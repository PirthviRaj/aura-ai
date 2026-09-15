import crypto from "crypto";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { execute, queryOne, queryRows, withTransaction } from "@/lib/db/client";
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

type UserRow = DbUser & RowDataPacket;
type AuthUserRow = DbUser & { password_hash: string } & RowDataPacket;
type SessionJoinRow = DbUser & { token: string; expires_at: string } & RowDataPacket;

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

const USER_SELECT =
  `id, email, full_name, first_name, last_name, role, company, website, team_size, plan, provider`;

export async function createUser(input: SignUpInput) {
  const email = input.email.trim().toLowerCase();
  const existing = await queryOne<RowDataPacket>("SELECT id FROM users WHERE email = ?", [email]);
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
  await execute(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, full_name, role, provider)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      email,
      hashPassword(input.password),
      firstName,
      lastName,
      fullName,
      input.role,
      input.provider ?? "email",
    ],
  );

  await seedWorkspace(id);
  const user = (await getUserById(id))!;
  const token = await createSession(id);
  return { ok: true as const, user, session: toSession(user), token };
}

export async function authenticateUser(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return { ok: false as const, error: "Email and password are required." };
  }

  const row = await queryOne<AuthUserRow>(
    `SELECT ${USER_SELECT}, password_hash FROM users WHERE email = ?`,
    [normalized],
  );

  if (!row) return { ok: false as const, error: "No account found for this email. Create one first." };
  if (!verifyPassword(password, row.password_hash)) {
    return { ok: false as const, error: "Incorrect password." };
  }

  const user: DbUser = {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    first_name: row.first_name,
    last_name: row.last_name,
    role: row.role,
    company: row.company,
    website: row.website,
    team_size: row.team_size,
    plan: row.plan,
    provider: row.provider,
  };
  const token = await createSession(user.id);
  return { ok: true as const, user, session: toSession(user), token };
}

export async function upsertOAuthUser(input: {
  provider: Exclude<NonNullable<AuraSession["provider"]>, "email">;
  email: string;
  name: string;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || email.split("@")[0] || "Aura User";
  if (!email.includes("@")) {
    return { ok: false as const, error: "A valid email is required from the provider." };
  }

  let user = await queryOne<UserRow>(`SELECT ${USER_SELECT} FROM users WHERE email = ?`, [email]);

  if (user) {
    await execute(`UPDATE users SET full_name = ?, provider = ? WHERE id = ?`, [
      name,
      input.provider,
      user.id,
    ]);
    user = (await getUserById(user.id))!;
  } else {
    const [firstName, ...rest] = name.split(/\s+/);
    const id = uid();
    await execute(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, full_name, role, provider)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        email,
        hashPassword(`oauth-${input.provider}-${Date.now()}`),
        firstName || "Aura",
        rest.join(" ") || "User",
        name,
        "Founder / Operator",
        input.provider,
      ],
    );
    await seedWorkspace(id);
    user = (await getUserById(id))!;
  }

  const token = await createSession(user.id);
  return { ok: true as const, user, session: toSession(user), token };
}

export async function getUserById(id: string) {
  return queryOne<UserRow>(`SELECT ${USER_SELECT} FROM users WHERE id = ?`, [id]);
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const id = uid();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await execute(`INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`, [
    id,
    userId,
    token,
    expires,
  ]);
  return token;
}

export async function getSessionByToken(token: string | undefined | null) {
  if (!token) return null;

  const row = await queryOne<SessionJoinRow>(
    `SELECT s.token, s.expires_at, u.id, u.email, u.full_name, u.first_name, u.last_name,
            u.role, u.company, u.website, u.team_size, u.plan, u.provider
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ?`,
    [token],
  );

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await execute("DELETE FROM sessions WHERE token = ?", [token]);
    return null;
  }

  const user: DbUser = {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    first_name: row.first_name,
    last_name: row.last_name,
    role: row.role,
    company: row.company,
    website: row.website,
    team_size: row.team_size,
    plan: row.plan,
    provider: row.provider,
  };
  return { user, session: toSession(user) };
}

export async function destroySession(token: string | undefined | null) {
  if (!token) return;
  await execute("DELETE FROM sessions WHERE token = ?", [token]);
}

