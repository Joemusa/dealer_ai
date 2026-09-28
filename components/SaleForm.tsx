"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState } from "react-dom";
import { controlClass, Field, FormError, SubmitButton } from "@/components/fields";
import type { FormState } from "@/lib/db/mutations";
import type { Lead, Salesperson, Vehicle } from "@/types";
import { vehicleLabel } from "@/lib/utils";

export function SaleForm({
  action,
  leads,
  vehicles,
  salespeople,
  initialLeadId,
  today,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  leads: Lead[];
  vehicles: Vehicle[];
  salespeople: Salesperson[];
  initialLeadId?: string;
  today: string;
  cancelHref: string;
}) {
  const [state, formAction] = useFormState(action, {});
  const openLeads = leads.filter((lead) => lead.status !== "Sold" && lead.status !== "Lost");
  const stock = vehicles.filter((vehicle) => vehicle.status !== "Sold");
  const initialLead = openLeads.find((lead) => lead.id === initialLeadId);
  const initialVehicle =
    stock.find((vehicle) => vehicle.id === initialLead?.vehicleId) ?? stock[0];

  const [leadId, setLeadId] = useState(initialLead?.id ?? "");
  const [vehicleId, setVehicleId] = useState(initialVehicle?.id ?? "");
  const [customer, setCustomer] = useState(initialLead?.name ?? "");
  const [salesperson, setSalesperson] = useState(
    initialLead?.salesperson ?? salespeople[0]?.name ?? ""
  );
  const [sellingPrice, setSellingPrice] = useState(
    initialVehicle ? String(initialVehicle.sellingPrice) : ""
  );
  const [purchasePrice, setPurchasePrice] = useState(
    initialVehicle ? String(initialVehicle.purchasePrice) : ""
  );

  function chooseLead(id: string) {
    setLeadId(id);
    const lead = openLeads.find((item) => item.id === id);
    if (!lead) return;
    setCustomer(lead.name);
    setSalesperson(lead.salesperson);
    const vehicle = stock.find((item) => item.id === lead.vehicleId);
    if (!vehicle) return;
    setVehicleId(vehicle.id);
    setSellingPrice(String(vehicle.sellingPrice));
    setPurchasePrice(String(vehicle.purchasePrice));
  }

  function chooseVehicle(id: string) {
    setVehicleId(id);
    const vehicle = stock.find((item) => item.id === id);
    if (!vehicle) return;
    setSellingPrice(String(vehicle.sellingPrice));
    setPurchasePrice(String(vehicle.purchasePrice));
  }

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <FormError error={state.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Lead" className="block space-y-1.5 text-sm sm:col-span-2">
          <select
            name="leadId"
            value={leadId}
            onChange={(event) => chooseLead(event.target.value)}
            className={controlClass}
          >
            <option value="">No lead on file</option>
            {openLeads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name} · {lead.status}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vehicle" className="block space-y-1.5 text-sm sm:col-span-2">
          <select
            name="vehicleId"
            required
            value={vehicleId}
            onChange={(event) => chooseVehicle(event.target.value)}
            className={controlClass}
          >
            {stock.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicleLabel(vehicle)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Customer">
          <input
            name="customer"
            required
            value={customer}
            onChange={(event) => setCustomer(event.target.value)}
            className={controlClass}
          />
        </Field>
        <Field label="Recorded by">
          <select
            name="salesperson"
            value={salesperson}
            onChange={(event) => setSalesperson(event.target.value)}
            className={controlClass}
          >
            {salespeople.map((person) => (
              <option key={person.id}>{person.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Selling price (R)">
          <input
            name="sellingPrice"
            type="number"
            required
            min={0}
            value={sellingPrice}
            onChange={(event) => setSellingPrice(event.target.value)}
            className={controlClass}
          />
        </Field>
        <Field label="Purchase price (R)">
          <input
            name="purchasePrice"
            type="number"
            required
            min={0}
            value={purchasePrice}
            onChange={(event) => setPurchasePrice(event.target.value)}
            className={controlClass}
          />
        </Field>
        <Field label="Date sold">
          <input name="dateSold" type="date" required defaultValue={today} className={controlClass} />
        </Field>
        <Field label="Outcome">
          <input name="outcome" defaultValue="Delivered" className={controlClass} />
        </Field>
      </div>
      <p className="text-xs leading-5 text-slate-500">
        Saving writes the sale, marks the vehicle sold, and closes the lead under the salesperson who recorded it.
      </p>
      <div className="flex items-center justify-end gap-3">
        <Link href={cancelHref} className="text-sm text-slate-400 hover:text-white">
          Cancel
        </Link>
        <SubmitButton label="Record sale" />
      </div>
    </form>
  );
}
