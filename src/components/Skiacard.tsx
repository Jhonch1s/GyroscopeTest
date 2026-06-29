import { UncialAntiqua_400Regular } from "@expo-google-fonts/uncial-antiqua";
import {
  Canvas,
  Group,
  Image,
  ImageShader,
  processTransform3d,
  Rect,
  Shader,
  Skia,
  SkRuntimeEffect,
  Text,
  useFont,
  useImage,
} from "@shopify/react-native-skia";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  SensorType,
  useAnimatedSensor,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import { getLocalImage } from "../utils/imageMapper";

const CARD_W = 300;
const CARD_H = 450;
const PADDING = 60;
const CANVAS_W = CARD_W + PADDING * 2;
const CANVAS_H = CARD_H + PADDING * 2;
const CX = CANVAS_W / 2;
const CY = CANVAS_H / 2;
const MAX_ROTATION = 0.35;

const NORMAL_SCALE: Record<Rarity, number> = {
  common: 0.2,
  rare: 0.2,
  epic: 1.5,
  legendary: 1.0,
};

export type Rarity = "common" | "rare" | "epic" | "legendary";

// ─── Shader base: normal map lighting ────────────────────────────────────────
const LIGHTING_SKSL = `
  uniform shader normalMap;
  uniform vec2  lightPos;
  uniform vec3  lightColor;
  uniform float ambient;
  uniform vec2  resolution;

  half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;
    vec3 n = normalMap.eval(fragCoord).rgb;
    n = normalize(n * 2.0 - 1.0);
    vec3 lightDir = normalize(vec3(lightPos - uv, 0.4));
    float diff = max(dot(n, lightDir), 0.0);
    vec3 halfV = normalize(lightDir + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(n, halfV), 0.0), 48.0);
    vec3 lighting = lightColor * (diff * 0.55 + spec * 0.45) + ambient;
    float alpha = diff * 0.3 + spec * 0.25;
    return half4(lighting * alpha, alpha);
  }
`;

// ─── Rare: grain texture + rainbow desplazado por tilt ───────────────────────
// grain.webp modula el brillo; el hue varía con posición + tilt.
const RARE_SKSL = `
  uniform shader grainTex;
  uniform vec2  tilt;
  uniform float intensity;
  uniform vec2  resolution;

  vec3 hsl2rgb(float h, float s, float l) {
    vec3 rgb = clamp(abs(mod(h*6.0 + vec3(0,4,2), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0*l - 1.0));
  }

  half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;

    // Textura de grano se mueve con el tilt (paralax)
    vec2 grainUV = fragCoord + tilt * 30.0;
    vec3 grain = grainTex.eval(grainUV).rgb;
    float luma = dot(grain, vec3(0.299, 0.587, 0.114));

    // Hue varía con posición y tilt — esto es lo que hace el "rainbow shift"
    float hue = fract(uv.x * 0.6 + uv.y * 0.3 + tilt.x * 0.35 + tilt.y * 0.2);
    vec3 rainbow = hsl2rgb(hue, 0.9, 0.6);

    // Solo los puntos brillantes del grain brillan
    float sparkle = smoothstep(0.55, 1.0, luma);
    vec3 color = rainbow * (0.4 + sparkle * 0.6);

    // Glare extra al inclinar
    color += smoothstep(0.3, 1.0, intensity) * 0.2;

    float alpha = (0.25 + sparkle * 0.35) * max(intensity, 0.15);
    return half4(color * alpha, alpha);
  }
`;

// ─── Epic: foil illusion.png + cromado iridiscente ───────────────────────────
// illusion.png se desplaza agresivamente con tilt → efecto "oil slick" cromado.
const EPIC_SKSL = `
  uniform shader foilTex;
  uniform vec2  tilt;
  uniform float intensity;
  uniform vec2  resolution;

  vec3 hsl2rgb(float h, float s, float l) {
    vec3 rgb = clamp(abs(mod(h*6.0 + vec3(0,4,2), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0*l - 1.0));
  }

  half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;

    // El foil se desplaza con el tilt — cuanto más se inclina, más "corre"
    vec2 foilUV = fragCoord + tilt * vec2(60.0, 40.0);
    vec3 foil = foilTex.eval(foilUV).rgb;
    float luma = dot(foil, vec3(0.299, 0.587, 0.114));

    // Hue = posición + luma del foil + tilt → cromado iridiscente
    float hue = fract(luma * 0.8 + uv.x * 0.3 + tilt.x * 0.5 - tilt.y * 0.3);
    float sat = mix(0.5, 1.0, intensity);
    vec3 chrome = hsl2rgb(hue, sat, mix(0.35, 0.65, luma));

    // Highlight especular en zonas brillantes del foil
    float spec = smoothstep(0.6, 0.95, luma) * intensity;
    chrome += spec * vec3(1.0, 0.98, 0.92) * 0.4;

    float alpha = (0.3 + luma * 0.3) * max(intensity, 0.2);
    return half4(chrome * alpha, alpha);
  }
`;

