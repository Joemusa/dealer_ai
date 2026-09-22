import { getDb } from "@/lib/db";
import { leads, sales, salespeople, vehicles } from "@/lib/db/schema";
import { leads as seedLeads, sales as seedSales, salespeople as seedSalespeople, vehicles as seedVehicles } from "@/lib/data";

export async function seedDatabase() {
  const db = getDb();
  await db.insert(salespeople).values(seedSalespeople).onConflictDoNothing();
  await db.insert(vehicles).values(seedVehicles).onConflictDoNothing();
  await db.insert(leads).values(seedLeads).onConflictDoNothing();
  await db.insert(sales).values(seedSales).onConflictDoNothing();
}
