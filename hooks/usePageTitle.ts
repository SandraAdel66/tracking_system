import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/newShipment": "New Shipment",
  "/admin/allShipments": "All Shipments",
  "/admin/tracking": "Tracking",
  "/admin/agents": "Agents & Clients",
  "/admin/agentProfile": "Agent Profile",
  "/admin/agentProfile/agentActiveShipments": "Active Shipments",
  "/admin/agentProfile/agentHistory": "Shipment History",
  "/admin/allUsers": "Users",
  "/admin/allUsers/addNewUser": "Add New User",
  "/admin/allUsers/[id]/edit": "Edit User",
};

export const usePageTitle = () => {
  const pathnameRaw = usePathname() || "/admin";
  const pathname = pathnameRaw.replace(/\/$/, ""); // remove trailing slash

  // 1) exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // 2) then longest prefix match for nested routes
  const matched = Object.entries(pageTitles)
    .sort(([a], [b]) => b.length - a.length)
    .find(([path]) => pathname.startsWith(path + "/"));

  return matched?.[1] ?? "Dashboard";
};
