// app/src/types/shipment.ts

export type ShipmentStatus = "Pending" | "In Transit" | "Delivered" | "Exceptions";

export type ContainerItem = {
  id: string;
  type: string; // "20" | "40"
};

export type TrackingEvent = {
  id: string;
  status: ShipmentStatus;
  location: string;
  description: string;
  eventDate: string; // ISO string
  createdAt: string; // ISO string (when the event was saved)
};

export type Shipment = {
  id: string;
  blNumber: string;

  salesman: string;
  shipper: string;
  consignee: string;
  agent?: string;

  polCountry: string;
  polCity: string;
  podCountry: string;
  podCity: string;

  carrier: string;

  containers: ContainerItem[];
  documents: string[];

  status: ShipmentStatus;
  createdAt: string; // ISO

  // role visibility
  createdByUserId: string;

  // tracking history
  trackingEvents: TrackingEvent[];
};
