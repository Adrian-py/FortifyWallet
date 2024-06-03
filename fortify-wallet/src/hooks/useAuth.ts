import { useRouter } from "next/navigation";

import {
  DASHBOARD_PAGE_URL,
  LOGIN_PAGE_URL,
  SETUP_2FA_PAGE_URL,
  VERIFY_2FA_PAGE_URL,
} from "@/constants/constants";

export default function useAuth() {
  const router = useRouter();

  async function checkAuthorization(): Promise<any> {
    return await fetch("/api/auth/authorized", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      credentials: "include",
    }).then((res) => {
      if (res.status !== 200) return router.push(LOGIN_PAGE_URL);
      return res.json();
    });
  }

  async function login(username: string, password: string) {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.error);
        localStorage.setItem("account", res.account);
        if (!res.enabled_two_factor) return router.push(SETUP_2FA_PAGE_URL);
        router.push(DASHBOARD_PAGE_URL);
      });
  }

  async function logout() {
    const account_id = JSON.parse(
      localStorage.getItem("account") ?? "{}"
    ).account_id;

    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({ account_id }),
    }).then((res) => {
      if (res.status === 200) {
        localStorage.removeItem("account");
        router.push(LOGIN_PAGE_URL);
      }
    });
  }

  async function isAuthenticated(): Promise<boolean> {
    return await fetch("api/auth/status", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      credentials: "include",
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return res.status == 200;
      });
  }

  async function getAccountRole(): Promise<string> {
    const account = JSON.parse(localStorage.getItem("account") ?? "{}");
    return account.role;
  }

  return {
    checkAuthorization,
    login,
    logout,
    isAuthenticated,
    getAccountRole,
  };
}
