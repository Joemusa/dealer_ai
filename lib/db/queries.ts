import { getDb } from "@/lib/db";
import { ensureSchema } from "@/lib/db/ensure-schema";
import { seedDatabase } from "@/lib/db/seed";
import { leads, sales, salespeople, vehicles } from "@/lib/db/schema";
import type { Lead, Sale, Salesperson, Vehicle } from "@/types";

export async function loadDashboard() {
  await ensureSchema();
  const db = getDb();
  const existing = await db.select({ id: vehicles.id }).from(vehicles).limit(1);
  if (existing.length === 0) {
    await seedDatabase();
  }

  const [vehicleRows, leadRows, saleRows, staffRows] = await Promise.all([
    db.select().from(vehicles),
    db.select().from(leads),
    db.select().from(sales),
    db.select().from(salespeople),
  ]);

  return {
    vehicles: vehicleRows as Vehicle[],
    leads: leadRows.map((row) => ({
      ...row,
      outcome: row.outcome ?? undefined,
    })) as Lead[],
    sales: saleRows as Sale[],
    salespeople: staffRows as Salesperson[],
  };
}
