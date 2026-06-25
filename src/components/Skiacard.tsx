import { UncialAntiqua_400Regular } from "@expo-google-fonts/uncial-antiqua";
import { Orbitron_700Bold } from "@expo-google-fonts/orbitron";
import { Cinzel_700Bold } from "@expo-google-fonts/cinzel";
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
  rare: 3.0,
  epic: 1.5,
  legendary: 0.2,
};

interface LightingConfig {
  lightColor: [number, number, number];
  ambient: number;
  diffuseStrength: number;
  specularStrength: number;
  specularPower: number;
  saturation: number;
}

const LIGHTING_CONFIG: Record<Rarity, LightingConfig> = {
  common: {
    lightColor: [1.0, 0.97, 0.88],
    ambient: 0.06,
    diffuseStrength: 0.55,
    specularStrength: 0.45,
    specularPower: 48.0,
    saturation: 1.0,
  },
  rare: {
    lightColor: [1.0, 0.97, 0.88],
    ambient: 0.06,
    diffuseStrength: 0.55,
    specularStrength: 0.45,
    specularPower: 48.0,
    saturation: 1.0,
  },
  epic: {
    lightColor: [1.0, 0.97, 0.88],
    ambient: 0.06,
    diffuseStrength: 0.55,
    specularStrength: 0.45,
    specularPower: 48.0,
    saturation: 1.0,
  },
  legendary: {
    lightColor: [0.95, 0.88, 0.78],
    ambient: 0.04,
    diffuseStrength: 0.35,
    specularStrength: 0.15,
    specularPower: 24.0,
    saturation: 0.3,
  },
};

export type Rarity = "common" | "rare" | "epic" | "legendary";

// ─── Shader base: normal map lighting ────────────────────────────────────────
const LIGHTING_SKSL = `
  uniform shader normalMap;
  uniform vec2  lightPos;
  uniform vec3  lightColor;
  uniform float ambient;
  uniform float diffuseStrength;
  uniform float specularStrength;
  uniform float specularPower;
  uniform float saturation;
  uniform vec2  resolution;

  half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;
    vec3 n = normalMap.eval(fragCoord).rgb;
    n = normalize(n * 2.0 - 1.0);
    vec3 lightDir = normalize(vec3(lightPos - uv, 0.4));
    float diff = max(dot(n, lightDir), 0.0);
    vec3 halfV = normalize(lightDir + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(n, halfV), 0.0), specularPower);

    // Ajustar saturación del color de luz
    float luma = dot(lightColor, vec3(0.299, 0.587, 0.114));
    vec3 saturatedLight = mix(vec3(luma), lightColor, saturation);

    vec3 lighting = saturatedLight * (diff * diffuseStrength + spec * specularStrength) + ambient;
    float alpha = diff * 0.3 + spec * 0.25;
    return half4(lighting * alpha, alpha);
  }
`;

// ─── Rare: glitter sparkles + rainbow holographic ───────────────────────────
// glitter.png modula destellos; el hue varía con posición + tilt.
const RARE_SKSL = `
  uniform shader glitterTex;
  uniform vec2  tilt;
  uniform float intensity;
  uniform float time;
  uniform vec2  resolution;

  vec3 hsl2rgb(float h, float s, float l) {
    vec3 rgb = clamp(abs(mod(h*6.0 + vec3(0,4,2), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0*l - 1.0));
  }

  // Hash para sparkle pseudo-aleatorio por pixel, poneleee
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;

    // Glitter texture se mueve con tilt (paralax)
    vec2 glitterUV = fragCoord + tilt * 60.0;
    vec3 glitter = glitterTex.eval(glitterUV).rgb;
    float luma = dot(glitter, vec3(0.299, 0.587, 0.114));

    // Hue varía con posición y tilt — rainbow shift
    float hue = fract(uv.x * 0.6 + uv.y * 0.3 + tilt.x * 0.4 + tilt.y * 0.25);
    vec3 rainbow = hsl2rgb(hue, 0.95, 0.6);

    // Sparkle: múltiples capas con distintas escalas y velocidades
    // Capa 1: sparkles grandes y lentos
    float cell1 = hash(floor(uv * 12.0));
    float twinkle1 = sin(time * 2.0 + cell1 * 6.283) * 0.5 + 0.5;
    float sparkle1 = smoothstep(0.6, 1.0, twinkle1 * luma);

    // Capa 2: sparkles pequeños y rápidos
    float cell2 = hash(floor(uv * 24.0) + 100.0);
    float twinkle2 = sin(time * 4.5 + cell2 * 6.283) * 0.5 + 0.5;
    float sparkle2 = smoothstep(0.7, 1.0, twinkle2 * luma) * 0.7;

    // Capa 3: destellos individuales brillantes
    float cell3 = hash(floor(uv * 8.0) + 200.0);
    float twinkle3 = sin(time * 1.5 + cell3 * 12.566) * 0.5 + 0.5;
    float flash = pow(twinkle3, 8.0) * step(0.85, luma) * 1.5;

    float totalSparkle = sparkle1 + sparkle2 + flash;

    // Color: rainbow base + blancos en los destellos
    vec3 sparkleColor = mix(rainbow, vec3(1.0, 0.98, 0.95), totalSparkle * 0.6);
    vec3 color = sparkleColor * (0.5 + totalSparkle * 0.5);

    // Glare extra al inclinar
    color += smoothstep(0.2, 1.0, intensity) * rainbow * 0.15;

    float alpha = (0.45 + totalSparkle * 0.55) * max(intensity, 0.25);
    return half4(color * alpha, alpha);
  }
`;

