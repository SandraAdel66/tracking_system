"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PackageCheck,
  Box,
  Truck,
  MapPin,
  CheckCircle2,
  Anchor,
  ArrowUpRight,
  FileText,
  Share2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { findShipmentByBLNormalized } from "@/lib/shipmentsStore";
import type { Shipment, TrackingEvent, ShipmentStatus } from "@/types/shipment";

function buildRoute(s: Shipment) {
  const pol = [s.polCity, s.polCountry].filter(Boolean).join(", ").trim();
  const pod = [s.podCity, s.podCountry].filter(Boolean).join(", ").trim();
  return `${pol || "-"} → ${pod || "-"}`;
}

function sortEventsDesc(events: TrackingEvent[]) {
  return [...(events || [])].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );
}

function formatPrettyTime(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const now = new Date();
  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isSameDay) return `Today, ${time}`;

  const date = d.toLocaleDateString([], { month: "short", day: "2-digit" });
  return `${date}, ${time}`;
}

function statusPillClass(status: ShipmentStatus) {
  // screenshot uses orange pill for In Transit
  if (status === "In Transit") return "bg-orange-50 text-[#f26d21]";
  if (status === "Delivered") return "bg-green-50 text-green-600";
  if (status === "Exceptions") return "bg-red-50 text-red-600";
  return "bg-slate-100 text-slate-600";
}

function stepIndexFromStatus(status: ShipmentStatus) {
  // 5-step UI; your DB has 4 statuses
  // Pending -> step 0
  // In Transit / Exceptions -> step 2
  // Delivered -> step 4
  if (status === "Delivered") return 4;
  if (status === "In Transit") return 2;
  if (status === "Exceptions") return 2;
  return 0;
}

function TimelineIcon({ event }: { event: TrackingEvent }) {
  // Icon choice to mimic screenshot feel
  // You only have 4 statuses; we style the "latest" item via props in HistoryItem
  switch (event.status) {
    case "In Transit":
      return <Anchor className="h-4 w-4" />;
    case "Delivered":
      return <CheckCircle2 className="h-4 w-4" />;
    case "Exceptions":
      return <ArrowUpRight className="h-4 w-4" />;
    case "Pending":
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={[
          "text-sm font-semibold",
          highlight ? "text-[#f26d21]" : "text-[#111827]",
        ].join(" ")}
      >
        {value || "-"}
      </span>
    </div>
  );
}

function HistoryItem({
  event,
  isLatest,
  isLast,
}: {
  event: TrackingEvent;
  isLatest: boolean;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      {/* left timeline column */}
      <div className="relative flex flex-col items-center">
        <div
          className={[
            "h-9 w-9 rounded-full flex items-center justify-center",
            isLatest
              ? "bg-orange-50 text-[#f26d21] ring-2 ring-orange-200"
              : "bg-gray-100 text-gray-400",
          ].join(" ")}
        >
          <TimelineIcon event={event} />
        </div>

        {/* vertical line */}
        {!isLast ? (
          <div className="mt-2 w-[2px] flex-1 bg-gray-100" />
        ) : null}
      </div>

      {/* content */}
      <div className="flex-1 pb-8">
        <p className="text-xs text-gray-400">{formatPrettyTime(event.eventDate)}</p>

        {/* screenshot has bold title + light description */}
        <p className="mt-1 text-[15px] font-bold text-[#111827]">
          {event.location || event.status}
        </p>
        <p className="mt-2 text-sm text-gray-500">{event.description || "-"}</p>
      </div>
    </div>
  );
}

