import Link from "next/link";
import { RecordPage } from "@/components/RecordPage";
import { SetupMessage } from "@/components/SetupMessage";
import { LeadForm } from "@/components/LeadForm";
import { createLead } from "@/lib/db/mutations";
import { getFloor } from "@/lib/floor";
import { addDaysIso, todayIso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NewLeadPage() {
  const floor = await getFloor();
  if (!floor.ok) return <SetupMessage title={floor.title} body={floor.body} />;

  const stock = floor.data.vehicles.filter((vehicle) => vehicle.status !== "Sold");
  if (floor.data.salespeople.length === 0) {
    return (
      <RecordPage eyebrow="Leads" title="Add a salesperson first" lede="A lead needs an owner from the staff list.">
        <Link href="/staff" className="text-sm font-medium text-amber-300">
          Open staff
        </Link>
      </RecordPage>
    );
  }
  if (stock.length === 0) {
    return (
      <RecordPage eyebrow="Leads" title="Add stock first" lede="An enquiry is captured against a vehicle on the floor.">
        <Link href="/stock/new" className="text-sm font-medium text-amber-300">
          Add vehicle
        </Link>
      </RecordPage>
    );
  }

  return (
    <RecordPage
      eyebrow="Leads"
      title="Add lead"
      lede="Capture a buyer enquiry. Source is recorded here, whether they walked in, messaged, or came from a listing site."
    >
      <LeadForm
        action={createLead}
        salespeople={floor.data.salespeople}
        vehicles={floor.data.vehicles}
        today={todayIso()}
        tomorrow={addDaysIso(1)}
        cancelHref="/?tab=leads"
      />
    </RecordPage>
  );
}
