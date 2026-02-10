import TrackingPage from "@/app/src/features/tracking/TrackingPage";
import { getScopeFromSession } from "@/lib/session";

export default function Page() {
  const scope = getScopeFromSession();
  return <TrackingPage scope={scope} />;
}
