/**
 * OfflineIndicator Component
 * Displays the current online/offline status with visual indicator
 *
 * Shows:
 * - 🟢 ONLINE (green) when connected
 * - 🔴 OFFLINE (red) when disconnected
 */

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isLoading } = useOnlineStatus();

  // Show nothing while loading to avoid flashing
  if (isLoading) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-sm ${
        isOnline
          ? 'bg-green-100 text-green-800 border border-green-300'
          : 'bg-red-100 text-red-800 border border-red-300'
      }`}
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${isOnline ? 'Online' : 'Offline'}`}
    >
      <span className="text-lg">{isOnline ? '🟢' : '🔴'}</span>
      <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
    </div>
  );
};

export default OfflineIndicator;
