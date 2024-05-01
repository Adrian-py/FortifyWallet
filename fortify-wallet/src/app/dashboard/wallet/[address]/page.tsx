"use client";

import { useEffect, useState } from "react";
import { DASHBOARD_PAGE_URL } from "@/constants/constants";
import Loading from "@/components/loading";

export default function WalletDetailPage({
  params,
}: {
  params: { address: string };
}) {
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    handleRetrieveWalletInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetrieveWalletInfo = async () => {
    try {
      await fetch("/api/wallet/info?address=" + params.address, {
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
          if (res.status !== 200) throw new Error(res.error);
          setWalletInfo(res.wallet_info);
          setLoading(false);
        });
    } catch (err) {
      setLoading(false);
      alert(err);
    }
  };

  const formatDate = (date: string): string => {
    const currentDate = new Date();
    const confirmedDate = new Date(date);
    const diffInDays = Math.floor(
      (currentDate.getTime() - confirmedDate.getTime()) / (1000 * 3600 * 24)
    );
    return `${diffInDays} days ago`;
  };

  return (
    <>
      <div className="mb-16 flex items-center justify-between">
        <div className="flex items-center gap-[1rem]">
          <a
            href={DASHBOARD_PAGE_URL}
            className="text-slate-400 hover:text-slate-800"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-150"
              />
            </svg>
          </a>

          <h2 className="text-3xl font-bold">Wallet Detail</h2>
        </div>
        <h4 className="text-slate-500">Address: {params.address}</h4>
      </div>

      {loading ? (
        <Loading />
      ) : walletInfo === null ? (
        <p className="w-full text-center text-slate-400">
          Please try again later!
        </p>
      ) : (
        <>
          <div className="mb-8 flex flex-col gap-[1rem]">
            <p className="text-lg text-slate-400">Total Balance</p>
            <h3 className="text-5xl font-bold">
              {(walletInfo.balance ?? 0 / 100000000).toFixed(8)}{" "}
              <span className="text-sm text-slate-400">BTC</span>
            </h3>
          </div>

          <div className="">
            <h3 className="mb-8 text-xl font-bold">Transactions</h3>
            <div className="w-full flex flex-col gap-[1rem]">
              {walletInfo.txrefs?.map((tx: any, ind: number) => (
                <div
                  key={ind}
                  className="w-full px-[1rem] py-[0.75rem] border-[1px] border-slate-100 rounded-lg hover:bg-slate-100 transition-all duration-150 "
                >
                  <div className="w-full flex justify-between font-bold">
                    <p
                      className={
                        tx.tx_input_n === -1 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {tx.tx_input_n === -1 ? "Received" : "Sent"}
                    </p>
                    <p className="">{tx.value / 100000000} BTC</p>
                  </div>
                  <p className="text-sm text-slate-400">
                    {formatDate(tx.confirmed)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
