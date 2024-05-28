"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TRANSCATION_DETAIL_PAGE_URL } from "@/constants/constants";

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
          </tr>
        </thead>
        <tbody className="w-full text-sm">
          {transactions.map((transaction, ind) => (
            <tr
              key={ind}
              className="px-[1rem] py-2 hover:bg-slate-100 transition-all duration-150 rounded-lg"
              onClick={() =>
                router.push(
                  TRANSCATION_DETAIL_PAGE_URL + "/" + transaction.transaction_id
                )
              }
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
