"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();

  useEffect(() => {
    verifyToken().then((res) => {
      if (res.status !== 200) {
        router.push("/");
      }
    });
  }, [router]);
  return <>{children}</>;
}

async function verifyToken(): Promise<Response> {
  return await fetch("/api/auth/status", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
    credentials: "include",
  });
}
