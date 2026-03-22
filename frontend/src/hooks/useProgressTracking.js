import { useRef, useCallback, useEffect } from 'react';
import api from '../utils/api';

export function useProgressTracking(materialId, isActive = false) {
  const heartbeatInterval = useRef(null);
  const sessionStartTime = useRef(null);

  const startTracking = useCallback(async () => {
    if (!materialId) return;

    try {
      await api.post(`/progress/start/${materialId}`);
      sessionStartTime.current = Date.now();

      // Start heartbeat every 30 seconds
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      heartbeatInterval.current = setInterval(async () => {
        try {
          await api.put(`/progress/heartbeat/${materialId}`);
        } catch (err) {
          console.error('Heartbeat error:', err);
        }
      }, 30000);
    } catch (err) {
      console.error('Start tracking error:', err);
    }
  }, [materialId]);

  const stopTracking = useCallback(async () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }

    if (materialId && sessionStartTime.current) {
      try {
        await api.put(`/progress/end/${materialId}`);
      } catch (err) {
        console.error('End session error:', err);
      }
    }
    sessionStartTime.current = null;
  }, [materialId]);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, []);

  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && heartbeatInterval.current) {
        stopTracking();
      } else if (!document.hidden && isActive && materialId) {
        startTracking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, materialId, startTracking, stopTracking]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (materialId && sessionStartTime.current) {
        // Synchronous API call on page unload
        navigator.sendBeacon(`/api/progress/end/${materialId}`);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [materialId]);

  return { startTracking, stopTracking };
}
