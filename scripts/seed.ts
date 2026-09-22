import { config } from "dotenv";
import { ensureSchema } from "../lib/db/ensure-schema";
import { seedDatabase } from "../lib/db/seed";

config({ path: ".env.local" });

async function main() {
  await ensureSchema();
  await seedDatabase();
  console.log("Seeded Neon with demo dealership data.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
