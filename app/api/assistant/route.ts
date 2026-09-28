import { NextRequest, NextResponse } from "next/server";

function openAiKey() {
  const named = process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY;
  if (named) return named;
  const legacy = process.env.GEMINI_API_KEY;
  if (legacy?.startsWith("sk-")) return legacy;
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();
    const apiKey = openAiKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured. Add your ChatGPT key in Vercel as OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
    }

    const systemInstruction = `You are DealerAI, an AI sales intelligence assistant for an independent used-car dealership in South Africa.
Answer questions using ONLY the structured dealership data provided in the context.
Do not invent vehicles, leads, sales, prices, customers or statistics.
When making a recommendation, explain the specific underlying numbers.
Clearly distinguish calculated facts from recommendations.
Currency is South African Rand (R).`;

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemInstruction },
          {
            role: "user",
            content: `Dealership Data Context:\n${JSON.stringify(context, null, 2)}\n\nUser Question: ${prompt}`,
          },
        ],
      }),
    });

    if (!apiRes.ok) {
      const body = await apiRes.json().catch(() => null);
      const message = body?.error?.message || "Upstream OpenAI API error";
      return NextResponse.json({ error: message }, { status: apiRes.status });
    }

    const data = await apiRes.json();
    const replyText = data?.choices?.[0]?.message?.content || "No response generated.";

    return NextResponse.json({ text: replyText });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
