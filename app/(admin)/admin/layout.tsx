"use client";

import "@/styles/globals.css";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import RequireRole from "@/components/auth/RequireRole";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/newShipment": "New Shipment",
  "/admin/all-shipments": "All Shipments",
  "/admin/tracking": "Tracking",
  "/admin/agents-clients": "Agents & Clients",
};

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname() || "/admin";
  const currentTitle = pageTitles[pathname] || "Dashboard";

  return (
    <RequireRole allow={["admin"]}>
      <div className="min-h-screen flex">
        {/* Sidebar column */}
        {sidebarOpen ? (
          <div className="w-[20vw] min-w-[260px] max-w-[320px] shrink-0">
            <Sidebar sidebarOpen={sidebarOpen} />
          </div>
        ) : null}

        {/* Right column: Navbar + Page (navbar starts after sidebar) */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Navbar now NOT full width of screen, only this column */}
          <Navbar
            title={currentTitle}
            userName="John Doe"
            role="Admin"
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
