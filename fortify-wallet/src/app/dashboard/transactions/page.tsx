"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SIGN_TRANSCATION_PAGE_URL } from "@/constants/constants";

export default function TranscationsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    handleRetrieveTransactions();
  }, []);

  const handleRetrieveTransactions = async () => {
    await fetch("/api/transactions/retrieve", {
      method: "POST",
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setTransactions(res.transactions);
      });
  };

  const handleBroadcastTransaction = async (ind: number, txid: number) => {
    await fetch("/api/transactions/broadcast?txid=" + txid, {
      method: "POST",
      body: JSON.stringify({ txid }),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        alert(res.message);
        const updatedTransactions = [...transactions];
        updatedTransactions[ind].broadcasted = 1;
        setTransactions(updatedTransactions);
      });
  };

  return (
    <div className="">
      <h2 className="mb-[1rem] text-3xl font-bold">Transactions</h2>

      <table className="w-full text-left">
        <thead className="font-bold">
          <tr>
            <th className="w-[6rem] max-w-[8vw] px-2 py-1">No</th>
            <th className="w-[8rem] max-w-[10vw] px-2 py-1">Initiator</th>
            <th className="w-[8rem] max-w-[15vw] px-2 py-1">Recipient</th>
            <th className="w-[8rem] max-w-[10vw] px-2 py-1">Status</th>
            <th className="w-[8rem] max-w-[10vw] px-2 py-1">Signatures</th>
            <th className="w-[8rem] max-w-[10vw] px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody className="w-full text-sm">
          {transactions.map((transaction, ind) => (
            <tr
              key={ind}
              className="px-[1rem] py-2 hover:bg-slate-100 transition-all duration-150 rounded-lg"
            >
              <td className="w-[6rem] max-w-[8vw] y-2 px-2 overflow-hidden text-ellipsis">
                {ind + 1}
              </td>
              <td className="w-[8rem] max-w-[10vw] py-2 px-2 overflow-hidden text-ellipsis">
                {transaction.initiator_username}
              </td>
              <td className="w-[8rem] max-w-[15vw] py-2 px-2 overflow-hidden text-ellipsis">
                {transaction.recipient}
              </td>
              <td className="w-[8rem] max-w-[10vw] px-2 overflow-hidden text-ellipsis">
                <span
                  className={
                    (transaction.pending ? "bg-yellow-500" : "bg-green-400") +
                    " px-[1rem] py-[0.4rem] text-white rounded-md"
                  }
                >
                  {transaction.pending ? "Pending" : "Completed"}
                </span>
              </td>
              <td className="w-[8rem] max-w-[10vw] py-2 px-2 overflow-hidden text-ellipsis">
                {transaction.num_signatures} /
                {transaction.num_of_needed_signatures}
              </td>
              <td className="w-[8rem] max-w-[10vw] px-2 overflow-hidden text-ellipsis">
                {!transaction.pending ? (
                  <button
                    className={
                      "px-[1rem] py-[0.4rem] text-white rounded-md flex gap-[0.5rem] transition-all duration-250" +
                      (transaction.broadcasted
                        ? " bg-slate-200 cursor-not-allowed"
                        : " bg-red-400 cursor-pointer hover:scale-[1.05] transition-all duration-250")
                    }
                    onClick={() => {
                      if (!transaction.broadcasted) {
                        handleBroadcastTransaction(
                          ind,
                          transaction.transaction_id
                        );
                      }
                    }}
                  >
                    Broadcast Transaction
                  </button>
                ) : (
                  <button
                    className={
                      "px-[1rem] py-[0.4rem] text-white rounded-md flex gap-[0.5rem] transition-all duration-250" +
                      (transaction.approved
                        ? " bg-slate-200 cursor-not-allowed"
                        : " bg-red-400 cursor-pointer hover:scale-[1.05] transition-all duration-250")
                    }
                    onClick={() => {
                      if (!transaction.approved) {
                        router.push(
                          SIGN_TRANSCATION_PAGE_URL +
                            "/" +
                            transaction.transaction_id
                        );
                      }
                    }}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
