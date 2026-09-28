import { RecordPage } from "@/components/RecordPage";
import { SetupMessage } from "@/components/SetupMessage";
import { VehicleForm } from "@/components/VehicleForm";
import { createVehicle } from "@/lib/db/mutations";
import { getFloor } from "@/lib/floor";
import { todayIso } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewVehiclePage() {
  const floor = await getFloor();
  if (!floor.ok) return <SetupMessage title={floor.title} body={floor.body} />;
  if (floor.data.salespeople.length === 0) {
    return (
      <RecordPage
        eyebrow="Stock"
        title="Add a salesperson first"
        lede="A vehicle needs an owner from the staff list."
      >
        <Link href="/staff" className="text-sm font-medium text-amber-300">
          Open staff
        </Link>
      </RecordPage>
    );
  }

  return (
    <RecordPage
      eyebrow="Stock"
      title="Add vehicle"
      lede="Put a bought car on the floor. Asking price, cost, and status feed the stock list and opportunities."
    >
      <VehicleForm
        action={createVehicle}
        salespeople={floor.data.salespeople}
        today={todayIso()}
        cancelHref="/?tab=stock"
      />
    </RecordPage>
  );
}
