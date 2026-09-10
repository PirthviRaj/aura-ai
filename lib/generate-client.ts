"use client";

import { getBrandVoice, type LabDraft } from "@/lib/workspace";

export async function generateDraft(
  topic: string,
  template = "SEO Blog Post",
): Promise<{ draft: LabDraft; source: string; words: number; score: number }> {
  const voice = getBrandVoice();
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic,
      template,
      voice: {
        trained: voice.trained,
        traits: voice.traits,
        sample: voice.sample,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Generation failed");
  }

  const data = (await response.json()) as {
    draft: LabDraft;
    source: string;
    words: number;
    score: number;
  };
  return data;
}
