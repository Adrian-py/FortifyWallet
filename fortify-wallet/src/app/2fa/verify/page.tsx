"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Verify2FAPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Verify valid otp was inputted
    if (otp.length < 6) {
      alert("OTP must be 6 characters long");
      return;
    }

    await fetch("/api/2fa/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp }),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.status === 200) return router.push("/dashboard");
        alert(res.error);
        e.currentTarget.reset();
        setOtp("");
      });
  };

  const handleValidateInputIsNumber = (e: React.KeyboardEvent) => {
    if (/^[a-z]$/.test(e.key) || (otp.length >= 6 && /^[0-9]$/.test(e.key)))
      e.preventDefault();
  };

  return (
    <div className="pt-[5vh] w-screen h-screen flex flex-col justify-start items-center gap-[1rem]">
      <h1 className="text-2xl font-bold">Verify 2-Factor Authentication</h1>
      <p className="mb-[2rem] text-center">
        To verify your identity, please continue by entering the OTP
        <br />
        displayed in your authenticator app.
      </p>
      <form
        className="flex flex-col justify-center items-center"
        onSubmit={handleVerifyOtp}
      >
        <input
          type="text"
          onChange={(e) => setOtp(e.target.value)}
          className="mb-[2rem] border-[2px] px-[1rem] py-[0.5rem] outline-none rounded-md focus:border-slate-400 tracking-[0.5rem]"
          placeholder="XXXXXX"
          onKeyDown={handleValidateInputIsNumber}
        />
        <input
          type="submit"
          value="Submit"
          className="w-fit px-[1.5rem] py-[0.5rem] bg-red-400 text-white rounded-md cursor-pointer transition-all duration-250 hover:scale-105"
        />
      </form>
    </div>
  );
}
