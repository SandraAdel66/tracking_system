"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Search, Save, Info, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

type Scope = "all" | "mine";
type Role = "admin" | "customerService" | "user";

type Session = {
  userId: string;
  role: Role;
  email: string;
  username: string;
  loginAt: string;
};

export type Shipment = {
  blNumber: string;
  origin: string;
  destination: string;
  carrier: string;
  type: "FCL" | "Air";
  status: "Pending" | "In Transit" | "Delivered" | "Exceptions";
  eta: string;
};

type LocalShipment = Shipment & {
  id?: string;
  assignedToUserId?: string;
  createdAt?: string;
};

type TrackingUpdate = {
  blNumber: string;
  status: Shipment["status"];
  location: string;
  description: string;
  eventDate: string; // ISO
  updatedAt: string; // ISO
  updatedByUserId?: string;
};

const SESSION_KEY = "pfs_session_v1";
const SHIPMENTS_KEY = "pfs_shipments_v1";
const TRACKING_UPDATES_KEY = "pfs_tracking_updates_v1";

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function readLocalShipments(): LocalShipment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHIPMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalShipment[]) : [];
  } catch {
    return [];
  }
}

function writeTrackingUpdate(update: TrackingUpdate) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(TRACKING_UPDATES_KEY);
    const existing = raw ? (JSON.parse(raw) as TrackingUpdate[]) : [];
    const next = Array.isArray(existing) ? [update, ...existing] : [update];
    window.localStorage.setItem(TRACKING_UPDATES_KEY, JSON.stringify(next));
  } catch {
    window.localStorage.setItem(TRACKING_UPDATES_KEY, JSON.stringify([update]));
  }
}

const STATUS_ORDER: Shipment["status"][] = ["Pending", "In Transit", "Delivered", "Exceptions"];

const STATUS_STYLES: Record<string, string> = {
  "In Transit": "border-purple-600 bg-purple-100 text-purple-700",
  Pending: "border-amber-500 bg-amber-100 text-amber-700",
  Delivered: "border-emerald-500 bg-emerald-100 text-emerald-700",
  Exceptions: "border-red-500 bg-red-50 text-red-700",
};

const mockShipments: Shipment[] = [
  { blNumber: "BL-202401", origin: "Shanghai", destination: "Los Angeles", carrier: "Maersk", type: "FCL", status: "In Transit", eta: "2026-02-18" },
  { blNumber: "BL-202402", origin: "Hamburg", destination: "Alexandria", carrier: "MSC", type: "FCL", status: "Pending", eta: "2026-02-25" },
  { blNumber: "AWB-774411", origin: "Dubai", destination: "Cairo", carrier: "Emirates SkyCargo", type: "Air", status: "Delivered", eta: "2026-02-05" },
  { blNumber: "BL-202403", origin: "Rotterdam", destination: "New York", carrier: "CMA CGM", type: "FCL", status: "Exceptions", eta: "2026-03-02" },
  { blNumber: "BL-202404", origin: "Singapore", destination: "Tokyo", carrier: "ONE", type: "FCL", status: "In Transit", eta: "2026-02-15" },
  { blNumber: "AWB-774412", origin: "London", destination: "New York", carrier: "British Airways", type: "Air", status: "Pending", eta: "2026-02-10" },
];

