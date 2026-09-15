import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/db/session";
import {
  clearDraftForUser,
  getBrandVoiceForUser,
  getDraftForUser,
  getSessionByToken,
  listCollections,
  listImages,
  saveBrandVoiceForUser,
  saveCollectionsForUser,
  saveDraftForUser,
  saveImagesForUser,
} from "@/lib/db/store";

export const runtime = "nodejs";

async function requireUser() {
  const current = await getSessionByToken(getSessionToken());
  if (!current) return null;
  return current.user;
}

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource") || "all";

    if (resource === "collections") {
      return NextResponse.json({ ok: true, collections: await listCollections(user.id) });
    }
    if (resource === "images") {
      return NextResponse.json({ ok: true, images: await listImages(user.id) });
    }
    if (resource === "voice") {
      return NextResponse.json({ ok: true, voice: await getBrandVoiceForUser(user.id) });
    }
    if (resource === "draft") {
      return NextResponse.json({ ok: true, draft: await getDraftForUser(user.id) });
    }

    return NextResponse.json({
      ok: true,
      collections: await listCollections(user.id),
      images: await listImages(user.id),
      voice: await getBrandVoiceForUser(user.id),
      draft: await getDraftForUser(user.id),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Load failed" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const resource = String(body.resource || "");

    if (resource === "collections") {
      await saveCollectionsForUser(user.id, body.collections ?? []);
      return NextResponse.json({ ok: true });
    }
    if (resource === "images") {
      await saveImagesForUser(user.id, body.images ?? []);
      return NextResponse.json({ ok: true });
    }
    if (resource === "voice") {
      await saveBrandVoiceForUser(user.id, body.voice);
      return NextResponse.json({ ok: true });
    }
    if (resource === "draft") {
      if (body.draft == null) await clearDraftForUser(user.id);
      else await saveDraftForUser(user.id, body.draft);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown resource" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Save failed" },
      { status: 500 },
    );
  }
}
