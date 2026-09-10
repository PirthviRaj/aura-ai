import type { LabDraft } from "@/lib/workspace";

export type VoiceHints = {
  trained: boolean;
  traits: string[];
  sample?: string;
};

function slugWords(topic: string) {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function titleCase(topic: string) {
  return topic
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function applyVoice(body: string, voice?: VoiceHints) {
  if (!voice?.trained || !voice.traits.length) return body;
  const style = voice.traits.slice(0, 2).join(", ").toLowerCase();
  return `${body} Tone note: keep this section ${style}.`;
}

function blogSections(topic: string): LabDraft["sections"] {
  const t = titleCase(topic);
  const words = slugWords(topic);
  const primary = words.slice(0, 4).join(" ") || topic;
  const entity = words[0] ?? "this topic";

  return [
    {
      heading: `What ${t} really means for search in 2026`,
      body: `${t} is not a vanity keyword — it is a job-to-be-done. People searching for “${primary}” want a clear answer, proof, and a next step. This draft is built to rank on Google and get cited by AI assistants by leading with definitions, entities, and actionable structure.`,
    },
    {
      heading: `Search intent and competitor gaps for ${primary}`,
      body: `Top results for ${primary} usually cover definitions and generic tips, but they under-serve comparison language, FAQs, and original examples. Aura’s brief assumes you will outrank them with deeper coverage of ${entity}, clearer H2 architecture, and internal links into a supporting cluster.`,
    },
    {
      heading: `How to execute ${t} step by step`,
      body: `Start with keyword mapping around ${primary}. Build an outline where every H2 answers one intent. Draft 2,000–4,000 words with short paragraphs, concrete examples, and a FAQ block. Add internal links to related guides, then score readability and keyword density before publish.`,
    },
    {
      heading: `Proof, metrics, and publishing checklist`,
      body: `Before you ship content on ${t}, confirm: primary keyword in the H1 and first 100 words, one H2 per sub-intent, FAQ schema, meta under 155 characters, and at least three internal links. Target SEO score 80+, human-likeness above 95%, and a clear CTA that matches the searcher’s next action.`,
    },
    {
      heading: `FAQ: ${t}`,
      body: `Q: What is ${primary}? A: It is the practical process of ${topic.toLowerCase()} in a way search engines and buyers can understand.\nQ: How long should the article be? A: 1,800–6,000 words depending on competition.\nQ: Can AI write this? A: Yes — with brand voice, SEO scoring, and human review before publish.`,
    },
  ];
}

function competitorSections(topic: string): LabDraft["sections"] {
  const t = titleCase(topic);
  return [
    {
      heading: `Page under review: ${t}`,
      body: `This brief scans ranking content related to ${t}. Capture their H1/H2 map, offered proof, CTAs, and which entities they emphasize. Your outrank draft must cover the same intents with more specific examples and cleaner structure.`,
    },
    {
      heading: "Keyword and intent gaps",
      body: `Gaps commonly found against pages about ${t}: thin FAQ coverage, weak comparison sections, no answer-engine summaries, and missing local or niche modifiers. Fill those first — they are the fastest path to visibility.`,
    },
    {
      heading: "Recommended outrank brief",
      body: `Publish a longer article on ${t} with original data or screenshots, a feature/comparison table, FAQ schema, and internal links into your cluster. End with a single CTA that matches commercial intent.`,
    },
  ];
}

function landingSections(topic: string): LabDraft["sections"] {
  const t = titleCase(topic);
  return [
    {
      heading: "Hero",
      body: `${t} — get the outcome without the busywork. One sentence of proof. One primary CTA: Start free.`,
    },
    {
      heading: "Why teams choose this",
      body: `For buyers evaluating ${t}, show three proof points: speed, quality, and measurable SEO lift. Walk through research → draft → score → publish in plain language.`,
    },
    {
      heading: "Close",
      body: `Repeat the offer for ${t}. Remove risk with a free trial. Send the visitor to signup, not a vague demo request.`,
    },
  ];
}

function newsletterSections(topic: string): LabDraft["sections"] {
  const t = titleCase(topic);
  return [
    {
      heading: "Subject line",
      body: `${t}: what changed this week — and what to publish next.`,
    },
    {
      heading: "The point",
      body: `One opinionated take on ${t}. No hype. Link to the long-form piece, give one action, and stop.`,
    },
  ];
}

function youtubeSections(topic: string): LabDraft["sections"] {
  const t = titleCase(topic);
  return [
    {
      heading: "Hook (0–12s)",
      body: `Open on the outcome: how ${t} actually moves rankings — not another tool tour.`,
    },
    {
      heading: "Chapters",
      body: `1) The mistake people make with ${t}. 2) The workflow. 3) Live outline. 4) Score and publish. 5) CTA to try Aura.`,
    },
  ];
}

function comparisonSections(topic: string): LabDraft["sections"] {
  const t = titleCase(topic);
  return [
    {
      heading: "Who this comparison is for",
      body: `Teams evaluating ${t} who need ranking content systems, not another generic writer. Be specific about research, brand voice, SEO score, images, and publishing.`,
    },
    {
      heading: "Feature notes",
      body: `Compare ${t} on: keyword research depth, long-form quality, brand voice, SEO scoring, image generation, and CMS publishing. Avoid empty superlatives — use proof.`,
    },
  ];
}

const builders: Record<string, (topic: string) => LabDraft["sections"]> = {
  "SEO Blog Post": blogSections,
  "Competitor Brief": competitorSections,
  "Product Landing Page": landingSections,
  "Newsletter Issue": newsletterSections,
  "YouTube Script": youtubeSections,
  "Comparison Page": comparisonSections,
};

export function buildDraftLocal(
  topic: string,
  template = "SEO Blog Post",
  voice?: VoiceHints,
): LabDraft {
  const clean = topic.trim() || "AI SEO content strategy";
  const sections = (builders[template] ?? blogSections)(clean).map((section) => ({
    ...section,
    body: applyVoice(section.body, voice),
  }));

  return {
    title: titleCase(clean),
    template,
    sections,
    voiceApplied: Boolean(voice?.trained),
  };
}

/** @deprecated use buildDraftLocal — kept for client imports */
export function buildDraft(topic: string, template = "SEO Blog Post"): LabDraft {
  return buildDraftLocal(topic, template);
}

export function draftToMarkdown(draft: LabDraft) {
  return [
    `# ${draft.title}`,
    "",
    ...draft.sections.flatMap((section) => [
      `## ${section.heading}`,
      "",
      section.body,
      "",
    ]),
  ].join("\n");
}

export function scoreDraft(draft: LabDraft) {
  const words = draft.sections.reduce(
    (sum, s) => sum + s.body.split(/\s+/).length + s.heading.split(/\s+/).length,
    40,
  );
  const score = Math.min(96, 72 + Math.floor(words / 80) + (draft.voiceApplied ? 4 : 0));
  return {
    words,
    score,
    human: draft.voiceApplied ? 99 : 97,
    readability: Math.min(90, 65 + Math.floor(words / 120)),
  };
}
