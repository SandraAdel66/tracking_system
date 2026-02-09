"use client"

import type { Agent } from "@/types/mock-data"

const KEY = "pfs_agents_created_v1"

type StoredAgent = Agent

function safeParse(json: string | null): StoredAgent[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? (parsed as StoredAgent[]) : []
  } catch {
    return []
  }
}

export function getCreatedAgents(): StoredAgent[] {
  if (typeof window === "undefined") return []
  return safeParse(window.localStorage.getItem(KEY))
}

export function saveCreatedAgents(list: StoredAgent[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(list))
  window.dispatchEvent(new Event("agents-changed"))
}

export function addCreatedAgent(agent: StoredAgent) {
  const list = getCreatedAgents()
  list.unshift(agent) // newest first
  saveCreatedAgents(list)
}

export function getAllAgents(baseAgents: Agent[]): Agent[] {
  // Merge base agents + created agents (avoid duplicates by id)
  const created = typeof window === "undefined" ? [] : getCreatedAgents()
  const map = new Map<string, Agent>()
  for (const a of baseAgents) map.set(a.id, a)
  for (const a of created) map.set(a.id, a)
  return Array.from(map.values())
}
