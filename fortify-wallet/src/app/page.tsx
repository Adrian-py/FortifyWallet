"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.message === "Authorized!") {
          localStorage.setItem("user", JSON.stringify(res.user));
          router.push("/dashboard");
        }
      });
  };

  return (
    <div className="h-screen flex justify-center items-center flex-col">
      <h1 className="mb-8 text-2xl font-bold">Fortify Wallet</h1>
      <form
        className="w-[50%] max-w-[25rem] flex items-center flex-col"
        onSubmit={handleSubmit}
      >
        <div className="w-full flex flex-col">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            className="mb-4 border-b-[2px]"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="mb-8 border-b-[2px]"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-fit px-[1.5rem] py-[0.5rem] bg-red-400 text-white rounded-md"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
