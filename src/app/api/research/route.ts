import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.TINYFISH_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TinyFish is not configured. Add TINYFISH_API_KEY on your server to enable research." },
      { status: 503 },
    );
  }

  let body: { query?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query || query.length > 500) {
    return NextResponse.json({ error: "Enter a research query (maximum 500 characters)." }, { status: 400 });
  }

  // TinyFish provider endpoints evolve independently from this app. Keep the
  // integration server-only and avoid silently guessing API contracts here.
  return NextResponse.json({
    configured: true,
    message: "TinyFish credentials are configured. Connect your account's current Search API endpoint and response schema here.",
    query,
  }, { status: 200 });
}
