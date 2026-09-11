import crypto from "crypto";
import { getDb } from "@/lib/db/client";
import { uid } from "@/lib/id";
import type { AuraSession, SignUpInput } from "@/lib/auth";
import type {
  BrandVoice,
  Collection,
  CollectionDoc,
  LabDraft,
  LabImage,
} from "@/lib/workspace";

const DEFAULT_VOICE_SAMPLE =
  "We write like a senior strategist: precise, calm, and allergic to hype. Short sentences. No exclamation marks. Proof before promises.";

const SESSION_DAYS = 30;

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(next, "hex"));
}

export type DbUser = {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: string;
  company: string | null;
  website: string | null;
  team_size: string | null;
  plan: string | null;
  provider: AuraSession["provider"];
};

function toSession(user: DbUser): AuraSession {
  return {
    email: user.email,
    name: user.full_name,
    role: user.role,
    company: user.company ?? undefined,
    website: user.website ?? undefined,
    teamSize: user.team_size ?? undefined,
    plan: user.plan ?? undefined,
    provider: user.provider ?? "email",
  };
}

export function createUser(input: SignUpInput) {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return { ok: false as const, error: "This email already has an account. Log in instead." };

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!firstName || !lastName) return { ok: false as const, error: "Enter your first and last name." };
  if (!email.includes("@")) return { ok: false as const, error: "Enter a valid work email." };
  if (input.password.length < 6) return { ok: false as const, error: "Password must be at least 6 characters." };
  if (input.confirmPassword !== undefined && input.password !== input.confirmPassword) {
    return { ok: false as const, error: "Passwords do not match." };
  }
  if (!input.role) return { ok: false as const, error: "Choose your role." };

  const id = uid();
  const fullName = `${firstName} ${lastName}`.trim();
  db.prepare(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, full_name, role, provider)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    email,
    hashPassword(input.password),
    firstName,
    lastName,
    fullName,
    input.role,
    input.provider ?? "email",
  );

  seedWorkspace(id);
  const user = getUserById(id)!;
  const token = createSession(id);
  return { ok: true as const, user, session: toSession(user), token };
}

export function authenticateUser(email: string, password: string) {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return { ok: false as const, error: "Email and password are required." };
  }
  const row = db
    .prepare(
      `SELECT id, email, password_hash, full_name, first_name, last_name, role, company, website, team_size, plan, provider
       FROM users WHERE email = ?`,
    )
    .get(normalized) as (DbUser & { password_hash: string }) | undefined;

  if (!row) return { ok: false as const, error: "No account found for this email. Create one first." };
  if (!verifyPassword(password, row.password_hash)) {
    return { ok: false as const, error: "Incorrect password." };
  }

  const { password_hash: _, ...user } = row;
  const token = createSession(user.id);
  return { ok: true as const, user, session: toSession(user), token };
}

export function upsertOAuthUser(input: {
  provider: Exclude<NonNullable<AuraSession["provider"]>, "email">;
  email: string;
  name: string;
}) {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || email.split("@")[0] || "Aura User";
  if (!email.includes("@")) {
    return { ok: false as const, error: "A valid email is required from the provider." };
  }

  let user = db
    .prepare(
      `SELECT id, email, full_name, first_name, last_name, role, company, website, team_size, plan, provider
       FROM users WHERE email = ?`,
    )
    .get(email) as DbUser | undefined;

  if (user) {
    db.prepare(
      `UPDATE users SET full_name = ?, provider = ?, updated_at = datetime('now') WHERE id = ?`,
    ).run(name, input.provider, user.id);
    user = getUserById(user.id)!;
  } else {
    const [firstName, ...rest] = name.split(/\s+/);
    const id = uid();
    db.prepare(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, full_name, role, provider)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      email,
      hashPassword(`oauth-${input.provider}-${Date.now()}`),
      firstName || "Aura",
      rest.join(" ") || "User",
      name,
      "Founder / Operator",
      input.provider,
    );
    seedWorkspace(id);
    user = getUserById(id)!;
  }

  const token = createSession(user.id);
  return { ok: true as const, user, session: toSession(user), token };
}

