"use client";

import { DEPARTMENTS_PAGE_URL } from "@/constants/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateDepartmentPage() {
  const router = useRouter();
  const [department_name, setDepartmentName] = useState("");
  const [department_desc, setDepartmentDesc] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await fetch("/api/departments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ department_name, department_desc }),
    })
      .then((res) => {
        if (res.status == 200) {
          alert("Department created!");
          router.push(DEPARTMENTS_PAGE_URL);
        } else {
          alert("Error: Something went wrong when creating department");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <form
        className="w-[40vw] max-w-[30rem] mt-[3rem] flex flex-col"
        onSubmit={handleSubmit}
      >
        <label htmlFor="department_name" className="mb-[0.5rem] font-bold">
          Department Name
        </label>
        <input
          type="text"
          name="department_name"
          className="mb-8 border-b-[1px] px-[1rem] py-[0.5rem]"
          onChange={(e) => setDepartmentName(e.target.value)}
        />

        <label htmlFor="department_desc" className="mb-[0.5rem] font-bold">
          Department Description
        </label>
        <textarea
          name="department_desc"
          id="company_desc"
          cols={30}
          rows={10}
          required
          className="mb-8 border-[1px] px-[1rem] py-[0.5rem]"
          onChange={(e) => setDepartmentDesc(e.target.value)}
        ></textarea>
        <button
          type="submit"
          className="mt-16 w-fit px-[1.5rem] py-[0.5rem] bg-red-400 text-white rounded-md hover:scale-[1.05] transition-all duration-150"
        >
          Create Department
        </button>
      </form>
    </>
  );
}
