"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CREATE_ACCOUNTS_PAGE_URL } from "@/constants/constants";

interface UserInterface {
  account_id: string;
  username: string;
  email: string;
  role_name: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [accounts, setUsers] = useState<UserInterface[]>([]);

  useEffect(() => {
    const retrieveAccounts = async () => {
      await fetch("/api/account/retrieve", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          console.log(res);
          setUsers(res.accounts);
        });
    };
    retrieveAccounts();
  }, []);

  return (
    <div className="">
      <div className="w-full flex justify-between items-center">
        <h2 className="mb-[1rem] text-3xl font-bold">Accounts</h2>
        <button
          onClick={() => router.push(CREATE_ACCOUNTS_PAGE_URL)}
          className="w-fit px-[1.25rem] py-[0.5rem] flex gap-[0.5rem] bg-red-400 text-white rounded-md hover:scale-[1.05] transition-all duration-150"
        >
          Create Account
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
      </div>
      <table className="text-left">
        <thead className="font-bold">
          <tr>
            <th className="w-[5vw] max-w-[4rem] px-2 py-1">No</th>
            <th className="w-[25vw] max-w-[30rem] px-2 py-1">Username</th>
            <th className="w-[25vw] max-w-[30rem] px-2 py-1">Email</th>
            <th className="w-[10vw] max-w-[8rem] px-2 py-1">Role</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {accounts.map((account, ind) => (
            <tr key={account.account_id} className="px-[1rem] py-2">
              <td className="y-2 px-2">{ind + 1}</td>
              <td className="py-2 px-2">{account.username}</td>
              <td className="py-2 px-2">{account.email}</td>
              <td className="py-2 px-2">{account.role_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
