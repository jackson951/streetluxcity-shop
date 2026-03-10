'use client';
import { useState, useEffect } from 'react';

export function useIsNative() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const checkNative = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        setIsNative(Capacitor.isNativePlatform());
      } catch {
        setIsNative(false);
      }
    };
    checkNative();
  }, []);

  return isNative;
}