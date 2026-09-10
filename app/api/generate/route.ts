import { NextResponse } from "next/server";
import {
  buildDraftLocal,
  draftToMarkdown,
  scoreDraft,
  type VoiceHints,
} from "@/lib/content";
import type { LabDraft } from "@/lib/workspace";

export const runtime = "nodejs";

type GenerateBody = {
  topic?: string;
  template?: string;
  voice?: VoiceHints;
};

async function generateWithOpenAI(
  topic: string,
  template: string,
  voice?: VoiceHints,
): Promise<LabDraft | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey });
    const voiceNote = voice?.trained
      ? `Write in this brand voice: ${voice.traits.join(", ")}. Sample: ${voice.sample?.slice(0, 300) ?? ""}`
      : "Write in a clear, senior strategist tone.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.55,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are Aura AI, an SEO content engine. Return JSON only: {"title": string, "sections": [{"heading": string, "body": string}]}. Template type: ${template}. ${voiceNote} Produce useful, specific copy about the user's topic — never a generic placeholder.`,
        },
        {
          role: "user",
          content: `Create a ${template} draft about: ${topic}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      title?: string;
      sections?: { heading: string; body: string }[];
    };
    if (!parsed.sections?.length) return null;

    return {
      title: parsed.title || topic,
      template,
      sections: parsed.sections,
      voiceApplied: Boolean(voice?.trained),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as GenerateBody;
  const topic = (body.topic || "AI SEO content strategy").trim();
  const template = body.template || "SEO Blog Post";
  const voice = body.voice;

  const live = await generateWithOpenAI(topic, template, voice);
  const draft = live ?? buildDraftLocal(topic, template, voice);
  const metrics = scoreDraft(draft);

  return NextResponse.json({
    draft,
    markdown: draftToMarkdown(draft),
    ...metrics,
    source: live ? "gpt-4o" : "aura-engine",
  });
}
