"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { DASHBOARD_PAGE_URL } from "@/constants/constants";
import Loading from "@/components/loading";

const dummyData = {
  address: "mqToiL4VDRFpD9cQ3JmWCoRgG8EscmakG4",
  total_received: 18952,
  total_sent: 0,
  balance: 18952,
  unconfirmed_balance: 0,
  final_balance: 18952,
  n_tx: 1,
  unconfirmed_n_tx: 0,
  final_n_tx: 1,
  txrefs: [
    {
      tx_hash:
        "ae83e747a1ed27e9c1f3c495e5a1d5f889d8139b31325068a3a766abf26737e7",
      block_height: 2810735,
      tx_input_n: -1,
      tx_output_n: 1,
      value: 18952,
      ref_balance: 18952,
      spent: false,
      confirmations: 3,
      confirmed: "2024-05-02T13:00:20Z",
      double_spend: false,
    },
  ],
  tx_url: "https://api.blockcypher.com/v1/btc/test3/txs/",
};

export default function WalletDetailPage({
  params,
}: {
  params: { address: string };
}) {
  const path_name = usePathname();
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
      <div className="my-16 flex items-center justify-between">
        <div className="relative -translate-x-[2.5rem] flex items-center gap-[1rem]">
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
          <div className="mb-8 w-full flex justify-between items-end">
            <div className="flex flex-col gap-[1rem]">
              <p className="text-lg text-slate-400">Total Balance</p>
              <h3 className="text-5xl font-bold">
                {((walletInfo.balance ?? 0) / 100000000).toFixed(8)}{" "}
                <span className="text-sm text-slate-400">BTC</span>
              </h3>
            </div>
            <a
              className="w-fit h-fit px-[1.5rem] py-[0.5rem] bg-red-400 text-white rounded-md flex gap-[0.5rem] hover:scale-[1.05] transition-all duration-150"
              href={path_name + "/transfer"}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 "
              >
                <path
                  d="M10.4995 13.5001L20.9995 3.00005M10.6271 13.8281L13.2552 20.5861C13.4867 21.1815 13.6025 21.4791 13.7693 21.566C13.9139 21.6414 14.0862 21.6415 14.2308 21.5663C14.3977 21.4796 14.5139 21.1821 14.7461 20.587L21.3364 3.69925C21.5461 3.16207 21.6509 2.89348 21.5935 2.72185C21.5437 2.5728 21.4268 2.45583 21.2777 2.40604C21.1061 2.34871 20.8375 2.45352 20.3003 2.66315L3.41258 9.25349C2.8175 9.48572 2.51997 9.60183 2.43326 9.76873C2.35809 9.91342 2.35819 10.0857 2.43353 10.2303C2.52043 10.3971 2.81811 10.5128 3.41345 10.7444L10.1715 13.3725C10.2923 13.4195 10.3527 13.443 10.4036 13.4793C10.4487 13.5114 10.4881 13.5509 10.5203 13.596C10.5566 13.6468 10.5801 13.7073 10.6271 13.8281Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Transfer Funds
            </a>
          </div>

          <div className="">
            <h3 className="mb-8 text-xl font-bold">Transactions</h3>
            <div className="w-full flex flex-col gap-[1rem]">
              {walletInfo.txrefs?.map((tx: any, ind: number) => (
                <div
                  key={ind}
                  className="w-full px-[1.5rem] py-[0.75rem] border-[1px] border-slate-100 rounded-lg hover:bg-slate-100 transition-all duration-150 "
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
                  <div className="w-full flex justify-between text-slate-400">
                    <p className="text-sm">{formatDate(tx.confirmed)}</p>
                    <p className="text-xs">
                      Transaction Hash:{" "}
                      <span className="font-bold">{tx.tx_hash}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
