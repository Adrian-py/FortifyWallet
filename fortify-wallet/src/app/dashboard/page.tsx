"use client";

import { useEffect } from "react";

export default function Dashboard() {
  useEffect(() => {
    retrieveWallets();
  }, []);

  return (
    <div className="">
      <h2 className="text-3xl font-bold">Dashboard</h2>
    </div>
  );
}

async function retrieveWallets() {
  await fetch("/api/wallet/retrieve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      return data;
    });
}
