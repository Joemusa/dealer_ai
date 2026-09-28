"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };

export function AssistantView({
  context,
  seedPrompt,
}: {
  context: unknown;
  seedPrompt?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Ask me about ageing stock, overdue leads, GP, or who to call first. I will only use this dealership's numbers.",
    },
  ]);
  const [prompt, setPrompt] = useState(seedPrompt ?? "");
  const [loading, setLoading] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (seedPrompt) setPrompt(seedPrompt);
  }, [seedPrompt]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text = prompt) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setPrompt("");
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, context }),
      });
      const data = await response.json();
      const reply = data.text || data.error || "No response generated.";
      setMessages((current) => [...current, { role: "assistant", text: reply }]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", text: "Could not reach the assistant. Check OPENAI_API_KEY on Vercel." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col rounded-2xl border border-slate-800 bg-slate-900/60">
      <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
        <Sparkles className="h-4 w-4 text-amber-300" />
        <div>
          <h2 className="text-base font-semibold">DealerAI assistant</h2>
          <p className="text-xs text-slate-400">Answers only from current stock, leads and sales</p>
        </div>
      </div>
      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "user"
                ? "ml-10 rounded-2xl bg-amber-400/15 px-4 py-3 text-sm text-amber-50"
                : "mr-10 whitespace-pre-wrap rounded-2xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200"
            }
          >
            {message.text}
          </div>
        ))}
        {loading ? <p className="text-sm text-slate-500">Reading the floor data…</p> : null}
      </div>
      <form
        className="flex gap-2 border-t border-slate-800 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="e.g. Who should we call first this morning?"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none ring-amber-400/40 placeholder:text-slate-500 focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
        >
          Send <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
