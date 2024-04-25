"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from '@/components/header';
import useAuth from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { checkStatus } = useAuth();
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    checkStatus().then((res) => {
      if (!res) router.push('/');
      else setVerified(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {
        verified ?
          <>
            <Header />
            {children}
          </>
          :
          <div className="w-screen h-screen flex justify-center items-center">
            Loading...
          </div>
      }
    </>
  );
}
