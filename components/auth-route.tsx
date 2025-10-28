// components/auth-route.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { decodeJwt } from "jose";

export default function AuthRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{children}</>; // Ou um loading state
  }
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      
      if (!token) {
        router.push("/login");
        return;
      }
      
      try {
        decodeJwt(token);
      } catch {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  }, [router]);

  return <>{children}</>;
}