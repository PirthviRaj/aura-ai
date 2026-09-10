"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { addImage, getImages, type LabImage } from "@/lib/workspace";
import { uid } from "@/lib/id";
import { toast } from "sonner";

const prompts = [
  "Best CRM dashboard for small businesses, clean UI mockup",
  "Glass analytics dashboard floating in a dark void",
  "SEO keyword research constellation map on a night sky",
  "Editorial photo of a content strategist at a modern desk",
  "Cinematic ember AI energy orb in a laboratory",
];

export default function ImagesPage() {
  const [prompt, setPrompt] = useState(prompts[0]);
  const [images, setImages] = useState<LabImage[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setImages(getImages());
  }, []);

  async function generate(nextPrompt = prompt) {
    const text = nextPrompt.trim();
    if (!text) {
      toast.error("Describe the image first.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = (await response.json()) as {
        url?: string;
        source?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Image generation failed");
      }

      const item: LabImage = {
        id: uid(),
        prompt: text,
        url: data.url,
        createdAt: new Date().toISOString(),
      };
      setImages(addImage(item));
      toast.success(
        data.source === "dall-e-3"
          ? "Generated with DALL·E 3"
          : data.source === "pollinations"
            ? "Generated from your prompt"
            : "Studio frame from your prompt",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not generate image",
      );
    } finally {
      setBusy(false);
    }
  }

  function downloadName(promptText: string, url: string) {
    const safe = promptText.slice(0, 32).replace(/[^\w\-]+/g, "_") || "aura";
    if (url.startsWith("data:image/svg")) return `${safe}.svg`;
    if (url.includes("image/png")) return `${safe}.png`;
    return `${safe}.jpg`;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">AI Image</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Each prompt generates a matching visual. First generation can take up to
        a minute while the model renders.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe exactly what you want to see"
          onKeyDown={(e) => e.key === "Enter" && void generate()}
        />
        <Button onClick={() => void generate()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Generating…" : "Generate"}
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {prompts.map((item) => (
          <button
            key={item}
            type="button"
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400 hover:border-primary/40 hover:text-white"
            onClick={() => {
              setPrompt(item);
              void generate(item);
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {images.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">
          No images yet. Press Generate to create the first one.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {images.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-3">
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0c0b12]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="aspect-video w-full object-cover"
                  />
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <p className="text-sm text-zinc-200">{image.prompt}</p>
                  <a
                    href={image.url}
                    download={downloadName(image.prompt, image.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="icon" variant="secondary">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {busy ? (
        <div className="mt-4">
          <Badge variant="secondary">Rendering your prompt…</Badge>
        </div>
      ) : null}
    </div>
  );
}
