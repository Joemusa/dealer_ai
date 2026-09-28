import { RecordPage } from "@/components/RecordPage";
import { SetupMessage } from "@/components/SetupMessage";
import { StaffForm } from "@/components/StaffForm";
import { createSalesperson } from "@/lib/db/mutations";
import { getFloor } from "@/lib/floor";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const floor = await getFloor();
  if (!floor.ok) return <SetupMessage title={floor.title} body={floor.body} />;

  return (
    <RecordPage
      eyebrow="Staff"
      title="Salespeople"
      lede="People on this list can own stock, work leads, and record a sale."
    >
      <div className="space-y-6">
        <div className="table-wrap rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {floor.data.salespeople.map((person) => (
                <tr key={person.id}>
                  <td className="font-medium text-white">{person.name}</td>
                  <td>{person.phone}</td>
                  <td>{person.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <StaffForm action={createSalesperson} />
      </div>
    </RecordPage>
  );
}
