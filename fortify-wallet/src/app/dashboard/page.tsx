"use client";

import { useEffect } from "react";

export default function Dashboard() {
  useEffect(() => {
    const account_id = JSON.parse(
      localStorage.getItem("account") ?? "{}"
    )?.account_id;
    retrieveWallets(account_id);
  }, []);

  return (
    <div className="">
      <h2 className="text-3xl font-bold">Dashboard</h2>
    </div>
  );
}

async function retrieveWallets(account_id: string) {
  await fetch("/api/wallet/retrieve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ account_id }),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      return data;
    });
}
