"use client";

import type { Opportunity } from "@/types";
import { Badge } from "@/components/Badge";
import { ArrowRight, Sparkles } from "lucide-react";

const levelTone: Record<Opportunity["priorityLevel"], string> = {
  HIGH: "rose",
  MEDIUM: "amber",
  MONITOR: "sky",
};

export function OpportunityCentre({
  opportunities,
  onOpen,
}: {
  opportunities: Opportunity[];
  onOpen: (opportunity: Opportunity) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/80">
          Opportunity Centre
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">What needs attention now</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Ranked from live stock, leads and sales. Open a card to jump to the records or ask DealerAI
          to draft the next move.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {opportunities.map((opportunity) => (
          <button
            key={opportunity.id}
            type="button"
            onClick={() => onOpen(opportunity)}
            className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left shadow-lg shadow-black/20 transition hover:border-amber-400/40 hover:bg-slate-900"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={levelTone[opportunity.priorityLevel]}>{opportunity.priorityLevel}</Badge>
              <Badge tone={opportunity.badgeColor}>{opportunity.badgeText}</Badge>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">{opportunity.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{opportunity.whyItMatters}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
              {opportunity.evidence.slice(0, 3).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-500">
                {opportunity.affectedCount} {opportunity.affectedLabel}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-amber-300 group-hover:gap-2">
                {opportunity.targetTab === "assistant" ? (
                  <>
                    Ask DealerAI <Sparkles className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Open records <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
