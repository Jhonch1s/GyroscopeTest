import { useGyroscope } from "@/hooks/useGyroscope";
import {
  UncialAntiqua_400Regular,
  useFonts,
} from "@expo-google-fonts/uncial-antiqua";
import { Canvas, RoundedRect, Shader, Skia } from "@shopify/react-native-skia";
import React from "react";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export const GyroscopeScreen = () => {
  // 1. Consumimos el sensor compartido
  const gyroSensor = useGyroscope(16);

  const [fontsLoaded] = useFonts({
    UncialAntiqua_400Regular,
  });

  const paperShader = Skia.RuntimeEffect.Make(`
  uniform float2 iResolution;

  float hash(float2 p) {
    return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
  }

  float noise(float2 p) {
    float2 i = floor(p);
    float2 f = fract(p);
    float2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + float2(1,0)), u.x),
      mix(hash(i + float2(0,1)), hash(i + float2(1,1)), u.x),
      u.y
    );
  }

  float fbm(float2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.1;
      a *= 0.5;
    }
    return v;
  }

  half4 main(float2 fragCoord) {
    float2 uv = fragCoord / iResolution;

    float3 base = float3(0.945, 0.933, 0.910);

    // Fibras horizontales de celulosa
    float fibers = noise(float2(uv.x * 900.0, uv.y * 10.0)) * 0.025;

    // Grano general
    float grain = fbm(uv * 200.0) * 0.055;

    // Tono orgánico de baja frecuencia
    float tone = fbm(uv * 35.0) * 0.035;

    // Viñeta — oscurece bordes levemente
    float2 c = uv - 0.5;
    float vignette = 1.0 - dot(c, c) * 0.5;

    float3 color = (base - grain - fibers - tone) * vignette;

    return half4(clamp(color, 0.0, 1.0), 1.0);
  }
`)!;

  // --- CAPA 1: Fondo Lejano (Movimiento mínimo) ---
  const layer1Style = useAnimatedStyle(() => {
    const { x, y } = gyroSensor.value;
    return {
      transform: [
        { translateX: withSpring(Math.max(Math.min(y * -10, 25), -25)) },
        { translateY: withSpring(Math.max(Math.min(x * -10, 25), -25)) },
      ],
    };
  });

  // --- CAPA 2: Fondo Medio ---
  const layer2Style = useAnimatedStyle(() => {
    const { x, y } = gyroSensor.value;
    return {
      transform: [
        { translateX: withSpring(Math.max(Math.min(y * -8, 19), -19)) },
        { translateY: withSpring(Math.max(Math.min(x * -8, 19), -19)) },
      ],
    };
  });

  // --- CAPA 3: Objeto Principal (Caja Morada) ---
  const layer3Style = useAnimatedStyle(() => {
    const { x, y } = gyroSensor.value;
    return {
      transform: [
        { translateX: withSpring(Math.max(Math.min(y * -6, 12), -12)) },
        { translateY: withSpring(Math.max(Math.min(x * -6, 12), -12)) },
      ],
    };
  });

  // --- CAPA 4: Frente / Superposición (Movimiento exagerado) ---
  const layer4Style = useAnimatedStyle(() => {
    const { x, y } = gyroSensor.value;
    return {
      transform: [
        { translateX: withSpring(Math.max(Math.min(y * -5, 10), -10)) },
        { translateY: withSpring(Math.max(Math.min(x * -5, 10), -10)) },
      ],
    };
  });
  // Dentro del componente, antes del return:
  const CARD_W = 300;
  const CARD_H = 450;
  const uniforms = { iResolution: [CARD_W, CARD_H] };
  if (!fontsLoaded) return null;
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.cont}>
        {/* Capa 1: Fondo con textura de papel */}
        <Animated.View style={[styles.layer, styles.layerBg, layer1Style]}>
          <Canvas
            style={{
              width: CARD_W,
              height: CARD_H,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <RoundedRect x={0} y={0} width={CARD_W} height={CARD_H} r={12}>
              <Shader source={paperShader} uniforms={uniforms} />
            </RoundedRect>
          </Canvas>
        </Animated.View>

        {/* Capa 2: Decoración trasera */}
        <Animated.View style={[styles.layer, styles.layerMiddle, layer2Style]}>
          <ImageBackground
            source={require("../../assets/images/card1.png")}
            resizeMode="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>

        {/* Capa 3: Elemento principal */}
        <Animated.View style={[styles.layer, styles.layerBorder, layer3Style]}>
          <ImageBackground
            source={require("../../assets/images/borde1.png")}
            resizeMode="cover"
            style={{ width: "110%", height: "110%" }}
          />
        </Animated.View>

        {/* Capa 4: Elemento flotando al frente */}
        <Animated.View style={[styles.layer, styles.layerText, layer4Style]}>
          <Text style={[styles.layerTextp]}>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            Repellendus non optio rem molestias iusto atque, pariatur veniam
            eos, praesentium facilis cupiditate!
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#111",
  },
  cont: {
    position: "relative",
    width: 300,
    height: 450,
    margin: "auto",
  },
  layer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
  },
  layerMiddle: {
    height: 250,
    width: 250,
    borderRadius: 8,
    top: 25,
    left: 25,
    zIndex: 2,
  },
  layerBg: {
    zIndex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  layerBorder: {
    // borderWidth: 2,
    // borderColor: "#ed00caff",
    // borderRadius: 12,
    //borderStyle: "solid",
    position: "absolute",
    top: -55,
    left: -35,
    zIndex: 3,
  },
  layerText: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingTop: 250,
    color: "#ffffff",
    zIndex: 4,
  },
  layerTextp: {
    margin: 0,
    fontFamily: "UncialAntiqua_400Regular",
    fontSize: 20,
    textAlign: "center",
    textShadowColor: "#ffffff",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
});
