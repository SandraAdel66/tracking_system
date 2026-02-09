
"use client"

import type { AgentStatus } from "@/types/mock-data"

const KEY = "pfs_agent_status_map_v1"

type StatusMap = Record<string, AgentStatus>

function safeParse(json: string | null): StatusMap {
  if (!json) return {}
  try {
    const parsed = JSON.parse(json)
    if (parsed && typeof parsed === "object") return parsed as StatusMap
    return {}
  } catch {
    return {}
  }
}

export function getAgentStatusOverride(agentId: string): AgentStatus | null {
  if (typeof window === "undefined") return null
  const map = safeParse(window.localStorage.getItem(KEY))
  return map[agentId] ?? null
}

export function setAgentStatusOverride(agentId: string, status: AgentStatus) {
  if (typeof window === "undefined") return
  const map = safeParse(window.localStorage.getItem(KEY))
  map[agentId] = status
  window.localStorage.setItem(KEY, JSON.stringify(map))

  // Notify same-tab listeners
  window.dispatchEvent(new Event("agent-status-changed"))
}

export function getEffectiveAgentStatus(
  agentId: string,
  defaultStatus: AgentStatus
): AgentStatus {
  return getAgentStatusOverride(agentId) ?? defaultStatus
}