// ─── Epic: foil illusion.png + cromado iridiscente + shimmer ─────────────────
// illusion.png se desplaza con tilt; el cromado "corre" con time y los sparkles
// brillan sobre las zonas más luminosas del foil.
const EPIC_SKSL = `
  uniform shader foilTex;
  uniform vec2  tilt;
  uniform float intensity;
  uniform float time;
  uniform vec2  resolution;

  vec3 hsl2rgb(float h, float s, float l) {
    vec3 rgb = clamp(abs(mod(h*6.0 + vec3(0,4,2), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0*l - 1.0));
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;

    // El foil se desplaza con el tilt — cuanto más se inclina, más "corre"
    vec2 foilUV = fragCoord + tilt * vec2(60.0, 40.0);
    vec3 foil = foilTex.eval(foilUV).rgb;
    float luma = dot(foil, vec3(0.299, 0.587, 0.114));

    // Hue = posición + luma + tilt + time → cromado que "corre" continuamente
    float hue = fract(
      luma * 0.8 + uv.x * 0.3 + uv.y * 0.2
      + tilt.x * 0.5 - tilt.y * 0.3
      + time * 0.08
    );
    float sat = mix(0.5, 1.0, intensity);
    vec3 chrome = hsl2rgb(hue, sat, mix(0.35, 0.65, luma));

    // Highlight especular en zonas brillantes del foil
    float spec = smoothstep(0.6, 0.95, luma) * intensity;
    chrome += spec * vec3(1.0, 0.98, 0.92) * 0.4;

    // Foil shimmer sparkles — twinkle sobre zonas luminosas
    float cell1 = hash(floor(uv * 16.0));
    float twinkle1 = sin(time * 3.0 + cell1 * 6.283) * 0.5 + 0.5;
    float shimmer1 = pow(twinkle1, 6.0) * smoothstep(0.5, 0.9, luma);

    float cell2 = hash(floor(uv * 32.0) + 100.0);
    float twinkle2 = sin(time * 5.5 + cell2 * 6.283) * 0.5 + 0.5;
    float shimmer2 = pow(twinkle2, 8.0) * smoothstep(0.65, 0.95, luma) * 0.6;

    float totalShimmer = shimmer1 + shimmer2;
    chrome += totalShimmer * vec3(1.0, 0.97, 0.9) * 0.8;

    float alpha = (0.3 + luma * 0.3 + totalShimmer * 0.25) * max(intensity, 0.2);
    return half4(chrome * alpha, alpha);
  }
`;

