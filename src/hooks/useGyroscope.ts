import { SensorType, useAnimatedSensor } from "react-native-reanimated";

export const useGyroscope = (interval = 16) => {
  //inicializamos el sensor nativo una vez sola
  const animatedSensor = useAnimatedSensor(SensorType.GYROSCOPE, { interval });

  //retornamos el valor directamente para ser consumido cuantas veces sea necesario
  return animatedSensor.sensor;
};
