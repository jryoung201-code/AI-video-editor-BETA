export type VideoRequest = {
  prompt: string;
  style: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
  duration: number;
};

export type VideoJob = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  prompt: string;
  createdAt: string;
  previewUrl?: string;
  message: string;
};

/**
 * Provider boundary. The default adapter deliberately creates a storyboard job,
 * not a fake rendered video. Plug a real text-to-video API into this function
 * and return its job ID/status/output URL.
 */
export async function createVideoJob(input: VideoRequest): Promise<VideoJob> {
  const provider = process.env.VIDEO_PROVIDER ?? "mock";

  if (provider !== "mock") {
    throw new Error(
      `VIDEO_PROVIDER="${provider}" has no adapter yet. Implement the provider's create/status/download methods in src/lib/video-provider.ts before enabling rendering.`,
    );
  }

  return {
    id: crypto.randomUUID(),
    status: "queued",
    prompt: input.prompt,
    createdAt: new Date().toISOString(),
    message:
      "Storyboard job created. Add a text-to-video provider API key and adapter to render an actual MP4.",
  };
}
