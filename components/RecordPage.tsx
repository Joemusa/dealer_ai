import Link from "next/link";

export function RecordPage({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm text-slate-400 hover:text-white">
        ← Sales floor
      </Link>
      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-400">{lede}</p>
      <div className="mt-6">{children}</div>
    </main>
  );
}
