import { NextResponse } from "next/server";
import { createVideoJob, type VideoRequest } from "@/lib/video-provider";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Partial<VideoRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "Describe the video you want to create." }, { status: 400 });
  }
  if (prompt.length > 4000) {
    return NextResponse.json({ error: "Prompt must be 4,000 characters or fewer." }, { status: 400 });
  }

  const style = typeof body.style === "string" ? body.style.slice(0, 80) : "Cinematic";
  const aspectRatio = ["16:9", "9:16", "1:1"].includes(String(body.aspectRatio))
    ? (body.aspectRatio as VideoRequest["aspectRatio"])
    : "16:9";
  const duration = Math.min(60, Math.max(5, Number.isFinite(body.duration) ? Number(body.duration) : 10));

  try {
    const job = await createVideoJob({ prompt, style, aspectRatio, duration });
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Video job could not be created.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
