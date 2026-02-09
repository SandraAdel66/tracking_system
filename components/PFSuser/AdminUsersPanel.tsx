"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";

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

export default function AdminUsersPanel() {
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

  const stats = React.useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const cs = users.filter((u) => u.role === "customerService").length;
    const endUsers = users.filter((u) => u.role === "user").length;
    return { total, admins, cs, endUsers };
  }, [users]);

  const latest = React.useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [users]);

  return (
    <Card className="bg-white border-muted/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">User Management</CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/allUsers")}>
            Show all users
          </Button>

          <Button
            className="gap-2 bg-orange-500 hover:bg-orange-600"
            onClick={() => router.push("/admin/allUsers/addNewUser")}
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Total Users</div>
            <div className="text-lg font-semibold text-[#121826]">{stats.total}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Admins</div>
            <div className="text-lg font-semibold text-[#121826]">{stats.admins}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Customer Service</div>
            <div className="text-lg font-semibold text-[#121826]">{stats.cs}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Tracking Users</div>
            <div className="text-lg font-semibold text-[#121826]">{stats.endUsers}</div>
          </div>
        </div>

        {/* Latest */}
        <div className="rounded-lg border">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="text-sm font-medium text-[#121826]">Latest Added Users</div>
            <div className="text-xs text-muted-foreground">Showing 5</div>
          </div>

          <div className="divide-y">
            {latest.map((u) => (
              <div key={u.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-[#121826]">{u.username}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={u.role} />
                  <div className="text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}

            {latest.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No users yet. Click <span className="font-medium">Add User</span>.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
