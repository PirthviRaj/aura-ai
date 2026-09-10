"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  AudioLines,
  ImageIcon,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SeoGauge } from "@/components/shared/seo-gauge";

type LabId = "writer" | "competitor" | "voice" | "images" | "workflows";

const cards: {
  id: LabId;
  title: string;
  copy: string;
  icon: typeof Sparkles;
  action: string;
}[] = [
  {
    id: "writer",
    title: "AI Blog Writer",
    copy: "Generate SEO-optimized long-form articles up to 6,000 words with outlines, FAQs, and schema.",
    icon: Sparkles,
    action: "Write a draft",
  },
  {
    id: "competitor",
    title: "Competitor intelligence",
    copy: "Aura scans ranking pages, extracts keyword gaps, and builds a brief you can actually publish.",
    icon: Search,
    action: "Scan a URL",
  },
  {
    id: "voice",
    title: "Brand Voice",
    copy: "Establish voice traits once. Downstream drafts inherit the approved brand tone.",
    icon: AudioLines,
    action: "Train voice",
  },
  {
    id: "images",
    title: "AI Images",
    copy: "Create original hero and in-article visuals in seconds, matched to the topic cluster.",
    icon: ImageIcon,
    action: "Generate image",
  },
  {
    id: "workflows",
    title: "Autopilot workflows",
    copy: "Research, write, score, and queue publishing without jumping between five tools.",
    icon: Workflow,
    action: "Run pipeline",
  },
];

