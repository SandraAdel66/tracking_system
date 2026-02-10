"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePageTitle } from "@/hooks/usePageTitle";

const SESSION_KEY = "pfs_session_v1";

interface NavbarProps {
  userName: string;
  role: string;
  avatarUrl?: string;
  titleOverride?: string;
}

export default function Navbar({
  userName,
  role,
  avatarUrl,
  titleOverride,
}: NavbarProps): import("react/jsx-runtime").JSX.Element {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const autoTitle = usePageTitle();
  const title = titleOverride ?? autoTitle;

  const handleLogout = () => {
    //  Clear session
    localStorage.removeItem(SESSION_KEY);

    //  Notify app (sidebar, guards, etc.)
    window.dispatchEvent(new Event("session-changed"));

    //  Redirect to login and replace history
    router.replace("/");

    //  Close dropdown
    setOpen(false);
  };

  const profileImage =
    avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : "/profile.png";

  return (
    <nav className="w-full h-20 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="text-left pr-4">
            <p className="text-md font-semibold leading-tight">{userName}</p>
            <p className="text-xs text-gray-600 leading-tight">{role}</p>
          </div>

          <Image
            src={profileImage}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full object-cover"
            priority
          />
        </button>

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
