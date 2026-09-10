import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  makeArtDataUrl,
  pollinationsUrl,
  promptSeed,
} from "@/lib/image-art";

export const runtime = "nodejs";
export const maxDuration = 60;

async function tryOpenAI(prompt: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const openai = new OpenAI({ apiKey: key });
  const result = await openai.images.generate({
    model: "dall-e-3",
    prompt: `${prompt.trim()}. Photoreal or polished digital art matching the subject exactly. No watermark.`,
    size: "1792x1024",
    quality: "standard",
    n: 1,
  });

  const remote = result.data?.[0]?.url;
  if (!remote) return null;

  const response = await fetch(remote, { cache: "no-store" });
  if (!response.ok) return null;
  const mime = response.headers.get("content-type") || "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength < 1000) return null;

  return {
    url: `data:${mime};base64,${buffer.toString("base64")}`,
    source: "dall-e-3" as const,
  };
}

async function tryPollinations(prompt: string) {
  const seed = promptSeed(prompt) ^ (Date.now() % 100000);
  const remote = pollinationsUrl(prompt, seed);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55000);
  try {
    const response = await fetch(remote, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "image/*" },
    });
    if (!response.ok) {
      // Still return the live URL — browser can finish loading the model image.
      return { url: remote, source: "pollinations" as const, proxied: false };
    }

    const mime = response.headers.get("content-type") || "image/jpeg";
    if (!mime.startsWith("image/")) {
      return { url: remote, source: "pollinations" as const, proxied: false };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength < 800) {
      return { url: remote, source: "pollinations" as const, proxied: false };
    }

    return {
      url: `data:${mime};base64,${buffer.toString("base64")}`,
      source: "pollinations" as const,
      proxied: true,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  const { prompt } = (await request.json()) as { prompt?: string };
  const text = (prompt || "").trim();
  if (!text) {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  try {
    const openaiImage = await tryOpenAI(text);
    if (openaiImage) {
      return NextResponse.json(openaiImage);
    }
  } catch {
    // Fall through to Pollinations.
  }

  try {
    const live = await tryPollinations(text);
    return NextResponse.json(live);
  } catch {
    // Offline / network failure — prompt-aware studio frame.
    return NextResponse.json({
      url: makeArtDataUrl(text),
      source: "studio",
    });
  }
}
