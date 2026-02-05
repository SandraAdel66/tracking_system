import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/newShipment": "New Shipment",
  "/admin/all-shipments": "All Shipments",
  "/admin/tracking": "Tracking",
  "/admin/agents-clients": "Agents & Clients",
  // Add more routes as needed
};

export const usePageTitle = () => {
  const pathname = usePathname() || "/admin";
  
  // Find the best matching title
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname === path || (path !== "/admin" && pathname.startsWith(path))) {
      return title;
    }
  }
  
  return "Dashboard"; // Default fallback
};