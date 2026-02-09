// app/admin/agentProfile/agentActiveShipments/page.tsx
"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AGENTS, SHIPMENTS, type ShipmentStatus, type ShipmentMode } from "@/types/mock-data"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Search, Ship, Plane } from "lucide-react"

function StatusPill({ status }: { status: ShipmentStatus }) {
  if (status === "In Transit")
    return <Badge className="bg-blue-600 text-white hover:bg-blue-600">In Transit</Badge>
  if (status === "Pending")
    return <Badge className="bg-orange-500 text-white hover:bg-orange-500">Pending</Badge>
  if (status === "Delivered")
    return <Badge className="bg-green-600 text-white hover:bg-green-600">Delivered</Badge>
  return <Badge className="bg-red-600 text-white hover:bg-red-600">Exception</Badge>
}

function ModeIcon({ mode }: { mode: ShipmentMode }) {
  return mode === "SEA" ? <Ship className="h-4 w-4" /> : <Plane className="h-4 w-4" />
}


function isActiveShipment(status: ShipmentStatus) {
  return status !== "Delivered"
}

export default function AgentActiveShipmentsPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const agentId = sp.get("id") || AGENTS[0]?.id
  const agent = React.useMemo(() => AGENTS.find((a) => a.id === agentId) ?? AGENTS[0], [agentId])

  const [query, setQuery] = React.useState("")

  const activeData = React.useMemo(() => {
    const list = SHIPMENTS
      .filter((s) => s.agentId === agent.id)
      .filter((s) => isActiveShipment(s.status))
      .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())

    const q = query.trim().toLowerCase()
    if (!q) return list

    return list.filter((s) => {
      const hay = [
        s.ref,
        s.blNumber ?? "",
        s.awbNumber ?? "",
        s.containerNumber ?? "",
        s.origin,
        s.destination,
        s.status,
        s.mode,
      ]
        .join(" ")
        .toLowerCase()
      return hay.includes(q)
    })
  }, [agent.id, query])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push(`/admin/agentProfile?id=${encodeURIComponent(agent.id)}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Button>

        <div className="text-sm text-muted-foreground">
          Active shipments for <span className="font-medium text-[#121826]">{agent.name}</span>
        </div>
      </div>

      <Card className="border-muted/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Active Shipments</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search ref, BL, AWB, container, route..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[#9b9b9b]">REF</TableHead>
                  <TableHead className="text-[#9b9b9b]">DOC</TableHead>
                  <TableHead className="text-[#9b9b9b]">ROUTE</TableHead>
                  <TableHead className="text-[#9b9b9b]">MODE</TableHead>
                  <TableHead className="text-[#9b9b9b]">STATUS</TableHead>
                  <TableHead className="text-[#9b9b9b]">UPDATED</TableHead>
                  <TableHead className="text-[#9b9b9b]">ETA</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {activeData.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-[#121826]">{s.ref}</TableCell>

                    <TableCell className="text-[#111827]">
                      <div className="text-sm">
                        {s.mode === "SEA"
                          ? `BL: ${s.blNumber ?? "—"}`
                          : `AWB: ${s.awbNumber ?? "—"}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.mode === "SEA" ? `CTN: ${s.containerNumber ?? "—"}` : "—"}
                      </div>
                    </TableCell>

                    <TableCell className="text-[#111827]">
                      {s.origin} → {s.destination}
                    </TableCell>

                    <TableCell className="text-[#111827]">
                      <div className="inline-flex items-center gap-2">
                        <ModeIcon mode={s.mode} />
                        <span>{s.mode}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusPill status={s.status} />
                    </TableCell>

                    <TableCell className="text-[#111827]">
                      {new Date(s.lastUpdate).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-[#111827]">
                      {new Date(s.eta).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}

                {activeData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                      No active shipments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-[#121826]">{activeData.length}</span> active shipment(s).
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
