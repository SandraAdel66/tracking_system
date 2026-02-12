"use client";

import "@/styles/globals.css";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useState, useMemo } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import RequireRole from "@/components/auth/RequireRole";

const pageTitles: Record<string, string> = {
  "/customerService": "Dashboard",
  "/customerService/newShipment": "New Shipment",
  "/customerService/allShipments": "All Shipments",
  "/customerService/tracking": "Tracking",
};

function getTitle(pathname: string) {
  // exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // longest prefix match for nested routes: /customerService/tracking/xyz
  const match = Object.keys(pageTitles)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname.startsWith(key));

  return match ? pageTitles[match] : "Dashboard";
}

export default function CustomerServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname() || "/customerService";

  const currentTitle = useMemo(() => getTitle(pathname), [pathname]);

  return (
    <RequireRole allow={["customerService"]}>
      <div className="min-h-screen flex">
        {/* Sidebar column */}
        {sidebarOpen ? (
          <div className="w-[20vw] min-w-[260px] max-w-[320px] shrink-0">
            <Sidebar sidebarOpen={sidebarOpen} />
          </div>
        ) : null}

        {/* Right column */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Navbar
            title={currentTitle}
            userName="John Doe"
            role="Customer Service"
            avatarUrl=""
          />

          <main className="flex-1 min-w-0 pt-8 px-6 pb-6 overflow-auto">
            {children}
          </main>
        </div>

        {/* Toggle (mobile) */}
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-blue-500 text-white rounded-md shadow-md md:hidden"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </RequireRole>
  );
}
