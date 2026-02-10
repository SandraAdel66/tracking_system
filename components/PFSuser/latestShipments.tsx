"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { readSession } from "@/lib/session";
import { getShipmentsForSession } from "@/lib/shipmentsStore";
import type { Shipment } from "@/types/shipment";

function buildRoute(s: Shipment) {
  const pol = [s.polCity, s.polCountry].filter(Boolean).join(", ").trim();
  const pod = [s.podCity, s.podCountry].filter(Boolean).join(", ").trim();
  return `${pol || "-"} → ${pod || "-"}`;
}

const STATUS_STYLES: Record<Shipment["status"], string> = {
  "In Transit": "border-purple-600 bg-purple-100 text-purple-700",
  Pending: "border-amber-500 bg-amber-100 text-amber-700",
  Delivered: "border-emerald-500 bg-emerald-100 text-emerald-700",
  Exceptions: "border-red-500 bg-red-50 text-red-700",
};

export default function LatestShipments() {
  const [shipments, setShipments] = React.useState<Shipment[]>([]);

  React.useEffect(() => {
    const refresh = () => {
      const session = readSession();
      const visible = getShipmentsForSession(session);

      // latest first by createdAt
      const sorted = [...visible].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // show latest 5 (change if needed)
      setShipments(sorted.slice(0, 5));
    };

    refresh();

    window.addEventListener("shipments-changed", refresh);
    window.addEventListener("session-changed", refresh);

    return () => {
      window.removeEventListener("shipments-changed", refresh);
      window.removeEventListener("session-changed", refresh);
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Latest Shipments</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {shipments.length === 0 ? (
          <div className="text-sm text-muted-foreground">No shipments yet.</div>
        ) : (
          shipments.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-1">
                <div className="font-medium text-sm">#{s.blNumber}</div>
                <div className="text-xs text-muted-foreground">
                  {buildRoute(s)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Carrier: {s.carrier || "-"}
                </div>
              </div>

              <Badge
                variant="outline"
                className={`${STATUS_STYLES[s.status]} font-semibold`}
              >
                {s.status}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
