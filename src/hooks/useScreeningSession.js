import { useState, useEffect, useRef } from 'react';

export const useScreeningSession = (projectId) => {
  const [sessionId, setSessionId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const activityTimer = useRef(null);

  const startSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/screening-sessions/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setIsActive(true);
        console.log('Screening session started:', data.sessionId);
      }
    } catch (error) {
      console.error('Error starting screening session:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/projects/${projectId}/screening-sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Screening session ended:', sessionId);
      setSessionId(null);
      setIsActive(false);
    } catch (error) {
      console.error('Error ending screening session:', error);
    }
  };

  // Track user activity
  const trackActivity = () => {
    if (activityTimer.current) {
      clearTimeout(activityTimer.current);
    }

    activityTimer.current = setTimeout(() => {
      // User is inactive for 5 minutes, end session
      if (isActive) {
        endSession();
      }
    }, 5 * 60 * 1000); // 5 minutes
  };

  useEffect(() => {
    // Start session when component mounts
    startSession();

    // Set up activity tracking
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, trackActivity, true);
    });

    // End session when user leaves the page
    const handleBeforeUnload = () => {
      if (isActive) {
        // Use synchronous request or sendBeacon for better reliability
        navigator.sendBeacon(
          `http://localhost:5000/api/projects/${projectId}/screening-sessions/${sessionId}/end`
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Cleanup
      activityEvents.forEach(event => {
        document.removeEventListener(event, trackActivity, true);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (activityTimer.current) {
        clearTimeout(activityTimer.current);
      }
      
      if (isActive) {
        endSession();
      }
    };
  }, [projectId]);

  return {
    sessionId,
    isActive,
    startSession,
    endSession
  };
};