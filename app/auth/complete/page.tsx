"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setSession, type AuraSession } from "@/lib/auth";

function CompleteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Finishing sign-in…");

  useEffect(() => {
    async function finish() {
      const next = params.get("next") || "/dashboard";
      const safeNext = next.startsWith("/") ? next : "/dashboard";
      const supabase = createClient();

      if (!supabase) {
        setMessage("Auth is not configured.");
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setMessage("Could not complete sign-in.");
        router.replace("/login?error=oauth");
        return;
      }

      const meta = data.user.user_metadata ?? {};
      const name =
        (meta.full_name as string) ||
        (meta.name as string) ||
        [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
        data.user.email?.split("@")[0] ||
        "Aura User";

      const providerRaw = data.user.app_metadata?.provider as string | undefined;
      const provider: AuraSession["provider"] =
        providerRaw === "google" || providerRaw === "github" || providerRaw === "azure"
          ? providerRaw === "azure"
            ? "microsoft"
            : providerRaw
          : "email";

      setSession({
        email: data.user.email ?? "",
        name,
        provider,
        role: (meta.role as string) || "Founder / Operator",
      });

      router.replace(safeNext);
    }

    void finish();
  }, [params, router]);

  return (
    <div className="grid min-h-screen place-items-center bg-background text-sm text-zinc-400">
      {message}
    </div>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-background text-sm text-zinc-400">
          Finishing sign-in…
        </div>
      }
    >
      <CompleteInner />
    </Suspense>
  );
}
