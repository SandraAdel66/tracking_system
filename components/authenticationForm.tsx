"use client";

import Image from "next/image";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { User, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

type Role = "admin" | "customerService" | "user";

type AppUser = {
  id: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  createdAt: string;
};

type Session = {
  userId: string;
  role: Role;
  email: string;
  username: string;
  loginAt: string;
};

const USERS_KEY = "pfs_users_v1";
const SESSION_KEY = "pfs_session_v1";

function seedUsersIfEmpty() {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(USERS_KEY);
  if (raw) return;

  const now = new Date().toISOString();
  const seed: AppUser[] = [
    {
      id: "u_admin_1",
      email: "admin@pfs.com",
      username: "admin",
      password: "Admin@123",
      role: "admin",
      createdAt: now,
    },
    {
      id: "u_cs_1",
      email: "cs@pfs.com",
      username: "customerservice",
      password: "CS@123",
      role: "customerService",
      createdAt: now,
    },
    {
      id: "u_user_1",
      email: "user@pfs.com",
      username: "user",
      password: "User@123",
      role: "user",
      createdAt: now,
    },
  ];

  window.localStorage.setItem(USERS_KEY, JSON.stringify(seed));
}

function readUsers(): AppUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AppUser[]) : [];
  } catch {
    return [];
  }
}

function writeSession(session: Session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("session-changed"));
}

function redirectForRole(role: Role) {
  if (role === "admin") return "/admin";
  if (role === "customerService") return "/customerService";
  return "/user/track";
}

export default function AuthenticationForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    seedUsersIfEmpty();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const id = email.trim().toLowerCase();
    const pw = password;

    const users = readUsers();

    // Login by email OR username (you kept the label "Email" as requested)
    const found = users.find(
      (u) => u.email.toLowerCase() === id || u.username.toLowerCase() === id
    );

    if (!found || found.password !== pw) {
      // No UI changes requested, so we won't render an error component.
      // For now, just log it (you can later add toast without changing layout).
      console.warn("Invalid credentials");
      return;
    }

    writeSession({
      userId: found.id,
      role: found.role,
      email: found.email,
      username: found.username,
      loginAt: new Date().toISOString(),
    });

    router.push(redirectForRole(found.role));
  };

  return (
    <div className="flex min-h-screen">
      {/* Image */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/login.jpg"
          alt="Logistics Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-20 left-10 right-10 z-10">
          <p className="text-white text-center text-2xl font-normal">
            Streamline your logistics operations with real-time tracking and
            comprehensive fleet management.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <form className="flex w-full max-w-sm flex-col gap-4" onSubmit={handleSubmit}>
          <h3 className="text-[32px] font-bold text-center text-[#37384e]">
            Welcome Back
          </h3>

          <p className="text-[16px] font-medium text-center text-[#9aa0b3]">
            Enter your credentials to access your dashboard
          </p>
          <label className="text-sm font-medium text-[#37384e]">Email</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9aa0b3]" />
            <Input
              type="text"
              placeholder="Email"
              required
              className="h-12 pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <label className="text-sm font-medium text-[#37384e]">Password</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9aa0b3]" />
            <Input
              type="password"
              placeholder="Password"
              required
              className="h-12 pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <span className="flex justify-end text-[14px] font-medium text-[#f26d21] cursor-pointer">
            Forgot Password?
          </span>

          <Button
            type="submit"
            className="mt-4 bg-[#f26d21] hover:bg-[#f26d21]/60 font-bold text-xl"
            size="xl"
          >
            Log In
          </Button>

          <p className="text-center text-[14px] font-medium text-[#9aa0b3]">
            Do not have an account?{" "}
            <span className="text-[#f26d21] cursor-pointer">Request Access</span>
          </p>
        </form>
      </div>
    </div>
  );
}
