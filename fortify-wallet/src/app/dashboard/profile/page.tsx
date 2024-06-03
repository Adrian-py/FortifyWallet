"use client";

import { useEffect, useState } from "react";

interface ProfileInterface {
  username?: string;
  email?: string;
  role?: string;
  department?: string;
  enabled_two_factor?: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileInterface>({});

  useEffect(() => {
    handleRetrieveProfile();
  }, []);

  const handleRetrieveProfile = async () => {
    await fetch("/api/account/info", {
      method: "GET",
      cache: "no-cache",
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setProfile(res.account);
      });
  };

  return (
    <div className="">
      <h2 className="text-3xl font-bold">Your Profile</h2>
      <div className="mt-[4rem] flex flex-col gap-[2rem]">
        <div className="w-fit flex flex-col items-start justify-between gap-[0.5rem]">
          <p className="text-lg font-semibold">Username</p>
          <p className="text-lg">{profile.username}</p>
        </div>
        <div className="w-fit flex flex-col items-start justify-between gap-[0.5rem]">
          <p className="text-lg font-semibold">Email</p>
          <p className="text-lg">{profile.email}</p>
        </div>
        <div className="w-fit flex flex-col items-start justify-between gap-[0.5rem]">
          <p className="text-lg font-semibold">Role</p>
          <p className="text-lg">{profile.role}</p>
        </div>
        {profile.department && (
          <div className="w-fit flex flex-col items-start justify-between">
            <p className="text-lg font-semibold">Department</p>
            <p className="text-lg">{profile.department}</p>
          </div>
        )}
        <div className="w-fit flex flex-col items-start justify-between gap-[0.5rem]">
          <p className="text-lg font-semibold">
            Have Enabled Two-Factor Authentication
          </p>
          <p
            className={`text-lg text-white px-[1rem] py-[0.4rem] rounded-lg ${
              profile.enabled_two_factor ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {profile.enabled_two_factor ? "Enabled ✔ " : "Disabled ✖"}
          </p>
        </div>
      </div>
    </div>
  );
}
