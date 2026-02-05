"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define page titles
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
  
  // Get current page title or default to "Dashboard"
  const currentTitle = pageTitles[pathname] || "Dashboard";

  return (
   
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
              role="Admin"
              avatarUrl=""
            />

            {/* Page Content */}
            <main className="flex-1 pt-8 px-6 pb-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
  );
}