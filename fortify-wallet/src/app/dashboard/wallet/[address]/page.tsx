"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DASHBOARD_PAGE_URL } from '@/constants/constants';

export default function WalletDetailPage({ params }: { params: { address: string } }) {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState<any>({
    address: 'mpnniQGF4CS1uzG86e6wR2Qd2TcHfQSJGs',
    total_received: 0,
    total_sent: 0,
    balance: 0,
    unconfirmed_balance: 0,
    final_balance: 0,
    n_tx: 0,
    unconfirmed_n_tx: 0,
    final_n_tx: 0,
    txs: []
  });

  useEffect(() => {
    // handleRetrieveWalletInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetrieveWalletInfo = async () => {
    await fetch("/api/wallet/info?address=" + params.address, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache"
    }).then((res) => {
      return res.json();
    }).then((res) => {
      setWalletInfo(res.wallet_info);
    });
  };

  const handleRetrieveTransactions = async () => {
    // await fetch(walletInfo.tx_url, method:)
  };

  return (
    <>
      <div className="mb-8 flex items-center gap-[1rem]">
        <a href={DASHBOARD_PAGE_URL} className="text-slate-400 hover:text-slate-800">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-150" />
          </svg>
        </a>

        <h2 className="text-3xl font-bold">Wallet Detail</h2>
      </div>
      <div className="mb-8 flex flex-col gap-[1rem]">
        <h4 className="text-slate-500">Address: {params.address}</h4>
        <h3 className="text-3xl font-bold">{walletInfo.balance} BTC</h3>
      </div>

      <div className="">
        <h3 className="text-xl font-bold">Transactions</h3>
        <div className="">
          {
            walletInfo.txs.map((tx: any) => (
              <>

              </>
            ))
          }
        </div>
      </div>
    </>
  )
}
