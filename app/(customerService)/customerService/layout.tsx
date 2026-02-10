"use client";


import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import RequireRole from "@/components/auth/RequireRole";

// Titles for customer service pages
const pageTitles: Record<string, string> = {
  "/customerService": "Dashboard",
  "/customerService/newShipment": "New Shipment",
  "/customerService/allShipments": "All Shipments",
  "/customerService/tracking": "Tracking",
};

export default function CustomerServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname() || "/customerService";
  const currentTitle = pageTitles[pathname] || "Dashboard";

  return (
    <RequireRole allow={["customerService"]}>
      <div className="flex h-full">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Toggle Button (mobile only) */}
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-blue-500 text-white rounded-md shadow-md md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Main content area */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out flex flex-col ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          {/* Navbar */}
          <Navbar
            title={currentTitle}
            userName="John Doe"
            role="Customer Service"
            avatarUrl=""
          />

          {/* Page Content */}
          <main className="flex-1 pt-8 px-6 pb-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
