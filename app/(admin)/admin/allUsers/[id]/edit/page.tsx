// app/admin/allUsers/[id]/edit/page.tsx
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function writeUsers(users: AppUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event("users-changed"));
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = params?.id;

  const [loaded, setLoaded] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<Role>("customerService");

  React.useEffect(() => {
    const all = readUsers();
    const found = all.find((u) => u.id === userId);

    if (found) {
      setEmail(found.email);
      setUsername(found.username);
      setPassword(found.password);
      setRole(found.role);
    }
    setLoaded(true);
  }, [userId]);

  const canSave =
    email.trim().includes("@") &&
    username.trim().length >= 3 &&
    password.trim().length >= 6;

  const handleSave = () => {
    if (!canSave) return;

    const all = readUsers();
    const idx = all.findIndex((u) => u.id === userId);
    if (idx === -1) return;

    // uniqueness checks (ignore self)
    const emailTaken = all.some(
      (u) => u.id !== userId && u.email.toLowerCase() === email.trim().toLowerCase()
    );
    const usernameTaken = all.some(
      (u) => u.id !== userId && u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (emailTaken || usernameTaken) {
      console.warn("Email or username already exists");
      return;
    }

    const updated: AppUser = {
      ...all[idx],
      email: email.trim(),
      username: username.trim(),
      password: password.trim(),
      role,
    };

    const next = [...all];
    next[idx] = updated;

    writeUsers(next);

    router.push(`/admin/allUsers/${encodeURIComponent(userId)}`);
  };

  if (!loaded) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push(`/admin/allUsers/${encodeURIComponent(userId)}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Button>

        <Button
          className="gap-2 bg-orange-500 hover:bg-orange-600"
          onClick={handleSave}
          disabled={!canSave}
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      <Card className="bg-white border-muted/60">
        <CardHeader>
          <CardTitle className="text-base">Edit User</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {/* ✅ visible + editable password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="customerService">Customer Service</SelectItem>
                  <SelectItem value="user">User (Tracking)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
