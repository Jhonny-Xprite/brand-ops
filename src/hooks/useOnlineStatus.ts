/**
 * useOnlineStatus Hook
 * Detects online/offline state and updates on network changes
 *
 * Usage:
 *   const { isOnline, isLoading } = useOnlineStatus();
 *   return <div>{isOnline ? 'Online' : 'Offline'}</div>;
 */

import { useState, useEffect } from 'react';

interface UseOnlineStatusReturn {
  isOnline: boolean;
  isLoading: boolean;
}

export const useOnlineStatus = (): UseOnlineStatusReturn => {
  // Initialize with navigator.onLine (or true for SSR)
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Exit early if navigator is not available (SSR)
    if (typeof navigator === 'undefined') {
      return;
    }

    setIsLoading(true);

    // Define event listeners
    const handleOnline = () => {
      console.log('[useOnlineStatus] Going online');
      setIsOnline(true);
      setIsLoading(false);
    };

    const handleOffline = () => {
      console.log('[useOnlineStatus] Going offline');
      setIsOnline(false);
      setIsLoading(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set loading to false after initial setup
    setIsLoading(false);

    // Cleanup: remove event listeners when component unmounts
    return () => {
      console.log('[useOnlineStatus] Cleaning up event listeners');
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isLoading };
};
