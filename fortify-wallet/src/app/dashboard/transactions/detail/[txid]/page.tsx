"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Loading from "@/components/loading";
import { TRANSACTIONS_PAGE_URL } from "@/constants/constants";

export default function SignTransactionPage({
  params,
}: {
  params: { txid: string };
}) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<any>({});
  const [promptPassword, setPromptPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [callback, setCallback] = useState<(password: string) => void>(
    () => {}
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    handleRetrieveTransactionInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!promptPassword && password.length > 0) callback(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptPassword]);

  const handleRetrieveTransactionInfo = async () => {
    try {
      setLoading(true);
      await fetch("/api/transactions/info?txid=" + params.txid, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if (res.status !== 200) throw new Error(res.message);
          setTransaction(res.transaction[0]);
          setLoading(false);
        });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSignTransaction = async (password: string) => {
    try {
      setLoading(true);
      await fetch("/api/transactions/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
        body: JSON.stringify({
          password: password,
          transaction_id: transaction.transaction_id,
          sender_address: transaction.sender,
        }),
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if (res.status !== 200) throw new Error(res.error);
          alert(res.message);
          setLoading(false);
          router.push(TRANSACTIONS_PAGE_URL);
        });
    } catch (err: any) {
      alert(err);
    }
  };

  const handleBroadcastTransaction = async (password: string) => {
    const txid = params.txid;
    await fetch("/api/transactions/broadcast", {
      method: "POST",
      body: JSON.stringify({ password: password, txid }),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        alert(res.message);
      });
  };

  return (
    <div className="">
      {promptPassword && (
        <div className="absolute top-0 left-0 w-screen h-screen flex items-center justify-center">
          <div className="relative flex flex-col px-[6rem] py-[4rem] z-20 bg-white gap-[1rem] rounded-lg">
            <h3 className="text-xl font-bold">Enter password:</h3>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              className="min-w-[40rem] mb-8 border-b-[2px] px-[1rem] py-[0.5rem]"
            />
            <div className="flex gap-[1rem]">
              <button
                onClick={() => {
                  setPromptPassword(false);
                }}
                className="w-fit px-[1rem] py-[0.4rem] text-white rounded-md flex gap-[0.5rem] transition-all duration-250 bg-green-500 cursor-pointer hover:scale-[1.05] transition-all duration-250"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setPassword("");
                  setPromptPassword(false);
                }}
                className="w-fit px-[1rem] py-[0.4rem] text-white rounded-md flex gap-[0.5rem] transition-all duration-250 bg-red-400 cursor-pointer hover:scale-[1.05] transition-all duration-250"
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="absolute top-0 w-full h-full bg-slate-800 z-10 opacity-[70%]"></div>
        </div>
      )}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="mb-[3rem] relative -translate-x-[2.5rem] flex items-center gap-[1rem]">
            <a
              href={TRANSACTIONS_PAGE_URL}
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

            <h2 className="text-3xl font-bold">Sign Transaction</h2>
          </div>
          <div className="flex flex-col gap-[1.5rem]">
            <div className="">
              <p className="mb-[0.5rem] font-bold text-xl">
                Sender&apos;s Address (Initiator)
              </p>
              <p className="">{transaction.sender}</p>
            </div>
            <div className="">
              <p className="mb-[0.5rem] font-bold text-xl">Recipient</p>
              <p className="">{transaction.recipient}</p>
            </div>
            <div className="">
              <p className="mb-[0.5rem] font-bold text-xl">
                Transaction Initiated by
              </p>
              <p className="">{transaction.initiator_username}</p>
            </div>
            <div className="">
              <p className="mb-[0.5rem] font-bold text-xl">
                Status of Transcation
              </p>
              <p className="">
                <span
                  className={
                    (transaction.pending ? "bg-yellow-500" : "bg-green-400") +
                    " px-[1rem] py-[0.4rem] text-white rounded-md"
                  }
                >
                  {transaction.pending ? "Pending" : "Completed"}
                </span>
              </p>
            </div>
            <div className="">
              <p className="mb-[0.5rem] font-bold text-xl">
                Number of Signatures
              </p>
              <p className="">
                {transaction.num_signatures} /{" "}
                {transaction.num_of_needed_signatures}
              </p>
            </div>
            <div className="">
              <p className="mb-[0.5rem] font-bold text-xl">Amount Transfered</p>
              <p className="">{transaction.value} Satoshis</p>
            </div>
            {!transaction.pending ? (
              <button
                className={
                  "w-fit px-[1rem] py-[0.4rem] text-white rounded-md flex gap-[0.5rem] transition-all duration-250" +
                  (transaction.broadcasted
                    ? " bg-slate-200 cursor-not-allowed"
                    : " bg-red-400 cursor-pointer hover:scale-[1.05] transition-all duration-250")
                }
                onClick={() => {
                  if (!transaction.broadcasted) {
                    setCallback(() => handleBroadcastTransaction);
                    setPromptPassword(true);
                  }
                }}
              >
                Broadcast Transaction
              </button>
            ) : (
              <button
                onClick={() => {
                  setCallback(() => handleSignTransaction);
                  setPromptPassword(true);
                }}
                className="mt-10 w-fit px-[1.5rem] py-[0.5rem] bg-red-400 text-white rounded-md hover:scale-[1.05] transition-all duration-150 flex gap-[0.5rem]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5"
                >
                  <path
                    d="M21 20.9998H13M2.5 21.4998L8.04927 19.3655C8.40421 19.229 8.58168 19.1607 8.74772 19.0716C8.8952 18.9924 9.0358 18.901 9.16804 18.7984C9.31692 18.6829 9.45137 18.5484 9.72028 18.2795L21 6.99982C22.1046 5.89525 22.1046 4.10438 21 2.99981C19.8955 1.89525 18.1046 1.89524 17 2.99981L5.72028 14.2795C5.45138 14.5484 5.31692 14.6829 5.20139 14.8318C5.09877 14.964 5.0074 15.1046 4.92823 15.2521C4.83911 15.4181 4.77085 15.5956 4.63433 15.9506L2.5 21.4998ZM2.5 21.4998L4.55812 16.1488C4.7054 15.7659 4.77903 15.5744 4.90534 15.4867C5.01572 15.4101 5.1523 15.3811 5.2843 15.4063C5.43533 15.4351 5.58038 15.5802 5.87048 15.8703L8.12957 18.1294C8.41967 18.4195 8.56472 18.5645 8.59356 18.7155C8.61877 18.8475 8.58979 18.9841 8.51314 19.0945C8.42545 19.2208 8.23399 19.2944 7.85107 19.4417L2.5 21.4998Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Sign Transaction
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
