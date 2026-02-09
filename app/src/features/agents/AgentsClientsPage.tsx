// app/admin/agents/page.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AGENTS as BASE_AGENTS, SHIPMENTS, type Agent } from "@/types/mock-data"
import { getEffectiveAgentStatus } from "@/types/agent-status-store"
import { getAllAgents } from "@/types/agents-store"

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, MoreVertical, Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")
}

function AgentStatusBadge({ status }: { status: Agent["status"] }) {
  if (status === "Active") {
    return <Badge className="bg-orange-500 text-white hover:bg-orange-500">Active</Badge>
  }
  return <Badge variant="secondary">Inactive</Badge>
}

function getAgentCounts(agentId: string) {
  const all = SHIPMENTS.filter((s) => s.agentId === agentId)
  const active = all.filter((s) => s.status !== "Delivered").length
  return { total: all.length, active }
}

export default function AgentsPage() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [country, setCountry] = React.useState<"All" | string>("All")

  const [statusVersion, setStatusVersion] = React.useState(0)
  React.useEffect(() => {
    const handler = () => setStatusVersion((v) => v + 1)
    window.addEventListener("agent-status-changed", handler)
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener("agent-status-changed", handler)
      window.removeEventListener("storage", handler)
    }
  }, [])

  // ✅ rerender when agents are added
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

  const AGENTS = React.useMemo(() => {
    return getAllAgents(BASE_AGENTS)
  }, [agentsVersion])

  const countries = React.useMemo(() => {
    const set = new Set(AGENTS.map((a) => a.country))
    return ["All", ...Array.from(set)]
  }, [AGENTS])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return AGENTS.filter((a) => {
      const matchesQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        (a.company ?? "").toLowerCase().includes(q)

      const matchesCountry = country === "All" ? true : a.country === country
      return matchesQuery && matchesCountry
    })
  }, [query, country, AGENTS, statusVersion])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex items-center gap-2">
          <Button
            className="gap-2 bg-orange-500 hover:bg-orange-600"
            onClick={() => router.push("/admin/agents/addNewAgent")}
          >
            <Plus className="h-4 w-4" />
            Add New Agent
          </Button>
        </div>
      </div>

      <Card className="border-muted/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Agents</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search name, email, or location..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    {/* Globe icon */}
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Country: <span className="font-medium">{country}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {countries.map((c) => (
                    <DropdownMenuItem key={c} onClick={() => setCountry(c)}>
                      {c}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[#9b9b9b]">NAME</TableHead>
                  <TableHead className="text-[#9b9b9b]">LOCATION</TableHead>
                  <TableHead className="text-[#9b9b9b]">PHONE</TableHead>
                  <TableHead className="text-[#9b9b9b]">ACTIVE SHIPMENTS</TableHead>
                  <TableHead className="text-[#9b9b9b]">STATUS</TableHead>
                  <TableHead className="w-14" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((agent) => {
                  const counts = getAgentCounts(agent.id)
                  const effectiveStatus = getEffectiveAgentStatus(agent.id, agent.status)

                  return (
                    <TableRow
                      key={agent.id}
                      className="cursor-pointer"
                      onClick={() =>
                        router.push(`/admin/agentProfile?id=${encodeURIComponent(agent.id)}`)
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>{initials(agent.name)}</AvatarFallback>
                          </Avatar>
                          <div className="leading-tight">
                            <div className="font-medium text-[#121826]">{agent.name}</div>
                            <div className="text-xs text-muted-foreground">{agent.email}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-[#111827]">
                        {agent.location}, {agent.country}
                        {agent.company ? (
                          <div className="text-xs text-muted-foreground">{agent.company}</div>
                        ) : null}
                      </TableCell>

                      <TableCell className="text-[#111827]">{agent.phone}</TableCell>

                      <TableCell className="text-[#111827]">{counts.active}</TableCell>

                      <TableCell>
                        <AgentStatusBadge status={effectiveStatus} />
                      </TableCell>

                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/agentProfile?id=${encodeURIComponent(agent.id)}`)
                              }
                            >
                              View profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                      No agents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
