"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { readSession, type Role } from "@/lib/session";

export default function RequireRole({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();

  React.useEffect(() => {
    const s = readSession();

    // not logged in -> go login
    if (!s) {
      router.replace("/");
      return;
    }

    // logged in but not allowed -> send to correct home
    if (!allow.includes(s.role)) {
      router.replace(s.role === "admin" ? "/admin" : "/customerService");
    }
  }, [router, allow]);

  return <>{children}</>;
}
