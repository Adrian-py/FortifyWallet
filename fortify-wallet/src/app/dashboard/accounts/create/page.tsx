"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ACCOUNTS_PAGE_URL } from "@/constants/constants";

export default function CreateUserPage() {
  const router = useRouter();
  const account = JSON.parse(localStorage.getItem("account") ?? "{}");

  const [departmentHeads, setDepartmentHeads] = useState<any[]>([]); // contains all department heads [id, name
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("-");
  const [reportingTo, setReportingTo] = useState<number | null>(
    account.role === "head" ? account.account_id : null
  ); // contains Head of Department id, if role is member

  useEffect(() => {
    handleRetrieveHead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newAccount = {
      username,
      email,
      password,
      role,
      reportingTo,
    };
    if (reportingTo === null && role === "member") {
      return alert(
        "Please select a head of department for member to report to!"
      );
    }

    await fetch("/api/account/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ new_account: newAccount }),
    })
      .then((res) => {
        if (res.status == 200) {
          alert("Account created!");
          router.push(ACCOUNTS_PAGE_URL);
        } else {
          alert("Error: Something went wrong when creating account");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const handleRetrieveHead = async () => {
    if (account.role === "admin") {
      await fetch("/api/account/retrieve/head/")
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          setDepartmentHeads(res.heads);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  const handleReportingToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportingTo(parseInt(e.target.value));
  };

  return (
    <div>
      <h2 className="mb-[1rem] text-3xl font-bold">Create Account</h2>
      <form
        className="w-[40vw] max-w-[30rem] mt-[3rem] flex flex-col"
        onSubmit={handleSubmit}
      >
        <label htmlFor="username" className="mb-[0.5rem] font-bold">
          Username
        </label>
        <input
          type="text"
          name="username"
          className="mb-8 border-b-[1px] px-[1rem] py-[0.5rem]"
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="email" className="mb-[0.5rem] font-bold">
          Email
        </label>
        <input
          type="email"
          name="email"
          className="mb-8 border-b-[1px] px-[1rem] py-[0.5rem]"
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password" className="mb-[0.5rem] font-bold">
          Password
        </label>
        <input
          type="text"
          name="password"
          className="mb-8 border-b-[1px] px-[1rem] py-[0.5rem]"
          onChange={(e) => setPassword(e.target.value)}
        />
        {account.role === "admin" && (
          <>
            <label htmlFor="role" className="mb-[0.5rem] font-bold">
              Role
            </label>
            <select onChange={handleRoleChange} className="mb-8" name="role">
              <option value="-">-</option>
              <option value="member">Member</option>
              <option value="head">Head of Department</option>
            </select>
            {role === "member" && (
              <>
                <label htmlFor="reports_to" className="mb-[0.5rem] font-bold">
                  Reports To
                </label>
                <select onChange={handleReportingToChange} name="reports_to">
                  <option value="-1">-</option>
                  {departmentHeads.map((head) => {
                    return (
                      <option key={head.id} value={head.id}>
                        {head.username}
                      </option>
                    );
                  })}
                </select>
              </>
            )}
          </>
        )}

        <button
          type="submit"
          className="mt-16 w-fit px-[1.5rem] py-[0.5rem] bg-red-400 text-white rounded-md hover:scale-[1.05] transition-all duration-150"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