async function seedWorkspace(userId: string) {
  const countRow = await queryOne<RowDataPacket & { c: number }>(
    "SELECT COUNT(*) AS c FROM collections WHERE user_id = ?",
    [userId],
  );
  if ((countRow?.c ?? 0) > 0) return;

  const seeds: Array<{ id: string; name: string; status: Collection["status"] }> = [
    { id: "generated", name: "Generated drafts", status: "Drafting" },
    { id: "saas-growth", name: "SaaS Growth Cluster", status: "Publishing" },
    { id: "ai-search", name: "AI Search Citations", status: "Drafting" },
    { id: "brand-voice", name: "Brand Voice Samples", status: "Ready" },
    { id: "q3-launches", name: "Q3 Product Launches", status: "Review" },
  ];

  await withTransaction(async (conn) => {
    for (const seed of seeds) {
      const collectionId = `${userId.slice(0, 8)}-${seed.id}`;
      await conn.execute(
        `INSERT INTO collections (id, user_id, name, status) VALUES (?, ?, ?, ?)`,
        [collectionId, userId, seed.name, seed.status],
      );
      if (seed.id === "generated") continue;
      await conn.execute(
        `INSERT INTO collection_documents (id, collection_id, title, status, words, template)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uid(), collectionId, `${seed.name} starter doc`, "Draft", 400, "SEO Blog Post"],
      );
    }
    await conn.execute(
      `INSERT INTO brand_voices (user_id, sample, trained, traits_json, cadence, speaker)
       VALUES (?, ?, 0, '[]', '', 'aria')`,
      [userId, DEFAULT_VOICE_SAMPLE],
    );
  });
}

export async function listCollections(userId: string): Promise<Collection[]> {
  const collections = await queryRows<
    RowDataPacket & { id: string; name: string; status: Collection["status"] }
  >(`SELECT id, name, status FROM collections WHERE user_id = ? ORDER BY updated_at DESC`, [userId]);

  const result: Collection[] = [];
  for (const collection of collections) {
    const documents = await queryRows<
      RowDataPacket & {
        id: string;
        title: string;
        status: CollectionDoc["status"];
        words: number;
        template: string | null;
        updatedAt: string;
      }
    >(
      `SELECT id, title, status, words, template, updated_at AS updatedAt
       FROM collection_documents WHERE collection_id = ? ORDER BY updated_at DESC`,
      [collection.id],
    );
    result.push({
      ...collection,
      documents: documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        status: doc.status,
        words: doc.words,
        template: doc.template ?? undefined,
        updatedAt: doc.updatedAt,
      })),
    });
  }
  return result;
}

export async function saveCollectionsForUser(userId: string, collections: Collection[]) {
  await withTransaction(async (conn) => {
    const [existingRows] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM collections WHERE user_id = ?",
      [userId],
    );
    const keep = new Set(collections.map((c) => c.id));
    for (const row of existingRows) {
      if (!keep.has(String(row.id))) {
        await conn.execute("DELETE FROM collections WHERE id = ? AND user_id = ?", [row.id, userId]);
      }
    }

    for (const collection of collections) {
      await conn.execute(
        `INSERT INTO collections (id, user_id, name, status)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           status = VALUES(status),
           user_id = VALUES(user_id)`,
        [collection.id, userId, collection.name, collection.status],
      );
      await conn.execute("DELETE FROM collection_documents WHERE collection_id = ?", [collection.id]);
      for (const doc of collection.documents) {
        await conn.execute(
          `INSERT INTO collection_documents (id, collection_id, title, status, words, template, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            doc.id,
            collection.id,
            doc.title,
            doc.status,
            doc.words,
            doc.template ?? null,
            doc.updatedAt,
          ],
        );
      }
    }
  });
}

export async function getBrandVoiceForUser(userId: string): Promise<BrandVoice> {
  const row = await queryOne<
    RowDataPacket & {
      sample: string;
      trained: number;
      traits_json: string;
      cadence: string;
      speaker: string;
      trained_at: string | null;
    }
  >(
    `SELECT sample, trained, traits_json, cadence, speaker, trained_at
     FROM brand_voices WHERE user_id = ?`,
    [userId],
  );

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

export async function saveBrandVoiceForUser(userId: string, voice: BrandVoice) {
  await execute(
    `INSERT INTO brand_voices (user_id, sample, trained, traits_json, cadence, speaker, trained_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       sample = VALUES(sample),
       trained = VALUES(trained),
       traits_json = VALUES(traits_json),
       cadence = VALUES(cadence),
       speaker = VALUES(speaker),
       trained_at = VALUES(trained_at)`,
    [
      userId,
      voice.sample,
      voice.trained ? 1 : 0,
      JSON.stringify(voice.traits ?? []),
      voice.cadence ?? "",
      voice.speaker ?? "aria",
      voice.trainedAt ?? null,
    ],
  );
}

export async function listImages(userId: string): Promise<LabImage[]> {
  const rows = await queryRows<
    RowDataPacket & { id: string; prompt: string; url: string; createdAt: string }
  >(
    `SELECT id, prompt, url, created_at AS createdAt FROM images WHERE user_id = ? ORDER BY created_at DESC LIMIT 24`,
    [userId],
  );
  return rows.map((row) => ({
    id: row.id,
    prompt: row.prompt,
    url: row.url,
    createdAt: row.createdAt,
  }));
}

export async function saveImagesForUser(userId: string, images: LabImage[]) {
  await withTransaction(async (conn: PoolConnection) => {
    await conn.execute("DELETE FROM images WHERE user_id = ?", [userId]);
    for (const image of images.slice(0, 24)) {
      await conn.execute(
        `INSERT INTO images (id, user_id, prompt, url, created_at) VALUES (?, ?, ?, ?, ?)`,
        [image.id, userId, image.prompt, image.url, image.createdAt],
      );
    }
  });
}

export async function getDraftForUser(userId: string): Promise<LabDraft | null> {
  const row = await queryOne<
    RowDataPacket & {
      title: string;
      template: string | null;
      sections_json: string;
      collection_id: string | null;
      document_id: string | null;
      voice_applied: number;
    }
  >(
    `SELECT title, template, sections_json, collection_id, document_id, voice_applied
     FROM drafts WHERE user_id = ?`,
    [userId],
  );
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

export async function saveDraftForUser(userId: string, draft: LabDraft) {
  await execute(
    `INSERT INTO drafts (user_id, title, template, sections_json, collection_id, document_id, voice_applied)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       template = VALUES(template),
       sections_json = VALUES(sections_json),
       collection_id = VALUES(collection_id),
       document_id = VALUES(document_id),
       voice_applied = VALUES(voice_applied)`,
    [
      userId,
      draft.title,
      draft.template ?? null,
      JSON.stringify(draft.sections ?? []),
      draft.collectionId ?? null,
      draft.documentId ?? null,
      draft.voiceApplied ? 1 : 0,
    ],
  );
}

export async function clearDraftForUser(userId: string) {
  await execute("DELETE FROM drafts WHERE user_id = ?", [userId]);
}
