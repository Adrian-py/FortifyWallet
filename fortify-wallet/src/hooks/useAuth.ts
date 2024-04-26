import { useRouter } from "next/navigation";

import { DASHBOARD_PAGE_URL, LOGIN_PAGE_URL } from "@/constants/constants";
import { cookies } from "next/headers";

export default function useAuth() {
  const router = useRouter();

  async function checkAuthorization(): Promise<boolean> {
    return await fetch("/api/auth/authorized", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      credentials: "include",
    }).then((res) => {
      return res.status == 200;
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
        if (res.message === "Authorized!") {
          localStorage.setItem("user", res.user);
          router.push(DASHBOARD_PAGE_URL);
        }
      });
  }

  async function logout() {
    const user_id = JSON.parse(localStorage.getItem("user") ?? "{}").user_id;

    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({ user_id }),
    }).then((res) => {
      if (res.status === 200) {
        localStorage.removeItem("user");
        router.push(LOGIN_PAGE_URL);
      }
    });
  }

  async function isAuthenticated(): Promise<boolean> {
    return await fetch("api/auth/authorized", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      credentials: "include",
    }).then((res) => {
      return res.status === 200;
    });
  }

  async function getUserRole(): Promise<string> {
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    return user.role;
  }

  return {
    checkAuthorization,
    login,
    logout,
    isAuthenticated,
    getUserRole,
  };
}
