"use client";

import type { Sale } from "@/types";
import { formatDate, formatRand } from "@/lib/utils";

export function SalesView({ sales, search }: { sales: Sale[]; search: string }) {
  const rows = sales.filter((sale) => {
    if (!search) return true;
    const haystack = `${sale.vehicleName} ${sale.customer} ${sale.salesperson}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const gp = rows.reduce((sum, sale) => sum + (sale.sellingPrice - sale.purchasePrice), 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Sales</h2>
        <p className="mt-1 text-sm text-slate-400">
          {rows.length} deals · {formatRand(gp)} gross profit
        </p>
      </div>
      <div className="table-wrap rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Customer</th>
              <th>Selling</th>
              <th>GP</th>
              <th>Salesperson</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((sale) => (
              <tr key={sale.id}>
                <td>{formatDate(sale.dateSold)}</td>
                <td className="font-medium text-white">{sale.vehicleName}</td>
                <td>{sale.customer}</td>
                <td>{formatRand(sale.sellingPrice)}</td>
                <td className="text-emerald-300">
                  {formatRand(sale.sellingPrice - sale.purchasePrice)}
                </td>
                <td>{sale.salesperson}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
