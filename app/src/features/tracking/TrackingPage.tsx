"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Search, Save, Info, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { readSession } from "@/lib/session";
import { getShipmentsForSession, addTrackingEventAndUpdateStatus } from "@/lib/shipmentsStore";
import type { Shipment, TrackingEvent } from "@/types/shipment";

type ListRow = {
  id: string;
  blNumber: string;
  routeLabel: string;
  status: Shipment["status"];
};

const STATUS_ORDER: Shipment["status"][] = ["Pending", "In Transit", "Delivered", "Exceptions"];

const STATUS_STYLES: Record<Shipment["status"], string> = {
  "In Transit": "border-purple-600 bg-purple-100 text-purple-700",
  Pending: "border-amber-500 bg-amber-100 text-amber-700",
  Delivered: "border-emerald-500 bg-emerald-100 text-emerald-700",
  Exceptions: "border-red-500 bg-red-50 text-red-700",
};

function buildRoute(s: Shipment) {
  const pol = [s.polCity, s.polCountry].filter(Boolean).join(", ").trim();
  const pod = [s.podCity, s.podCountry].filter(Boolean).join(", ").trim();
  return `${pol || "-"} → ${pod || "-"}`;
}

function loadVisibleShipments(): Shipment[] {
  const session = readSession();
  const visible = getShipmentsForSession(session);
  return [...visible].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default function TrackingPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // form fields (editable)
  const [status, setStatus] = useState<Shipment["status"] | "">("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [search, setSearch] = useState("");

  const [shipments, setShipments] = useState<Shipment[]>([]);

  React.useEffect(() => {
    const refresh = () => setShipments(loadVisibleShipments());

    refresh();
    window.addEventListener("shipments-changed", refresh);
    window.addEventListener("session-changed", refresh);

    return () => {
      window.removeEventListener("shipments-changed", refresh);
      window.removeEventListener("session-changed", refresh);
    };
  }, []);

  const selectedShipment = useMemo(() => {
    if (!selectedId) return null;
    return shipments.find((s) => s.id === selectedId) ?? null;
  }, [selectedId, shipments]);

  const canSave = !!(selectedShipment && status && location && description && eventDate);

  const listRows: ListRow[] = useMemo(() => {
    return shipments.map((s) => ({
      id: s.id,
      blNumber: s.blNumber,
      routeLabel: buildRoute(s),
      status: s.status,
    }));
  }, [shipments]);

  const filteredRows = useMemo(() => {
    if (!search) return listRows;
    const q = search.toLowerCase();
    return listRows.filter((r) => r.blNumber.toLowerCase().includes(q));
  }, [search, listRows]);

  const allowedStatuses = useMemo(() => {
    if (!selectedShipment) return [];
    const currentIndex = STATUS_ORDER.indexOf(selectedShipment.status);
    return STATUS_ORDER.slice(currentIndex + 1);
  }, [selectedShipment]);

  const handleSaveUpdates = () => {
    if (!canSave || !selectedShipment) return;

    addTrackingEventAndUpdateStatus(selectedShipment.id, {
      status: status as Shipment["status"],
      location,
      description,
      eventDate: (eventDate as Date).toISOString(),
    });

    // reset form
    setStatus("");
    setLocation("");
    setDescription("");
    setEventDate(undefined);
  };

  return (
    <div className="flex h-screen bg-[#f7f7f9]">
      {/* Left panel */}
      <div className="flex-1 p-8 bg-white overflow-auto">
        {!selectedShipment ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#9B9B9B]">
            <MapPin className="h-12 w-12 mb-4" />
            <p>Select a shipment to show its details</p>
          </div>
        ) : (
          <div className="space-y-6 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#37384E]">Shipment Details</h2>

            {/*  ALL NON-EDITABLE SHIPMENT DATA */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#9B9B9B] font-semibold">B/L Number</label>
                    <Input disabled value={selectedShipment.blNumber} className="bg-[#EDEDED] text-black font-medium text-sm" />
                  </div>

                  <div>
                    <label className="text-sm text-[#9B9B9B] font-semibold">Carrier</label>
                    <Input disabled value={selectedShipment.carrier || "-"} className="bg-[#EDEDED] text-black font-medium text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-[#9B9B9B] font-semibold">Route</label>
                  <Input disabled value={buildRoute(selectedShipment)} className="bg-[#EDEDED] text-black font-medium text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#9B9B9B] font-semibold">Shipper</label>
                    <Input disabled value={selectedShipment.shipper || "-"} className="bg-[#EDEDED] text-black font-medium text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-[#9B9B9B] font-semibold">Consignee</label>
                    <Input disabled value={selectedShipment.consignee || "-"} className="bg-[#EDEDED] text-black font-medium text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#9B9B9B] font-semibold">Salesman</label>
                    <Input disabled value={selectedShipment.salesman || "-"} className="bg-[#EDEDED] text-black font-medium text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-[#9B9B9B] font-semibold">Agent</label>
                    <Input disabled value={selectedShipment.agent || "-"} className="bg-[#EDEDED] text-black font-medium text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#9B9B9B] font-semibold">Current Status</label>
                    <Input disabled value={selectedShipment.status} className="bg-[#EDEDED] text-black font-medium text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-[#9B9B9B] font-semibold">Created</label>
                    <Input
                      disabled
                      value={new Date(selectedShipment.createdAt).toLocaleString()}
                      className="bg-[#EDEDED] text-black font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Containers */}
                <div>
                  <label className="text-sm text-[#9B9B9B] font-semibold">Containers</label>
                  <div className="mt-2 space-y-2">
                    {(selectedShipment.containers ?? []).length === 0 ? (
                      <div className="text-sm text-[#9B9B9B]">No containers</div>
                    ) : (
                      selectedShipment.containers.map((c, idx) => (
                        <div key={`${c.id}-${idx}`} className="rounded-lg border bg-white p-2 text-sm">
                          <span className="font-medium">{c.id || "-"}</span>
                          <span className="text-[#9B9B9B]"> — {c.type || "-"} ft</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <label className="text-sm text-[#9B9B9B] font-semibold">Documents</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedShipment.documents ?? []).length === 0 ? (
                      <span className="text-sm text-[#9B9B9B]">No documents</span>
                    ) : (
                      selectedShipment.documents.map((d) => (
                        <span key={d} className="text-xs rounded-full border px-3 py-1 bg-gray-50 text-gray-700">
                          {d}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking history */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-[#37384E]">Tracking History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(selectedShipment.trackingEvents ?? []).length === 0 ? (
                  <div className="text-sm text-[#9B9B9B]">No tracking events yet.</div>
                ) : (
                  selectedShipment.trackingEvents.map((e: TrackingEvent) => (
                    <div key={e.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{e.status}</span>
                        <span className="text-xs text-[#9B9B9B]">
                          {new Date(e.eventDate).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">{e.location}</div>
                      <div className="text-sm text-[#9B9B9B] mt-1">{e.description}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/*  EDITABLE SECTION stays as it is */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xl font-semibold text-[#37384E]">Update Tracking Details</h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-[#9B9B9B] font-semibold">New Status</label>
                  <Select value={status} onValueChange={(value) => setStatus(value as Shipment["status"])}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="New Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedStatuses.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-[#9B9B9B] font-semibold">Location</label>
                  <Input placeholder="Port, Country" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm text-[#9B9B9B] font-semibold">Last Event Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter the description of the current status update"
                />
              </div>

              <div className="w-1/2">
                <label className="text-sm text-[#9B9B9B] font-semibold">Event Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center justify-between text-left text-[#9B9B9B]">
                      <span>{eventDate ? format(eventDate, "yyyy-MM-dd") : "Year-Month-Day"}</span>
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar mode="single" selected={eventDate} onSelect={setEventDate} fromDate={new Date()} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-[#9B9B9B]">
                  <Info className="h-4 w-4 mr-2" />
                  Use this form to manually update the latest tracking event for the selected shipment
                </div>

                <Button
                  onClick={handleSaveUpdates}
                  disabled={!canSave}
                  className="bg-[#f26d21] text-white font-medium"
                >
                  <Save className="h-4 w-4 mr-2" /> Save Updates
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="w-[30%] border-l bg-white p-6 space-y-6">
        <div className="flex gap-2">
          <Input placeholder="Enter B/L or Container number" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button className="bg-[#f26d21] text-white font-medium">
            <Search className="h-4 w-4 mr-1" /> Search
          </Button>
        </div>

        <div className="space-y-3">
          {filteredRows.map((r) => {
            const isSelected = selectedId === r.id;
            return (
              <Card
                key={r.id}
                onClick={() => {
                  setSelectedId(r.id);
                  setStatus("");
                  setLocation("");
                  setDescription("");
                  setEventDate(undefined);
                }}
                className={`cursor-pointer transition hover:shadow ${isSelected ? "bg-[#fdf4ee] border border-[#f26d21]" : "bg-white"}`}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">#{r.blNumber}</p>
                    <p className="text-sm text-[#9B9B9B]">{r.routeLabel}</p>
                  </div>
                  <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded border ${STATUS_STYLES[r.status]}`}>
                    {r.status}
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
