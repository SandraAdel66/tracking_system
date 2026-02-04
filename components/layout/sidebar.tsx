"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, PackagePlus, Archive, MapPin, Users } from "lucide-react";

const items = [
  { label: "Dashboard", href: "/admin/homePage", icon: LayoutGrid },
  { label: "New Shipment", href: "/admin/new-shipment", icon: PackagePlus },
  { label: "All Shipments", href: "/admin/all-shipments", icon: Archive },
  { label: "Tracking", href: "/admin/tracking", icon: MapPin },
  { label: "Agents & Clients", href: "/admin/agents-clients", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname() || "";

  return (
    <aside className="w-[20vw] bg-[#37384e] h-screen border-r border-slate-200 flex flex-col px-4 py-6">
      {/* Logo / Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white text-center">PFS Tracking System</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col justify-start">
        <div className="space-y-4">
          {items.map((it) => {
            const isActive = pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-3 transition-all
                  ${isActive ? "bg-[#f26d21] text-white" : "text-white hover:bg-[#f26d21] hover:text-white"}
                `}
              >
                {/* Active indicator */}
                <span
                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all
                    ${isActive ? "bg-[#f26d21]" : "opacity-0 group-hover:opacity-100 bg-transparent"}
                  `}
                />
                {/* Icon */}
                <it.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-white"}`} />
                {/* Label */}
                <span className="text-sm font-medium">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
