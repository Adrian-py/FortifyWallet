"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DERIVE_WALLET_PAGE_URL } from "@/constants/constants";

interface WalletInterface {
  address: string;
  owned_by: string;
  department: string;
}

export default function Dashboard() {
  const user_role: string = JSON.parse(
    localStorage.getItem("account") ?? "{}"
  ).role;

  const router = useRouter();
  const [wallets, setWallets] = useState<WalletInterface[]>([]);

  useEffect(() => {
    retrieveWallets().then((res) => {
      setWallets(res.wallet);
    });
  }, []);

  return (
    <div className="">
      <div className="mb-[1rem] w-full flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        {user_role !== "member" && (
          <button
            onClick={() => router.push(DERIVE_WALLET_PAGE_URL)}
            className="w-fit px-[1.25rem] py-[0.5rem] flex items-center gap-[0.5rem] bg-red-400 text-white rounded-md hover:scale-[1.05] transition-all duration-150"
          >
            Derive Addresses
            <svg
              className="w-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      <table className="text-left">
        <thead className="font-bold">
          <tr>
            <th className="w-[6rem] max-w-[8vw] px-2 py-1">No</th>
            <th className="w-[30rem] max-w-[25vw] px-2 py-1">Address</th>
            <th className="w-[15rem] max-w-[25vw] px-2 py-1">Owned By</th>
            <th className="w-[15rem] max-w-[25vw] px-2 py-1">Department</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {wallets.map((wallet, ind) => (
            <tr key={ind} className="px-[1rem] py-2">
              <td className="w-[6rem] max-w-[8vw] y-2 px-2 overflow-hidden text-ellipsis">
                {ind + 1}
              </td>
              <td className="w-[30rem] max-w-[25vw] py-2 px-2 overflow-hidden text-ellipsis">
                {wallet.address}
              </td>
              <td className="w-[15rem] max-w-[10vw] py-2 px-2 overflow-hidden text-ellipsis">
                {wallet.owned_by}
              </td>
              <td className="w-[15rem] max-w-[25vw] py-2 px-2 overflow-hidden text-ellipsis">
                {wallet.department}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function retrieveWallets() {
  return await fetch("/api/wallet/retrieve", {
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
