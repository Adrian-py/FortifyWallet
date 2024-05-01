"use client";

import { useRouter } from "next/navigation";

import { DASHBOARD_PAGE_URL } from "@/constants/constants";
import { useEffect, useState } from "react";

export default function DerivePage() {
  const router = useRouter();
  const [walletOwner, setWalletOwner] = useState<string>("-" as string);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    handleRetrieveAccountsBelow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (walletOwner === "-") {
      return alert("Choose wallet owner");
    }

    await fetch("/api/wallet/derive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_id: walletOwner,
      }),
    })
      .then((res) => {
        if (res.status == 200) {
          alert("Wallet derived!");
          router.push(DASHBOARD_PAGE_URL);
        } else {
          alert("Error: Something went wrong when deriving wallet");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleRetrieveAccountsBelow = async () => {
    await fetch("/api/account/retrieve", {
      method: "GET",
    })
      .then(async (res) => {
        if (res.status == 200) {
          setAccounts(
            (await res.json()).accounts.filter(
              (account: any) => account.username !== "admin"
            )
          );
        } else {
          alert("Error: Something went wrong when retrieving accounts");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleWalletOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWalletOwner(e.target.value);
  };

  return (
    <div>
      <h1 className="mb-[1rem] text-3xl font-bold">Derive Wallet</h1>
      <p className="mb-[2rem]">
        Derive a new wallet for an account. Newly created wallets will be
        viewable through their dashboard.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label htmlFor="wallet_owner" className="mb-[0.5rem] font-bold">
          Wallet Owner{" "}
          <span className="ml-[1rem] text-gray-500 text-[0.75rem]">
            (username - department)
          </span>
        </label>
        <select
          name="wallet_owner"
          onChange={handleWalletOwnerChange}
          className="px-[0.5rem] py-[0.4rem] w-[50%] border-[2px] border-gray-400 rounded-md"
        >
          <option value="-">-</option>
          {accounts.map((account, ind) => (
            <option key={ind} value={account.account_id}>
              {account.username} - {account.department_name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="mt-8 w-fit px-[1.5rem] py-[0.5rem] bg-red-400 text-white rounded-md hover:scale-[1.05] transition-all duration-150"
        >
          Derive Wallet
        </button>
      </form>
    </div>
  );
}