export function getUserById(id: string) {
  return getDb()
    .prepare(
      `SELECT id, email, full_name, first_name, last_name, role, company, website, team_size, plan, provider
       FROM users WHERE id = ?`,
    )
    .get(id) as DbUser | undefined;
}

export function createSession(userId: string) {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const id = uid();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
  ).run(id, userId, token, expires);
  return token;
}

export function getSessionByToken(token: string | undefined | null) {
  if (!token) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT s.token, s.expires_at, u.id, u.email, u.full_name, u.first_name, u.last_name,
              u.role, u.company, u.website, u.team_size, u.plan, u.provider
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`,
    )
    .get(token) as
    | (DbUser & { token: string; expires_at: string })
    | undefined;

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }
  const { token: _, expires_at: __, ...user } = row;
  return { user, session: toSession(user) };
}

export function destroySession(token: string | undefined | null) {
  if (!token) return;
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

function seedWorkspace(userId: string) {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) AS c FROM collections WHERE user_id = ?").get(userId) as {
    c: number;
  };
  if (count.c > 0) return;

  const seeds: Array<{ id: string; name: string; status: Collection["status"] }> = [
    { id: "generated", name: "Generated drafts", status: "Drafting" },
    { id: "saas-growth", name: "SaaS Growth Cluster", status: "Publishing" },
    { id: "ai-search", name: "AI Search Citations", status: "Drafting" },
    { id: "brand-voice", name: "Brand Voice Samples", status: "Ready" },
    { id: "q3-launches", name: "Q3 Product Launches", status: "Review" },
  ];

  const insertCollection = db.prepare(
    `INSERT INTO collections (id, user_id, name, status) VALUES (?, ?, ?, ?)`,
  );
  const insertDoc = db.prepare(
    `INSERT INTO collection_documents (id, collection_id, title, status, words, template, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
  );

  const tx = db.transaction(() => {
    for (const seed of seeds) {
      const collectionId = `${userId.slice(0, 8)}-${seed.id}`;
      insertCollection.run(collectionId, userId, seed.name, seed.status);
      if (seed.id === "generated") continue;
      insertDoc.run(uid(), collectionId, `${seed.name} starter doc`, "Draft", 400, "SEO Blog Post");
    }
    db.prepare(
      `INSERT INTO brand_voices (user_id, sample, trained, traits_json, cadence, speaker)
       VALUES (?, ?, 0, '[]', '', 'aria')`,
    ).run(userId, DEFAULT_VOICE_SAMPLE);
  });
  tx();
}

export function listCollections(userId: string): Collection[] {
  const db = getDb();
  const collections = db
    .prepare(
      `SELECT id, name, status FROM collections WHERE user_id = ? ORDER BY updated_at DESC`,
    )
    .all(userId) as Array<{ id: string; name: string; status: Collection["status"] }>;

  const docsStmt = db.prepare(
    `SELECT id, title, status, words, template, updated_at AS updatedAt
     FROM collection_documents WHERE collection_id = ? ORDER BY updated_at DESC`,
  );

  return collections.map((collection) => ({
    ...collection,
    documents: docsStmt.all(collection.id) as CollectionDoc[],
  }));
}

