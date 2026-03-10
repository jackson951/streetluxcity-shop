import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { ClientErrorObserver } from "@/components/client-error-observer";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { MobileCapabilities } from "@/components/mobile-capabilities";
import { AndroidBackHandler } from "@/components/AndroidBackHandler";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { NativeAwareFooter } from "@/components/NativeAwareFooter";
import { NativeMain } from "@/components/NativeMain";
import { NativeAwareWhatsApp } from "@/components/NativeAwareWhatsApp";
import { NativeAwareCookieConsent } from "@/components/NativeAwareCookieConsent";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "StreetLuxCity Shop",
  description: "Your trusted clothing store - Shop on mobile with offline support",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          <AndroidBackHandler />
          <ServiceWorkerRegistration />
          <MobileCapabilities />
          <ClientErrorObserver />
          <div className="flex min-h-screen flex-col">
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>
            <NativeMain>{children}</NativeMain>
            <NativeAwareFooter />
            <MobileBottomNav />
            <NativeAwareWhatsApp />
            <NativeAwareCookieConsent />
            <Analytics />
          </div>
        </Providers>
      </body>
    </html>
  );
}