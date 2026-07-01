import { RootStackParamList } from "@/app";
import { supabase } from "@/lib/supabase";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState, useCallback } from "react";
import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ReadingMissionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { userId, missionId } = route.params as { userId: number; missionId: number };

  const initialTime = missionId === 6 ? 600 : 60;
  const [timerCount, setTimer] = useState(initialTime);
  const [completed, setCompleted] = useState(false);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [volverHome, setVolverHome] = useState(false);

  useEffect(() => {
    const fetchTexto = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('texto_educativo').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          setTexto(data[randomIndex].contenido);
        } else {
          setTexto("No se encontraron textos educativos.");
        }
      } catch (error) {
        console.error("Error al obtener el texto educativo", error);
        setTexto("Hubo un error al cargar el texto. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchTexto();
  }, []);

  useEffect(() => {
    if (timerCount <= 0) return;

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerCount]);

  const handleFinalizar = async () => {
    if (timerCount > 0) {
      Alert.alert(
        "Lectura Incompleta",
        "Debes leer el texto completo. Aún no ha pasado un minuto."
      );
      return;
    }

    if (completed) return;
    setCompleted(true);

    if (userId && missionId) {
      const { error } = await supabase
        .from('progreso_usuario')
        .update({ completado: true })
        .eq('perfil_id', userId)
        .eq('mision_id', missionId)
        .eq('fecha', new Date().toISOString().split('T')[0]);

      if (error) {
        console.error("Error al completar misión 32:", error);
        setCompleted(false); 
        return;
      }
    }

    navigation.navigate('MainTabs', { showPack: true });
  };

  useEffect(() => {
    if (volverHome) {
      navigation.navigate('MainTabs');
      setVolverHome(false); 
    }
  }, [volverHome, navigation]);

  useFocusEffect(
    useCallback(() => {
      setTimer(initialTime);
      setCompleted(false);
      setVolverHome(false);
    }, [initialTime])
  );

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Tiempo restante:</Text>
        <Text style={[styles.countdown, timerCount === 0 && { color: '#2ecc71' }]}>
          {timerCount > 0 ? `${timerCount}s` : "¡Completado!"}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.textoEducativo}>{texto}</Text>
      </ScrollView>

      <View style={styles.botonesContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.botonSecundario}>
          <Text style={styles.botonSecundarioTexto}>Regresar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleFinalizar} 
          style={[styles.botonPrimario, timerCount > 0 && styles.botonPrimarioDeshabilitado]}
        >
          <Text style={styles.botonPrimarioTexto}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f13",
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  titulo: {
    color: "#ccc",
    fontSize: 20,
  },
  countdown: {
    color: "white",
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#1a1a20',
    borderRadius: 12,
    marginVertical: 20,
  },
  scrollContent: {
    padding: 20,
  },
  textoEducativo: {
    color: 'white',
    fontSize: 18,
    lineHeight: 28,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  botonSecundario: {
    flex: 1,
    backgroundColor: "#333",
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
  },
  botonSecundarioTexto: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
  },
  botonPrimario: {
    flex: 1,
    backgroundColor: "#3498db",
    paddingVertical: 15,
    borderRadius: 12,
    marginLeft: 10,
  },
  botonPrimarioDeshabilitado: {
    backgroundColor: "#2980b9",
    opacity: 0.7,
  },
  botonPrimarioTexto: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: 'bold',
  },
});
