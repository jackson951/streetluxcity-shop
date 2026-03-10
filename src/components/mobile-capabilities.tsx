"use client";

import { useEffect, useState } from "react";

// Define types for network status
interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

export function MobileCapabilities() {
  const [isOnline, setIsOnline] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);

  useEffect(() => {
    // Check network status
    const checkNetworkStatus = async () => {
      try {
        // Check if we're in a Capacitor environment
        if (typeof window !== 'undefined' && (window as any).Capacitor) {
          const { Network } = await import('@capacitor/network');
          const status = await Network.getStatus();
          setNetworkStatus(status);
          setIsOnline(status.connected);
        } else {
          // Fallback for web
          setIsOnline(navigator.onLine);
        }
      } catch (error) {
        console.log('Network status check failed:', error);
      }
    };

    // Listen for network changes
    let networkListener: any = null;
    
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      import('@capacitor/network').then(({ Network }) => {
        networkListener = Network.addListener('networkStatusChange', (status: NetworkStatus) => {
          setNetworkStatus(status);
          setIsOnline(status.connected);
        });
      });
    } else {
      // Web fallback
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    // Initial check
    checkNetworkStatus();
  }, []);

  // Show offline indicator when not connected
  if (typeof window !== 'undefined' && !isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 z-50">
        <span className="text-sm font-medium">You are currently offline. Some features may be limited.</span>
      </div>
    );
  }

  return null;
}
