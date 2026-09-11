import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { upsertOAuthUser } from "@/lib/db/store";
import { setSessionCookie } from "@/lib/db/session";

export const runtime = "nodejs";

export default async function OAuthCompletePage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next = searchParams?.next || "/dashboard";
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect(`/login?error=oauth&next=${encodeURIComponent(next)}`);
  }

  const providerRaw = (session as { oauthProvider?: string }).oauthProvider;
  const provider =
    providerRaw === "google" || providerRaw === "github" || providerRaw === "microsoft"
      ? providerRaw
      : "google";

  const result = upsertOAuthUser({
    provider,
    email: session.user.email,
    name: session.user.name || session.user.email.split("@")[0] || "Aura User",
  });

  if (!result.ok) {
    redirect(`/login?error=oauth&next=${encodeURIComponent(next)}`);
  }

  setSessionCookie(result.token);
  redirect(next);
}
