import { uid } from "@/lib/id";
import type { SpeakerId } from "@/lib/speech";

export type BrandVoice = {
  sample: string;
  trained: boolean;
  traits: string[];
  cadence: string;
  trainedAt?: string;
  speaker: SpeakerId;
};

export type CollectionDoc = {
  id: string;
  title: string;
  status: "Draft" | "Review" | "Ready" | "Published";
  words: number;
  updatedAt: string;
  template?: string;
};

export type Collection = {
  id: string;
  name: string;
  status: "Drafting" | "Review" | "Ready" | "Publishing";
  documents: CollectionDoc[];
};

export type LabImage = {
  id: string;
  prompt: string;
  url: string;
  createdAt: string;
};

export type LabDraft = {
  title: string;
  template?: string;
  sections: { heading: string; body: string }[];
  collectionId?: string;
  documentId?: string;
  voiceApplied?: boolean;
};

const VOICE_KEY = "aura-brand-voice";
const COLLECTIONS_KEY = "aura-collections";
const IMAGES_KEY = "aura-images";
const DRAFT_KEY = "aura-active-draft";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function syncWorkspace(resource: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  void fetch("/api/db/workspace", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resource, ...payload }),
  }).catch(() => {
    // DB sync is best-effort when session cookie exists
  });
}

