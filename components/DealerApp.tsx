"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  Car,
  LayoutDashboard,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { AssistantView } from "@/components/AssistantView";
import { LeadsView } from "@/components/LeadsView";
import { OpportunityCentre } from "@/components/OpportunityCentre";
import { SalesView } from "@/components/SalesView";
import { StockView } from "@/components/StockView";
import { buildOpportunities, dealershipSnapshot } from "@/lib/opportunities";
import { cn, formatRand } from "@/lib/utils";
import type { Lead, Opportunity, Sale, Vehicle } from "@/types";

type Tab = "opportunities" | "stock" | "leads" | "sales" | "assistant";

const nav: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "opportunities", label: "Opportunities", icon: LayoutDashboard },
  { id: "stock", label: "Stock", icon: Car },
  { id: "leads", label: "Leads", icon: Users },
  { id: "sales", label: "Sales", icon: Wallet },
  { id: "assistant", label: "Assistant", icon: Bot },
];

export function DealerApp({
  dealershipName,
  vehicles,
  leads,
  sales,
}: {
  dealershipName: string;
  vehicles: Vehicle[];
  leads: Lead[];
  sales: Sale[];
}) {
  const [tab, setTab] = useState<Tab>("opportunities");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [seedPrompt, setSeedPrompt] = useState<string>();

  const opportunities = useMemo(
    () => buildOpportunities(vehicles, leads, sales),
    [vehicles, leads, sales]
  );
  const snapshot = useMemo(
    () => dealershipSnapshot(vehicles, leads, sales),
    [vehicles, leads, sales]
  );
  const activeFilters = { ...filters, search };

  const assistantContext = useMemo(
    () => ({
      dealership: dealershipName,
      snapshot,
      vehicles,
      leads,
      sales,
      opportunities: opportunities.map(({ records, ...rest }) => rest),
    }),
    [dealershipName, leads, opportunities, sales, snapshot, vehicles]
  );

  function openOpportunity(opportunity: Opportunity) {
    const nextFilters = { ...opportunity.filterPayload };
    if (opportunity.targetTab === "assistant") {
      setSeedPrompt(nextFilters.prompt);
      setFilters({});
      setTab("assistant");
      return;
    }
    setSeedPrompt(undefined);
    setFilters(nextFilters);
    setSearch("");
    setTab(opportunity.targetTab);
  }

  function go(next: Tab) {
    setTab(next);
    setFilters({});
    setSeedPrompt(undefined);
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-slate-800 bg-slate-950/80 px-5 py-5 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 font-black text-slate-950">
            D
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">DealerAI</p>
            <p className="text-xs text-slate-400">{dealershipName}</p>
          </div>
        </div>
        <nav className="mt-8 grid grid-cols-2 gap-2 lg:grid-cols-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                  tab === item.id
                    ? "bg-amber-400/15 text-amber-200"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sales floor</p>
            <h1 className="text-xl font-semibold sm:text-2xl">Used-car intelligence</h1>
          </div>
          <label className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search stock, leads or sales"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm outline-none ring-amber-400/40 placeholder:text-slate-500 focus:ring-2"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Available stock" value={`${snapshot.availableUnits} units`} />
          <Kpi label="Floor capital" value={formatRand(snapshot.stockValue)} />
          <Kpi label="Open leads" value={`${snapshot.openLeads}`} hint={`${snapshot.overdueFollowUps} overdue`} />
          <Kpi label="Month GP" value={formatRand(snapshot.monthGp)} hint={`${snapshot.monthDeals} deals`} />
        </div>

        <section className="mt-8">
          {tab === "opportunities" ? (
            <OpportunityCentre opportunities={opportunities} onOpen={openOpportunity} />
          ) : null}
          {tab === "stock" ? <StockView vehicles={vehicles} filters={activeFilters} /> : null}
          {tab === "leads" ? <LeadsView leads={leads} vehicles={vehicles} filters={activeFilters} /> : null}
          {tab === "sales" ? <SalesView sales={sales} search={search} /> : null}
          {tab === "assistant" ? (
            <AssistantView context={assistantContext} seedPrompt={seedPrompt} />
          ) : null}
        </section>
      </main>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-amber-300/80">{hint}</p> : null}
    </div>
  );
}
