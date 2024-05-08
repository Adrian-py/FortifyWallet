export default function TransactionComponent({
  transaction,
  ind,
  unconfirmed,
}: any) {
  const formatDate = (date: string): string => {
    const currentDate = new Date();
    const confirmedDate = new Date(date);
    const diffInDays = Math.floor(
      (currentDate.getTime() - confirmedDate.getTime()) / (1000 * 3600 * 24)
    );
    return `${diffInDays} day(s) ago`;
  };

  return (
    <div
      key={ind}
      className="w-full px-[1.5rem] py-[0.75rem] border-[1px] border-slate-100 rounded-lg hover:bg-slate-100 transition-all duration-150 "
    >
      <div className="w-full flex justify-between font-bold">
        <p
          className={
            transaction.tx_input_n === -1 ? "text-green-600" : "text-red-600"
          }
        >
          {transaction.tx_input_n === -1 ? "Received" : "Sent"}{" "}
          {transaction.unconfirmed && "(Unconfirmed)"}
        </p>
        <p className="">{transaction.value / 100000000} BTC</p>
      </div>
      <div className="w-full flex justify-between text-slate-400">
        <p className="text-sm">{formatDate(transaction.confirmed)}</p>
        <p className="text-xs">
          Transaction Hash:{" "}
          <span className="font-bold">{transaction.tx_hash}</span>
        </p>
      </div>
    </div>
  );
}
