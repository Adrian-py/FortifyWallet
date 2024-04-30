"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CREATE_DEPARTMENT_PAGE_URL } from "@/constants/constants";

interface DepartmentInterface {
  department_id: number;
  department_name: string;
}

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);

  useEffect(() => {
    handleRetrieveDepartments();
  }, []);

  const handleRetrieveDepartments = async () => {
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
  };
  return (
    <div>
      <div className="mb-[1rem] w-full flex justify-between items-center">
        <h2 className="mb-[1rem] text-3xl font-bold">Departments</h2>
        <button
          onClick={() => router.push(CREATE_DEPARTMENT_PAGE_URL)}
          className="w-fit px-[1.25rem] py-[0.5rem] flex items-center gap-[0.5rem] bg-red-400 text-white rounded-md hover:scale-[1.05] transition-all duration-150"
        >
          Create Department
          <svg
            className="w-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="">
        <table className="text-left">
          <thead className="font-bold">
            <tr>
              <th className="w-[6rem] max-w-[8vw] px-2 py-1">No</th>
              <th className="w-[15rem] max-w-[25vw]  px-2 py-1">
                Department Name
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {departments.map((dept, ind) => (
              <tr key={dept.department_name} className="px-[1rem] py-2">
                <td className="w-[6rem] max-w-[8vw] y-2 px-2 overflow-hidden text-ellipsis">
                  {ind + 1}
                </td>
                <td className="w-[15rem] max-w-[25vw] py-2 px-2 overflow-hidden text-ellipsis">
                  {dept.department_name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
