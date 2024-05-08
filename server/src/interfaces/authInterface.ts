interface AuthorizationToken {
  token_id: number;
  account_id: string;
  token: string;
}

interface RefreshToken {
  token_id: number;
  account_id: string;
  token: string;
}

export { AuthorizationToken, RefreshToken };
