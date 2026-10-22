import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Shot = { index: number; durationSeconds: number; title: string; visual: string; camera: string; audio: string };

function sentenceParts(value: string): string[] {
  return value.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
}

export async function POST(request: Request) {
  let body: { prompt?: unknown; duration?: unknown; style?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) return NextResponse.json({ error: "Enter a video prompt first." }, { status: 400 });
  if (prompt.length > 4000) return NextResponse.json({ error: "Prompt must be 4,000 characters or fewer." }, { status: 400 });

  const duration = Math.min(60, Math.max(5, Number.isFinite(body.duration) ? Number(body.duration) : 10));
  const style = typeof body.style === "string" ? body.style.slice(0, 80) : "Cinematic";
  const seeds = sentenceParts(prompt);
  const count = Math.max(3, Math.min(6, Math.ceil(duration / 5)));
  const phases = ["Opening shot", "Establishing scene", "Main action", "Detail moment", "Climactic beat", "Closing shot"];
  const shots: Shot[] = Array.from({ length: count }, (_, index) => ({
    index: index + 1,
    durationSeconds: Math.floor(duration / count) + (index < duration % count ? 1 : 0),
    title: phases[index] ?? `Shot ${index + 1}`,
    visual: index === 0
      ? `Introduce the scene: ${prompt}`
      : index === count - 1
        ? `End on a memorable final frame that completes the idea: ${prompt}`
        : `${seeds[index % Math.max(1, seeds.length)] ?? prompt} Maintain visual continuity and a clear focal subject.`,
    camera: ["Slow push-in, deliberate composition", "Wide establishing movement", "Smooth tracking shot", "Close-up with gentle parallax", "Dynamic reveal, controlled motion", "Slow pull-back into final frame"][index] ?? "Steady cinematic movement",
    audio: style === "Documentary" ? "Natural ambience with a restrained, informative music bed" : "Sound design matched to the scene with a subtle cinematic music bed",
  }));

  return NextResponse.json({
    prompt,
    style,
    durationSeconds: duration,
    shots,
    note: "This storyboard is generated heuristically in the starter app. Connect a language model to create richer story beats and a video model to render the shots.",
  });
}
