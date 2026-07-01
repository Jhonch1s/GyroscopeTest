import { useEffect, useState, useCallback, useRef } from 'react';
import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid, AppState, AppStateStatus } from 'react-native';

const { GoogleFitStepModule, StepCounterModule } = NativeModules;

const googleFitEmitter = Platform.OS === 'android' ? new NativeEventEmitter(GoogleFitStepModule) : null;
const stepCounterEmitter = Platform.OS === 'android' ? new NativeEventEmitter(StepCounterModule) : null;

interface StepCounterResult {
  steps: number;
}

const POLLING_INTERVAL = 30000;

export function useStepCounter() {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isUsingGoogleFit, setIsUsingGoogleFit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      setError('Step counter is only available on Android');
      return;
    }

    const checkGoogleFit = async () => {
      try {
        const available = await GoogleFitStepModule.isAvailable();
        if (available) {
          setIsAvailable(true);
          setIsUsingGoogleFit(true);
          return true;
        }
      } catch (e) {
        // GoogleFit not available
      }
      return false;
    };

    const checkFallback = async () => {
      try {
        const available = await StepCounterModule.isStepCounterAvailable();
        if (available) {
          setIsAvailable(true);
          setIsUsingGoogleFit(false);
          return true;
        }
      } catch (e) {
        // Fallback not available
      }
      return false;
    };

    const init = async () => {
      const hasGoogleFit = await checkGoogleFit();
      if (!hasGoogleFit) {
        await checkFallback();
      }
      if (!isAvailable) {
        setError('No step counter available on this device');
      }
    };

    init();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        {
          title: 'Permission to count steps',
          message: 'This app needs access to your step counter to track daily steps.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (e) {
      setError('Failed to request step counter permission');
      return false;
    }
  }, []);

  const startTracking = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      setError('Permission denied');
      return;
    }

    const subscriptionRef = { current: null as any };

    const startGoogleFit = async () => {
      try {
        await GoogleFitStepModule.startPolling(POLLING_INTERVAL);

        subscriptionRef.current = googleFitEmitter?.addListener(
          'onStepCountUpdate',
          (result: StepCounterResult) => {
            setSteps(result.steps);
          }
        );

        setError(null);
        return true;
      } catch (e) {
        setError('Failed to start Google Fit step counter');
        return false;
      }
    };

    const startFallback = async () => {
      try {
        await StepCounterModule.startStepCounter();

        subscriptionRef.current = stepCounterEmitter?.addListener(
          'onStepCountUpdate',
          (result: StepCounterResult) => {
            setSteps(result.steps);
          }
        );

        setError(null);
        return true;
      } catch (e) {
        setError('Failed to start step counter');
        return false;
      }
    };

    let started = false;
    if (isUsingGoogleFit) {
      started = await startGoogleFit();
      if (!started) {
        started = await startFallback();
        if (started) setIsUsingGoogleFit(false);
      }
    } else {
      started = await startFallback();
    }

    if (!started) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current === 'background' && nextAppState === 'active') {
        if (isUsingGoogleFit) {
          GoogleFitStepModule.startPolling(POLLING_INTERVAL);
        } else {
          StepCounterModule.startStepCounter();
        }
      } else if (appStateRef.current === 'active' && nextAppState === 'background') {
        if (isUsingGoogleFit) {
          GoogleFitStepModule.stopPolling();
        } else {
          StepCounterModule.stopStepCounter();
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscriptionRef.current?.remove();
      if (isUsingGoogleFit) {
        GoogleFitStepModule.stopPolling();
      } else {
        StepCounterModule.stopStepCounter();
      }
      subscription.remove();
    };
  }, [isAvailable, isUsingGoogleFit, requestPermission]);

  const stopTracking = useCallback(async () => {
    try {
      if (isUsingGoogleFit) {
        await GoogleFitStepModule.stopPolling();
      } else {
        await StepCounterModule.stopStepCounter();
      }
    } catch (e) {
      setError('Failed to stop step counter');
    }
  }, [isUsingGoogleFit]);

  return {
    steps,
    isAvailable,
    isUsingGoogleFit,
    error,
    startTracking,
    stopTracking,
  };
}