export default function UserTrackingDetailsPage() {
  const router = useRouter();
  const params = useParams<{ blNumber: string }>();
  const blParam = decodeURIComponent(params.blNumber || "");

  const shipment = useMemo(() => findShipmentByBLNormalized(blParam) ?? null, [blParam]);
  const eventsDesc = useMemo(
    () => (shipment ? sortEventsDesc(shipment.trackingEvents || []) : []),
    [shipment]
  );

  if (!shipment) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Card className="rounded-2xl border bg-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#37384e]">
              Shipment not found
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              No shipment found for: <span className="font-mono">{blParam}</span>
            </p>
            <Button
              className="mt-6 bg-[#f26d21] hover:bg-[#e8641e]"
              onClick={() => router.push("/user/track")}
            >
              Back to search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const idx = stepIndexFromStatus(shipment.status);

  const steps = [
    { label: "Order Placed", icon: PackageCheck },
    { label: "Packed", icon: Box },
    { label: "In Transit", icon: Truck },
    { label: "Arrived", icon: MapPin },
    { label: "Delivered", icon: CheckCircle2 },
  ] as const;

  const carrierLine = `${shipment.carrier || "-"}  •  ${
    shipment.containers?.[0]?.type
      ? `${shipment.containers[0].type}ft Container`
      : `${shipment.containers?.length || 0} Container(s)`
  }`;

  const origin = `${shipment.polCity}, ${shipment.polCountry}`;
  const destination = `${shipment.podCity}, ${shipment.podCountry}`;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      {/* ===== Top Header Card ===== */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100">
        <div className="px-8 pt-7 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] leading-tight font-extrabold text-[#111827]">
                {shipment.blNumber}
              </h1>
              <p className="mt-2 text-sm text-gray-400">{carrierLine}</p>
            </div>

            <span
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
                statusPillClass(shipment.status),
              ].join(" ")}
            >
              <span className="text-[10px] leading-none">●</span>
              {shipment.status}
            </span>
          </div>

          {/* ===== Stepper ===== */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const active = i <= idx;

                return (
                  <div key={s.label} className="relative flex-1">
                    {/* connector line */}
                    {i !== 0 ? (
                      <div
                        className={`absolute left-0 top-5 h-[3px] w-full ${
                          i <= idx ? "bg-[#f26d21]" : "bg-gray-200"
                        }`}
                      />
                    ) : null}

                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={[
                          "h-11 w-11 rounded-full flex items-center justify-center",
                          active
                            ? "bg-[#f26d21] text-white"
                            : "bg-white text-gray-400 border border-gray-200",
                          i === idx ? "ring-4 ring-orange-100" : "",
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <p
                        className={[
                          "mt-3 text-sm font-semibold",
                          active ? "text-[#111827]" : "text-gray-400",
                        ].join(" ")}
                      >
                        {s.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-8 text-sm text-gray-400">{buildRoute(shipment)}</p>
          </div>
        </div>
      </div>

      {/* ===== Bottom Grid ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tracking History */}
        <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-orange-50 text-[#f26d21]">
              <Truck className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-[#111827]">Tracking History</h2>
          </div>

          <div className="px-8 py-8">
            {eventsDesc.length === 0 ? (
              <p className="text-sm text-gray-500">No tracking updates yet.</p>
            ) : (
              <div>
                {eventsDesc.map((e, index) => (
                  <HistoryItem
                    key={e.id}
                    event={e}
                    isLatest={index === 0}
                    isLast={index === eventsDesc.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Map + Details */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100">
          <div className="px-8 py-6">
            {/* Map placeholder */}
            <div className="relative overflow-hidden rounded-xl border border-gray-100">
              <img
                src="/map-placeholder.png"
                alt="Map"
                className="h-[190px] w-full object-cover"
              />
              <span className="absolute bottom-3 right-3 bg-white px-3 py-1.5 text-xs font-semibold rounded-full shadow">
                ● Live View
              </span>
            </div>

            {/* Details */}
            <div className="mt-6">
              <InfoRow label="Origin" value={origin} />
              <InfoRow label="Destination" value={destination} />
              <InfoRow label="Estimated Arrival" value="-" highlight />
              <InfoRow label="Vessel" value="-" />
              <InfoRow label="Voyage No." value="-" />
              <InfoRow label="Weight" value="-" />
            </div>

            <Button
              className="mt-6 w-full h-12 rounded-lg bg-[#2f3147] hover:bg-[#25263a] text-white font-semibold"
              onClick={() => navigator.clipboard.writeText(window.location.href)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Tracking Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
