"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CREATE_ACCOUNTS_PAGE_URL } from "@/constants/constants";

interface AccountInterface {
  account_id: string;
  username: string;
  email: string;
  role_name: string;
  department_name: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountInterface[]>([]);

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
          setAccounts(res.accounts);
        });
    };
    retrieveAccounts();
  }, []);

  return (
    <div className="">
      <div className="mb-[1rem] w-full flex justify-between items-center">
        <h2 className="text-3xl font-bold">Accounts</h2>
        <button
          onClick={() => router.push(CREATE_ACCOUNTS_PAGE_URL)}
          className="w-fit px-[1.25rem] py-[0.5rem] flex items-center gap-[0.5rem] bg-red-400 text-white rounded-md hover:scale-[1.05] transition-all duration-150"
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
            <th className="w-[6rem] max-w-[8vw] px-2 py-1">No</th>
            <th className="w-[30rem] max-w-[25vw] px-2 py-1">Username</th>
            <th className="w-[30rem] max-w-[25vw] px-2 py-1">Email</th>
            <th className="w-[15rem] max-w-[10vw] px-2 py-1">Role</th>
            <th className="w-[15rem] max-w-[25vw] px-2 py-1">Department</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {accounts.map((account, ind) => (
            <tr key={ind} className="px-[1rem] py-2">
              <td className="w-[4rem] max-w-[5vw] y-2 px-2 overflow-hidden text-ellipsis">
                {ind + 1}
              </td>
              <td className="w-[30rem] max-w-[25vw] py-2 px-2 overflow-hidden text-ellipsis">
                {account.username}
              </td>
              <td className="w-[30rem] max-w-[25vw] py-2 px-2 overflow-hidden text-ellipsis">
                {account.email}
              </td>
              <td className="w-[15rem] max-w-[10vw] py-2 px-2 overflow-hidden text-ellipsis">
                {account.role_name}
              </td>
              <td className="w-[15rem] max-w-[25vw] py-2 px-2 overflow-hidden text-ellipsis">
                {account.department_name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