// ─── Legendary: cosmos holo — galaxia + arcoíris 82° + glare ────────────────
// cosmos-bottom.png se desplaza con pointer; las otras 2 capas van por Rect
// separados con paralax propio (Skia RuntimeEffect: 1 solo child ImageShader).
const COSMOS_SKSL = `
  uniform shader cosmosTex;
  uniform vec2  pointer;
  uniform float intensity;
  uniform vec2  resolution;

  vec3 hsl2rgb(float h, float s, float l) {
    vec3 rgb = clamp(abs(mod(h*6.0 + vec3(0,4,2), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0*l - 1.0));
  }

  vec3 colorDodge(vec3 b, vec3 t) { return clamp(b / (1.0 - t + 0.001), 0.0, 1.0); }
  vec3 colorBurn (vec3 b, vec3 t) { return clamp(1.0 - (1.0 - b) / (t + 0.001), 0.0, 1.0); }

  half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;

    // Paralax: cosmos se mueve con pointer
    vec2 offset = (pointer - 0.5) * 0.25;
    vec3 cosmos = cosmosTex.eval(fragCoord + offset * resolution).rgb;

    // Gradiente arcoíris a 82° — igual que pokemon-cards-css
    float angle = 82.0 * 3.14159265 / 180.0;
    float t = fract(
      (uv.x * cos(angle) + uv.y * sin(angle)) * 5.0
      + (pointer.x - 0.5) * 0.8
      - (pointer.y - 0.5) * 0.5
    );
    vec3 rainbow = hsl2rgb(t, 1.0, 0.55);

    // Blend cosmos + rainbow
    vec3 result = mix(colorBurn(cosmos, rainbow), colorDodge(cosmos, rainbow), 0.5);

    // Glare radial: linterna centrada en el pointer
    float dist = distance(uv, pointer);
    result += vec3(0.85, 0.92, 1.0) * smoothstep(0.7, 0.0, dist) * intensity * 0.5;

    // Halo en bordes al inclinar
    float edge = smoothstep(0.3, 0.0, min(min(uv.x, 1.0-uv.x), min(uv.y, 1.0-uv.y)));
    result += rainbow * edge * intensity * 0.3;

    result = pow(clamp(result, 0.0, 1.0), vec3(0.85)) * 1.1;

    float alpha = max(intensity, 0.3) * 0.7;
    return half4(result * alpha, alpha);
  }
`;

