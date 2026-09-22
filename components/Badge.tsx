import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  rose: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  amber: "bg-amber-400/15 text-amber-200 ring-amber-400/30",
  sky: "bg-sky-400/15 text-sky-200 ring-sky-400/30",
  slate: "bg-slate-700/60 text-slate-200 ring-slate-500/30",
  emerald: "bg-emerald-400/15 text-emerald-200 ring-emerald-400/30",
};

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: React.ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1",
        tones[tone] ?? tones.slate,
        className
      )}
    >
      {children}
    </span>
  );
}
