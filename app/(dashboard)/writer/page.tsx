"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoicePlayer } from "@/components/voice/voice-player";
import { generateDraft } from "@/lib/generate-client";
import { addDocument, getBrandVoice, saveDraft, type LabDraft } from "@/lib/workspace";
import { uid } from "@/lib/id";
import { toast } from "sonner";

export default function WriterPage() {
  const router = useRouter();
  const [topic, setTopic] = useState(
    "Generate high ranking SEO content on autopilot",
  );
  const [draft, setDraft] = useState<LabDraft | null>(null);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const voice = useMemo(() => getBrandVoice(), [draft]);

  async function generate() {
    const clean = topic.trim();
    if (!clean) {
      toast.error("Enter a topic first.");
      return;
    }
    setBusy(true);
    try {
      const result = await generateDraft(clean, "SEO Blog Post");
      setDraft(result.draft);
      setSource(result.source);
      saveDraft(result.draft);
      toast.success(
        result.source === "gpt-4o"
          ? "Article drafted with GPT-4o"
          : "Article drafted by Aura engine",
      );
    } catch {
      toast.error("Could not generate. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!draft) return;
    const document = {
      id: uid(),
      title: draft.title,
      status: "Draft" as const,
      words: draft.sections.reduce(
        (sum, section) => sum + section.body.split(" ").length,
        80,
      ),
      updatedAt: new Date().toISOString(),
      template: "SEO Blog Post",
    };
    addDocument("generated", document);
    saveDraft({ ...draft, collectionId: "generated", documentId: document.id });
    toast.success("Saved to Collections");
    router.push("/collections/generated");
  }

  const spoken = draft
    ? `${draft.title}. ${draft.sections.map((s) => `${s.heading}. ${s.body}`).join(" ")}`
    : topic;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">AI Blog Writer</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter any topic. Aura returns a full SEO draft you can hear, edit, and
          save.
        </p>
      </div>
      <Card>
        <CardContent className="space-y-3 p-5">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What should Aura write?"
            onKeyDown={(e) => e.key === "Enter" && void generate()}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void generate()} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {busy ? "Writing…" : "Generate article"}
            </Button>
            {draft ? (
              <Button variant="secondary" onClick={save}>
                Save to collections
              </Button>
            ) : null}
            {draft ? (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `/editor?topic=${encodeURIComponent(draft.title)}&template=SEO%20Blog%20Post`,
                  )
                }
              >
                Open in editor
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {draft ? (
        <Card className="border-glow">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap gap-2">
              <Badge>SEO Blog Post</Badge>
              <Badge variant="secondary">{source || "aura-engine"}</Badge>
              {voice.trained ? <Badge variant="success">Voice applied</Badge> : null}
            </div>
            <h2 className="text-2xl font-semibold text-white">{draft.title}</h2>
            <VoicePlayer
              text={spoken}
              speaker={voice.speaker}
              label="Hear this article"
            />
            {draft.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="text-lg font-medium text-white">{section.heading}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-400">
                  {section.body}
                </p>
              </section>
            ))}
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-zinc-500">
          Press Generate article — output is built from your exact topic.
        </p>
      )}
    </div>
  );
}
