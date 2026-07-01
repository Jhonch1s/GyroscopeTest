import { RootStackParamList } from "@/app";
import { supabase } from "@/lib/supabase";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  SensorType,
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";


const THRESHOLD = 0.1;

export default function DontTouchScreen() {

  const sensor = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 100 });
  const texto = "esta es la pantalla donde esta el cronometro";
  const route = useRoute();
  const { userId, missionId } = route.params as { userId: number; missionId: number };
  
  const initialTime = missionId === 5 ? 600 : 60;
  const [timerCount, setTimer] = useState(initialTime);
  const [completed, setCompleted] = useState(false);
  const [movido, setMovido] = useState(false);
  const [volverHome, setVolverHome] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const isMoving = useDerivedValue(() => {
    const { x, y, z } = sensor.sensor.value;
    // Comparar valor absoluto con el umbral
    return (
      Math.abs(x) > THRESHOLD ||
      Math.abs(y) > THRESHOLD ||
      Math.abs(z) > THRESHOLD
    );
  });

  const messageStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: isMoving.value ? 1 : 0.3,
      color: isMoving.value ? '#ff4444' : '#44ff44',
      transform: [
        {
          scale: withSpring(isMoving.value ? 1.1 : 1),
        },
      ],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    'worklet';
    const { x, y, z } = sensor.sensor.value;
    return {
      color: '#aaa',
      fontSize: 18,
    };
  });

  useEffect(() => {
    if (timerCount === 0) {
      handleTimerEnd();
      return;
    }


     if (timerCount < 0) return;

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerCount]);

   useEffect(() => {
    if (isMoving.value) {
      setTimer(initialTime);
    }
  }, [isMoving.value]);

  const handleTimerEnd = async () => {
    if (completed) return; // Ya se completó
    setCompleted(true);

    // 1. Actualizar la base de datos
    if (userId && missionId) {
      const { error } = await supabase
        .from('progreso_usuario')
        .update({ completado: true })
        .eq('perfil_id', userId)
        .eq('mision_id', missionId)
        .eq('fecha', new Date().toISOString().split('T')[0]);

      if (error) {
        console.error("Error al completar misión 31:", error);
        
        setCompleted(false); 
        return;
      }
    }

    navigation.navigate('MainTabs', { showPack: true },
    );
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

  
  


  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.containCountdown}>

        <Text style={styles.titulo}>Tiempo de Relajación</Text>
        <Text style={styles.countdown}>{timerCount}</Text>
        
        <Text style={styles.texto}>Para conseguir tu recompensa, no muevas el Dispositivo durante el tiempo restante del cronometro</Text>
        <Text style={styles.texto}>{movido ? "TelefonoMovido" : ""}</Text>      
      </View>


      {/* Mensaje animado según movimiento */}
      <Animated.Text style={[styles.message, messageStyle]}>
        {isMoving.value ? '¡Movimiento detectado!' : 'Dispositivo quieto'}
      </Animated.Text>

      <View>
          <TouchableOpacity onPress={() => {
            setTimer(initialTime);
            navigation.navigate('MainTabs')
          }} style={styles.botonContainer}>
            <Text style={styles.boton}>Regresar</Text>
          </TouchableOpacity>

      </View>
    </View>

  )


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: 1000,
    backgroundColor: "#0f0f13",

  },
  containCountdown: {
    width: 300
  },
  countdown: {
    textAlign: "center",
    color: "white",
    fontSize: 100

  },
  texto: {
    textAlign: "center",
    color: "white",
    fontSize: 16
  },
  titulo: {
    textAlign: "center",
    color: "white",
    fontSize: 24
  },
  botonContainer:{
    backgroundColor: "#3498db",
    width: 120,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  boton:{
    textAlign: "center",
    fontSize: 20,
    color: "white",
  },
  message: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
  },
})
