import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for passive scroll event listeners
 * Improves scrolling performance by not blocking the main thread
 */
export const usePassiveScroll = (callback) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleScroll = useCallback(() => {
    callbackRef.current();
  }, []);

  useEffect(() => {
    // Use passive event listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);
};
