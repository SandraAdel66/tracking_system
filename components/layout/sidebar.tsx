"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, PackagePlus, Archive, MapPin, Users } from "lucide-react";
import * as React from "react";

type Role = "admin" | "customerService" | "user";

const SESSION_KEY = "pfs_session_v1";

function readRole(): Role | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { role?: Role };
    return parsed?.role ?? null;
  } catch {
    return null;
  }
}

type Item = {
  label: string;
  href: string; // suffix: "", "/newShipment", ...
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const baseItems: Item[] = [
  { label: "Dashboard", href: "", icon: LayoutGrid },
  { label: "New Shipment", href: "/newShipment", icon: PackagePlus },
  { label: "All Shipments", href: "/allShipments", icon: Archive },
  { label: "Tracking", href: "/tracking", icon: MapPin },
  { label: "Agents & Clients", href: "/agents", icon: Users, adminOnly: true },
];

interface SidebarProps {
  sidebarOpen: boolean;
}

export default function Sidebar({ sidebarOpen }: SidebarProps) {
  const pathname = usePathname() || "";

  const [role, setRole] = React.useState<Role | null>(null);

  React.useEffect(() => {
    const sync = () => setRole(readRole());
    sync();

    window.addEventListener("session-changed", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("session-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // default to admin paths if role not loaded yet (prevents UI jumping)
  const basePath =
    role === "customerService" ? "/customerService" : "/admin";

  const items = baseItems
    .filter((it) => (role === "customerService" ? !it.adminOnly : true))
    .map((it) => ({
      ...it,
      fullHref: `${basePath}${it.href || ""}`,
    }));

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#37384e] border-r flex flex-col px-4 py-6 transition-transform duration-300 ease-in-out z-40
        ${sidebarOpen ? "translate-x-0 w-[20vw]" : "-translate-x-full w-[30vw]"}
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const href = (it as any).fullHref as string;

            // active if exact match OR is a sub-route
            const isActive =
              pathname === href ||
              (href !== basePath && pathname.startsWith(href));

            const Icon = it.icon;

            return (
              <Link
                key={href}
                href={href}
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
                <Icon
                  className={`h-5 w-5 ${
                    isActive
                      ? "text-white"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                />
                {/* Label */}
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                >
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
