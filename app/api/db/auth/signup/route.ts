import { NextResponse } from "next/server";
import { createUser } from "@/lib/db/store";
import { setSessionCookie } from "@/lib/db/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createUser(body);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    setSessionCookie(result.token);
    return NextResponse.json({
      ok: true,
      session: result.session,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Signup failed" },
      { status: 500 },
    );
  }
}
