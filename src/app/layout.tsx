import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "StreetLuxCity E-Commerce",
  description: "Full e-commerce frontend"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
