"use client";

import Link from "next/link";
import type { Vehicle } from "@/types";
import { Badge } from "@/components/Badge";
import { daysBetween, formatDate, formatRand, margin, vehicleLabel } from "@/lib/utils";

const statusTone: Record<Vehicle["status"], string> = {
  Available: "emerald",
  Reserved: "sky",
  Sold: "slate",
};

export function matchesStockFilter(vehicle: Vehicle, filters: Record<string, string>) {
  if (filters.aging && daysBetween(vehicle.dateAcquired) < Number(filters.aging)) return false;
  if (filters.margin === "thin" && margin(vehicle.sellingPrice, vehicle.purchasePrice) >= 10) return false;
  if (filters.status && vehicle.status !== filters.status) return false;
  if (filters.search) {
    const haystack = `${vehicle.id} ${vehicleLabel(vehicle)} ${vehicle.salesperson}`.toLowerCase();
    if (!haystack.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

export function StockView({
  vehicles,
  filters,
}: {
  vehicles: Vehicle[];
  filters: Record<string, string>;
}) {
  const rows = vehicles.filter((vehicle) => matchesStockFilter(vehicle, filters));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Stock</h2>
          <p className="mt-1 text-sm text-slate-400">
            {rows.length} vehicles shown
            {filters.aging ? ` · ${filters.aging}+ days on floor` : ""}
            {filters.margin === "thin" ? " · thin margin" : ""}
          </p>
        </div>
        <Link
          href="/stock/new"
          className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950"
        >
          Add vehicle
        </Link>
      </div>
      <div className="table-wrap rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="data">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Days</th>
              <th>Mileage</th>
              <th>Cost</th>
              <th>Asking</th>
              <th>GP</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((vehicle) => {
              const gp = vehicle.sellingPrice - vehicle.purchasePrice;
              const gpPct = margin(vehicle.sellingPrice, vehicle.purchasePrice);
              return (
                <tr key={vehicle.id}>
                  <td>
                    <Link href={`/stock/${vehicle.id}`} className="font-medium text-white hover:text-amber-200">
                      {vehicleLabel(vehicle)}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {vehicle.id} · {vehicle.fuel} · {vehicle.transmission}
                    </div>
                  </td>
                  <td className={daysBetween(vehicle.dateAcquired) >= 60 ? "text-rose-300" : "text-slate-300"}>
                    {daysBetween(vehicle.dateAcquired)}
                    <div className="text-xs text-slate-500">{formatDate(vehicle.dateAcquired)}</div>
                  </td>
                  <td>{vehicle.mileage.toLocaleString("en-ZA")} km</td>
                  <td>{formatRand(vehicle.purchasePrice)}</td>
                  <td className="font-medium text-white">{formatRand(vehicle.sellingPrice)}</td>
                  <td className={gpPct < 10 ? "text-amber-300" : "text-emerald-300"}>
                    {formatRand(gp)}
                    <div className="text-xs text-slate-500">{gpPct.toFixed(1)}%</div>
                  </td>
                  <td>{vehicle.salesperson}</td>
                  <td>
                    <Badge tone={statusTone[vehicle.status]}>{vehicle.status}</Badge>
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
