// app/admin/allUsers/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus } from "lucide-react";

type Role = "admin" | "customerService" | "user";

type AppUser = {
  id: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  createdAt: string;
};

const USERS_KEY = "pfs_users_v1";

function safeParse(json: string | null): AppUser[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as AppUser[]) : [];
  } catch {
    return [];
  }
}

function readUsers(): AppUser[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(USERS_KEY));
}

function RoleBadge({ role }: { role: Role }) {
  if (role === "admin")
    return <Badge className="bg-orange-500 text-white hover:bg-orange-500">Admin</Badge>;
  if (role === "customerService")
    return <Badge className="bg-blue-600 text-white hover:bg-blue-600">Customer Service</Badge>;
  return <Badge className="bg-slate-700 text-white hover:bg-slate-700">User</Badge>;
}

export default function AllUsersPage() {
  const router = useRouter();
  const [users, setUsers] = React.useState<AppUser[]>([]);

  React.useEffect(() => {
    const load = () => setUsers(readUsers());
    load();

    window.addEventListener("users-changed", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("users-changed", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const sorted = React.useMemo(() => {
    return [...users].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [users]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" className="gap-2" onClick={() => router.push("/admin")}>
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Button>

        <Button
          className="gap-2 bg-orange-500 hover:bg-orange-600"
          onClick={() => router.push("/admin/allUsers/addNewUser")}
        >
          <Plus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Card className="bg-white border-muted/60">
        <CardHeader>
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border">
            <div className="grid grid-cols-12 bg-muted/40 text-[#9b9b9b] text-xs font-medium px-4 py-3">
              <div className="col-span-3">USERNAME</div>
              <div className="col-span-5">EMAIL</div>
              <div className="col-span-2">ROLE</div>
              <div className="col-span-2 text-right">CREATED</div>
            </div>

            <div className="divide-y">
              {sorted.map((u) => (
                <div
                  key={u.id}
                  className="grid grid-cols-12 items-center px-4 py-3 cursor-pointer hover:bg-muted/20"
                  onClick={() => router.push(`/admin/allUsers/${encodeURIComponent(u.id)}`)}
                >
                  <div className="col-span-3 text-sm font-medium text-[#121826]">{u.username}</div>
                  <div className="col-span-5 text-sm text-muted-foreground">{u.email}</div>
                  <div className="col-span-2">
                    <RoleBadge role={u.role} />
                  </div>
                  <div className="col-span-2 text-right text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {sorted.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No users found.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
