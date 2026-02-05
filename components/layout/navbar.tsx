"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface NavbarProps {
  title: string;
  userName: string;
  role: string;
  avatarUrl?: string; // optional
}

export default function Navbar({
  title,
  userName,
  role,
  avatarUrl,
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  const profileImage = avatarUrl && avatarUrl.trim() !== ""
    ? avatarUrl
    : "/profile.png";

  return (
    <nav className="w-full h-20 bg-white border-b flex items-center justify-between px-6">
      {/* Left side - Title */}
      <h1 className="text-xl font-semibold">{title}</h1>

      {/* Right side - User info */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          {/* Name & Role */}
          <div className="text-left pr-4">
            <p className="text-md font-semibold leading-tight">{userName}</p>
            <p className="text-xs text-gray-600 leading-tight">{role}</p>
          </div>

          {/* Profile Image */}
          <Image
            src={profileImage}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full object-cover"
            priority
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-md z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
