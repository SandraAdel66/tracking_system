export type Role = "admin" | "customerService" | "user";
export type Scope = "all" | "mine";

export type Session = {
  userId: string;
  role: Role;
  email: string;
  username: string;
  loginAt: string;
};

export const SESSION_KEY = "pfs_session_v1";

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("session-changed"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("session-changed"));
}

export function getScopeFromSession(): Scope {
  const s = readSession();
  return s?.role === "admin" ? "all" : "mine";
}
