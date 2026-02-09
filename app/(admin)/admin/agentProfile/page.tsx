// app/admin/agentProfile/page.tsx
"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AGENTS as BASE_AGENTS,
  SHIPMENTS,
  type ShipmentStatus,
  type ShipmentMode,
  type Agent,
} from "@/types/mock-data"
import { getEffectiveAgentStatus, setAgentStatusOverride } from "@/types/agent-status-store"
import { getAllAgents } from "@/types/agents-store"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Mail, Phone, MapPin, ArrowLeft, Ship, Plane, Clock } from "lucide-react"

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")
}

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
  return mode === "FCL" ? <Ship className="h-4 w-4" /> : <Plane className="h-4 w-4" />
}


function isActiveShipment(status: ShipmentStatus) {
  return status !== "Delivered"
}

export default function AgentProfilePage() {
  const router = useRouter()
  const sp = useSearchParams()


  const [agentsVersion, setAgentsVersion] = React.useState(0)
  React.useEffect(() => {
    const handler = () => setAgentsVersion((v) => v + 1)
    window.addEventListener("agents-changed", handler)
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener("agents-changed", handler)
      window.removeEventListener("storage", handler)
    }
  }, [])


  const AGENTS = React.useMemo(() => getAllAgents(BASE_AGENTS), [agentsVersion])

  const agentIdFromQuery = sp.get("id")
  const fallbackId = AGENTS[0]?.id
  const agentId = agentIdFromQuery || fallbackId


  const agent: Agent = React.useMemo(() => {
    const found = AGENTS.find((a) => a.id === agentId)
    return found ?? AGENTS[0]
  }, [AGENTS, agentId])


  if (!agent) {
    return (
      <div className="p-6">
        <Card className="border-muted/60">
          <CardContent className="p-6 text-sm text-muted-foreground">
            No agents available.
          </CardContent>
        </Card>
      </div>
    )
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [status, setStatus] = React.useState<"Active" | "Inactive">(() =>
    getEffectiveAgentStatus(agent.id, agent.status)
  )

  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    const sync = () => setStatus(getEffectiveAgentStatus(agent.id, agent.status))
    window.addEventListener("agent-status-changed", sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener("agent-status-changed", sync)
      window.removeEventListener("storage", sync)
    }
  }, [agent.id, agent.status])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const shipmentsAll = React.useMemo(() => {
    return SHIPMENTS
      .filter((s) => s.agentId === agent.id)
      .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
  }, [agent.id])


  // eslint-disable-next-line react-hooks/rules-of-hooks
  const shipmentsActive = React.useMemo(() => {
    return shipmentsAll.filter((s) => isActiveShipment(s.status))
  }, [shipmentsAll])

  const totalCount = shipmentsAll.length
  const activeCount = shipmentsActive.length

  const latestFiveActive = shipmentsActive.slice(0, 5)

  const isAgentActive = status === "Active"

  const handleToggle = (checked: boolean) => {
    const nextStatus: "Active" | "Inactive" = checked ? "Active" : "Inactive"
    setStatus(nextStatus)
    setAgentStatusOverride(agent.id, nextStatus)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" className="gap-2" onClick={() => router.push("/admin/agents")}>
          <ArrowLeft className="h-4 w-4" />
          Back to agents
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            router.push(`/admin/agentProfile/agentHistory?id=${encodeURIComponent(agent.id)}`)
          }
        >
          View all shipment history
        </Button>
      </div>

      {/* Profile header */}
      <Card className="border-muted/60">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="text-lg">{initials(agent.name)}</AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-[#121826]">{agent.name}</h1>
                  {isAgentActive ? (
                    <Badge className="bg-orange-500 text-white hover:bg-orange-500">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>

                <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {agent.location}, {agent.country}
                      {agent.company ? ` • ${agent.company}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{agent.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{agent.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Toggle + KPI */}
            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-[#121826]">Agent Status</Label>
                  <div className="text-xs text-muted-foreground">
                    Toggle to activate/deactivate this agent.
                  </div>
                </div>
                <Switch checked={isAgentActive} onCheckedChange={handleToggle} />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[520px]">
                <Card className="border-muted/60">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Active Shipments</div>
                    <div className="text-xl font-semibold text-[#121826]">{activeCount}</div>
                  </CardContent>
                </Card>

                <Card className="border-muted/60">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">On-time Rate</div>
                    <div className="text-xl font-semibold text-[#121826]">{agent.onTimeRate}%</div>
                  </CardContent>
                </Card>

                <Card className="border-muted/60">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Total Shipments</div>
                    <div className="text-xl font-semibold text-[#121826]">{totalCount}</div>
                  </CardContent>
                </Card>

                <Card className="border-muted/60">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Last Update
                    </div>
                    <div className="text-sm font-medium text-[#121826]">
                      {shipmentsAll[0]?.lastUpdate
                        ? new Date(shipmentsAll[0].lastUpdate).toLocaleString()
                        : "—"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details + Latest shipments (ACTIVE ONLY) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-muted/60 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Agent Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Agent Code</span>
              <span className="font-medium text-[#121826]">{agent.id.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Coverage</span>
              <span className="font-medium text-[#121826]">{agent.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Modes</span>
              <span className="font-medium text-[#121826]">Fcl • Air</span>
            </div>
            <div className="pt-2">
              <div className="text-muted-foreground mb-1">Internal Notes</div>
              <div className="rounded-md border p-3 text-[#121826]">
                Handles updates & documents for assigned shipments. Escalate exceptions via email + phone.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Latest Active Shipments</CardTitle>

            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() =>
                router.push(
                  `/admin/agentProfile/agentActiveShipments?id=${encodeURIComponent(agent.id)}`
                )
              }
            >
              Show active shipments
            </Button>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-[#9b9b9b]">B/L Number</TableHead>
                    <TableHead className="text-[#9b9b9b]">ROUTE</TableHead>
                    <TableHead className="text-[#9b9b9b]">MODE</TableHead>
                    <TableHead className="text-[#9b9b9b]">STATUS</TableHead>
                    <TableHead className="text-[#9b9b9b]">LAST UPDATE</TableHead>
                    <TableHead className="text-[#9b9b9b]">ETA</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {latestFiveActive.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-[#121826]">
                        <div>{s.ref}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.mode === "FCL"
                            ? `BL: ${s.blNumber ?? "—"} • CTN: ${s.containerNumber ?? "—"}`
                            : `AWB: ${s.awbNumber ?? "—"}`}
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

                  {latestFiveActive.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-sm text-muted-foreground py-10"
                      >
                        No active shipments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Active shipments count:{" "}
              <span className="font-medium text-[#121826]">{activeCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
