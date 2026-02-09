// lib/mock-data.ts
export type AgentStatus = "Active" | "Inactive"

export type Agent = {
  id: string
  name: string
  email: string
  phone: string
  location: string
  country: string
  company?: string
  status: AgentStatus
  onTimeRate: number // %
}

export type ShipmentMode = "FCL" | "AIR"
export type ShipmentStatus = "Pending" | "In Transit" | "Delivered" | "Exception"

export type Shipment = {
  id: string
  agentId: string
  ref: string
  blNumber?: string
  awbNumber?: string
  containerNumber?: string
  origin: string
  destination: string
  mode: ShipmentMode
  status: ShipmentStatus
  lastUpdate: string // ISO
  eta: string // ISO
}

export const AGENTS: Agent[] = [
  {
    id: "agent_1",
    name: "Jenny Wilson",
    email: "j.wilson@fastlane.com",
    phone: "+65 9123 4567",
    location: "Singapore",
    country: "Singapore",
    company: "Fastlane Logistics",
    status: "Active",
    onTimeRate: 93,
  },
  {
    id: "agent_2",
    name: "Ahmed Al-Sayed",
    email: "ahmed@gulflogistics.ae",
    phone: "+971 50 123 4567",
    location: "Dubai",
    country: "UAE",
    company: "Gulf Logistics",
    status: "Inactive",
    onTimeRate: 88,
  },
  {
    id: "agent_3",
    name: "Sarah Okafor",
    email: "s.okafor@afritrade.co",
    phone: "+234 80 1234 5678",
    location: "Lagos",
    country: "Nigeria",
    company: "AfriTrade",
    status: "Active",
    onTimeRate: 91,
  },
  {
    id: "agent_4",
    name: "Omar Hassan",
    email: "omar@portside.com",
    phone: "+20 10 5555 0101",
    location: "Alexandria",
    country: "Egypt",
    company: "Portside Agency",
    status: "Active",
    onTimeRate: 95,
  },
]

// Helper to create deterministic ISO dates (newest first)
function daysAgoISO(daysAgo: number) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - daysAgo)
  d.setUTCHours(10, 0, 0, 0)
  return d.toISOString()
}

function daysAheadISO(daysAhead: number) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + daysAhead)
  d.setUTCHours(10, 0, 0, 0)
  return d.toISOString()
}

function generateSarahShipments(): Shipment[] {
  const total = 22
  const list: Shipment[] = []

  for (let i = 0; i < total; i++) {
    const isLatestActive = i === 0 // only the newest one is active
    const mode: ShipmentMode = i % 2 === 0 ? "FCL" : "AIR"

    const status: ShipmentStatus = isLatestActive ? "In Transit" : "Delivered"

    const base: Shipment = {
      id: `sh_sarah_${String(i + 1).padStart(3, "0")}`,
      agentId: "agent_3",
      ref: mode === "FCL" ? `PFS-SEA-SO-${1000 + i}` : `PFS-AIR-SO-${2000 + i}`,
      origin: mode === "FCL" ? "Ningbo, CN" : "Lagos, NG",
      destination: mode === "FCL" ? "Alexandria, EG" : "Dubai, UAE",
      mode,
      status,
      lastUpdate: daysAgoISO(i),
      eta: daysAheadISO(10 + i),
    }

    if (mode === "FCL") {
      base.blNumber = `BL-SO-${900000 + i}`
      base.containerNumber = `MSCU${8000000 + i}`
    } else {
      base.awbNumber = `AWB-SO-${700000 + i}`
    }

    list.push(base)
  }

  return list
}

export const SHIPMENTS: Shipment[] = [

  {
    id: "sh_1001",
    agentId: "agent_1",
    ref: "PFS-SEA-1001",
    blNumber: "BL-889201",
    containerNumber: "MSCU1234567",
    origin: "Shanghai, CN",
    destination: "Alexandria, EG",
    mode: "FCL",
    status: "In Transit",
    lastUpdate: daysAgoISO(0),
    eta: daysAheadISO(12),
  },
  {
    id: "sh_1002",
    agentId: "agent_1",
    ref: "PFS-AIR-1002",
    awbNumber: "AWB-176-99001234",
    origin: "Singapore, SG",
    destination: "Cairo, EG",
    mode: "AIR",
    status: "Pending",
    lastUpdate: daysAgoISO(1),
    eta: daysAheadISO(3),
  },
  {
    id: "sh_1006",
    agentId: "agent_1",
    ref: "PFS-SEA-1006",
    blNumber: "BL-901122",
    containerNumber: "MSCU7651209",
    origin: "Shenzhen, CN",
    destination: "Port Said, EG",
    mode: "FCL",
    status: "In Transit",
    lastUpdate: daysAgoISO(4),
    eta: daysAheadISO(9),
  },

  // Ahmed (some)
  {
    id: "sh_1003",
    agentId: "agent_2",
    ref: "PFS-SEA-1003",
    blNumber: "BL-771022",
    containerNumber: "CMAU7654321",
    origin: "Jebel Ali, UAE",
    destination: "Port Said, EG",
    mode: "FCL",
    status: "Exception",
    lastUpdate: daysAgoISO(2),
    eta: daysAheadISO(6),
  },

  // Omar (some)
  {
    id: "sh_1005",
    agentId: "agent_4",
    ref: "PFS-SEA-1005",
    blNumber: "BL-223344",
    containerNumber: "OOLU9998887",
    origin: "Ningbo, CN",
    destination: "Alexandria, EG",
    mode: "FCL",
    status: "In Transit",
    lastUpdate: daysAgoISO(1),
    eta: daysAheadISO(11),
  },

  ...generateSarahShipments(),
]