// ─── Legendary: cosmos holo — galaxia + arcoíris 82° + glare + star twinkle ──
// cosmos-bottom.png se desplaza con pointer; las otras 2 capas van por Rect
// separados con paralax propio (Skia RuntimeEffect: 1 solo child ImageShader).
const COSMOS_SKSL = `
  uniform shader cosmosTex;
  uniform vec2  pointer;
  uniform float intensity;
  uniform float time;
  uniform vec2  resolution;

  vec3 hsl2rgb(float h, float s, float l) {
    vec3 rgb = clamp(abs(mod(h*6.0 + vec3(0,4,2), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0*l - 1.0));
  }

  vec3 colorDodge(vec3 b, vec3 t) { return clamp(b / (1.0 - t + 0.001), 0.0, 1.0); }
  vec3 colorBurn (vec3 b, vec3 t) { return clamp(1.0 - (1.0 - b) / (t + 0.001), 0.0, 1.0); }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;

    // Paralax: cosmos se mueve con pointer
    vec2 offset = (pointer - 0.5) * 0.25;
    vec3 cosmos = cosmosTex.eval(fragCoord + offset * resolution).rgb;

    // Gradiente arcoíris a 82° — se desplaza con time para que "corra" el holo
    float angle = 82.0 * 3.14159265 / 180.0;
    float t = fract(
      (uv.x * cos(angle) + uv.y * sin(angle)) * 5.0
      + (pointer.x - 0.5) * 0.8
      - (pointer.y - 0.5) * 0.5
      + time * 0.12
    );
    vec3 rainbow = hsl2rgb(t, 1.0, 0.55);

    // Blend cosmos + rainbow
    vec3 result = mix(colorBurn(cosmos, rainbow), colorDodge(cosmos, rainbow), 0.5);

    // Glare radial: linterna centrada en el pointer, pulsa suavemente
    float pulse = 1.0 + sin(time * 1.8) * 0.15;
    float dist = distance(uv, pointer);
    result += vec3(0.85, 0.92, 1.0) * smoothstep(0.7, 0.0, dist) * intensity * 0.5 * pulse;

    // Halo en bordes al inclinar
    float edge = smoothstep(0.3, 0.0, min(min(uv.x, 1.0-uv.x), min(uv.y, 1.0-uv.y)));
    result += rainbow * edge * intensity * 0.3;

    // Star twinkle — estrellas individuales que parpadean
    float cell1 = hash(floor(uv * 20.0));
    float twinkle1 = sin(time * 2.5 + cell1 * 6.283) * 0.5 + 0.5;
    float star1 = pow(twinkle1, 10.0) * step(0.88, cell1);

    float cell2 = hash(floor(uv * 40.0) + 100.0);
    float twinkle2 = sin(time * 4.0 + cell2 * 6.283) * 0.5 + 0.5;
    float star2 = pow(twinkle2, 12.0) * step(0.93, cell2) * 0.7;

    float stars = star1 + star2;
    result += stars * vec3(1.0, 0.98, 0.95) * 1.2;

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
  const glitterImg = useImage(getLocalImage("rare/glitter.png"));
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
  const time = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    "worklet";
    const dt = (frameInfo.timeSincePreviousFrame ?? 16) / 1000;
    time.value += dt;
    const { x, y } = sensor.sensor.value;
    const dz = 0.01;
    if (Math.abs(x) > dz) {
      rotX.value = Math.max(
        -MAX_ROTATION,
        Math.min(MAX_ROTATION, rotX.value + x * dt),
      );
    } else {
      rotX.value *= 0.98;
    }
    if (Math.abs(y) > dz) {
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

  const lightingUniforms = useDerivedValue(() => {
    const cfg = LIGHTING_CONFIG[rarity] || LIGHTING_CONFIG.common;
    return {
      lightPos: [0.5 + rotY.value * 0.9, 0.5 - rotX.value * 0.9],
      lightColor: cfg.lightColor,
      ambient: cfg.ambient,
      diffuseStrength: cfg.diffuseStrength,
      specularStrength: cfg.specularStrength,
      specularPower: cfg.specularPower,
      saturation: cfg.saturation,
      resolution: [CARD_W, CARD_H],
    };
  });

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
    time: time.value,
    resolution: [CARD_W, CARD_H],
  }));

  const epicUniforms = useDerivedValue(() => ({
    tilt: tiltVec.value,
    intensity: smoothIntensity.value,
    time: time.value,
    resolution: [CARD_W, CARD_H],
  }));

  const cosmosUniforms = useDerivedValue(() => ({
    pointer: pointerVec.value,
    intensity: smoothIntensity.value,
    time: time.value,
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
  const gothicFont = useFont(UncialAntiqua_400Regular, 20);
  const cyberFont = useFont(Orbitron_700Bold, 18);
  const elegantFont = useFont(Cinzel_700Bold, 20);

  const font = rarity === "common" ? gothicFont
    : rarity === "legendary" ? elegantFont
    : cyberFont;

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

  const textColor = rarity === "legendary" ? "#ffffffff" : "#363636ff";

  return (
    <View style={styles.container}>
      <Canvas style={{ width: CANVAS_W, height: CANVAS_H }}>
        <Group
          matrix={cardMatrix}
          clip={Skia.RRectXY(
            Skia.XYWHRect(PADDING, PADDING, CARD_W, CARD_H),
            16,
            16,
          )}
        >
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
                color={textColor}
              />
              <Text
                x={text2X}
                y={CARD_H * 0.85 + 25}
                text={texto2}
                font={font}
                color={textColor}
              />
              <Text
                x={text3X}
                y={CARD_H * 0.85 + 25 + 25}
                text={texto3}
                font={font}
                color={textColor}
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

          {/* ── Capa 5 RARE: glitter.png + rainbow sparkles ──────────────── */}
          {rarity === "rare" && rareFx && glitterImg && (
            <Rect
              x={PADDING}
              y={PADDING}
              width={CARD_W}
              height={CARD_H}
              blendMode="screen"
            >
              <Shader source={rareFx} uniforms={rareUniforms}>
                <ImageShader
                  image={glitterImg}
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
