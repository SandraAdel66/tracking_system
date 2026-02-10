"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readSession } from "@/lib/session";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Ship, Container, FileText, Plus, ArrowRight } from "lucide-react";
import type { Shipment } from "@/types/shipment";

/* COUNTRY → CITY DATA */
const countriesData: Record<string, string[]> = {
  Egypt: ["Alexandria", "Port Said", "Damietta"],
  China: ["Shanghai", "Ningbo", "Shenzhen"],
  UAE: ["Dubai", "Abu Dhabi"],
};
const countries = Object.keys(countriesData);

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default function CreateShipmentPage() {
  const router = useRouter();

  const [blNumber, setBlNumber] = useState("");
  const [salesman, setSalesman] = useState("");
  const [shipper, setShipper] = useState("");
  const [consignee, setConsignee] = useState("");
  const [agent, setAgent] = useState<string | undefined>();

  const [shippingLines, setShippingLines] = useState(["Maersk", "MSC"]);
  const [selectedLine, setSelectedLine] = useState<string | undefined>();
  const [newLineName, setNewLineName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [lineDialogOpen, setLineDialogOpen] = useState(false);

  const [polCountry, setPolCountry] = useState<string | null>(null);
  const [polCity, setPolCity] = useState<string | null>(null);

  const [podCountry, setPodCountry] = useState<string | null>(null);
  const [podCity, setPodCity] = useState<string | null>(null);

  const [containers, setContainers] = useState([{ id: "", type: "" }]);
  const [documents, setDocuments] = useState<File[]>([]);

  const addShippingLine = () => {
    if (!newLineName) return;
    setShippingLines((prev) => [...prev, newLineName]);
    setSelectedLine(newLineName);
    setNewLineName("");
    setArabicName("");
    setLineDialogOpen(false);
  };

  const addContainer = () => setContainers((prev) => [...prev, { id: "", type: "" }]);
  const updateContainer = (index: number, field: "id" | "type", value: string) => {
    const updated = [...containers];
    updated[index][field] = value;
    setContainers(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setDocuments(Array.from(e.target.files));
  };

  const handleSaveShipment = () => {
    const session = readSession();
    if (!session?.role || !session.userId) {
      router.replace("/");
      return;
    }

    const data: Shipment = {
      id: crypto.randomUUID(),
      blNumber,
      salesman,
      shipper,
      consignee,
      agent,
      polCountry: polCountry ?? "",
      polCity: polCity ?? "",
      podCountry: podCountry ?? "",
      podCity: podCity ?? "",
      carrier: selectedLine ?? "",
      containers,
      documents: documents.map((f) => f.name),
      status: "Pending",
      createdAt: new Date().toISOString(),
      createdByUserId: session.userId,
      trackingEvents: [],
    };

    sessionStorage.setItem("shipmentPreview", JSON.stringify(data));

    const base = session.role === "customerService" ? "/customerService" : "/admin";
    router.push(`${base}/previewShipment`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#37384E]">Create New Shipment</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to register a new freight order
          </p>
        </div>

        <Button onClick={handleSaveShipment} className="bg-[#f26d21] text-white">
          Save Shipment
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <User className="text-[#f26d21]" />
              <CardTitle className="text-[#37384E]">Parties & Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Bill of Lading (B/L) Number">
                  <Input value={blNumber} onChange={(e) => setBlNumber(e.target.value)} />
                </FormField>
                <FormField label="Salesman">
                  <Input value={salesman} onChange={(e) => setSalesman(e.target.value)} />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Shipper">
                  <Input value={shipper} onChange={(e) => setShipper(e.target.value)} />
                </FormField>
                <FormField label="Consignee">
                  <Input value={consignee} onChange={(e) => setConsignee(e.target.value)} />
                </FormField>
              </div>

              <FormField label="Agent">
                <Select value={agent} onValueChange={setAgent}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Forwarding Agent Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent1">Agent One</SelectItem>
                    <SelectItem value="agent2">Agent Two</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <Ship className="text-[#f26d21]" />
              <CardTitle className="text-[#37384E]">Route & Carrier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField label="Shipping Line">
                <div className="flex gap-2 mt-1">
                  <Select value={selectedLine} onValueChange={setSelectedLine}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Shipping Line" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingLines.map((line) => (
                        <SelectItem key={line} value={line}>
                          {line}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Dialog open={lineDialogOpen} onOpenChange={setLineDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="bg-white border-white">
                      <DialogHeader>
                        <DialogTitle>Add Shipping Line</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <FormField label="Shipping Line Name *">
                          <Input value={newLineName} onChange={(e) => setNewLineName(e.target.value)} />
                        </FormField>
                        <FormField label="Arabic Name">
                          <Input value={arabicName} onChange={(e) => setArabicName(e.target.value)} />
                        </FormField>
                      </div>
                      <DialogFooter>
                        <Button onClick={addShippingLine} className="bg-[#f26d21] text-white">
                          Save
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="POL Country">
                  <Select
                    value={polCountry ?? ""}
                    onValueChange={(v) => {
                      setPolCountry(v);
                      setPolCity(null);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="POL City">
                  <Select value={polCity ?? ""} onValueChange={setPolCity} disabled={!polCountry}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {polCountry &&
                        countriesData[polCountry].map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="POD Country">
                  <Select
                    value={podCountry ?? ""}
                    onValueChange={(v) => {
                      setPodCountry(v);
                      setPodCity(null);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="POD City">
                  <Select value={podCity ?? ""} onValueChange={setPodCity} disabled={!podCountry}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {podCountry &&
                        countriesData[podCountry].map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Container className="text-[#f26d21]" />
              <CardTitle className="text-[#37384E]">Cargo Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {containers.map((c, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Container ID"
                    value={c.id}
                    onChange={(e) => updateContainer(i, "id", e.target.value)}
                  />
                  <Select value={c.type} onValueChange={(v) => updateContainer(i, "type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20 ft</SelectItem>
                      <SelectItem value="40">40 ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={addContainer}>
                <Plus className="mr-2 h-4 w-4" />
                Add another container
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <FileText className="text-[#f26d21]" />
              <CardTitle className="text-[#37384E]">Provided Documents</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-3">
              <p>Commercial Invoice</p>
              <p>Packing List</p>
              <p>B/L Draft</p>
              <input type="file" multiple hidden id="docs" onChange={handleFileUpload} />
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => document.getElementById("docs")?.click()}
              >
                <Plus className="h-4 w-4" />
                Upload Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
