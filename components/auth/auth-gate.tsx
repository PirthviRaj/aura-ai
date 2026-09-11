"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, setSession, type AuraSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { hydrateWorkspaceFromDb } from "@/lib/workspace";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const local = getSession();
      if (local) {
        await hydrateWorkspaceFromDb();
        if (!cancelled) setAllowed(true);
        return;
      }

      try {
        const response = await fetch("/api/db/auth/session", { cache: "no-store" });
        const payload = await response.json();
        if (payload?.ok && payload.session) {
          setSession(payload.session);
          await hydrateWorkspaceFromDb();
          if (!cancelled) setAllowed(true);
          return;
        }
      } catch {
        // continue to supabase / redirect
      }

      const supabase = createClient();
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (data.user && !cancelled) {
          const meta = data.user.user_metadata ?? {};
          const name =
            (meta.full_name as string) ||
            (meta.name as string) ||
            data.user.email?.split("@")[0] ||
            "Aura User";
          const providerRaw = data.user.app_metadata?.provider as string | undefined;
          const provider: AuraSession["provider"] =
            providerRaw === "google" || providerRaw === "github"
              ? providerRaw
              : providerRaw === "azure"
                ? "microsoft"
                : "email";
          setSession({
            email: data.user.email ?? "",
            name,
            provider,
            role: (meta.role as string) || "Founder / Operator",
          });
          setAllowed(true);
          return;
        }
      }

      if (!cancelled) {
        const next = encodeURIComponent(pathname || "/dashboard");
        router.replace(`/login?next=${next}`);
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-zinc-400">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}
