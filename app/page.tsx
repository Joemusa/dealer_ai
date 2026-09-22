import { DealerApp } from "@/components/DealerApp";
import { loadDashboard } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const dealershipName = process.env.NEXT_PUBLIC_DEALERSHIP_NAME || "Demo Dealership SA";

export default async function HomePage() {
  if (!process.env.DATABASE_URL) {
    return (
      <SetupMessage
        title="Neon database is not connected"
        body="Add DATABASE_URL to .env.local locally, and to Vercel → Settings → Environment Variables for production."
      />
    );
  }

  try {
    const data = await loadDashboard();
    return (
      <DealerApp
        dealershipName={dealershipName}
        vehicles={data.vehicles}
        leads={data.leads}
        sales={data.sales}
      />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return (
      <SetupMessage
        title="Could not load dealership data from Neon"
        body={message}
      />
    );
  }
}

function SetupMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">DealerAI</p>
      <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
    </main>
  );
}
