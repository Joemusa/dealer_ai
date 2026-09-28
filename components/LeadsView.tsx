"use client";

import Link from "next/link";
import type { Lead, Vehicle } from "@/types";
import { Badge } from "@/components/Badge";
import { daysBetween, formatDate, formatRand, vehicleLabel } from "@/lib/utils";

const statusTone: Record<Lead["status"], string> = {
  New: "rose",
  Contacted: "sky",
  Qualified: "sky",
  "Test Drive": "amber",
  Negotiation: "amber",
  Finance: "emerald",
  Sold: "emerald",
  Lost: "slate",
};

export function matchesLeadFilter(lead: Lead, filters: Record<string, string>) {
  if (filters.status && lead.status !== filters.status) return false;
  if (filters.followUp === "overdue" && daysBetween(lead.nextFollowUp) <= 0) return false;
  if (filters.search) {
    const haystack = `${lead.id} ${lead.name} ${lead.phone} ${lead.salesperson} ${lead.source}`.toLowerCase();
    if (!haystack.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

export function LeadsView({
  leads,
  vehicles,
  filters,
}: {
  leads: Lead[];
  vehicles: Vehicle[];
  filters: Record<string, string>;
}) {
  const rows = leads.filter((lead) => matchesLeadFilter(lead, filters));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Leads</h2>
          <p className="mt-1 text-sm text-slate-400">
            {rows.length} leads shown
            {filters.followUp === "overdue" ? " · overdue follow-ups" : ""}
            {filters.status ? ` · ${filters.status}` : ""}
          </p>
        </div>
        <Link
          href="/leads/new"
          className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950"
        >
          Add lead
        </Link>
      </div>
      <div className="table-wrap rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="data">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Vehicle</th>
              <th>Budget</th>
              <th>Source</th>
              <th>Follow-up</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => {
              const vehicle = vehicles.find((item) => item.id === lead.vehicleId);
              const overdue = daysBetween(lead.nextFollowUp) > 0 && !["Sold", "Lost"].includes(lead.status);
              return (
                <tr key={lead.id}>
                  <td>
                    <Link href={`/leads/${lead.id}`} className="font-medium text-white hover:text-amber-200">
                      {lead.name}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {lead.phone} · {lead.id}
                    </div>
                  </td>
                  <td>{vehicle ? vehicleLabel(vehicle) : lead.vehicleId}</td>
                  <td>
                    {formatRand(lead.budget)}
                    <div className="text-xs text-slate-500">
                      {lead.financeRequired ? "Finance" : "Cash"}
                      {lead.tradeIn ? " · trade-in" : ""}
                    </div>
                  </td>
                  <td>{lead.source}</td>
                  <td className={overdue ? "text-rose-300" : "text-slate-300"}>
                    {formatDate(lead.nextFollowUp)}
                    {overdue ? (
                      <div className="text-xs">{daysBetween(lead.nextFollowUp)} days late</div>
                    ) : null}
                  </td>
                  <td>{lead.salesperson}</td>
                  <td>
                    <Badge tone={statusTone[lead.status]}>{lead.status}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
