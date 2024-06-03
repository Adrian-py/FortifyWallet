"use client";

import { useState } from "react";

import useAuth from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(username, password).catch((err) => {
      setErrorMessage(err.message);
    });
  };

  return (
    <div className="h-screen flex justify-center items-center flex-col">
      <h1 className="mb-8 text-2xl font-bold">Fortify Wallet</h1>
      <form
        className="w-[50%] max-w-[25rem] flex items-center flex-col gap-[1rem]"
        onSubmit={handleSubmit}
      >
        {errorMessage && (
          <p className="mb-[1rem] w-full px-[10%] py-[0.75rem] text-center bg-red-600 text-white rounded-lg text-sm">
            {errorMessage}
          </p>
        )}
        <div className="w-full flex flex-col">
          <label htmlFor="username" className="mb-[0.5rem]">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="mb-4 border-b-[2px] px-[1rem] py-[0.5rem]"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="password" className="mb-[0.5rem]">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="mb-8 border-b-[2px] px-[1rem] py-[0.5rem]"
            onChange={(e) => setPassword(e.target.value)}
            required
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
