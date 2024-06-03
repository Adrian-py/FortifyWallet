"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/header";
import Navbar from "@/components/nav";
import useAuth from "@/hooks/useAuth";
import { SETUP_2FA_PAGE_URL, VERIFY_2FA_PAGE_URL } from "@/constants/constants";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { checkAuthorization } = useAuth();
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    checkAuthorization().then((res) => {
      if (!res.enabled_two_factor) return router.push(SETUP_2FA_PAGE_URL);
      else if (!res.verified_2fa) return router.push(VERIFY_2FA_PAGE_URL);
      setVerified(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {verified ? (
        <>
          <Header />
          <main className="w-screen px-[5vw] pt-[2rem]">
            <Navbar />
            {children}
          </main>
        </>
      ) : (
        <div className="w-screen h-screen flex justify-center items-center">
          Loading...
        </div>
      )}
    </>
  );
}