export function saveCollectionsForUser(userId: string, collections: Collection[]) {
  const db = getDb();
  const tx = db.transaction(() => {
    const existing = db
      .prepare("SELECT id FROM collections WHERE user_id = ?")
      .all(userId) as Array<{ id: string }>;
    const keep = new Set(collections.map((c) => c.id));
    for (const row of existing) {
      if (!keep.has(row.id)) {
        db.prepare("DELETE FROM collections WHERE id = ? AND user_id = ?").run(row.id, userId);
      }
    }

    const upsertCollection = db.prepare(
      `INSERT INTO collections (id, user_id, name, status, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         status = excluded.status,
         updated_at = datetime('now')`,
    );
    const deleteDocs = db.prepare("DELETE FROM collection_documents WHERE collection_id = ?");
    const insertDoc = db.prepare(
      `INSERT INTO collection_documents (id, collection_id, title, status, words, template, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const collection of collections) {
      upsertCollection.run(collection.id, userId, collection.name, collection.status);
      deleteDocs.run(collection.id);
      for (const doc of collection.documents) {
        insertDoc.run(
          doc.id,
          collection.id,
          doc.title,
          doc.status,
          doc.words,
          doc.template ?? null,
          doc.updatedAt,
        );
      }
    }
  });
  tx();
}

export function getBrandVoiceForUser(userId: string): BrandVoice {
  const row = getDb()
    .prepare(
      `SELECT sample, trained, traits_json, cadence, speaker, trained_at
       FROM brand_voices WHERE user_id = ?`,
    )
    .get(userId) as
    | {
        sample: string;
        trained: number;
        traits_json: string;
        cadence: string;
        speaker: string;
        trained_at: string | null;
      }
    | undefined;

  if (!row) {
    return {
      sample: DEFAULT_VOICE_SAMPLE,
      trained: false,
      traits: [],
      cadence: "",
      speaker: "aria",
    };
  }

  return {
    sample: row.sample,
    trained: Boolean(row.trained),
    traits: JSON.parse(row.traits_json || "[]") as string[],
    cadence: row.cadence,
    speaker: (row.speaker as BrandVoice["speaker"]) || "aria",
    trainedAt: row.trained_at ?? undefined,
  };
}

export function saveBrandVoiceForUser(userId: string, voice: BrandVoice) {
  getDb()
    .prepare(
      `INSERT INTO brand_voices (user_id, sample, trained, traits_json, cadence, speaker, trained_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         sample = excluded.sample,
         trained = excluded.trained,
         traits_json = excluded.traits_json,
         cadence = excluded.cadence,
         speaker = excluded.speaker,
         trained_at = excluded.trained_at,
         updated_at = datetime('now')`,
    )
    .run(
      userId,
      voice.sample,
      voice.trained ? 1 : 0,
      JSON.stringify(voice.traits ?? []),
      voice.cadence ?? "",
      voice.speaker ?? "aria",
      voice.trainedAt ?? null,
    );
}

export function listImages(userId: string): LabImage[] {
  return getDb()
    .prepare(
      `SELECT id, prompt, url, created_at AS createdAt FROM images WHERE user_id = ? ORDER BY created_at DESC LIMIT 24`,
    )
    .all(userId) as LabImage[];
}

export function saveImagesForUser(userId: string, images: LabImage[]) {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM images WHERE user_id = ?").run(userId);
    const insert = db.prepare(
      `INSERT INTO images (id, user_id, prompt, url, created_at) VALUES (?, ?, ?, ?, ?)`,
    );
    for (const image of images.slice(0, 24)) {
      insert.run(image.id, userId, image.prompt, image.url, image.createdAt);
    }
  });
  tx();
}

export function getDraftForUser(userId: string): LabDraft | null {
  const row = getDb()
    .prepare(
      `SELECT title, template, sections_json, collection_id, document_id, voice_applied
       FROM drafts WHERE user_id = ?`,
    )
    .get(userId) as
    | {
        title: string;
        template: string | null;
        sections_json: string;
        collection_id: string | null;
        document_id: string | null;
        voice_applied: number;
      }
    | undefined;
  if (!row) return null;
  return {
    title: row.title,
    template: row.template ?? undefined,
    sections: JSON.parse(row.sections_json || "[]"),
    collectionId: row.collection_id ?? undefined,
    documentId: row.document_id ?? undefined,
    voiceApplied: Boolean(row.voice_applied),
  };
}

export function saveDraftForUser(userId: string, draft: LabDraft) {
  getDb()
    .prepare(
      `INSERT INTO drafts (user_id, title, template, sections_json, collection_id, document_id, voice_applied, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         title = excluded.title,
         template = excluded.template,
         sections_json = excluded.sections_json,
         collection_id = excluded.collection_id,
         document_id = excluded.document_id,
         voice_applied = excluded.voice_applied,
         updated_at = datetime('now')`,
    )
    .run(
      userId,
      draft.title,
      draft.template ?? null,
      JSON.stringify(draft.sections ?? []),
      draft.collectionId ?? null,
      draft.documentId ?? null,
      draft.voiceApplied ? 1 : 0,
    );
}

export function clearDraftForUser(userId: string) {
  getDb().prepare("DELETE FROM drafts WHERE user_id = ?").run(userId);
}
