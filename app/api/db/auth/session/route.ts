import { NextResponse } from "next/server";
import { destroySession, upsertOAuthUser } from "@/lib/db/store";
import {
  clearSessionCookie,
  getSessionToken,
  setSessionCookie,
} from "@/lib/db/session";
import { getSessionByToken } from "@/lib/db/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const token = getSessionToken();
    const current = await getSessionByToken(token);
    if (!current) {
      return NextResponse.json({ ok: true, session: null });
    }
    return NextResponse.json({ ok: true, session: current.session, userId: current.user.id });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Session failed" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await destroySession(getSessionToken());
    clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Logout failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body?.action === "oauth") {
      const result = await upsertOAuthUser({
        provider: body.provider,
        email: String(body.email ?? ""),
        name: String(body.name ?? ""),
      });
      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      }
      setSessionCookie(result.token);
      return NextResponse.json({ ok: true, session: result.session });
    }
    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Auth failed" },
      { status: 500 },
    );
  }
}
