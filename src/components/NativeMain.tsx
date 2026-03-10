'use client';
import { useIsNative } from '@/hooks/useNative';

export function NativeMain({ children }: { children: React.ReactNode }) {
  const isNative = useIsNative();
  return (
    <main className={`mx-auto w-full max-w-[1500px] flex-1 px-3 py-6 sm:px-5 lg:px-8 ${
      isNative ? 'pb-24' : ''
    }`}>
      {children}
    </main>
  );
}