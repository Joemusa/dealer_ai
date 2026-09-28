import Link from "next/link";
import { RecordPage } from "@/components/RecordPage";
import { SaleForm } from "@/components/SaleForm";
import { SetupMessage } from "@/components/SetupMessage";
import { recordSale } from "@/lib/db/mutations";
import { getFloor } from "@/lib/floor";
import { todayIso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: { lead?: string | string[] };
}) {
  const floor = await getFloor();
  if (!floor.ok) return <SetupMessage title={floor.title} body={floor.body} />;

  const stock = floor.data.vehicles.filter((vehicle) => vehicle.status !== "Sold");
  const leadParam = typeof searchParams.lead === "string" ? searchParams.lead : undefined;

  if (floor.data.salespeople.length === 0) {
    return (
      <RecordPage eyebrow="Sales" title="Add a salesperson first" lede="Someone on the staff list has to record the deal.">
        <Link href="/staff" className="text-sm font-medium text-amber-300">
          Open staff
        </Link>
      </RecordPage>
    );
  }
  if (stock.length === 0) {
    return (
      <RecordPage eyebrow="Sales" title="No stock left to sell" lede="Every vehicle on the floor is already marked sold.">
        <Link href="/?tab=stock" className="text-sm font-medium text-amber-300">
          Back to stock
        </Link>
      </RecordPage>
    );
  }

  return (
    <RecordPage
      eyebrow="Sales"
      title="Record sale"
      lede="The salesperson who closes the deal records it here. That writes the sale, marks the vehicle sold, and closes the lead."
    >
      <SaleForm
        action={recordSale}
        leads={floor.data.leads}
        vehicles={floor.data.vehicles}
        salespeople={floor.data.salespeople}
        initialLeadId={leadParam}
        today={todayIso()}
        cancelHref="/?tab=sales"
      />
    </RecordPage>
  );
}
