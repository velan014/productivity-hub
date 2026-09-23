import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>You are currently offline. Local cache is active; server actions will resume once reconnected.</span>
    </div>
  );
};
