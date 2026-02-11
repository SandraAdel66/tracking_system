"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  findShipmentByBLNormalized,
  findShipmentByContainerNormalized,
} from "@/lib/shipmentsStore";

type Mode = "bl" | "container";

export default function UserTrackingSearchPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("bl");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const placeholder = useMemo(
    () => (mode === "bl" ? "e.g. BL123456789" : "e.g. MEDU1234567"),
    [mode]
  );

  const canSearch = query.trim().length > 0;

  const onSearch = useCallback(() => {
    setError("");

    if (!query.trim()) {
      setError("Please enter a B/L number or container number.");
      return;
    }

    const found =
      mode === "bl"
        ? findShipmentByBLNormalized(query)
        : findShipmentByContainerNormalized(query);

    if (!found?.blNumber) {
      setError("No shipment found for this number.");
      return;
    }

    router.push(`/user/track/${encodeURIComponent(found.blNumber)}`);
  }, [mode, query, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{
        background: `
          radial-gradient(700px 700px at top left, rgba(242,109,33,0.20), transparent 60%),
          radial-gradient(900px 900px at bottom right, rgba(55,56,78,0.28), transparent 60%),
          #f7f7f9
        `,
      }}
    >
      <div className="w-full max-w-4xl">
        <h1 className="text-5xl font-extrabold text-[#2f3546] text-center">
          Track your cargo
        </h1>

        <p className="mt-4 text-[#9aa0b3] max-w-2xl mx-auto text-center">
          Enter your Bill of Lading (B/L) or Container Number to get real-time
          status updates.
        </p>

        <div className="mt-10 flex justify-center">
          <Card className="w-full max-w-3xl rounded-2xl border bg-white shadow-sm">
            <CardContent className="p-6">
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
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
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-14 text-base"
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSearch();
                    }}
                  />

                  {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                  <Button
                    onClick={onSearch}
                    disabled={!canSearch}
                    className="mt-6 h-14 w-full rounded-xl bg-[#f26d21] text-white text-base font-semibold hover:bg-[#e8641e] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Track Shipment →
                  </Button>
                </div>

                <TabsContent value="bl" />
                <TabsContent value="container" />
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
