"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RequireNoAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // If user is logged in, redirect to home
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading || user) {
    // Show loading or nothing while redirecting
    return <div className="p-6 text-slate-600">Redirecting...</div>;
  }
  
  return <>{children}</>;
}