"use client";

import * as React from "react";
import { Package, Truck, AlertCircle, Calendar } from "lucide-react";

type Scope = "all" | "mine";

type ShipmentStatus = "Pending" | "In Transit" | "Delivered" | "Exception";

type Shipment = {
  id: string;
  status: ShipmentStatus;
  assignedToUserId?: string;
  createdAt?: string;
};

type Session = {
  userId: string;
  role: "admin" | "customerService" | "user";
  email: string;
  username: string;
  loginAt: string;
};

const SESSION_KEY = "pfs_session_v1";
const SHIPMENTS_KEY = "pfs_shipments_v1";

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function readShipments(): Shipment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHIPMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Shipment[]) : [];
  } catch {
    return [];
  }
}

// Optional seed so you SEE numbers even without backend
function seedShipmentsIfEmpty() {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(SHIPMENTS_KEY);
  if (raw) return;

  const now = new Date().toISOString();
  const seed: Shipment[] = [
    { id: "s1", status: "In Transit", assignedToUserId: "u_cs_1", createdAt: now },
    { id: "s2", status: "Pending", assignedToUserId: "u_cs_1", createdAt: now },
    { id: "s3", status: "Exception", assignedToUserId: "u_admin_1", createdAt: now },
    { id: "s4", status: "Delivered", assignedToUserId: "u_cs_1", createdAt: now },
    { id: "s5", status: "In Transit", assignedToUserId: "u_admin_1", createdAt: now },
  ];

  window.localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(seed));
}

function computeCounts(list: Shipment[]) {
  let total = 0;
  let inTransit = 0;
  let pending = 0;
  let exceptions = 0;

  for (const s of list) {
    total += 1;
    if (s.status === "In Transit") inTransit += 1;
    if (s.status === "Pending") pending += 1;
    if (s.status === "Exception") exceptions += 1;
  }

  return { total, inTransit, pending, exceptions };
}

export default function CountCards({ scope }: { scope: Scope }) {
  const [values, setValues] = React.useState({
    total: 0,
    inTransit: 0,
    pending: 0,
    exceptions: 0,
  });

  React.useEffect(() => {
    seedShipmentsIfEmpty();

    const session = readSession();
    const all = readShipments();

    const filtered =
      scope === "all"
        ? all
        : all.filter((s) => s.assignedToUserId && s.assignedToUserId === session?.userId);

    setValues(computeCounts(filtered));
  }, [scope]);

  const SHIPMENT_CARDS = [
    {
      title: "Total Shipments",
      value: String(values.total),
      icon: Package,
      trend: "All-time",
      description: "shipments registered",
      color: {
        border: "border-blue-100",
        darkBorder: "dark:border-blue-900/50",
        text: "text-[#9B9B9B]",
        darkText: "dark:text-blue-200",
        iconBg: "bg-blue-100",
        darkIconBg: "dark:bg-blue-900/30",
        iconColor: "text-blue-600",
        darkIconColor: "dark:text-blue-400",
        descColor: "text-[#9B9B9B]",
        darkDescColor: "dark:text-blue-300",
      },
    },
    {
      title: "In Transit",
      value: String(values.inTransit),
      icon: Truck,
      trend: "Ongoing",
      description: "shipments moving",
      color: {
        border: "border-purple-100",
        darkBorder: "dark:border-purple-900/50",
        text: "text-[#9B9B9B]",
        darkText: "dark:text-purple-200",
        iconBg: "bg-purple-100",
        darkIconBg: "dark:bg-purple-900/30",
        iconColor: "text-purple-600",
        darkIconColor: "dark:text-purple-400",
        descColor: "text-[#9B9B9B]",
        darkDescColor: "dark:text-purple-300",
      },
    },
    {
      title: "Pending Bookings",
      value: String(values.pending),
      icon: Calendar,
      trend: "Waiting",
      description: "shipments pending",
      color: {
        border: "border-orange-100",
        darkBorder: "dark:border-orange-900/50",
        text: "text-[#9B9B9B]",
        darkText: "dark:text-orange-200",
        iconBg: "bg-orange-100",
        darkIconBg: "dark:bg-orange-900/30",
        iconColor: "text-orange-600",
        darkIconColor: "dark:text-orange-400",
        descColor: "text-[#9B9B9B]",
        darkDescColor: "dark:text-orange-300",
      },
    },
    {
      title: "Customs Exceptions",
      value: String(values.exceptions),
      icon: AlertCircle,
      trend: "Completed",
      description: "successfully delivered",
      color: {
        border: "border-red-100",
        darkBorder: "dark:border-red-900/50",
        text: "text-[#9B9B9B]",
        darkText: "dark:text-red-200",
        iconBg: "bg-red-100",
        darkIconBg: "dark:bg-red-900/30",
        iconColor: "text-red-600",
        darkIconColor: "dark:text-red-400",
        descColor: "text-[#9B9B9B]",
        darkDescColor: "dark:text-red-300",
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {SHIPMENT_CARDS.map((card, index) => (
        <div
          key={index}
          className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border ${card.color.border} ${card.color.darkBorder} overflow-hidden`}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium ${card.color.text} ${card.color.darkText}`}>
                {card.title}
              </h3>
              <div
                className={`p-2 rounded-lg ${card.color.iconBg} ${card.color.darkIconBg} ${card.color.iconColor} ${card.color.darkIconColor}`}
              >
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {card.value}
            </p>
            <p className={`text-sm ${card.color.descColor} ${card.color.darkDescColor}`}>
              {card.trend} {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
