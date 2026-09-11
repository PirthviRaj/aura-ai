import { redirect } from "next/navigation";

/** Legacy fake OAuth UI removed — real provider login is via NextAuth. */
export default function LegacyOAuthPage({
  params,
}: {
  params: { provider: string };
}) {
  redirect(`/login?error=oauth&provider=${encodeURIComponent(params.provider)}`);
}
