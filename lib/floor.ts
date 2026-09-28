import { loadDashboard } from "@/lib/db/queries";
import type { Lead, Sale, Salesperson, Vehicle } from "@/types";

export type FloorData = {
  vehicles: Vehicle[];
  leads: Lead[];
  sales: Sale[];
  salespeople: Salesperson[];
};

export async function getFloor(): Promise<
  { ok: true; data: FloorData } | { ok: false; title: string; body: string }
> {
  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      title: "Neon database is not connected",
      body: "Add DATABASE_URL to .env.local locally, and to Vercel → Settings → Environment Variables for production.",
    };
  }

  try {
    const data = await loadDashboard();
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      title: "Could not load dealership data from Neon",
      body: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}