export default function TrackingPage({ scope }: { scope: Scope }) {
  const router = useRouter();

  const [selected, setSelected] = useState<LocalShipment | null>(null);
  const [status, setStatus] = useState<Shipment["status"] | "">("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [search, setSearch] = useState("");

  // keep your "previewShipment" flow working without breaking
  const [blNumber, setBlNumber] = useState("");
  const [salesman, setSalesman] = useState("");
  const [shipper, setShipper] = useState("");
  const [consignee, setConsignee] = useState("");
  const [agent, setAgent] = useState<string | undefined>();

  const [polCountry, setPolCountry] = useState<string | null>(null);
  const [podCountry, setPodCountry] = useState<string | null>(null);

  const [containers, setContainers] = useState([{ id: "", type: "" }]);
  const [selectedLine, setSelectedLine] = useState<string | undefined>();
  const [documents, setDocuments] = useState<File[]>([]);

  const canSave = status && location && description && eventDate;

  // load shipments list according to scope
  const shipments: LocalShipment[] = useMemo(() => {
    const session = readSession();
    const local = readLocalShipments();

    const base: LocalShipment[] = local.length ? local : (mockShipments as LocalShipment[]);

    if (scope === "all") return base;

    // mine
    return base.filter(
      (s) => s.assignedToUserId && s.assignedToUserId === session?.userId
    );
  }, [scope]);

  const filteredShipments = useMemo(() => {
    if (!search) return shipments;

    const q = search.toLowerCase();
    return shipments.filter((s) => s.blNumber.toLowerCase().includes(q));
  }, [search, shipments]);

  const allowedStatuses = useMemo(() => {
    if (!selected) return [];
    const currentIndex = STATUS_ORDER.indexOf(selected.status);
    return STATUS_ORDER.slice(currentIndex + 1);
  }, [selected]);

  const handleSaveShipment = () => {
    // 1) Save the tracking update (local simulation)
    const session = readSession();

    if (!selected || !eventDate || !status) return;

    writeTrackingUpdate({
      blNumber: selected.blNumber,
      status: status as Shipment["status"],
      location,
      description,
      eventDate: eventDate.toISOString(),
      updatedAt: new Date().toISOString(),
      updatedByUserId: session?.userId,
    });

    // 2) Keep your existing preview navigation (no UI change)
    const preview = {
      blNumber,
      salesman,
      shipper,
      consignee,
      agent,
      shippingLine: selectedLine,
      polCountry,
      podCountry,
      containers,
      documents: documents.map((f) => f.name),
    };

    sessionStorage.setItem("shipmentPreview", JSON.stringify(preview));
    router.push("/admin/previewShipment");
  };

  return (
    <div className="flex h-screen bg-[#f7f7f9]">
      {/* Left panel */}
      <div className="flex-1 p-8 bg-white">
        {!selected ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#9B9B9B]">
            <MapPin className="h-12 w-12 mb-4" />
            <p>Select a shipment to show its details</p>
          </div>
        ) : (
          <div className="space-y-6 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#37384E]">
              Update Tracking Details
            </h2>

            {/* NON-EDITABLE DATA (CRITICAL) */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#9B9B9B] font-semibold">
                      B/L Number
                    </label>
                    <Input
                      disabled
                      value={selected.blNumber}
                      className="bg-[#EDEDED] text-black font-medium text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#9B9B9B] font-semibold">
                      Container Number
                    </label>
                    <Input
                      disabled
                      value="CONT-001 / 40FT"
                      className="bg-[#EDEDED] text-black font-medium text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EDITABLE DATA */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-[#9B9B9B] font-semibold">
                  Current Status
                </label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as Shipment["status"])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="New Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#9B9B9B] font-semibold">
                  Location
                </label>
                <Input
                  placeholder="Port, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-[#9B9B9B] font-semibold">
                Last Event Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter the description of the current status update"
              />
            </div>

            <div className="w-1/2">
              <label className="text-sm text-[#9B9B9B] font-semibold">
                Event Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-between text-left text-[#9B9B9B]"
                  >
                    <span>
                      {eventDate ? format(eventDate, "yyyy-MM-dd") : "Year-Month-Day"}
                    </span>
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-[#9B9B9B]">
                <Info className="h-4 w-4 mr-2" />
                Use this form to manually update the latest tracking event for the
                selected shipment
              </div>
              <Button
                onClick={handleSaveShipment}
                disabled={!canSave}
                className="bg-[#f26d21] text-white font-medium"
              >
                <Save className="h-4 w-4 mr-2" /> Save Updates
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="w-[30%] border-l bg-white p-6 space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="Enter B/L or Container number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button className="bg-[#f26d21] text-white font-medium">
            <Search className="h-4 w-4 mr-1" /> Search
          </Button>
        </div>

        <div className="space-y-3">
          {filteredShipments.map((s) => {
            const isSelected = selected?.blNumber === s.blNumber;
            return (
              <Card
                key={s.blNumber}
                onClick={() => {
                  setSelected(s);
                  setStatus("");
                  setLocation("");
                  setDescription("");
                  setEventDate(undefined);
                }}
                className={`cursor-pointer transition hover:shadow ${
                  isSelected ? "bg-[#fdf4ee] border border-[#f26d21]" : "bg-white"
                }`}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">#{s.blNumber}</p>
                    <p className="text-sm text-[#9B9B9B]">
                      {s.origin} → {s.destination}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center text-xs px-2 py-0.5 rounded border ${STATUS_STYLES[s.status]}`}
                  >
                    {s.status}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
