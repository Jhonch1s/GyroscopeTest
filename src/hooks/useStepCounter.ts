import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';

export function useStepCounter() {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const init = async () => {
      try {
        const available = await Pedometer.isAvailableAsync();
        setIsAvailable(available);
        if (!available) {
          setError('El contador de pasos no está disponible en este dispositivo');
        }
      } catch (e) {
        setIsAvailable(false);
        setError('Error al verificar disponibilidad del podómetro');
      }
    };
    init();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Pedometer.requestPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      setError('Error al solicitar permiso del podómetro');
      return false;
    }
  }, []);

  const startTracking = useCallback(async () => {
    if (!isAvailable) return;
    
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      setError('Permiso denegado');
      return;
    }

    const start = () => {
      if (subscriptionRef.current) return;
      try {
        subscriptionRef.current = Pedometer.watchStepCount(result => {
          setSteps(result.steps);
        });
        setError(null);
      } catch (e) {
        setError('No se pudo iniciar el podómetro');
      }
    };

    const stop = () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };

    start();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current === 'background' && nextAppState === 'active') {
        start();
      } else if (appStateRef.current === 'active' && nextAppState === 'background') {
        stop();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      stop();
      subscription.remove();
    };
  }, [isAvailable, requestPermission]);

  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
  }, []);

  return {
    steps,
    isAvailable,
    error,
    startTracking,
    stopTracking,
  };
}
