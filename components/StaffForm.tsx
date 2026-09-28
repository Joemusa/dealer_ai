"use client";

import { useFormState } from "react-dom";
import { controlClass, Field, FormError, SubmitButton } from "@/components/fields";
import type { FormState } from "@/lib/db/mutations";

export function StaffForm({
  action,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <FormError error={state.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" className="block space-y-1.5 text-sm sm:col-span-2">
          <input name="name" required className={controlClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" required className={controlClass} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={controlClass} />
        </Field>
      </div>
      <div className="flex justify-end">
        <SubmitButton label="Add salesperson" />
      </div>
    </form>
  );
}
