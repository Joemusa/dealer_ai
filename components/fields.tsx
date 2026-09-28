"use client";

import { useFormStatus } from "react-dom";

export const controlClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none ring-amber-400/40 placeholder:text-slate-500 focus:ring-2";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className ?? "block space-y-1.5 text-sm"}>
      <span className="text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
      {error}
    </p>
  );
}

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}
