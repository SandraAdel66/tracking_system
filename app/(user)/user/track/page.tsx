"use client";

import { useCallback, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getShipments } from "@/lib/shipmentsStore";
import type { Shipment } from "@/types/shipment";
type Mode = "bl" | "container";

function buildRoute(s: Shipment) {
  const pol = [s.polCity, s.polCountry].filter(Boolean).join(", ").trim();
  const pod = [s.podCity, s.podCountry].filter(Boolean).join(", ").trim();
  return `${pol || "-"} → ${pod || "-"}`;
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export default function TrackingLandingUserPage() {
  const [mode, setMode] = useState<Mode>("bl");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Shipment | null>(null);
  const [error, setError] = useState("");

  const placeholder = useMemo(
    () => (mode === "bl" ? "e.g. BL123456789" : "e.g. MEDU1234567"),
    [mode]
  );

  const canSearch = query.trim().length > 0;

  const onSearch = useCallback(() => {
    setError("");
    setResult(null);

    const q = normalizeQuery(query);
    if (!q) {
      setError("Please enter a B/L number or a container number.");
      return;
    }

    const shipments = getShipments();
    let found: Shipment | undefined;

    if (mode === "bl") {
      found = shipments.find((s) => normalizeQuery(s.blNumber || "") === q);
    } else {
      found = shipments.find((s) =>
        (s.containers || []).some((c) => normalizeQuery(c.id || "") === q)
      );
    }

    if (!found) {
      setError("No shipment found for this number.");
      return;
    }

    setResult(found);
  }, [mode, query]);

  return (
    <div
      className="rounded-xl min-h-screen flex items-center justify-center px-6 py-10"
      style={{
        background: `
          radial-gradient(700px 700px at top left, rgba(242,109,33,0.20), transparent 60%),
          radial-gradient(900px 900px at bottom right, rgba(55,56,78,0.28), transparent 60%),
          #f7f7f9
        `,
      }}
    >
      <div className="rounded-xl w-full max-w-4xl">
        {/* 48px title */}
        <h1 className="text-[48px] leading-[1.05] font-extrabold text-[#2f3546] text-center">
          Track your cargo
        </h1>

        <div className="mt-6 rounded-2xl border bg-white shadow-sm px-8 py-10">
          <div className="text-center">
            <p className="text-[16px] text-[#9aa0b3] max-w-2xl mx-auto">
              Enter your Bill of Lading (B/L) or Container Number to get
              real-time status updates.
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <Card className="w-full max-w-3xl rounded-2xl border">
              <CardContent className="p-6">
                <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                  {/* Tabs */}
                  <TabsList className="grid w-full sm:w-[320px] grid-cols-2 bg-gray-100 p-1 rounded-xl">
                    <TabsTrigger
                      value="bl"
                      className="rounded-xl text-[#37384e]
                                 data-[state=active]:bg-[#37384e]
                                 data-[state=active]:text-white"
                    >
                      B/L Number
                    </TabsTrigger>
                    <TabsTrigger
                      value="container"
                      className="rounded-xl text-[#37384e]
                                 data-[state=active]:bg-[#37384e]
                                 data-[state=active]:text-white"
                    >
                      Container No.
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-6">
                    {/* Search icon removed */}
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-14 text-base"
                      placeholder={placeholder}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onSearch();
                      }}
                    />

                    {error ? (
                      <p className="mt-3 text-sm text-red-600">{error}</p>
                    ) : null}

                    <Button
                      onClick={onSearch}
                      disabled={!canSearch}
                      className="mt-6 h-14 w-full rounded-xl bg-[#f26d21] text-white text-base font-semibold hover:bg-[#e8641e] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Track Shipment <span className="ml-2">→</span>
                    </Button>
                  </div>

                  <TabsContent value="bl" />
                  <TabsContent value="container" />

                  {result ? (
                    <div className="mt-8 space-y-4">
                      <div className="rounded-xl border bg-white p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <p className="text-sm text-[#9aa0b3] font-medium">
                              B/L Number
                            </p>
                            <p className="text-lg font-semibold text-[#37384E]">
                              {result.blNumber || "-"}
                            </p>
                            <p className="mt-1 text-sm text-[#9aa0b3]">
                              {buildRoute(result)}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-sm text-[#9aa0b3] font-medium">
                              Current Status
                            </p>
                            <p className="text-lg font-semibold text-[#37384E]">
                              {result.status || "-"}
                            </p>
                            <p className="mt-1 text-sm text-[#9aa0b3]">
                              Carrier: {result.carrier || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border bg-white p-5">
                        <p className="text-base font-semibold text-[#37384E]">
                          Tracking History
                        </p>

                        <div className="mt-3 space-y-3">
                          {(result.trackingEvents || []).length === 0 ? (
                            <p className="text-sm text-[#9aa0b3]">
                              No tracking updates yet.
                            </p>
                          ) : (
                            result.trackingEvents.map((e) => (
                              <div key={e.id} className="rounded-lg border p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-semibold text-[#37384E]">
                                    {e.status}
                                  </p>
                                  <p className="text-xs text-[#9aa0b3]">
                                    {e.eventDate
                                      ? new Date(e.eventDate).toLocaleString()
                                      : "-"}
                                  </p>
                                </div>
                                <p className="mt-1 text-sm text-gray-700">
                                  {e.location || "-"}
                                </p>
                                <p className="mt-1 text-sm text-[#9aa0b3]">
                                  {e.description || "-"}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
