

import CountCards from "@/components/PFSuser/countCards";
import AllShipmentsTable from "@/components/PFSuser/shipments";


export default function AllShipments() {
  return (
    <div className="flex">

      {/* Main content area */}
      <div className="flex w-full justify-center">
        <div className="w-full max-w-7xl m-4 flex flex-col gap-6">
          <CountCards />
          <AllShipmentsTable />
        </div>
      </div>
    </div>
  );
}
