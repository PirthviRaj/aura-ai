"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { templates } from "@/lib/mock-data";
import { generateDraft } from "@/lib/generate-client";
import { addDocument, saveDraft } from "@/lib/workspace";
import { uid } from "@/lib/id";
import { toast } from "sonner";

export default function TemplatesPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function generate(title: string) {
    const topic = (topics[title] || title).trim();
    if (!topic) {
      toast.error("Enter a topic for this template.");
      return;
    }
    setBusy(title);
    try {
      const result = await generateDraft(topic, title);
      const document = {
        id: uid(),
        title: result.draft.title,
        status: "Draft" as const,
        words: result.words,
        updatedAt: new Date().toISOString(),
        template: title,
      };
      addDocument("generated", document);
      saveDraft({
        ...result.draft,
        collectionId: "generated",
        documentId: document.id,
      });
      toast.success(`${title} ready (${result.source})`);
      router.push(
        `/editor?topic=${encodeURIComponent(result.draft.title)}&template=${encodeURIComponent(title)}`,
      );
    } catch {
      toast.error("Template generation failed. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Templates</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Enter a topic on any card. Aura drafts real copy, saves it, and opens the
        editor.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.title} className="border-glow">
            <CardContent className="space-y-4 p-5">
              <Badge variant="secondary">{template.category}</Badge>
              <div>
                <h2 className="text-lg font-medium text-white">{template.title}</h2>
                <p className="mt-2 text-sm text-zinc-400">{template.description}</p>
                <p className="mt-2 text-xs text-zinc-500">{template.words} words</p>
              </div>
              <Input
                placeholder={`Topic for ${template.title}`}
                value={topics[template.title] ?? ""}
                onChange={(e) =>
                  setTopics((current) => ({
                    ...current,
                    [template.title]: e.target.value,
                  }))
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && void generate(template.title)
                }
              />
              <Button
                className="w-full"
                disabled={busy === template.title}
                onClick={() => void generate(template.title)}
              >
                {busy === template.title ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {busy === template.title ? "Drafting…" : "Generate draft"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
