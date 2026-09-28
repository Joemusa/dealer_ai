import Link from "next/link";
import { RecordPage } from "@/components/RecordPage";
import { SetupMessage } from "@/components/SetupMessage";
import { LeadForm } from "@/components/LeadForm";
import { updateLead } from "@/lib/db/mutations";
import { getFloor } from "@/lib/floor";
import { addDaysIso, todayIso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditLeadPage({ params }: { params: { id: string } }) {
  const floor = await getFloor();
  if (!floor.ok) return <SetupMessage title={floor.title} body={floor.body} />;

  const lead = floor.data.leads.find((item) => item.id === params.id);
  if (!lead) {
    return (
      <RecordPage eyebrow="Leads" title="Lead not found" lede="That enquiry is not on the book.">
        <Link href="/?tab=leads" className="text-sm font-medium text-amber-300">
          Back to leads
        </Link>
      </RecordPage>
    );
  }

  if (lead.status === "Sold") {
    return (
      <RecordPage
        eyebrow="Leads"
        title={lead.name}
        lede="This lead was closed when the sale was recorded. The sale row keeps the customer, price, and salesperson."
      >
        <p className="text-sm text-slate-300">{lead.outcome || "Delivered"}</p>
        <Link href="/?tab=sales" className="mt-4 inline-block text-sm font-medium text-amber-300">
          Open sales
        </Link>
      </RecordPage>
    );
  }

  return (
    <RecordPage
      eyebrow="Leads"
      title={lead.name}
      lede="Update the follow-up, status, and outcome. Mark the lead lost here, or record the sale when the deal is done."
    >
      <LeadForm
        action={updateLead}
        salespeople={floor.data.salespeople}
        vehicles={floor.data.vehicles}
        lead={lead}
        today={todayIso()}
        tomorrow={addDaysIso(1)}
        cancelHref="/?tab=leads"
      />
    </RecordPage>
  );
}
