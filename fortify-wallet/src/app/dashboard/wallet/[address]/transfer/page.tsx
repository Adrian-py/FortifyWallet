"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Loading from "@/components/loading";

export default function TransferPage() {
  const router = useRouter();
  const path_name = usePathname();
  const address = path_name.split("/")[3];

  const [targetAddress, setTargetAddress] = useState<string>("");
  const [fundsToTransfer, setFundsToTransfer] = useState<number>(0.0000001);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_address: address,
          target_address: targetAddress,
          value: fundsToTransfer,
        }),
        cache: "no-cache",
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if (res.status !== 200) throw new Error(res.error);
          setLoading(false);
          alert(res.message);
          router.back();
        });
    } catch (err: any) {
      alert(err.message);
    }
  };
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <div className="my-8 items-center justify-between">
            <div className="flex items-center gap-[1rem]">
              <a
                href={path_name.replace("/transfer", "")}
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

              <h2 className="text-3xl font-bold">Transfer Funds</h2>
            </div>
          </div>
          <p className="mb-16 text-sm text-slate-600">
            Transfering funds from <span className="font-bold">{address}</span>
          </p>

          <form
            className="w-[40vw] max-w-[30rem] flex flex-col"
            onSubmit={handleSubmit}
          >
            <label htmlFor="target_address" className="mb-[0.5rem] font-bold">
              Transfer To
            </label>
            <input
              type="text"
              name="target_address"
              id="target_address"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="mb-8 border-b-[1px] px-[1rem] py-[0.5rem]"
              onChange={(e) => setTargetAddress(e.target.value)}
            />

            <label
              htmlFor="funds_to_transfer"
              className="mb-[0.5rem] font-bold"
            >
              Amount to Transfer
            </label>
            <input
              type="number"
              name="funds_to_transfer"
              id="funds_to_transfer"
              className="mb-8 border-b-[1px] px-[1rem] py-[0.5rem] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="In Satoshis (1 Satoshi = 0,00000001 BTC)"
              step="any"
              onChange={(e) => setFundsToTransfer(parseFloat(e.target.value))}
            />

            <button className="mt-16 w-fit px-[1.5rem] py-[0.5rem] bg-red-400 text-white rounded-md hover:scale-[1.05] transition-all duration-150">
              Transfer
            </button>
          </form>
        </div>
      )}
    </>
  );
}