export function Laboratory() {
  const [active, setActive] = useState<LabId>("writer");

  return (
    <section id="features" className="relative mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">
          Product modules
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          A complete SEO content operating system
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Core surfaces from the commercial brief — select a module to preview
          the workflow in place.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const selected = active === card.id;
          return (
            <motion.button
              key={card.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActive(card.id)}
              className={`lab-panel group h-full p-5 text-left transition-all ${
                selected
                  ? "border-glow ring-1 ring-primary/40"
                  : "hover:-translate-y-1 hover:shadow-glow"
              } ${card.id === "workflows" ? "lg:col-span-2" : ""}`}
            >
              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    {selected ? "Active" : card.action}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                <h3 className="font-medium text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {card.copy}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-5">
        <LabConsole id={active} />
      </div>
    </section>
  );
}

function LabConsole({ id }: { id: LabId }) {
  return (
    <div className="lab-panel border-glow p-5 md:p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {id === "writer" ? <WriterLab /> : null}
          {id === "competitor" ? <CompetitorLab /> : null}
          {id === "voice" ? <VoiceLab /> : null}
          {id === "images" ? <ImageLab /> : null}
          {id === "workflows" ? <WorkflowLab /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function WriterLab() {
  const [topic, setTopic] = useState("AI SEO writer that ranks on Google");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);
  const [score, setScore] = useState(12);

  async function run() {
    setRunning(true);
    setResult(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, template: "SEO Blog Post" }),
      });
      const data = (await response.json()) as {
        draft?: { title: string; sections: { heading: string }[] };
        score?: number;
      };
      setResult([
        `H1: ${data.draft?.title ?? topic}`,
        ...(data.draft?.sections.map((s) => `H2: ${s.heading}`) ?? []),
      ]);
      setScore(data.score ?? 85);
    } catch {
      setResult([`H1: ${topic}`, "Generation failed — try again"]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-sm font-medium text-white">AI Blog Writer</p>
        <p className="mt-1 text-xs text-zinc-500">
          Enter a keyword. Aura builds a ranking outline from that topic.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic or keyword"
          />
          <Button onClick={() => void run()} disabled={running || !topic.trim()}>
            {running ? "Writing…" : "Generate outline"}
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {result?.map((line) => (
            <div
              key={line}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200"
            >
              {line}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <SeoGauge value={score} size={140} />
        <p className="mt-2 text-xs text-zinc-500">
          {result ? "Draft ready for the editor" : "Awaiting generation"}
        </p>
      </div>
    </div>
  );
}

function CompetitorLab() {
  const [url, setUrl] = useState("https://competitor.com/ai-seo-writer");
  const [gaps, setGaps] = useState<string[] | null>(null);
  const [running, setRunning] = useState(false);

  function scan() {
    setRunning(true);
    const host = (() => {
      try {
        return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
      } catch {
        return url;
      }
    })();
    window.setTimeout(() => {
      setGaps([
        `Missing FAQ schema for pages on ${host}`,
        `Weak comparison coverage vs alternatives to ${host}`,
        `Thin AI-search citation blocks for queries about ${host}`,
        `Opportunity: build a cluster that outranks ${host} on intent pages`,
      ]);
      setRunning(false);
    }, 600);
  }

  return (
    <div>
      <p className="text-sm font-medium text-white">Competitor intelligence</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button onClick={scan} disabled={running || !url.trim()}>
          {running ? "Scanning…" : "Analyse page"}
        </Button>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {gaps?.map((gap) => (
          <div
            key={gap}
            className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-3 text-sm text-zinc-200"
          >
            {gap}
          </div>
        ))}
      </div>
    </div>
  );
}

function VoiceLab() {
  const [sample, setSample] = useState(
    "We write like a senior strategist: precise, calm, and allergic to hype.",
  );
  const [trained, setTrained] = useState(false);

  return (
    <div>
      <p className="text-sm font-medium text-white">Brand Voice</p>
      <Textarea
        className="mt-4 min-h-[120px]"
        value={sample}
        onChange={(e) => {
          setSample(e.target.value);
          setTrained(false);
        }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => setTrained(true)}
          disabled={sample.trim().length < 20}
        >
          Train on this sample
        </Button>
        {trained ? (
          <Badge variant="success">Voice model updated · 3 traits learned</Badge>
        ) : null}
      </div>
      {trained ? (
        <p className="mt-4 text-sm text-zinc-400">
          Detected tone: precise, calm, proof-first. Future drafts will avoid
          exclamation marks and keep sentences short.
        </p>
      ) : null}
    </div>
  );
}

function ImageLab() {
  const [prompt, setPrompt] = useState(
    "Glass laboratory orb over a dark ember grid",
  );
  const [url, setUrl] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function generate() {
    setRunning(true);
    try {
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = (await response.json()) as { url?: string };
      setUrl(data.url ?? null);
    } catch {
      setUrl(null);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <p className="text-sm font-medium text-white">AI Images</p>
        <Input
          className="mt-4"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setUrl(null);
          }}
        />
        <Button
          className="mt-3"
          onClick={() => void generate()}
          disabled={running || !prompt.trim()}
        >
          {running ? "Rendering…" : "Create original image"}
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={prompt} className="aspect-video w-full object-cover" />
        ) : (
          <div className="flex aspect-video items-end bg-gradient-to-br from-primary/20 to-[#110816] p-4">
            <p className="text-sm text-zinc-200">Preview appears after generate</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowLab() {
  const steps = ["Research", "Outline", "Draft", "SEO score", "Queue publish"];
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  function run() {
    setRunning(true);
    setStep(0);
    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      setStep(current);
      if (current >= steps.length) {
        window.clearInterval(timer);
        setRunning(false);
      }
    }, 450);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Autopilot workflows</p>
          <p className="text-xs text-zinc-500">
            Run the full publish pipeline in the lab.
          </p>
        </div>
        <Button onClick={run} disabled={running}>
          {running ? "Pipeline running…" : "Start autopilot"}
        </Button>
      </div>
      <Progress value={(step / steps.length) * 100} className="mt-5" />
      <div className="mt-4 flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`rounded-full border px-3 py-1 text-xs ${
              index < step
                ? "border-primary/40 bg-primary/15 text-orange-100"
                : "border-white/10 text-zinc-500"
            }`}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>
    </div>
  );
}
