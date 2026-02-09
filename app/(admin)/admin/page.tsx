import AdminUsersPanel from "@/components/PFSuser/AdminUsersPanel";
import { ChartBar } from "@/components/PFSuser/barChart";
import CountCards from "@/components/PFSuser/countCards";
import LatestShipments from "@/components/PFSuser/latestShipments";

export default function AdminDashboard() {
  return (
    <div className="flex">
      {/* Main content area */}
      <div className="flex w-full justify-center">
        <div className="w-full max-w-7xl m-4 flex flex-col gap-6">

          <AdminUsersPanel />

          <CountCards />
          <div className="bg-white p-6 w-full">
            <ChartBar />
          </div>
          <LatestShipments />
        </div>
      </div>
    </div>
  );
}
