import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/db/store";
import { setSessionCookie } from "@/lib/db/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await authenticateUser(String(body.email ?? ""), String(body.password ?? ""));
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
    }
    setSessionCookie(result.token);
    return NextResponse.json({ ok: true, session: result.session });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 },
    );
  }
}
