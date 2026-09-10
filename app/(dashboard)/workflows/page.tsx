"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { workflows } from "@/lib/mock-data";
import { generateDraft } from "@/lib/generate-client";
import { addDocument, saveDraft } from "@/lib/workspace";
import { uid } from "@/lib/id";
import { toast } from "sonner";

export default function WorkflowsPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("AI SEO content that ranks");
  const [active, setActive] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  async function run(name: string, steps: string[]) {
    if (!topic.trim()) {
      toast.error("Enter a topic for the workflow.");
      return;
    }
    setActive(name);
    setBusy(true);
    setStep(0);

    for (let i = 0; i < steps.length; i += 1) {
      setStep(i + 1);
      await new Promise((r) => setTimeout(r, 350));
    }

    try {
      const result = await generateDraft(topic.trim(), "SEO Blog Post");
      const document = {
        id: uid(),
        title: result.draft.title,
        status: "Draft" as const,
        words: result.words,
        updatedAt: new Date().toISOString(),
        template: "SEO Blog Post",
      };
      addDocument("generated", document);
      saveDraft({
        ...result.draft,
        collectionId: "generated",
        documentId: document.id,
      });
      toast.success(`${name} finished — draft ready`);
      router.push(
        `/editor?topic=${encodeURIComponent(result.draft.title)}&template=SEO%20Blog%20Post`,
      );
    } catch {
      toast.error("Workflow failed. Try again.");
    } finally {
      setBusy(false);
      setActive(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Workflows</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Run an autopilot pipeline from keyword to drafted article.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic for the pipeline"
        />
      </div>
      <div className="mt-6 space-y-4">
        {workflows.map((workflow) => {
          const running = busy && active === workflow.name;
          return (
            <Card key={workflow.name}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-medium text-white">{workflow.name}</h2>
                  <div className="flex items-center gap-2">
                    <Badge>{workflow.cadence}</Badge>
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => void run(workflow.name, workflow.steps)}
                    >
                      {running ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {running ? "Running…" : "Start"}
                    </Button>
                  </div>
                </div>
                {running ? (
                  <Progress
                    value={(step / workflow.steps.length) * 100}
                    className="mt-4"
                  />
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {workflow.steps.map((label, index) => (
                    <span
                      key={label}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        running && index < step
                          ? "border-primary/40 bg-primary/15 text-orange-100"
                          : "border-white/10 bg-white/5 text-zinc-300"
                      }`}
                    >
                      {index + 1}. {label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
