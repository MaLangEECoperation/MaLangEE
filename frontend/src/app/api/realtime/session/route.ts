import { NextResponse } from "next/server";

const DEFAULT_MODEL = "gpt-4o-realtime-preview";
const DEFAULT_VOICE = "alloy";

export async function POST(request: Request) {
  const apiKey = process.env.OPEN_AI_API ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OpenAI API key. Set OPEN_AI_API or OPENAI_API_KEY." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const model = body?.model ?? DEFAULT_MODEL;
  const voice = body?.voice ?? DEFAULT_VOICE;

  const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      modalities: ["audio", "text"],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json(
      { error: "Failed to create realtime session.", details: error },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
