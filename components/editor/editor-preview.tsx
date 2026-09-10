"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SeoGauge } from "@/components/shared/seo-gauge";
import { seoKeywords } from "@/lib/mock-data";
import { VoicePlayer } from "@/components/voice/voice-player";
import { generateDraft } from "@/lib/generate-client";
import {
  addDocument,
  getBrandVoice,
  getCollections,
  getDraft,
  saveDraft,
  type LabDraft,
} from "@/lib/workspace";
import { uid } from "@/lib/id";
import { toast } from "sonner";

export function EditorPreview() {
  const params = useSearchParams();
  const topic =
    params.get("topic") ??
    "How to Generate High-Ranking Content That Drives Organic Traffic";
  const template = params.get("template") ?? "SEO Blog Post";
  const [draft, setDraft] = useState<LabDraft | null>(null);
  const [score, setScore] = useState(85);
  const [words, setWords] = useState(0);
  const [human, setHuman] = useState(97);
  const [busy, setBusy] = useState(false);
  const voice = useMemo(() => getBrandVoice(), [draft]);

  useEffect(() => {
    const stored = getDraft();
    if (stored && stored.title === topic) {
      setDraft(stored);
      setWords(
        stored.sections.reduce(
          (sum, s) => sum + s.body.split(/\s+/).length,
          40,
        ),
      );
      return;
    }

    let cancelled = false;
    setBusy(true);
    void generateDraft(topic, template)
      .then((result) => {
        if (cancelled) return;
        setDraft(result.draft);
        setScore(result.score);
        setWords(result.words);
        setHuman(result.draft.voiceApplied ? 99 : 97);
        saveDraft(result.draft);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load draft");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [template, topic]);

  function saveToLibrary() {
    if (!draft) return;
    const collections = getCollections();
    const target = collections[0];
    if (!target) {
      toast.error("Create a collection first.");
      return;
    }
    addDocument(target.id, {
      id: uid(),
      title: draft.title,
      status: "Draft",
      words,
      updatedAt: new Date().toISOString(),
      template: draft.template,
    });
    toast.success(`Saved to ${target.name}`);
  }

  if (busy && !draft) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Writing your draft for “{topic}”…
      </div>
    );
  }

  if (!draft) {
    return <p className="text-sm text-zinc-500">No draft yet.</p>;
  }

  const spoken = `${draft.title}. ${draft.sections.map((s) => `${s.heading}. ${s.body}`).join(" ")}`;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="min-h-[70vh]">
        <CardContent className="relative space-y-6 p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Draft</Badge>
            <Badge variant="secondary">{draft.template}</Badge>
            <Badge variant="success">{human}% Human Content</Badge>
            <Badge variant="secondary">{words} words</Badge>
            {voice.trained ? (
              <Badge>Brand voice applied</Badge>
            ) : (
              <Badge variant="secondary">Voice not trained</Badge>
            )}
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
            {draft.title}
          </h1>
          <VoicePlayer
            text={spoken}
            speaker={voice.speaker}
            label="Hear this draft"
          />
          <Separator />
          <article className="space-y-5 text-[15px] leading-7 text-zinc-300">
            {draft.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-2 text-xl font-semibold text-white">
                  {section.heading}
                </h2>
                <p className="whitespace-pre-wrap">{section.body}</p>
              </section>
            ))}
          </article>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveToLibrary}>Save to collections</Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void generateDraft(topic, template)
                  .then((result) => {
                    setDraft(result.draft);
                    setScore(result.score);
                    setWords(result.words);
                    saveDraft(result.draft);
                    toast.success("Draft regenerated");
                  })
                  .finally(() => setBusy(false));
              }}
            >
              Regenerate
            </Button>
          </div>
        </CardContent>
      </Card>

      <aside className="space-y-4 xl:sticky xl:top-24">
        <Card className="border-glow">
          <CardContent className="flex flex-col items-center p-6">
            <SeoGauge value={score} size={150} />
            <p className="mt-2 text-sm text-zinc-400">
              Live SEO score for this draft
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <div className="mb-2 flex justify-between text-xs text-zinc-400">
                <span>Readability</span>
                <span>{Math.min(90, 65 + Math.floor(words / 120))}</span>
              </div>
              <Progress value={Math.min(90, 65 + Math.floor(words / 120))} />
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-zinc-500">
                Keyword density
              </p>
              <div className="space-y-3">
                {seoKeywords.map((keyword) => (
                  <div key={keyword.term}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-zinc-300">{keyword.term}</span>
                      <span className="text-zinc-500">{keyword.density}%</span>
                    </div>
                    <Progress value={keyword.density * 40} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
