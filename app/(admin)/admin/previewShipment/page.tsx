"use client";

import { useRouter } from "next/navigation";

export default function PreviewShipmentPage() {
  const router = useRouter();
  const data = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("shipmentPreview") || "{}") : {};

  const handleSave = () => {
    // TODO: save to admin/allShipments backend or database
    alert("Shipment saved to allShipments!");
    router.push("/admin/allShipments");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold text-[#37384E]">Shipment Preview</h1>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>

      <div className="flex gap-4 justify-end">
        <button className="px-4 py-2 bg-gray-300 rounded" onClick={handleCancel}>Cancel</button>
        <button className="px-4 py-2 bg-[#f26d21] text-white rounded" onClick={handleSave}>Save</button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handlePrint}>Print PDF</button>
      </div>
    </div>
  );
}
