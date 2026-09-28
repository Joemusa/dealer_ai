import { DealerApp, isTab } from "@/components/DealerApp";
import { SetupMessage } from "@/components/SetupMessage";
import { getFloor } from "@/lib/floor";

export const dynamic = "force-dynamic";

const dealershipName = process.env.NEXT_PUBLIC_DEALERSHIP_NAME || "Demo Dealership SA";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { tab?: string | string[] };
}) {
  const floor = await getFloor();
  if (!floor.ok) return <SetupMessage title={floor.title} body={floor.body} />;

  const tab = typeof searchParams.tab === "string" ? searchParams.tab : undefined;

  return (
    <DealerApp
      dealershipName={dealershipName}
      vehicles={floor.data.vehicles}
      leads={floor.data.leads}
      sales={floor.data.sales}
      initialTab={isTab(tab) ? tab : "opportunities"}
    />
  );
}
