"use client";

import Header from '@/components/header';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UsersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { checkStatus } = useAuth();

  useEffect(() => {
    checkStatus().then((res) => {
      if (!res) router.push('/');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <><Header />{children}</>
};