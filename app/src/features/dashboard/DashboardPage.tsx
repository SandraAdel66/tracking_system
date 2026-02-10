"use client";

import * as React from "react";
import AdminUsersPanel from "@/components/PFSuser/AdminUsersPanel";
import { ChartBar } from "@/components/PFSuser/barChart";
import CountCards from "@/components/PFSuser/countCards";
import LatestShipments from "@/components/PFSuser/latestShipments";

type Role = "admin" | "customerService" | "user";
type Scope = "all" | "mine";

const SESSION_KEY = "pfs_session_v1";

function readSession(): { role?: Role; userId?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as { role?: Role; userId?: string }) : null;
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const [scope, setScope] = React.useState<Scope>("mine");
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const session = readSession();
    const role = session?.role;

    setIsAdmin(role === "admin");
    setScope(role === "admin" ? "all" : "mine");
  }, []);

  return (
    <div className="flex">
      {/* Main content area */}
      <div className="flex w-full justify-center">
        <div className="w-full max-w-7xl m-4 flex flex-col gap-6">
          {isAdmin && <AdminUsersPanel />}

          <CountCards scope={scope} />
          <div className="bg-white p-6 w-full">
            <ChartBar scope={scope} />
          </div>
          <LatestShipments />
        </div>
      </div>
    </div>
  );
}
