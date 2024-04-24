"use client";

import { useEffect } from "react";

export default function Dashboard() {
  useEffect(() => {
    const user_id = JSON.parse(localStorage.getItem("user") ?? "{}")?.user_id;
    retrieveWallets(user_id);
  }, []);

  return <>Dashboard</>;
}

async function retrieveWallets(user_id: string) {
  await fetch("/api/wallet/retrieve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id }),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      return data;
    });
}
