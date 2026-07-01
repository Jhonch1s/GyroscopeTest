import { RootStackParamList } from "@/app";
import { supabase } from "@/lib/supabase";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  SensorType,
  runOnJS,
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CANTIDAD_SENTADILLAS = 10;
const LIMITE_TIEMPO = 60;
const UMBRAL_MOVIMIENTO = 0.4;
const UMBRAL_ESTABILIDAD = 0.3;
const UMBRAL_MAGNITUD = 10.0;

type EstadoSentadilla = "parado" | "agachado";

export default function MisionSquatsPantalla() {
  const route = useRoute();
  const { userId, missionId } = route.params as {
    userId: number;
    missionId: number;
  };
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const sensor = useAnimatedSensor(SensorType.ACCELEROMETER, { interval: 16 });

  const [cantidadSentadillas, setCantidadSentadillas] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(LIMITE_TIEMPO);
  const [completado, setCompletado] = useState(false);
  const [estadoActual, setEstadoActual] = useState<EstadoSentadilla>("parado");
  const [estaEstable, setEstaEstable] = useState(true);
  const [lineaBaseY, setLineaBaseY] = useState<number | null>(null);
  const [calibrando, setCalibrando] = useState(true);
  const [ultimaSentadillaTiempo, setUltimaSentadillaTiempo] = useState(0);
  const [listoParaCalibrar, setListoParaCalibrar] = useState(false);
  const [valorYEstable, setValorYEstable] = useState<number>(0);
  const [lecturasEstablesContador, setLecturasEstablesContador] = useState(0);
  const [debugY, setDebugY] = useState(0);
  const [debugMagnitud, setDebugMagnitud] = useState(0);
  const [debugDelta, setDebugDelta] = useState(0);
  const [debugEstado, setDebugEstado] = useState<EstadoSentadilla>("parado");

  const cantidadSentadillasComp = useSharedValue(0);
  const estadoActualComp = useSharedValue<EstadoSentadilla>("parado");
  const ultimaSentadillaTiempoComp = useSharedValue(0);
  const calibrandoComp = useSharedValue(true);
  const lineaBaseYComp = useSharedValue<number>(0);

  const yAcceleration = useDerivedValue(() => {
    return sensor.sensor.value.y;
  });

  const magnitude = useDerivedValue(() => {
    const { x, y, z } = sensor.sensor.value;
    return Math.sqrt(x * x + y * y + z * z);
  });

  useFrameCallback(() => {
    "worklet";
    if (calibrandoComp.value) return;
    if (lineaBaseYComp.value === 0) return;

    const { x, y: yAxis, z } = sensor.sensor.value;
    const y = yAxis;
    const magnitud = Math.sqrt(x * x + y * y + z * z);
    const delta = y - lineaBaseYComp.value;
    const ahora = Date.now();

    runOnJS(setDebugY)(y);
    runOnJS(setDebugMagnitud)(magnitud);
    runOnJS(setDebugDelta)(delta);

    if (estadoActualComp.value === "parado") {
      if (magnitud > UMBRAL_MAGNITUD && delta < -UMBRAL_MOVIMIENTO) {
        estadoActualComp.value = "agachado";
        runOnJS(setEstadoActual)("agachado");
        runOnJS(setEstaEstable)(false);
      }
    } else if (estadoActualComp.value === "agachado") {
      if (magnitud > UMBRAL_MAGNITUD && delta > UMBRAL_MOVIMIENTO) {
        runOnJS(setDebugEstado)("parado");
        if (ahora - ultimaSentadillaTiempoComp.value > 800) {
          ultimaSentadillaTiempoComp.value = ahora;
          runOnJS(setUltimaSentadillaTiempo)(ahora);
          cantidadSentadillasComp.value = cantidadSentadillasComp.value + 1;
          runOnJS(setCantidadSentadillas)(cantidadSentadillasComp.value);
        }
        estadoActualComp.value = "parado";
        runOnJS(setEstadoActual)("parado");
        runOnJS(setEstaEstable)(true);
      }
    } else if (magnitud < UMBRAL_MAGNITUD) {
      runOnJS(setEstaEstable)(true);
    }
  });

  React.useEffect(() => {
    if (!calibrando) return;

    const y = yAcceleration.value;
    const umbralEstabilidad = 0.5;

    if (lecturasEstablesContador === 0) {
      setValorYEstable(y);
      setLecturasEstablesContador(1);
    } else if (Math.abs(y - valorYEstable) < umbralEstabilidad) {
      setLecturasEstablesContador((prev) => {
        const nuevoConteo = prev + 1;
        if (nuevoConteo >= 60) {
          setListoParaCalibrar(true);
        }
        return nuevoConteo;
      });
      setValorYEstable((prev) => prev * 0.95 + y * 0.05);
    } else {
      setLecturasEstablesContador(0);
      setListoParaCalibrar(false);
    }
  }, [yAcceleration.value, calibrando, lecturasEstablesContador, valorYEstable]);

  const estiloFeedback = useAnimatedStyle(() => {
    "worklet";
    return {
      opacity: withSpring(estaEstable ? 1 : 0.5),
      transform: [{ scale: withSpring(estaEstable ? 1 : 1.05) }],
    };
  });

  const estiloProgresoSentadillas = useAnimatedStyle(() => {
    "worklet";
    const progreso = cantidadSentadillas / CANTIDAD_SENTADILLAS;
    return {
      width: `${progreso * 100}%`,
    };
  });

  const estiloProgresoTiempo = useAnimatedStyle(() => {
    "worklet";
    const progreso = tiempoRestante / LIMITE_TIEMPO;
    return {
      width: `${progreso * 100}%`,
    };
  });

  React.useEffect(() => {
    if (tiempoRestante === 0 && cantidadSentadillas < CANTIDAD_SENTADILLAS) {
      manejarTiempoAgotado();
      return;
    }

    if (tiempoRestante < 0) return;

    const interval = setInterval(() => {
      setTiempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [tiempoRestante, cantidadSentadillas]);

  React.useEffect(() => {
    if (cantidadSentadillas >= CANTIDAD_SENTADILLAS && !completado) {
      manejarCompletarMision();
    }
  }, [cantidadSentadillas, completado]);

  const manejarCompletarMision = async () => {
    if (completado) return;
    setCompletado(true);

    if (userId && missionId) {
      const { error } = await supabase
        .from("progreso_usuario")
        .update({ completado: true })
        .eq("perfil_id", userId)
        .eq("mision_id", missionId)
        .eq("fecha", new Date().toISOString().split("T")[0]);

      if (error) {
        console.error("Error al completar misión:", error);
        setCompletado(false);
        return;
      }
    }

    navigation.navigate("MainTabs", { showPack: true });
  };

  const manejarTiempoAgotado = async () => {
    if (completado) return;
    setCompletado(true);

    if (userId && missionId) {
      const { error } = await supabase
        .from("progreso_usuario")
        .update({ fallado: true })
        .eq("perfil_id", userId)
        .eq("mision_id", missionId)
        .eq("fecha", new Date().toISOString().split("T")[0]);

      if (error) {
        console.error("Error al marcar misión como fallida:", error);
      }
    }

    navigation.navigate("MainTabs");
  };

  useFocusEffect(
    useCallback(() => {
      setCantidadSentadillas(0);
      cantidadSentadillasComp.value = 0;
      setTiempoRestante(LIMITE_TIEMPO);
      setCompletado(false);
      setEstadoActual("parado");
      estadoActualComp.value = "parado";
      setEstaEstable(true);
      setLineaBaseY(null);
      lineaBaseYComp.value = 0;
      setCalibrando(true);
      calibrandoComp.value = true;
      setUltimaSentadillaTiempo(0);
      ultimaSentadillaTiempoComp.value = 0;
      setListoParaCalibrar(false);
      setLecturasEstablesContador(0);
    }, []),
  );

  const manejarCalibrar = () => {
    setLineaBaseY(valorYEstable);
    lineaBaseYComp.value = valorYEstable;
    setCalibrando(false);
    calibrandoComp.value = false;
  };

  const obtenerMensajeEstado = () => {
    if (cantidadSentadillas >= CANTIDAD_SENTADILLAS) return "¡Misión completada!";
    if (estadoActual === "agachado") return "¡Abajo!";
    if (estaEstable && estadoActual === "parado") return "¡En posición!";
    return "Moviendo...";
  };

  const obtenerColorPorEstado = () => {
    if (cantidadSentadillas >= CANTIDAD_SENTADILLAS) return "#44ff44";
    if (estadoActual === "agachado") return "#ffaa00";
    if (estaEstable) return "#44ff44";
    return "#ff4444";
  };

  if (calibrando) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.calibrationContent}>
          <Text style={styles.title}>Misión Sentadillas</Text>
          <Text style={styles.subtitle}>
            Sostén el teléfono firme en la mano y espera a que el valor Y se
            estabilice
          </Text>

          <View style={styles.yDisplayContainer}>
            <Text style={styles.yLabel}>Valor Y actual:</Text>
            <Text style={styles.yValue}>{yAcceleration.value.toFixed(2)}</Text>
          </View>

          <View
            style={[
              styles.readyIndicator,
              listoParaCalibrar ? styles.readyGreen : styles.readyRed,
            ]}
          >
            <Text style={styles.readyText}>
              {listoParaCalibrar
                ? "✓ Listo para calibrar"
                : "Aguarde... manteniendo quieto"}
            </Text>
          </View>

          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              Estables: {lecturasEstablesContador}/60
            </Text>
            <Text style={styles.debugText}>Umbral: ±0.5 por 60 lecturas</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.calibrateButton,
              !listoParaCalibrar && styles.calibrateButtonDisabled,
            ]}
            onPress={manejarCalibrar}
            disabled={!listoParaCalibrar}
          >
            <Text style={styles.calibrateButtonText}>CALIBRAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("MainTabs")}
          >
            <Text style={styles.backButtonText}>Regresar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Misión Sentadillas</Text>
        <Text style={styles.subtitle}>
          Realiza {CANTIDAD_SENTADILLAS} sentadillas manteniendo el teléfono firme
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {cantidadSentadillas}/{CANTIDAD_SENTADILLAS}
            </Text>
            <Text style={styles.statLabel}>Sentadillas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{tiempoRestante}s</Text>
            <Text style={styles.statLabel}>Tiempo</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, estiloProgresoSentadillas]} />
          </View>
          <Text style={styles.progressLabel}>Progreso sentadillas</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFillTime, estiloProgresoTiempo]}
            />
          </View>
          <Text style={styles.progressLabel}>Tiempo restante</Text>
        </View>

        <Animated.View style={[styles.feedbackContainer, estiloFeedback]}>
          <Text style={[styles.feedbackText, { color: obtenerColorPorEstado() }]}>
            {obtenerMensajeEstado()}
          </Text>
        </Animated.View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionTitle}>
            Cómo realizar las sentadillas:
          </Text>
          <Text style={styles.instruction}>
            1. Sostén el teléfono en la mano
          </Text>
          <Text style={styles.instruction}>
            2. Mantén los brazos al costado del cuerpo
          </Text>
          <Text style={styles.instruction}>
            3. Al agacharte, baja el brazo manteniendo el teléfono firme
          </Text>
          <Text style={styles.instruction}>
            4. El sensor detectará el movimiento automáticamente
          </Text>
        </View>

        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Y: {debugY.toFixed(2)}</Text>
          <Text style={styles.debugText}>Magnitud: {debugMagnitud.toFixed(2)}</Text>
          <Text style={styles.debugText}>Delta: {debugDelta.toFixed(2)}</Text>
          <Text style={styles.debugText}>Estado: {estadoActual}</Text>
          <Text style={styles.debugTextThin}>
            Condición: Magnitud &gt; {UMBRAL_MAGNITUD} + Delta &lt; -
            {UMBRAL_MOVIMIENTO} para bajar
          </Text>
          <Text style={styles.debugTextThin}>
            Condición: Magnitud &gt; {UMBRAL_MAGNITUD} + Delta &gt; +
            {UMBRAL_MOVIMIENTO} para subir
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("MainTabs")}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f13",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  calibrationContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaaaaa",
    textAlign: "center",
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: "#1a1a24",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333344",
  },
  statValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 14,
    color: "#888888",
    marginTop: 4,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: "#1a1a24",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333344",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#44ff44",
    borderRadius: 6,
  },
  progressFillTime: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#888888",
    marginTop: 6,
    textAlign: "center",
  },
  feedbackContainer: {
    marginVertical: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "#1a1a24",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#333344",
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  instructionsContainer: {
    backgroundColor: "#1a1a24",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "#333344",
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    color: "#aaaaaa",
    marginBottom: 6,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: "#3498db",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  yDisplayContainer: {
    backgroundColor: "#1a1a24",
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 60,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333344",
    marginVertical: 30,
  },
  yLabel: {
    fontSize: 16,
    color: "#888888",
    marginBottom: 8,
  },
  yValue: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "monospace",
  },
  readyIndicator: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  readyGreen: {
    backgroundColor: "#1a3d1a",
    borderWidth: 1,
    borderColor: "#44ff44",
  },
  readyRed: {
    backgroundColor: "#3d1a1a",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  readyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  calibrateButton: {
    backgroundColor: "#44ff44",
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginVertical: 20,
  },
  calibrateButtonDisabled: {
    backgroundColor: "#333344",
  },
  calibrateButtonText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f0f13",
    textAlign: "center",
  },
  debugTextThin: {
    color: "#888888",
    fontFamily: "monospace",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  debugContainer: {
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  debugText: {
    color: "#00ff00",
    fontFamily: "monospace",
    fontSize: 16,
    textAlign: "center",
  },
});
