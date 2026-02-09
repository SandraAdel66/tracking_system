// app/admin/agents/addNewAgent/page.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { addCreatedAgent } from "@/types/agents-store"
import type { Agent } from "@/types/mock-data"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CountryOption = {
  name: string
  code: string
  dial: string
}

const COUNTRIES: CountryOption[] = [
  { name: "Egypt", code: "EG", dial: "+20" },
  { name: "UAE", code: "AE", dial: "+971" },
  { name: "Saudi Arabia", code: "SA", dial: "+966" },
  { name: "China", code: "CN", dial: "+86" },
  { name: "Nigeria", code: "NG", dial: "+234" },
  { name: "Turkey", code: "TR", dial: "+90" },
  { name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "United States", code: "US", dial: "+1" },
]

function makeId() {
  return `agent_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "")
}

export default function AddNewAgentPage() {
  const router = useRouter()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [company, setCompany] = React.useState("")
  const [location, setLocation] = React.useState("") // city

  // ✅ country select
  const [countryCode, setCountryCode] = React.useState<string>("EG") // default Egypt
  const selectedCountry = React.useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0],
    [countryCode]
  )

  // ✅ phone digits only (without +20)
  const [phoneLocal, setPhoneLocal] = React.useState("")

  const fullPhone = React.useMemo(() => {
    const dial = selectedCountry.dial
    const local = digitsOnly(phoneLocal)
    return local ? `${dial}${local}` : dial
  }, [selectedCountry.dial, phoneLocal])

  const [countryName, setCountryName] = React.useState<string>(selectedCountry.name)

  // keep countryName in sync
  React.useEffect(() => {
    setCountryName(selectedCountry.name)
  }, [selectedCountry.name])

  const canSave =
    name.trim().length >= 2 &&
    email.trim().includes("@") &&
    location.trim().length >= 2 &&
    countryName.trim().length >= 2 &&
    digitsOnly(phoneLocal).length >= 6 // minimal sanity check

  const onSave = () => {
    if (!canSave) return

    const newAgent: Agent = {
      id: makeId(),
      name: name.trim(),
      email: email.trim(),
      phone: `${selectedCountry.dial}${digitsOnly(phoneLocal)}`,
      location: location.trim(),
      country: countryName.trim(),
      company: company.trim() || undefined,

      // ✅ default inactive
      status: "Inactive",
      onTimeRate: 90,
    }

    addCreatedAgent(newAgent)

    router.push(`/admin/agentProfile?id=${encodeURIComponent(newAgent.id)}`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" className="gap-2" onClick={() => router.push("/admin/agents")}>
          <ArrowLeft className="h-4 w-4" />
          Back to agents
        </Button>

        <Button
          className="gap-2 bg-orange-500 hover:bg-orange-600"
          onClick={onSave}
          disabled={!canSave}
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle className="text-base">Add New Agent</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="Enter agent full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="agent@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Company (optional)</Label>
              <Input
                placeholder="Company / Partner name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>City / Location</Label>
              <Input
                placeholder="Alexandria"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* ✅ Country select first */}
            <div className="space-y-2">
              <Label>Country</Label>
              <Select
                value={countryCode}
                onValueChange={(val) => {
                  setCountryCode(val)
                  const found = COUNTRIES.find((c) => c.code === val)
                  setCountryName(found?.name ?? "Egypt")
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name} ({c.dial})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                Country code will be applied automatically.
              </div>
            </div>

            {/* ✅ Professional phone: prefix + local digits */}
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <div className="flex gap-2">
                <Input value={selectedCountry.dial} readOnly className="w-[110px]" />
                <Input
                  placeholder="Local number (digits only)"
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(digitsOnly(e.target.value))}
                  inputMode="numeric"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Saved as: <span className="font-medium text-[#121826]">{fullPhone}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4 text-sm">
            <div className="font-medium text-[#121826]">Default Status</div>
            <div className="text-muted-foreground mt-1">
              New agents are created as <span className="font-medium">Inactive</span> by default.
              You can activate them later from the agent profile toggle.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
