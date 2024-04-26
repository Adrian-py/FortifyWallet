"use client";

import useAuth from "@/hooks/useAuth";

export default function Header() {
  const { logout } = useAuth();

  const username = JSON.parse(localStorage.getItem("account") ?? "{}").username;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="px-[5vw] py-[2rem] w-full h-fit flex justify-between items-center border-b-[1px]">
      <h1 className="text-2xl font-bold">FortifyWallet</h1>
      <div className="flex items-center gap-[1rem]">
        <p className="">
          Welcome,
          <span className="ml-[0.25rem] font-bold">{username}</span>
        </p>
        <button
          onClick={handleLogout}
          className="w-fit px-[1.5rem] py-[0.5rem] bg-red-400 text-white rounded-md hover:scale-[1.05] transition-all duration-150"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
