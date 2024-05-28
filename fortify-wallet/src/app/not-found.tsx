"use client";

import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();
  router.push("/login");
  return (
    <div className="w-screen h-screen flex items-center justify-center text-2xl font-bold">
      Page Not Found ❌
    </div>
  );
}
