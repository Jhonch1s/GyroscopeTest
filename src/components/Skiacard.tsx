import {
    UncialAntiqua_400Regular
} from "@expo-google-fonts/uncial-antiqua";
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
    useFont
} from "@shopify/react-native-skia";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View
} from "react-native";
import {
    SensorType,
    useAnimatedSensor,
    useDerivedValue,
    useFrameCallback,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const CARD_W = 300;
const CARD_H = 450;
//Padding extra para que la rotación no se corte
const PADDING = 60;
const CANVAS_W = CARD_W + PADDING * 2;
const CANVAS_H = CARD_H + PADDING * 2;


const CX = CANVAS_W / 2;
const CY = CANVAS_H / 2;
const MAX_ROTATION = 0.35;

// recibe: normalMap, lightPos, lighColor, ambient
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


export default function SkiaCard({background,center,normal,texto} : {background:any,center:any,normal:any,texto:string}) {
    //assets de nuestra cartita

    //giroscipio por Reanimated
    const sensor = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 16 });

    
    const palabras = texto.split(' ');
    let lineas = ['', '', ''];
    let idx = 0;

    for (let i = 0; i < 3; i++) {
    let linea = '';
    while (idx < palabras.length && (linea + (linea ? ' ' : '') + palabras[idx]).length <= 20) {
        linea += (linea ? ' ' : '') + palabras[idx++];
    }
    if (linea.length < 16 && idx < palabras.length) {
        linea += ' ' + palabras[idx++];
    }
    lineas[i] = linea;
    }
    while (idx < palabras.length) lineas[2] += ' ' + palabras[idx++];

    const [texto1, texto2, texto3] = lineas;


    const [lightingEffect, setLightingEffect] = useState<SkRuntimeEffect | null>(null);

 

    //valores de rotacion acumulados (los radianes, ahora gira la carta)
    const rotX = useSharedValue(0);
    const rotY = useSharedValue(0);
    //acumulamos gyroscopio en rotacion y posición de luz
    useFrameCallback((frameInfo) => {
        "worklet";
        const dt = (frameInfo.timeSincePreviousFrame ?? 16) / 1000;
        const { x, y } = sensor.sensor.value;

        //zona muerta a 0
        const deadzone = 0.01;

        if (Math.abs(y) > deadzone) {
            const nextX = rotX.value + y * dt;
            rotX.value = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, nextX));

        } else {
            rotX.value = rotX.value * 0.98;
        }
        if (Math.abs(x) > deadzone) {
            const nextY = rotY.value + x * dt;
            rotY.value = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, nextY));

        } else {
            rotY.value = rotY.value * 0.98;
        }
    });

    //usando useDerivedValue para leer el sensor en worklet
    const rotXSmooth = useDerivedValue(() => {
        const delta = sensor.sensor.value.y ?? 0;
        const next = rotX.value + delta * 0.016;
        rotX.value = withSpring(
            Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, next)),
            { damping: 18, stiffness: 90 }
        );
        return rotX.value;
    });

    //los mismo para eje Y
    const rotYSmooth = useDerivedValue(() => {
        const delta = sensor.sensor.value.x ?? 0;
        const next = rotY.value + delta * 0.016;
        rotY.value = withSpring(
            Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, next)),
            { damping: 18, stiffness: 90 }
        );
        return rotY.value;
    });


    //Matriz M44 para la rotación 3d d ela carta
    const cardMatrix = useDerivedValue(() =>
        processTransform3d([
            { translateX: CX },
            { translateY: CY },
            { perspective: 600 },
            { rotateX: rotX.value },
            { rotateY: rotY.value },
            { translateX: -CX },
            { translateY: -CY },
        ])
    );

    //posi de la luz derivada del gyro para el efecto reflejo
    const lightPos = useDerivedValue(() => [
        0.5 + rotYSmooth.value * 0.9,
        0.5 - rotXSmooth.value * 0.9,
    ]);

    //partes del shaders, compatibles con skia
    const uniforms = useDerivedValue(() => ({
        lightPos: [
            0.5 + rotY.value * 0.9,
            0.5 - rotX.value * 0.9,
        ],
        lightColor: [1.0, 0.97, 0.88],
        ambient: 0.06,
        resolution: [CARD_W, CARD_H],
    }));
    const font = useFont(UncialAntiqua_400Regular, 20);

    const TEXT = texto1;
    const TEXT2 = texto2;
    const TEXT3 = texto3;

    const textX = useDerivedValue(() => {
        if (!font) return CX;
        const w = font.getTextWidth(TEXT);
        return CX - w / 2;
    });
    const text2X = useDerivedValue(() => {
        if (!font) return CX;
        const w = font.getTextWidth(TEXT2);
        return CX - w / 2;
    });
    const text3X = useDerivedValue(() => {
        if (!font) return CX;
        const w = font.getTextWidth(TEXT3);
        return CX - w / 2;
    });

     useEffect(() => {
    // Ensure Skia is defined before compiling
    if (Skia && Skia.RuntimeEffect) {
      try {
        const effect = Skia.RuntimeEffect.Make(LIGHTING_SKSL);
        if (effect) {
          setLightingEffect(effect);
        } else {
          console.error("Failed to compile shader");
        }
      } catch (err) {
        console.error("Shader compilation error:", err);
      }
    }
  }, []); // runs once after mount

  if (!lightingEffect) {
    return null; // or a loading spinner
  }

    if (!background || !center || !normal) {
        return null; // O un loading state
    }


    return (
        <View style={styles.container}>
            <Canvas style={{ width: CANVAS_W, height: CANVAS_H }}>

                <Group matrix={cardMatrix}>

                    {/* Capa 1: Fondo + Borde */}
                    <Image
                        image={background}
                        x={PADDING}        // ← antes era 0
                        y={PADDING}
                        width={CARD_W}
                        height={CARD_H}
                        fit="cover"
                    />

                    {/* Capa 2: Imagen central */}
                    <Image
                        image={center}
                        x={PADDING + CARD_W * 0.10}
                        y={PADDING + CARD_H * 0.15}
                        width={CARD_W * 0.80}
                        height={CARD_H * 0.50}
                        fit="contain"
                    />



                    {font && (
                        <>
                            <Text
                                x={textX}
                                y={CARD_H * 0.85}
                                text={TEXT}
                                font={font}
                                color="#363636ff"
                            />
                            <Text
                                x={text2X}
                                y={CARD_H * 0.85 + 25}
                                text={TEXT2}
                                font={font}
                                color="#363636ff"
                            />
                            <Text
                                x={text3X}
                                y={CARD_H * 0.85 + 25 + 25}
                                text={TEXT3}
                                font={font}
                                color="#363636ff"
                            />
                        </>
                    )}

                    {/* Capa 3: Shader */}
                    <Rect
                        x={PADDING}
                        y={PADDING}
                        width={CARD_W}
                        height={CARD_H}
                        blendMode="screen"
                    >
                        <Shader source={lightingEffect} uniforms={uniforms}>
                            <ImageShader
                                image={normal}
                                x={PADDING}
                                y={PADDING}
                                width={CARD_W}
                                height={CARD_H}
                                fit="cover"
                                tx="repeat"
                                ty="repeat"
                                transform={[{ scale: 0.2 }]}
                            />
                        </Shader>
                    </Rect>

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
