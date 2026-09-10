import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { signInWithSocial } from "@/lib/auth";

export type SocialProvider = "google" | "github" | "microsoft";

const supabaseProviderMap = {
  google: "google",
  github: "github",
  microsoft: "azure",
} as const;

export async function startSocialLogin(
  provider: SocialProvider,
  next = "/dashboard",
): Promise<
  | { ok: true; redirecting?: boolean }
  | { ok: false; error: string }
> {
  const supabase = createClient();

  if (supabase && isSupabaseConfigured()) {
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProviderMap[provider],
      options: {
        redirectTo,
        queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, redirecting: true };
  }

  return openOAuthPopup(provider);
}

function openOAuthPopup(
  provider: SocialProvider,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    let settled = false;
    const width = 520;
    const height = 640;
    const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
    const url = `/auth/oauth/${provider}`;
    const popup = window.open(
      url,
      `aura-oauth-${provider}`,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,status=no`,
    );

    if (!popup) {
      resolve({
        ok: false,
        error: "Popup blocked. Allow popups for Aura AI, then try again.",
      });
      return;
    }

    const finish = (result: { ok: true } | { ok: false; error: string }) => {
      if (settled) return;
      settled = true;
      window.clearInterval(timer);
      window.removeEventListener("message", onMessage);
      resolve(result);
    };

    const timer = window.setInterval(() => {
      if (popup.closed) {
        finish({ ok: false, error: "Sign-in cancelled." });
      }
    }, 400);

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as {
        type?: string;
        provider?: SocialProvider;
        email?: string;
        name?: string;
      };
      if (data?.type !== "aura-oauth-success") return;
      if (settled) return;

      // Mark settled before closing so the closed-popup poll cannot cancel a success.
      settled = true;
      window.clearInterval(timer);
      window.removeEventListener("message", onMessage);

      try {
        popup?.close();
      } catch {
        // ignore
      }

      const result = signInWithSocial({
        provider: data.provider ?? provider,
        email: data.email ?? "",
        name: data.name ?? "Aura User",
      });
      if (!result.ok) {
        resolve({ ok: false, error: result.error });
        return;
      }
      resolve({ ok: true });
    }

    window.addEventListener("message", onMessage);
  });
}
