// app/admin/allUsers/[id]/page.tsx
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil } from "lucide-react";

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

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = params?.id;

  const [user, setUser] = React.useState<AppUser | null>(null);

  React.useEffect(() => {
    const load = () => {
      const all = readUsers();
      const found = all.find((u) => u.id === userId) ?? null;
      setUser(found);
    };

    load();
    window.addEventListener("users-changed", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("users-changed", load);
      window.removeEventListener("storage", load);
    };
  }, [userId]);

  if (!user) {
    return (
      <div className="p-6">
        <Card className="bg-white border-muted/60">
          <CardContent className="p-6 text-sm text-muted-foreground">
            User not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top actions */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" className="gap-2" onClick={() => router.push("/admin/allUsers")}>
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Button>

        <Button
          className="gap-2 bg-orange-500 hover:bg-orange-600"
          onClick={() => router.push(`/admin/allUsers/${encodeURIComponent(user.id)}/edit`)}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* User details */}
      <Card className="bg-white border-muted/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">User Details</CardTitle>
          <RoleBadge role={user.role} />
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-medium text-[#121826]">{user.id}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Username</span>
              <span className="font-medium text-[#121826]">{user.username}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-[#121826]">{user.email}</span>
            </div>

            {/* ✅ Password intentionally NOT shown */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Password</span>
              <span className="text-muted-foreground italic">
                Hidden for security
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium text-[#121826]">
                {new Date(user.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
