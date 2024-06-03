"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import { VERIFY_2FA_PAGE_URL } from "@/constants/constants";
import Loading from "@/components/loading";

interface QrDataInterface {
  secret: string;
  qrUrl: string;
}

export default function Setup2FAPage() {
  const router = useRouter();
  const { checkAuthorization } = useAuth();
  const [qrData, setQrData] = useState<QrDataInterface>({
    secret: "",
    qrUrl: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthorization().then((res) => {
      console.log(res);
      if (res) fetch2FAData();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetch2FAData = async () => {
    await fetch("/api/2fa/setup", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    })
      .then((res) => {
        if (res.status === 401) router.push("/login");
        return res.json();
      })
      .then((res) => {
        setLoading(false);
        setQrData(res.two_factor_data);
      });
  };

  return (
    <div className="pt-[5vh] w-screen h-screen flex flex-col justify-start items-center gap-[1rem]">
      <h1 className="text-2xl font-bold">Setup 2-Factor Authentication</h1>
      <p className="text-center">
        To start using your wallet, please setup two-factor authentication
        <br />
        to improve your account&apos;s security
      </p>
      <div className="">
        {loading ? (
          <Loading />
        ) : (
          <div className="flex flex-col items-center">
            <Image
              src={qrData.qrUrl}
              alt=""
              width={120}
              height={120}
              className="w-[20vw]"
            />
            <p className="mb-[1rem] text-sm">Or Copy Your Secret</p>
            <p className="font-bold flex gap-[1rem]">
              {qrData.secret}{" "}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[1rem] cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(qrData.secret);
                  alert("Copied secret to clipboard!");
                }}
              >
                <path
                  d="M5 15C4.06812 15 3.60218 15 3.23463 14.8478C2.74458 14.6448 2.35523 14.2554 2.15224 13.7654C2 13.3978 2 12.9319 2 12V5.2C2 4.0799 2 3.51984 2.21799 3.09202C2.40973 2.71569 2.71569 2.40973 3.09202 2.21799C3.51984 2 4.0799 2 5.2 2H12C12.9319 2 13.3978 2 13.7654 2.15224C14.2554 2.35523 14.6448 2.74458 14.8478 3.23463C15 3.60218 15 4.06812 15 5M12.2 22H18.8C19.9201 22 20.4802 22 20.908 21.782C21.2843 21.5903 21.5903 21.2843 21.782 20.908C22 20.4802 22 19.9201 22 18.8V12.2C22 11.0799 22 10.5198 21.782 10.092C21.5903 9.71569 21.2843 9.40973 20.908 9.21799C20.4802 9 19.9201 9 18.8 9H12.2C11.0799 9 10.5198 9 10.092 9.21799C9.71569 9.40973 9.40973 9.71569 9.21799 10.092C9 10.5198 9 11.0799 9 12.2V18.8C9 19.9201 9 20.4802 9.21799 20.908C9.40973 21.2843 9.71569 21.5903 10.092 21.782C10.5198 22 11.0799 22 12.2 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </p>

            <button
              className="mt-[2rem] bg-red-400 text-white rounded-md px-4 py-2 transition-all duration-250 hover:scale-105"
              onClick={() => router.push(VERIFY_2FA_PAGE_URL)}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
