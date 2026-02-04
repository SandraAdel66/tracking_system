'use server';

import axios from "axios";
import { cookies } from "next/headers";

async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_session")?.value;

  if (!session) return null;

  const decoded = JSON.parse(
    Buffer.from(session, 'base64').toString()
  );

  return decoded.originalToken ?? null;
}

export async function apiServer() {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 15000,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Network-Id": "1"
    }
  });

  const token = await getTokenFromCookie();

  if (token) {
    instance.defaults.headers.Authorization = `Bearer ${token}`;
  }

  return instance;
}
export default apiServer;