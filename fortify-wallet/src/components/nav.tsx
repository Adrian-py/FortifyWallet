import {
  DASHBOARD_PAGE_URL,
  ACCOUNTS_PAGE_URL,
  DEPARTMENTS_PAGE_URL,
  TRANSACTIONS_PAGE_URL,
} from "@/constants/constants";

export default function Navbar() {
  const user_role: string = JSON.parse(
    localStorage.getItem("account") ?? "{}"
  ).role;

  return (
    <nav className="mb-[2rem] flex gap-[2rem]">
      <a
        href={DASHBOARD_PAGE_URL}
        className="px-[1.5rem] py-[0.4rem] bg-slate-100 rounded-xl hover:bg-gray-200 transition-all duration-150"
      >
        Dashboard
      </a>
      {(user_role === "admin" || user_role === "head") && (
        <a
          href={ACCOUNTS_PAGE_URL}
          className="px-[1.5rem] py-[0.4rem] bg-slate-100 rounded-xl hover:bg-gray-200 transition-all duration-150"
        >
          Accounts
        </a>
      )}
      {user_role === "admin" && (
        <a
          href={DEPARTMENTS_PAGE_URL}
          className="px-[1.5rem] py-[0.4rem] bg-slate-100 rounded-xl hover:bg-gray-200 transition-all duration-150"
        >
          Departments
        </a>
      )}
      <a
        href={TRANSACTIONS_PAGE_URL}
        className="px-[1.5rem] py-[0.4rem] bg-slate-100 rounded-xl hover:bg-gray-200 transition-all duration-150"
      >
        Transactions
      </a>
    </nav>
  );
}
