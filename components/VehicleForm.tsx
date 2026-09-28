"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { controlClass, Field, FormError, SubmitButton } from "@/components/fields";
import type { FormState } from "@/lib/db/mutations";
import { FUELS, OPEN_VEHICLE_STATUSES, TRANSMISSIONS } from "@/lib/options";
import type { Salesperson, Vehicle } from "@/types";

export function VehicleForm({
  action,
  salespeople,
  vehicle,
  today,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  salespeople: Salesperson[];
  vehicle?: Vehicle;
  today: string;
  cancelHref: string;
}) {
  const [state, formAction] = useFormState(action, {});
  const sold = vehicle?.status === "Sold";

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <FormError error={state.error} />
      {vehicle ? <input type="hidden" name="id" value={vehicle.id} /> : null}
      {sold ? <input type="hidden" name="status" value="Sold" /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Make">
          <input name="make" required defaultValue={vehicle?.make} className={controlClass} />
        </Field>
        <Field label="Model">
          <input name="model" required defaultValue={vehicle?.model} className={controlClass} />
        </Field>
        <Field label="Variant" className="block space-y-1.5 text-sm sm:col-span-2">
          <input name="variant" required defaultValue={vehicle?.variant} className={controlClass} />
        </Field>
        <Field label="Year">
          <input
            name="year"
            type="number"
            required
            min={1970}
            defaultValue={vehicle?.year ?? new Date().getFullYear()}
            className={controlClass}
          />
        </Field>
        <Field label="Mileage (km)">
          <input name="mileage" type="number" required min={0} defaultValue={vehicle?.mileage ?? 0} className={controlClass} />
        </Field>
        <Field label="Fuel">
          <select name="fuel" defaultValue={vehicle?.fuel ?? "Petrol"} className={controlClass}>
            {FUELS.map((fuel) => (
              <option key={fuel}>{fuel}</option>
            ))}
          </select>
        </Field>
        <Field label="Transmission">
          <select name="transmission" defaultValue={vehicle?.transmission ?? "Manual"} className={controlClass}>
            {TRANSMISSIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Purchase price (R)">
          <input
            name="purchasePrice"
            type="number"
            required
            min={0}
            defaultValue={vehicle?.purchasePrice}
            className={controlClass}
          />
        </Field>
        <Field label="Asking price (R)">
          <input
            name="sellingPrice"
            type="number"
            required
            min={0}
            defaultValue={vehicle?.sellingPrice}
            className={controlClass}
          />
        </Field>
        <Field label="Date acquired">
          <input
            name="dateAcquired"
            type="date"
            required
            defaultValue={vehicle?.dateAcquired ?? today}
            className={controlClass}
          />
        </Field>
        <Field label="Salesperson">
          <select name="salesperson" defaultValue={vehicle?.salesperson ?? salespeople[0]?.name} className={controlClass}>
            {salespeople.map((person) => (
              <option key={person.id}>{person.name}</option>
            ))}
          </select>
        </Field>
        {sold ? (
          <Field label="Status">
            <input value="Sold" readOnly className={controlClass} />
          </Field>
        ) : (
          <Field label="Status">
            <select name="status" defaultValue={vehicle?.status ?? "Available"} className={controlClass}>
              {OPEN_VEHICLE_STATUSES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
        )}
      </div>
      <div className="flex items-center justify-end gap-3">
        <Link href={cancelHref} className="text-sm text-slate-400 hover:text-white">
          Cancel
        </Link>
        <SubmitButton label={vehicle ? "Save vehicle" : "Add vehicle"} />
      </div>
    </form>
  );
}
