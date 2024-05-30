"use client";

import useAuth from "@/hooks/useAuth";
import { DASHBOARD_PAGE_URL, PROFILE_PAGE_URL } from "@/constants/constants";

export default function Header() {
  const { logout } = useAuth();

  const username = JSON.parse(localStorage.getItem("account") ?? "{}").username;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="px-[5vw] py-[2rem] w-full h-fit flex justify-between items-center border-b-[1px]">
      <h1 className="text-2xl font-bold">
        <a href={DASHBOARD_PAGE_URL} className="">
          FortifyWallet
        </a>
      </h1>
      <div className="flex items-center gap-[1rem]">
        <p className="">
          Welcome,
          <span className="ml-[0.25rem] font-bold">{username}</span>
        </p>
        <div className="group relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-[1.5rem] h-[1.5rem] cursor-pointer transition-all duration-150 hover:scale-105"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="absolute right-0 h-0 flex flex-col justify-end text-right overflow-hidden group-hover:h-auto shadow-lg bg-white">
            <a
              href={PROFILE_PAGE_URL}
              className="w-full px-[3rem] py-[1rem] hover:scale-[1.1] transition-all duration-150 text-right flex gap-[0.5rem] items-center hover:bg-slate-100"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-[1rem] h-[1rem]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Profile
            </a>
            <button
              onClick={handleLogout}
              className="w-full px-[3rem] py-[1rem] hover:scale-[1.1] transition-all duration-150 text-right flex gap-[0.5rem] items-center hover:bg-slate-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-[1rem] h-[1rem]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