// ─── Componente ──────────────────────────────────────────────────────────────
export default function SkiaCard({
  background,
  center,
  normal,
  texto,
  rarity = "common",
}: {
  background: any;
  center: any;
  normal: any;
  texto: string;
  rarity?: Rarity;
}) {
  const sensor = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 16 });

  // ── Texturas de rareza ─────────────────────────────────────────────────────
  // Descargá estas imágenes de:
  //   https://github.com/jerinjohnk/RNShaderCard/tree/main/assets
  // y ponerlas en assets/effects/
  const grainImg = useImage(getLocalImage("rare/grain.webp"));
  const illusionImg = useImage(getLocalImage("epic/illusion.png"));
  const cosmosBottomImg = useImage(
    getLocalImage("legendary/cosmos-bottom.png"),
  );
  const cosmosMiddleImg = useImage(
    getLocalImage("legendary/cosmos-middle.png"),
  );
  const cosmosTopImg = useImage(getLocalImage("legendary/cosmos-top.png"));

  // ── División de texto ──────────────────────────────────────────────────────
  const palabras = texto.split(" ");
  const lineas = ["", "", ""];
  let idx = 0;
  for (let i = 0; i < 3; i++) {
    let linea = "";
    while (
      idx < palabras.length &&
      (linea + (linea ? " " : "") + palabras[idx]).length <= 20
    ) {
      linea += (linea ? " " : "") + palabras[idx++];
    }
    if (linea.length < 16 && idx < palabras.length) {
      linea += " " + palabras[idx++];
    }
    lineas[i] = linea;
  }
  while (idx < palabras.length) lineas[2] += " " + palabras[idx++];
  const [texto1, texto2, texto3] = lineas;

  // ── Compilar shaders ───────────────────────────────────────────────────────
  const [lightingFx, setLightingFx] = useState<SkRuntimeEffect | null>(null);
  const [rareFx, setRareFx] = useState<SkRuntimeEffect | null>(null);
  const [epicFx, setEpicFx] = useState<SkRuntimeEffect | null>(null);
  const [cosmosFx, setCosmosFx] = useState<SkRuntimeEffect | null>(null);

  useEffect(() => {
    if (!Skia?.RuntimeEffect) return;
    const compile = (src: string, name: string): SkRuntimeEffect | null => {
      try {
        const fx = Skia.RuntimeEffect.Make(src);
        if (!fx) console.error(`${name} shader compile failed`);
        return fx ?? null;
      } catch (e) {
        console.error(`${name} shader error:`, e);
        return null;
      }
    };
    setLightingFx(compile(LIGHTING_SKSL, "Lighting"));
    setRareFx(compile(RARE_SKSL, "Rare"));
    setEpicFx(compile(EPIC_SKSL, "Epic"));
    setCosmosFx(compile(COSMOS_SKSL, "Cosmos"));
  }, []);

  // ── Rotación acumulada ─────────────────────────────────────────────────────
  const rotX = useSharedValue(0);
  const rotY = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    "worklet";
    const dt = (frameInfo.timeSincePreviousFrame ?? 16) / 1000;
    const { x, y } = sensor.sensor.value;
    const dz = 0.01;
    if (Math.abs(y) > dz) {
      rotX.value = Math.max(
        -MAX_ROTATION,
        Math.min(MAX_ROTATION, rotX.value + x * dt),
      );
    } else {
      rotX.value *= 0.98;
    }
    if (Math.abs(x) > dz) {
      rotY.value = Math.max(
        -MAX_ROTATION,
        Math.min(MAX_ROTATION, rotY.value + y * dt),
      );
    } else {
      rotY.value *= 0.98;
    }
  });

  // ── Valores derivados en worklet ──────────────────────────────────────────
  const cardMatrix = useDerivedValue(() =>
    processTransform3d([
      { translateX: CX },
      { translateY: CY },
      { perspective: 600 },
      { rotateX: rotX.value },
      { rotateY: rotY.value },
      { translateX: -CX },
      { translateY: -CY },
    ]),
  );

  const lightingUniforms = useDerivedValue(() => ({
    lightPos: [0.5 + rotY.value * 0.9, 0.5 - rotX.value * 0.9],
    lightColor: [1.0, 0.97, 0.88],
    ambient: 0.06,
    resolution: [CARD_W, CARD_H],
  }));

  // smoothstep para que el efecto aparezca gradualmente
  const smoothIntensity = useDerivedValue(() => {
    const t = Math.min(
      Math.sqrt(rotX.value ** 2 + rotY.value ** 2) / MAX_ROTATION,
      1.0,
    );
    return t * t * (3 - 2 * t);
  });

  const tiltVec = useDerivedValue(() => [
    rotX.value / MAX_ROTATION,
    rotY.value / MAX_ROTATION,
  ]);

  const pointerVec = useDerivedValue(() => [
    0.5 + (rotY.value / MAX_ROTATION) * 0.4,
    0.5 - (rotX.value / MAX_ROTATION) * 0.4,
  ]);

  const rareUniforms = useDerivedValue(() => ({
    tilt: tiltVec.value,
    intensity: smoothIntensity.value,
    resolution: [CARD_W, CARD_H],
  }));

  const epicUniforms = useDerivedValue(() => ({
    tilt: tiltVec.value,
    intensity: smoothIntensity.value,
    resolution: [CARD_W, CARD_H],
  }));

  const cosmosUniforms = useDerivedValue(() => ({
    pointer: pointerVec.value,
    intensity: smoothIntensity.value,
    resolution: [CARD_W, CARD_H],
  }));

  // Paralax independiente para las capas middle y top del cosmos
  // Cada capa se mueve a distinta velocidad → profundidad visual
  const cosmosMiddleTransform = useDerivedValue(() => [
    { translateX: (rotY.value / MAX_ROTATION) * 18 },
    { translateY: (rotX.value / MAX_ROTATION) * -18 },
  ]);
  const cosmosTopTransform = useDerivedValue(() => [
    { translateX: (rotY.value / MAX_ROTATION) * 32 },
    { translateY: (rotX.value / MAX_ROTATION) * -32 },
  ]);

  // ── Font ───────────────────────────────────────────────────────────────────
  const font = useFont(UncialAntiqua_400Regular, 20);
  const textX = useDerivedValue(() =>
    !font ? CX : CX - font.getTextWidth(texto1) / 2,
  );
  const text2X = useDerivedValue(() =>
    !font ? CX : CX - font.getTextWidth(texto2) / 2,
  );
  const text3X = useDerivedValue(() =>
    !font ? CX : CX - font.getTextWidth(texto3) / 2,
  );

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!lightingFx || !background || !center || !normal) return null;

  return (
    <View style={styles.container}>
      <Canvas style={{ width: CANVAS_W, height: CANVAS_H }}>
        <Group matrix={cardMatrix}>
          {/* ── Capa 1: Fondo ───────────────────────────────────────────── */}
          <Image
            image={background}
            x={PADDING}
            y={PADDING}
            width={CARD_W}
            height={CARD_H}
            fit="cover"
          />

          {/* ── Capa 2: Imagen central ──────────────────────────────────── */}
          <Image
            image={center}
            x={PADDING + CARD_W * 0.1}
            y={PADDING + CARD_H * 0.15}
            width={CARD_W * 0.8}
            height={CARD_H * 0.5}
            fit="contain"
          />

          {/* ── Capa 3: Texto ───────────────────────────────────────────── */}
          {font && (
            <>
              <Text
                x={textX}
                y={CARD_H * 0.85}
                text={texto1}
                font={font}
                color="#363636ff"
              />
              <Text
                x={text2X}
                y={CARD_H * 0.85 + 25}
                text={texto2}
                font={font}
                color="#363636ff"
              />
              <Text
                x={text3X}
                y={CARD_H * 0.85 + 25 + 25}
                text={texto3}
                font={font}
                color="#363636ff"
              />
            </>
          )}

          {/* ── Capa 4: Lighting normal map ─────────────────────────────── */}
          <Rect
            x={PADDING}
            y={PADDING}
            width={CARD_W}
            height={CARD_H}
            blendMode="screen"
          >
            <Shader source={lightingFx} uniforms={lightingUniforms}>
              <ImageShader
                image={normal}
                x={PADDING}
                y={PADDING}
                width={CARD_W}
                height={CARD_H}
                fit="cover"
                tx="repeat"
                ty="repeat"
                transform={[{ scale: NORMAL_SCALE[rarity] }]}
              />
            </Shader>
          </Rect>

          {/* ── Capa 5 RARE: grain.webp + rainbow ──────────────────────── */}
          {rarity === "rare" && rareFx && grainImg && (
            <Rect
              x={PADDING}
              y={PADDING}
              width={CARD_W}
              height={CARD_H}
              blendMode="screen"
            >
              <Shader source={rareFx} uniforms={rareUniforms}>
                <ImageShader
                  image={grainImg}
                  fit="cover"
                  tx="repeat"
                  ty="repeat"
                />
              </Shader>
            </Rect>
          )}

          {/* ── Capa 5 EPIC: illusion.png + foil cromado ───────────────── */}
          {rarity === "epic" && epicFx && illusionImg && (
            <Rect
              x={PADDING}
              y={PADDING}
              width={CARD_W}
              height={CARD_H}
              blendMode="overlay"
            >
              <Shader source={epicFx} uniforms={epicUniforms}>
                <ImageShader
                  image={illusionImg}
                  fit="cover"
                  tx="repeat"
                  ty="repeat"
                />
              </Shader>
            </Rect>
          )}

          {/* ── Capa 5-7 LEGENDARY: cosmos 3 capas con paralax propio ─── */}
          {rarity === "legendary" &&
            cosmosFx &&
            cosmosBottomImg &&
            cosmosMiddleImg &&
            cosmosTopImg && (
              <>
                {/* Bottom: el shader cosmos maneja su propio paralax interno */}
                <Rect
                  x={PADDING}
                  y={PADDING}
                  width={CARD_W}
                  height={CARD_H}
                  blendMode="screen"
                >
                  <Shader source={cosmosFx} uniforms={cosmosUniforms}>
                    <ImageShader
                      image={cosmosBottomImg}
                      fit="cover"
                      tx="repeat"
                      ty="repeat"
                    />
                  </Shader>
                </Rect>

                {/* Middle: paralax x1.8 — se mueve más que el bottom */}
                <Rect
                  x={PADDING}
                  y={PADDING}
                  width={CARD_W}
                  height={CARD_H}
                  blendMode="lighten"
                >
                  <ImageShader
                    image={cosmosMiddleImg}
                    fit="cover"
                    tx="repeat"
                    ty="repeat"
                    transform={cosmosMiddleTransform}
                  />
                </Rect>

                {/* Top: paralax x3.2 — la capa más "al frente" se mueve más */}
                <Rect
                  x={PADDING}
                  y={PADDING}
                  width={CARD_W}
                  height={CARD_H}
                  blendMode="colorDodge"
                >
                  <ImageShader
                    image={cosmosTopImg}
                    fit="cover"
                    tx="repeat"
                    ty="repeat"
                    transform={cosmosTopTransform}
                  />
                </Rect>
              </>
            )}
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080810",
    alignItems: "center",
    justifyContent: "center",
  },
});
