"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/header";
import Navbar from "@/components/nav";
import useAuth from "@/hooks/useAuth";
import { LOGIN_PAGE_URL } from "@/constants/constants";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { checkAuthorization } = useAuth();
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    checkAuthorization().then((res) => {
      if (!res) router.push(LOGIN_PAGE_URL);
      else setVerified(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {verified ? (
        <>
          <Header />
          <main className="px-[5vw] pt-[2rem]">
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
