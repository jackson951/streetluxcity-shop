'use client';
import { useIsNative } from '@/hooks/useNative';
import { CookieConsent } from './cookie-consent';

export function NativeAwareCookieConsent() {
  const isNative = useIsNative();
  if (isNative) return null;
  return <CookieConsent />;
}