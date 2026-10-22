import { NextResponse } from "next/server";

export const runtime = "nodejs";

type TinyFishSearchResult = {
  title?: string;
  url?: string;
  snippet?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.TINYFISH_API_KEY;
  const apiUrl = process.env.TINYFISH_SEARCH_API_URL;

  if (!apiKey || !apiUrl) {
    return NextResponse.json(
      { error: "Configure TINYFISH_API_KEY and TINYFISH_SEARCH_API_URL on the server to enable research." },
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

  let endpoint: URL;
  try {
    endpoint = new URL(apiUrl);
    if (endpoint.protocol !== "https:" && endpoint.hostname !== "localhost") {
      return NextResponse.json({ error: "Research API URL must use HTTPS." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "TINYFISH_SEARCH_API_URL is not a valid URL." }, { status: 500 });
  }

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const raw = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `TinyFish research request failed (HTTP ${upstream.status}). Check the configured endpoint and credentials.` },
        { status: 502 },
      );
    }

    let data: unknown;
    try { data = JSON.parse(raw); } catch { data = { text: raw }; }
    const record = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
    const list = Array.isArray(record.results) ? record.results : Array.isArray(record.organic_results) ? record.organic_results : [];
    const results: TinyFishSearchResult[] = list.slice(0, 10).map((item) => {
      const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return {
        title: typeof row.title === "string" ? row.title : undefined,
        url: typeof row.url === "string" ? row.url : typeof row.link === "string" ? row.link : undefined,
        snippet: typeof row.snippet === "string" ? row.snippet : typeof row.description === "string" ? row.description : undefined,
      };
    });

    return NextResponse.json({ query, results, raw: results.length ? undefined : data });
  } catch {
    return NextResponse.json({ error: "Could not reach the configured TinyFish endpoint." }, { status: 502 });
  }
}
