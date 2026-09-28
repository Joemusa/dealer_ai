export function SetupMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">DealerAI</p>
      <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
    </main>
  );
}
