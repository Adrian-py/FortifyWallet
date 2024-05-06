interface TransactionInterface {
  transaction_id?: string;
  initiator_id?: string;
  sender?: string;
  recipient?: string;
  psbt?: string;
  num_signatures?: number;
  num_of_needed_signatures?: number;
  value?: number;
  pending?: number;
}

export default TransactionInterface;
