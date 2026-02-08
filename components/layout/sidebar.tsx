"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, PackagePlus, Archive, MapPin, Users } from "lucide-react";

const items = [
  { label: "Dashboard", href: "/admin", icon: LayoutGrid },
  { label: "New Shipment", href: "/admin/newShipment", icon: PackagePlus },
  { label: "All Shipments", href: "/admin/allShipments", icon: Archive },
  { label: "Tracking", href: "/admin/tracking", icon: MapPin },
  { label: "Agents & Clients", href: "/admin/agents", icon: Users },
];

interface SidebarProps {
  sidebarOpen: boolean;
}

export default function Sidebar({ sidebarOpen }: SidebarProps) {
  const pathname = usePathname() || "";

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#37384e] border-r  flex flex-col px-4 py-6 transition-transform duration-300 ease-in-out z-40
        ${sidebarOpen ? "translate-x-0 w[20vm]" : "-translate-x-full w-[30vw]"}
      `}
    >
      {/* Logo / Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white text-center">
          PFS Tracking System
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col justify-start">
        <div className="space-y-4">
          {items.map((it) => {
            // Check if current route matches exactly or starts with the href
            const isActive = pathname === it.href || 
              (it.href !== "/admin" && pathname.startsWith(it.href));
            
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`group relative flex items-center gap-3 rounded-sm px-3 py-3 transition-all
                  ${
                    isActive
                      ? "bg-[#f26d21] text-white shadow-md"
                      : "text-white hover:bg-[#f26d21] hover:text-white"
                  }`}
              >
                {/* Active indicator */}
                <span
                  className={`absolute left-0 top-0 bottom-0 w-1 transition-all
                    ${
                      isActive
                        ? "bg-white"
                        : "opacity-0 group-hover:opacity-100 bg-transparent"
                    }
                  `}
                />
                {/* Icon */}
                <it.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}`} />
                {/* Label */}
                <span className={`text-sm font-medium ${isActive ? "text-white font-semibold" : "text-gray-300 group-hover:text-white"}`}>
                  {it.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}