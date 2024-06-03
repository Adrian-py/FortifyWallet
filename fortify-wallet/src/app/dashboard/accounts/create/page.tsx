"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ACCOUNTS_PAGE_URL } from "@/constants/constants";

interface DepartmentInterface {
  department_id: number;
  department_name: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const account = JSON.parse(localStorage.getItem("account") ?? "{}");

  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [departmentId, setDepartmentId] = useState<Number | null>(null);

  useEffect(() => {
    handleRetrieveDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newAccount = {
      username,
      email,
      password,
      role,
      department_id: departmentId,
    };

    await fetch("/api/account/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ new_account: newAccount }),
    }).then(async (res) => {
      if (res.status == 200) {
        alert("Account created!");
        router.push(ACCOUNTS_PAGE_URL);
      } else {
        const error_message = await res.json();
        alert(error_message.error);
      }
    });
  };

  const handleRetrieveDepartments = async () => {
    if (account.role === "admin") {
      await fetch("/api/departments/retrieve/")
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          setDepartments(res.departments);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartmentId(parseInt(e.target.value));
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
            <select
              onChange={handleRoleChange}
              name="role"
              className="mb-8 px-[0.5rem] py-[0.4rem] w-[50%] border-[2px] border-gray-400 rounded-md"
            >
              <option value="-">-</option>
              <option value="member">Member</option>
              <option value="head">Head of Department</option>
            </select>
            <label htmlFor="department" className="mb-[0.5rem] font-bold">
              Department
            </label>
            <select
              onChange={handleDepartmentChange}
              name="department"
              className="px-[0.5rem] py-[0.4rem] w-[50%] border-[2px] border-gray-400 rounded-md"
            >
              <option value="-">-</option>
              {departments.map((dept) => {
                return (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
                  </option>
                );
              })}
            </select>
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
