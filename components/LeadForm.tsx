"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { controlClass, Field, FormError, SubmitButton } from "@/components/fields";
import type { FormState } from "@/lib/db/mutations";
import { LEAD_SOURCES, WORKING_LEAD_STATUSES } from "@/lib/options";
import type { Lead, Salesperson, Vehicle } from "@/types";
import { vehicleLabel } from "@/lib/utils";

export function LeadForm({
  action,
  salespeople,
  vehicles,
  lead,
  today,
  tomorrow,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  salespeople: Salesperson[];
  vehicles: Vehicle[];
  lead?: Lead;
  today: string;
  tomorrow: string;
  cancelHref: string;
}) {
  const [state, formAction] = useFormState(action, {});
  const stock = vehicles.filter((vehicle) => vehicle.status !== "Sold" || vehicle.id === lead?.vehicleId);

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <FormError error={state.error} />
      {lead ? <input type="hidden" name="id" value={lead.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input name="name" required defaultValue={lead?.name} className={controlClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" required defaultValue={lead?.phone} className={controlClass} />
        </Field>
        <Field label="Email" className="block space-y-1.5 text-sm sm:col-span-2">
          <input name="email" type="email" required defaultValue={lead?.email} className={controlClass} />
        </Field>
        <Field label="Vehicle" className="block space-y-1.5 text-sm sm:col-span-2">
          <select name="vehicleId" defaultValue={lead?.vehicleId} required className={controlClass}>
            <option value="">Choose a vehicle</option>
            {stock.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicleLabel(vehicle)}
                {vehicle.status === "Sold" ? " · sold" : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Budget (R)">
          <input name="budget" type="number" required min={0} defaultValue={lead?.budget} className={controlClass} />
        </Field>
        <Field label="Source">
          <select name="source" defaultValue={lead?.source ?? "Walk-in"} className={controlClass}>
            {LEAD_SOURCES.map((source) => (
              <option key={source}>{source}</option>
            ))}
          </select>
        </Field>
        <Field label="Enquiry date">
          <input name="date" type="date" required defaultValue={lead?.date ?? today} className={controlClass} />
        </Field>
        <Field label="Next follow-up">
          <input
            name="nextFollowUp"
            type="date"
            required
            defaultValue={lead?.nextFollowUp ?? tomorrow}
            className={controlClass}
          />
        </Field>
        {lead ? (
          <Field label="Last contact">
            <input
              name="lastContactDate"
              type="date"
              required
              defaultValue={lead.lastContactDate}
              className={controlClass}
            />
          </Field>
        ) : null}
        <Field label="Salesperson">
          <select name="salesperson" defaultValue={lead?.salesperson ?? salespeople[0]?.name} className={controlClass}>
            {salespeople.map((person) => (
              <option key={person.id}>{person.name}</option>
            ))}
          </select>
        </Field>
        {lead ? (
          <Field label="Status">
            <select name="status" defaultValue={lead.status === "Sold" ? "New" : lead.status} className={controlClass}>
              {WORKING_LEAD_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </Field>
        ) : null}
        {lead ? (
          <Field label="Outcome" className="block space-y-1.5 text-sm sm:col-span-2">
            <input
              name="outcome"
              defaultValue={lead.outcome ?? ""}
              placeholder="Required when the lead is lost"
              className={controlClass}
            />
          </Field>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="financeRequired" defaultChecked={lead?.financeRequired} className="h-4 w-4 accent-amber-400" />
          Finance required
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="tradeIn" defaultChecked={lead?.tradeIn} className="h-4 w-4 accent-amber-400" />
          Trade-in
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="testDrive" defaultChecked={lead?.testDrive} className="h-4 w-4 accent-amber-400" />
          Test drive done
        </label>
      </div>
      <p className="text-xs leading-5 text-slate-500">
        Setting the status to Finance reserves an available car. Marking the lead lost returns that reserved car to available stock. A completed deal is recorded on the sale page.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {lead && lead.status !== "Sold" && lead.status !== "Lost" ? (
          <Link href={`/sales/new?lead=${lead.id}`} className="text-sm font-medium text-amber-300 hover:text-amber-200">
            Record sale
          </Link>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          <Link href={cancelHref} className="text-sm text-slate-400 hover:text-white">
            Cancel
          </Link>
          <SubmitButton label={lead ? "Save lead" : "Add lead"} />
        </div>
      </div>
    </form>
  );
}
