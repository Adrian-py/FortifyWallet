"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import { DASHBOARD_PAGE_URL } from "@/constants/constants";

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      if (await isAuthenticated()) {
        router.push(DASHBOARD_PAGE_URL);
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}
