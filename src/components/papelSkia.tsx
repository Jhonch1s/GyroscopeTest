import { Skia } from "@shopify/react-native-skia";

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
