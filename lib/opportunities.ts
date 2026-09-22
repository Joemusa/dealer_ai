import type { Lead, Opportunity, Sale, Vehicle } from "@/types";
import { daysBetween, formatRand, margin, vehicleLabel } from "@/lib/utils";

const OPEN_LEAD_STATUSES: Lead["status"][] = [
  "New",
  "Contacted",
  "Qualified",
  "Test Drive",
  "Negotiation",
  "Finance",
];

function scorePriority(level: Opportunity["priorityLevel"], base: number) {
  if (level === "HIGH") return 70 + base;
  if (level === "MEDIUM") return 40 + base;
  return 15 + base;
}

export function buildOpportunities(
  vehicles: Vehicle[],
  leads: Lead[],
  sales: Sale[]
): Opportunity[] {
  const today = new Date();
  const opportunities: Opportunity[] = [];
  const available = vehicles.filter((v) => v.status === "Available");
  const openLeads = leads.filter((l) => OPEN_LEAD_STATUSES.includes(l.status));

  const aging = available.filter((v) => daysBetween(v.dateAcquired, today) >= 45);
  if (aging.length) {
    const capital = aging.reduce((sum, v) => sum + v.purchasePrice, 0);
    const oldest = Math.max(...aging.map((v) => daysBetween(v.dateAcquired, today)));
    const level: Opportunity["priorityLevel"] = oldest >= 90 || aging.length >= 3 ? "HIGH" : "MEDIUM";
    opportunities.push({
      id: "opp-aging-stock",
      priorityLevel: level,
      priorityScore: scorePriority(level, Math.min(aging.length * 6, 25)),
      badgeText: `${aging.length} units · ${oldest} days`,
      badgeColor: level === "HIGH" ? "rose" : "amber",
      title: "Ageing stock is tying up cash",
      affectedCount: aging.length,
      affectedLabel: aging.length === 1 ? "vehicle" : "vehicles",
      targetTab: "stock",
      filterPayload: { aging: "45" },
      records: aging,
      whyItMatters: `${formatRand(capital)} is sitting on the floor with no movement.`,
      evidence: aging.map(
        (v) =>
          `${vehicleLabel(v)} · ${daysBetween(v.dateAcquired, today)} days · asking ${formatRand(v.sellingPrice)}`
      ),
      recommendedAction:
        "Price-review the oldest units today, call matching leads, and move 90-day stock onto a weekend special.",
      potentialImpact: `Freeing even half this stock returns about ${formatRand(Math.round(capital / 2))} in working capital.`,
    });
  }

  const thinMargin = available.filter((v) => margin(v.sellingPrice, v.purchasePrice) < 10);
  if (thinMargin.length) {
    opportunities.push({
      id: "opp-thin-margin",
      priorityLevel: "MEDIUM",
      priorityScore: scorePriority("MEDIUM", thinMargin.length * 4),
      badgeText: `${thinMargin.length} thin-margin units`,
      badgeColor: "amber",
      title: "Stock listed with thin gross profit",
      affectedCount: thinMargin.length,
      affectedLabel: "vehicles",
      targetTab: "stock",
      filterPayload: { margin: "thin" },
      records: thinMargin,
      whyItMatters: "These units leave almost no room for negotiation or recon costs.",
      evidence: thinMargin.map(
        (v) =>
          `${vehicleLabel(v)} · GP ${margin(v.sellingPrice, v.purchasePrice).toFixed(1)}% · ${formatRand(v.sellingPrice - v.purchasePrice)}`
      ),
      recommendedAction:
        "Hold the asking price, bundle extras instead of discounting, or retail the weakest unit to trade.",
      potentialImpact: "Protects floor GP and stops salespeople giving away the last 8–10%.",
    });
  }

  const reserved = vehicles.filter(
    (v) => v.status === "Reserved" && daysBetween(v.dateAcquired, today) >= 0
  );
  const staleReserved = reserved.filter((v) => {
    const lead = openLeads.find((l) => l.vehicleId === v.id && l.status === "Finance");
    return Boolean(lead);
  });
  if (staleReserved.length) {
    opportunities.push({
      id: "opp-reserved",
      priorityLevel: "MONITOR",
      priorityScore: scorePriority("MONITOR", 12),
      badgeText: `${staleReserved.length} in finance`,
      badgeColor: "sky",
      title: "Reserved units waiting on finance",
      affectedCount: staleReserved.length,
      affectedLabel: staleReserved.length === 1 ? "vehicle" : "vehicles",
      targetTab: "leads",
      filterPayload: { status: "Finance" },
      records: staleReserved,
      whyItMatters: "A reserved car is off the floor but not yet a deal.",
      evidence: staleReserved.map((v) => {
        const lead = openLeads.find((l) => l.vehicleId === v.id);
        return `${vehicleLabel(v)} reserved for ${lead?.name ?? "a buyer"} · ${lead?.status ?? "Finance"}`;
      }),
      recommendedAction: "Chase the bank/F&I pack today and set a 48-hour release rule if finance slips.",
      potentialImpact: "Stops a live deal going cold and getting the car back onto AutoTrader faster if it dies.",
    });
  }

  const overdue = openLeads.filter((l) => daysBetween(l.nextFollowUp, today) > 0);
  if (overdue.length) {
    const level: Opportunity["priorityLevel"] = overdue.length >= 3 ? "HIGH" : "MEDIUM";
    opportunities.push({
      id: "opp-overdue-leads",
      priorityLevel: level,
      priorityScore: scorePriority(level, Math.min(overdue.length * 7, 28)),
      badgeText: `${overdue.length} overdue`,
      badgeColor: level === "HIGH" ? "rose" : "amber",
      title: "Follow-ups are overdue",
      affectedCount: overdue.length,
      affectedLabel: overdue.length === 1 ? "lead" : "leads",
      targetTab: "leads",
      filterPayload: { followUp: "overdue" },
      records: overdue,
      whyItMatters: "Used-car buyers keep shopping. Silence is how walk-ins become AutoTrader losses.",
      evidence: overdue.map((l) => {
        const vehicle = vehicles.find((v) => v.id === l.vehicleId);
        return `${l.name} · ${l.status} · ${daysBetween(l.nextFollowUp, today)} days late${vehicle ? ` · ${vehicleLabel(vehicle)}` : ""}`;
      }),
      recommendedAction: "Run a 60-minute call blitz this morning. WhatsApp first, then phone the test-drive leads.",
      potentialImpact: `These ${overdue.length} buyers still have budget against current stock.`,
    });
  }

  const fresh = openLeads.filter(
    (l) => l.status === "New" && daysBetween(l.date, today) >= 1
  );
  if (fresh.length) {
    opportunities.push({
      id: "opp-new-leads",
      priorityLevel: "HIGH",
      priorityScore: scorePriority("HIGH", 18),
      badgeText: `${fresh.length} untouched`,
      badgeColor: "rose",
      title: "New enquiries have not been worked",
      affectedCount: fresh.length,
      affectedLabel: fresh.length === 1 ? "lead" : "leads",
      targetTab: "leads",
      filterPayload: { status: "New" },
      records: fresh,
      whyItMatters: "Speed-to-lead is the whole game on AutoTrader and Cars.co.za.",
      evidence: fresh.map((l) => `${l.name} · ${l.source} · received ${daysBetween(l.date, today)} days ago`),
      recommendedAction: "Assign and contact every New lead before lunch. Do not wait for the salesperson to 'get to it'.",
      potentialImpact: "First responder usually gets the test drive.",
    });
  }

  const stalledDrives = openLeads.filter(
    (l) => l.status === "Test Drive" && daysBetween(l.lastContactDate, today) >= 4
  );
  if (stalledDrives.length) {
    opportunities.push({
      id: "opp-test-drives",
      priorityLevel: "MEDIUM",
      priorityScore: scorePriority("MEDIUM", 16),
      badgeText: `${stalledDrives.length} stalled`,
      badgeColor: "amber",
      title: "Test drives have gone quiet",
      affectedCount: stalledDrives.length,
      affectedLabel: stalledDrives.length === 1 ? "buyer" : "buyers",
      targetTab: "leads",
      filterPayload: { status: "Test Drive" },
      records: stalledDrives,
      whyItMatters: "A driven car is the hottest lead you have until someone else retails it.",
      evidence: stalledDrives.map((l) => `${l.name} · last contact ${daysBetween(l.lastContactDate, today)} days ago`),
      recommendedAction: "Send a same-day offer: lock a price until Friday, include a trade valuation slot.",
      potentialImpact: "Recover deals that already cost recon time and demo fuel.",
    });
  }

  const matchingBudget = aging.flatMap((vehicle) => {
    const matches = openLeads.filter(
      (l) =>
        l.budget >= vehicle.sellingPrice * 0.9 &&
        l.budget <= vehicle.sellingPrice * 1.08 &&
        l.vehicleId !== vehicle.id
    );
    return matches.map((lead) => ({ vehicle, lead }));
  });
  if (matchingBudget.length) {
    const uniqueLeads = Array.from(new Map(matchingBudget.map((row) => [row.lead.id, row])).values());
    opportunities.push({
      id: "opp-match-leads",
      priorityLevel: "HIGH",
      priorityScore: scorePriority("HIGH", 22),
      badgeText: `${uniqueLeads.length} matches`,
      badgeColor: "rose",
      title: "Ageing stock matches live buyer budgets",
      affectedCount: uniqueLeads.length,
      affectedLabel: uniqueLeads.length === 1 ? "buyer" : "buyers",
      targetTab: "assistant",
      filterPayload: { prompt: "Which ageing vehicles match current live leads by budget? Draft a WhatsApp for the top 3." },
      records: uniqueLeads.map((row) => row.lead),
      whyItMatters: "You already have buyers who can pay for cars that are going stale.",
      evidence: uniqueLeads.slice(0, 5).map(
        (row) =>
          `${row.lead.name} budget ${formatRand(row.lead.budget)} fits ${vehicleLabel(row.vehicle)} at ${formatRand(row.vehicle.sellingPrice)}`
      ),
      recommendedAction: "Ask DealerAI to draft the WhatsApps, then call the buyers before the next price drop.",
      potentialImpact: "Turns dead stock into this week's deliveries without buying more cars.",
    });
  }

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthSales = sales.filter((s) => new Date(`${s.dateSold}T00:00:00`) >= monthStart);
  if (monthSales.length <= 1 && today.getDate() >= 18) {
    const gp = monthSales.reduce((sum, s) => sum + (s.sellingPrice - s.purchasePrice), 0);
    opportunities.push({
      id: "opp-month-pace",
      priorityLevel: "MONITOR",
      priorityScore: scorePriority("MONITOR", 8),
      badgeText: `${monthSales.length} deals MTD`,
      badgeColor: "sky",
      title: "Month-to-date pace is light",
      affectedCount: monthSales.length,
      affectedLabel: monthSales.length === 1 ? "sale" : "sales",
      targetTab: "assistant",
      filterPayload: {
        prompt: "We are behind on monthly deals. Using current stock, leads and GP, what should the sales floor do this week?",
      },
      records: monthSales,
      whyItMatters: `Only ${formatRand(gp)} gross profit is on the board this month.`,
      evidence:
        monthSales.length > 0
          ? monthSales.map(
              (s) => `${s.vehicleName} · ${s.customer} · GP ${formatRand(s.sellingPrice - s.purchasePrice)}`
            )
          : ["No deals have been invoiced this month yet."],
      recommendedAction: "Focus the floor on overdue test-drive leads and 60-day bakkies before month-end.",
      potentialImpact: "A two-deal week on Hilux/Ranger class stock can still rescue the month.",
    });
  }

  return opportunities.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function dealershipSnapshot(vehicles: Vehicle[], leads: Lead[], sales: Sale[]) {
  const available = vehicles.filter((v) => v.status === "Available");
  const openLeads = leads.filter((l) => OPEN_LEAD_STATUSES.includes(l.status));
  const stockValue = available.reduce((sum, v) => sum + v.purchasePrice, 0);
  const askingValue = available.reduce((sum, v) => sum + v.sellingPrice, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthSales = sales.filter((s) => new Date(`${s.dateSold}T00:00:00`) >= monthStart);
  const monthGp = monthSales.reduce((sum, s) => sum + (s.sellingPrice - s.purchasePrice), 0);

  return {
    availableUnits: available.length,
    stockValue,
    askingValue,
    openLeads: openLeads.length,
    overdueFollowUps: openLeads.filter((l) => daysBetween(l.nextFollowUp) > 0).length,
    monthDeals: monthSales.length,
    monthGp,
  };
}
