import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not configured.' },
        { status: 500 }
      );
    }

    const systemInstruction = `You are DealerAI, an AI sales intelligence assistant for an independent used-car dealership in South Africa.
Answer questions using ONLY the structured dealership data provided in the context.
Do not invent vehicles, leads, sales, prices, customers or statistics.
When making a recommendation, explain the specific underlying numbers.
Clearly distinguish calculated facts from recommendations.
Currency is South African Rand (R).`;

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [
        {
          parts: [
            { text: `Dealership Data Context:\n${JSON.stringify(context, null, 2)}\n\nUser Question: ${prompt}` }
          ]
        }
      ]
    };

    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!apiRes.ok) {
      const body = await apiRes.json().catch(() => null);
      const message = body?.error?.message || "Upstream Gemini API error";
      return NextResponse.json({ error: message }, { status: apiRes.status });
    }

    const data = await apiRes.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const replyText =
      parts
        .filter((part: { text?: string; thought?: boolean }) => part.text && !part.thought)
        .map((part: { text?: string }) => part.text)
        .join("\n") || "No response generated.";

    return NextResponse.json({ text: replyText });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