export async function hydrateWorkspaceFromDb() {
  if (typeof window === "undefined") return;
  try {
    const response = await fetch("/api/db/workspace?resource=all", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    if (!payload?.ok) return;
    if (payload.collections) write(COLLECTIONS_KEY, payload.collections);
    if (payload.images) write(IMAGES_KEY, payload.images);
    if (payload.voice) write(VOICE_KEY, payload.voice);
    if (payload.draft !== undefined) {
      if (payload.draft) write(DRAFT_KEY, payload.draft);
      else localStorage.removeItem(DRAFT_KEY);
    }
  } catch {
    // ignore
  }
}

export const defaultVoiceSample =
  "We write like a senior strategist: precise, calm, and allergic to hype. Short sentences. No exclamation marks. Proof before promises.";

export function getBrandVoice(): BrandVoice {
  const stored = read<Partial<BrandVoice>>(VOICE_KEY, {});
  return {
    sample: stored.sample || defaultVoiceSample,
    trained: Boolean(stored.trained),
    traits: stored.traits ?? [],
    cadence: stored.cadence ?? "",
    trainedAt: stored.trainedAt,
    speaker: stored.speaker ?? "aria",
  };
}

export function saveBrandVoice(voice: BrandVoice) {
  write(VOICE_KEY, voice);
  syncWorkspace("voice", { voice });
}

export function trainBrandVoice(sample: string, speaker: SpeakerId = "aria"): BrandVoice {
  const current = getBrandVoice();
  const text = sample.trim();
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  const avg = sentences.length ? Math.round(words.length / sentences.length) : 0;
  const traits = [
    text.includes("!") ? "Energetic punctuation" : "No exclamation marks",
    avg <= 12 ? "Short, clipped cadence" : "Measured long-form cadence",
    /proof|data|rank|evidence/i.test(text) ? "Proof before promises" : "Narrative-led",
    /we|our brand|our team/i.test(text) ? "First-person plural" : "Direct address",
  ];

  const voice: BrandVoice = {
    sample: text,
    trained: true,
    traits,
    cadence: `${avg} words per sentence`,
    trainedAt: new Date().toISOString(),
    speaker: speaker || current.speaker || "aria",
  };
  saveBrandVoice(voice);
  return voice;
}

function seedCollections(): Collection[] {
  return [
    {
      id: "generated",
      name: "Generated drafts",
      status: "Drafting",
      documents: [],
    },
    {
      id: "saas-growth",
      name: "SaaS Growth Cluster",
      status: "Publishing",
      documents: [
        doc("Product-led SEO roadmap", "Published", 2140, "SEO Blog Post"),
        doc("Pricing page that ranks", "Review", 980, "Product Landing Page"),
        doc("Competitor gap: Notion AI", "Draft", 760, "Competitor Brief"),
      ],
    },
    {
      id: "ai-search",
      name: "AI Search Citations",
      status: "Drafting",
      documents: [
        doc("Get cited by ChatGPT", "Draft", 1680, "SEO Blog Post"),
        doc("Answer-engine FAQ pack", "Review", 540, "Newsletter Issue"),
      ],
    },
    {
      id: "brand-voice",
      name: "Brand Voice Samples",
      status: "Ready",
      documents: [
        doc("Founder tone sample", "Ready", 220),
        doc("Support voice sample", "Ready", 180),
      ],
    },
    {
      id: "q3-launches",
      name: "Q3 Product Launches",
      status: "Review",
      documents: [
        doc("Launch landing page", "Review", 1120, "Product Landing Page"),
        doc("Comparison vs incumbents", "Draft", 1540, "Comparison Page"),
      ],
    },
  ];
}

function doc(
  title: string,
  status: CollectionDoc["status"],
  words: number,
  template?: string,
): CollectionDoc {
  return {
    id: uid(),
    title,
    status,
    words,
    template,
    updatedAt: new Date().toISOString(),
  };
}

export function getCollections(): Collection[] {
  if (typeof window === "undefined") return [];
  const existing = read<Collection[]>(COLLECTIONS_KEY, []);
  if (existing.length) {
    if (!existing.some((item) => item.id === "generated")) {
      const withGenerated = [
        {
          id: "generated",
          name: "Generated drafts",
          status: "Drafting" as const,
          documents: [],
        },
        ...existing,
      ];
      write(COLLECTIONS_KEY, withGenerated);
      return withGenerated;
    }
    return existing;
  }
  const seeded = seedCollections();
  write(COLLECTIONS_KEY, seeded);
  return seeded;
}

export function saveCollections(collections: Collection[]) {
  write(COLLECTIONS_KEY, collections);
  syncWorkspace("collections", { collections });
}

export function upsertCollection(collection: Collection) {
  const collections = getCollections();
  const index = collections.findIndex((item) => item.id === collection.id);
  if (index >= 0) collections[index] = collection;
  else collections.unshift(collection);
  saveCollections(collections);
  return collections;
}

export function deleteCollection(id: string) {
  const next = getCollections().filter((item) => item.id !== id);
  saveCollections(next);
  return next;
}

export function getCollection(id: string) {
  return getCollections().find((item) => item.id === id) ?? null;
}

export function addDocument(collectionId: string, document: CollectionDoc) {
  let collections = getCollections();
  if (!collections.some((collection) => collection.id === collectionId)) {
    collections = upsertCollection({
      id: collectionId,
      name: "Generated drafts",
      status: "Drafting",
      documents: [],
    });
  }
  collections = collections.map((collection) =>
    collection.id === collectionId
      ? { ...collection, documents: [document, ...collection.documents] }
      : collection,
  );
  saveCollections(collections);
  return collections;
}

export function getImages(): LabImage[] {
  return read<LabImage[]>(IMAGES_KEY, []);
}

export function saveImages(images: LabImage[]) {
  write(IMAGES_KEY, images);
  syncWorkspace("images", { images });
}

export function addImage(image: LabImage) {
  const images = [image, ...getImages()].slice(0, 24);
  saveImages(images);
  return images;
}

export function imageUrl(prompt: string, seed = Date.now()) {
  const encoded = encodeURIComponent(
    `${prompt}, cinematic lighting, dark laboratory, ember orange accents, ultra detailed`,
  );
  return `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${seed}`;
}

export function getDraft(): LabDraft | null {
  return read<LabDraft | null>(DRAFT_KEY, null);
}

export function saveDraft(draft: LabDraft) {
  write(DRAFT_KEY, draft);
  syncWorkspace("draft", { draft });
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
  syncWorkspace("draft", { draft: null });
}
