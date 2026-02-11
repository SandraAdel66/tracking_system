// lib/shipmentsStore.ts
import type { Shipment, TrackingEvent } from "@/types/shipment";

export type Role = "admin" | "customerService" | "user";

export type SessionShape = {
  role?: Role;
  userId?: string;
};

const STORAGE_KEY = "shipments";

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * ✅ Normalization helper for user searches:
 * - lowercases
 * - removes spaces, dashes, slashes, etc.
 */
export function normalizeLookup(value: string) {
  return (value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getShipments(): Shipment[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<Shipment[]>(localStorage.getItem(STORAGE_KEY));
  return Array.isArray(parsed) ? parsed : [];
}

export function saveShipments(list: Shipment[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("shipments-changed"));
}

export function addShipment(shipment: Shipment) {
  const list = getShipments();

  const exists = list.some((s) => s.blNumber === shipment.blNumber);
  const next = exists
    ? list.map((s) => (s.blNumber === shipment.blNumber ? shipment : s))
    : [shipment, ...list];

  saveShipments(next);
}

export function findShipmentById(id: string): Shipment | undefined {
  return getShipments().find((s) => s.id === id);
}

/**
 * ✅ Keep strict match for admin/customerService flows (unchanged).
 */
export function findShipmentByBL(blNumber: string): Shipment | undefined {
  return getShipments().find((s) => s.blNumber === blNumber);
}

/**
 * ✅ NEW: normalized match for user tracking.
 */
export function findShipmentByBLNormalized(blNumber: string): Shipment | undefined {
  const q = normalizeLookup(blNumber);
  if (!q) return undefined;
  return getShipments().find((s) => normalizeLookup(s.blNumber) === q);
}

/**
 * ✅ NEW: container normalized match for user tracking.
 */
export function findShipmentByContainerNormalized(containerId: string): Shipment | undefined {
  const q = normalizeLookup(containerId);
  if (!q) return undefined;

  return getShipments().find((s) =>
    (s.containers || []).some((c) => normalizeLookup(c.id) === q)
  );
}

export function updateShipmentById(id: string, patch: Partial<Shipment>) {
  const list = getShipments();
  const next = list.map((s) => (s.id === id ? { ...s, ...patch } : s));
  saveShipments(next);
}

export function addTrackingEventAndUpdateStatus(
  shipmentId: string,
  event: Omit<TrackingEvent, "id" | "createdAt">
) {
  const list = getShipments();

  const next = list.map((s) => {
    if (s.id !== shipmentId) return s;

    const newEvent: TrackingEvent = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...event,
    };

    return {
      ...s,
      status: event.status,
      trackingEvents: [newEvent, ...(s.trackingEvents ?? [])],
    };
  });

  saveShipments(next);
}

/**
 * Role-aware visibility:
 * - admin: all
 * - customerService: only createdByUserId === session.userId
 * - user: none (unchanged)
 */
export function getShipmentsForSession(session: SessionShape | null): Shipment[] {
  if (!session?.role) return [];
  const all = getShipments();

  if (session.role === "admin") return all;

  if (session.role === "customerService") {
    if (!session.userId) return [];
    return all.filter((s) => s.createdByUserId === session.userId);
  }

  return [];
}
