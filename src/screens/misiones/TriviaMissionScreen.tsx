import { RootStackParamList } from "@/app";
import { supabase } from "@/lib/supabase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TriviaPregunta {
  id: number;
  pregunta: string;
  opcion1: string;
  opcion2: string;
  opcion3: string;
  opcion4: string;
  respuesta_correcta: number;
}

export default function TriviaMissionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { userId, missionId } = route.params as { userId: number; missionId: number };

  const [preguntas, setPreguntas] = useState<TriviaPregunta[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrivia = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('trivia_utec').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Shuffle array to get random questions
          const shuffled = data.sort(() => 0.5 - Math.random());
          // We need 3 questions
          setPreguntas(shuffled.slice(0, 3));
        }
      } catch (error) {
        console.error("Error al obtener la trivia", error);
        Alert.alert("Error", "No se pudo cargar la trivia.");
        navigation.navigate('MainTabs');
      } finally {
        setLoading(false);
      }
    };
    fetchTrivia();
  }, [navigation]);

  const handleOptionSelect = async (optionIndex: number) => {
    const currentQuestion = preguntas[currentQuestionIndex];
    
    if (optionIndex === currentQuestion.respuesta_correcta) {
      // Correct!
      if (currentQuestionIndex < preguntas.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Finished all questions successfully
        await completeMission();
      }
    } else {
      // Wrong!
      const opcionesTexto = [currentQuestion.opcion1, currentQuestion.opcion2, currentQuestion.opcion3, currentQuestion.opcion4];
      const respuestaCorrectaTexto = opcionesTexto[currentQuestion.respuesta_correcta - 1];

      Alert.alert(
        "¡Incorrecto!", 
        `La respuesta correcta era: ${respuestaCorrectaTexto}. Inténtalo nuevamente.`,
        [{ text: "Aceptar", onPress: () => navigation.navigate('MainTabs') }]
      );
    }
  };



  const completeMission = async () => {
    if (userId && missionId) {
      const { error } = await supabase
        .from('progreso_usuario')
        .update({ completado: true })
        .eq('perfil_id', userId)
        .eq('mision_id', missionId)
        .eq('fecha', new Date().toISOString().split('T')[0]);

      if (error) {
        console.error("Error al completar misión:", error);
      }
    }
    navigation.navigate('MainTabs', { showPack: true });
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (preguntas.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.titulo}>No hay preguntas disponibles.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.volverBtn}>
          <Text style={styles.volverBtnTexto}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = preguntas[currentQuestionIndex];
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.progresoTexto}>
          Pregunta {currentQuestionIndex + 1} de {preguntas.length}
        </Text>
      </View>

      <View style={styles.preguntaContainer}>
        <Text style={styles.preguntaTexto}>{currentQuestion.pregunta}</Text>
      </View>

      <View style={styles.opcionesContainer}>
        <TouchableOpacity style={styles.opcionBtn} onPress={() => handleOptionSelect(1)}>
          <Text style={styles.opcionTexto}>{currentQuestion.opcion1}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.opcionBtn} onPress={() => handleOptionSelect(2)}>
          <Text style={styles.opcionTexto}>{currentQuestion.opcion2}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.opcionBtn} onPress={() => handleOptionSelect(3)}>
          <Text style={styles.opcionTexto}>{currentQuestion.opcion3}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.opcionBtn} onPress={() => handleOptionSelect(4)}>
          <Text style={styles.opcionTexto}>{currentQuestion.opcion4}</Text>
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
  progresoTexto: {
    color: "#3498db",
    fontSize: 18,
    fontWeight: 'bold',
  },
  preguntaContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  preguntaTexto: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  opcionesContainer: {
    flex: 2,
    justifyContent: 'flex-start',
    gap: 15,
  },
  opcionBtn: {
    backgroundColor: "#1a1a20",
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  opcionTexto: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  titulo: {
    color: "white",
    fontSize: 20,
    marginBottom: 20,
  },
  volverBtn: {
    backgroundColor: "#3498db",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  volverBtnTexto: {
    color: "white",
    fontSize: 18,
    fontWeight: 'bold',
  }
});
