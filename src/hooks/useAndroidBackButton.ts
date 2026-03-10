'use client';
import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useAndroidBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const lastBackPress = useRef<number>(0);

  // Pages that should never be returned to after leaving
  const AUTH_PAGES = ['/login', '/register', '/verify-otp', '/forgot-password'];

  useEffect(() => {
    const setupBackButton = async () => {
      const { App } = await import('@capacitor/app');
      const { Toast } = await import('@capacitor/toast');

      App.addListener('backButton', ({ canGoBack }) => {
        // If current page is an auth page, go home instead of back
        if (AUTH_PAGES.includes(pathname)) {
          router.replace('/');
          return;
        }

        if (canGoBack) {
          // Check if going back would land on an auth page
          // by replacing instead of going back when on sensitive pages
          router.back();
        } else {
          const now = Date.now();
          if (now - lastBackPress.current < 2000) {
            App.exitApp();
          } else {
            lastBackPress.current = now;
            Toast.show({ text: 'Press back again to exit', duration: 'short' });
          }
        }
      });
    };

    if ((window as any).Capacitor?.isNativePlatform()) {
      setupBackButton();
    }

    return () => {
      import('@capacitor/app').then(({ App }) => App.removeAllListeners());
    };
  }, [router, pathname]);
}