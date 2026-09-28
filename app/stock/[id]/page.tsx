import Link from "next/link";
import { RecordPage } from "@/components/RecordPage";
import { SetupMessage } from "@/components/SetupMessage";
import { VehicleForm } from "@/components/VehicleForm";
import { updateVehicle } from "@/lib/db/mutations";
import { getFloor } from "@/lib/floor";
import { todayIso, vehicleLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  const floor = await getFloor();
  if (!floor.ok) return <SetupMessage title={floor.title} body={floor.body} />;

  const vehicle = floor.data.vehicles.find((item) => item.id === params.id);
  if (!vehicle) {
    return (
      <RecordPage eyebrow="Stock" title="Vehicle not found" lede="That stock number is not on the floor.">
        <Link href="/?tab=stock" className="text-sm font-medium text-amber-300">
          Back to stock
        </Link>
      </RecordPage>
    );
  }

  return (
    <RecordPage
      eyebrow="Stock"
      title={vehicleLabel(vehicle)}
      lede="Update the asking price, mileage, or status. A completed deal is recorded from the sale page, which marks the car sold."
    >
      <VehicleForm
        action={updateVehicle}
        salespeople={floor.data.salespeople}
        vehicle={vehicle}
        today={todayIso()}
        cancelHref="/?tab=stock"
      />
    </RecordPage>
  );
}
