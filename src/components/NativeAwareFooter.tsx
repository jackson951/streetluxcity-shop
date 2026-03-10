'use client';
import { useIsNative } from '@/hooks/useNative';
import { Footer } from './footer';

export function NativeAwareFooter() {
  const isNative = useIsNative();
  if (isNative) return null;
  return <Footer />;
}