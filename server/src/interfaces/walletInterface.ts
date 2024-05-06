interface WalletInterface {
  wallet_id?: string;
  account_id?: string;
  department_id?: string;
  pub_key?: string;
  address?: string;
  owned_by?: string;
  role?: string;
  derivation_path?: string;
}

export default WalletInterface;
