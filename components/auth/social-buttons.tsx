"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { signInWithSocial } from "@/lib/auth";
import type { SocialProvider } from "@/lib/oauth";
import { toast } from "sonner";

const providers: {
  id: SocialProvider;
  label: string;
  brand: string;
  accent: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "google",
    label: "Continue with Google",
    brand: "Google",
    accent: "#4285F4",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
  },
  {
    id: "github",
    label: "Continue with GitHub",
    brand: "GitHub",
    accent: "#24292f",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.2-4.6-5.1 0-1.1.4-2 1-2.8-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.6-.3 2.5-.3s1.7.1 2.5.3c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.7.8 1 1.7 1 2.8 0 4-2.3 4.8-4.6 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z" />
      </svg>
    ),
  },
  {
    id: "microsoft",
    label: "Continue with Microsoft",
    brand: "Microsoft",
    accent: "#00a4ef",
    icon: (
      <span className="grid h-4 w-4 grid-cols-2 gap-0.5" aria-hidden>
        <span className="bg-[#f25022]" />
        <span className="bg-[#7fba00]" />
        <span className="bg-[#00a4ef]" />
        <span className="bg-[#ffb900]" />
      </span>
    ),
  },
];

const supabaseProviderMap = {
  google: "google",
  github: "github",
  microsoft: "azure",
} as const;

export function SocialAuthButtons({ next = "/dashboard" }: { next?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<SocialProvider | null>(null);
  const [active, setActive] = useState<(typeof providers)[number] | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  async function onClick(provider: SocialProvider) {
    const meta = providers.find((item) => item.id === provider);
    if (!meta) return;

    setBusy(provider);

    const supabase = createClient();
    if (supabase && isSupabaseConfigured()) {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProviderMap[provider],
        options: {
          redirectTo,
          queryParams:
            provider === "google" ? { prompt: "select_account" } : undefined,
        },
      });
      if (error) {
        toast.error(error.message);
        setBusy(null);
        return;
      }
      return;
    }

    setBusy(null);
    setEmail("");
    setName("");
    setActive(meta);
  }

  function complete(selectedEmail: string, selectedName: string) {
    if (!active) return;
    setBusy(active.id);
    const result = signInWithSocial({
      provider: active.id,
      email: selectedEmail,
      name: selectedName,
    });
    if (!result.ok) {
      toast.error(result.error);
      setBusy(null);
      return;
    }
    toast.success(`Signed in with ${active.brand}`);
    setActive(null);
    router.push(next);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            type="button"
            variant="secondary"
            className="h-11 w-full justify-center gap-2.5 rounded-full"
            disabled={busy !== null}
            onClick={() => void onClick(provider.id)}
          >
            {provider.icon}
            <span className="text-sm">
              {busy === provider.id ? "Connecting…" : provider.label}
            </span>
          </Button>
        ))}
      </div>

      <Dialog
        open={active !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActive(null);
            setBusy(null);
          }
        }}
      >
        <DialogContent className="max-w-md border-white/10 bg-[#141418]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              {active?.icon}
              Sign in with {active?.brand}
            </DialogTitle>
            <DialogDescription>
              Choose an account to continue to Aura AI — same flow as live
              product logins.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {[
              { email: "you@gmail.com", name: "You", hint: "Personal" },
              { email: "work@company.com", name: "Work Account", hint: "Work" },
            ].map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={busy !== null}
                onClick={() => complete(account.email, account.name)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold text-white"
                  style={{ background: active?.accent }}
                >
                  {account.name.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">
                    {account.name}
                  </span>
                  <span className="block truncate text-xs text-zinc-500">
                    {account.email}
                  </span>
                </span>
                <span className="text-[11px] text-zinc-500">{account.hint}</span>
              </button>
            ))}
          </div>

          <div className="my-1 flex items-center gap-3 text-xs text-zinc-500">
            <span className="h-px flex-1 bg-white/10" />
            or use another account
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="social-name">Full name</Label>
              <Input
                id="social-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aria Reynolds"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social-email">Email</Label>
              <Input
                id="social-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <Button
              className="w-full"
              disabled={busy !== null || !email.includes("@")}
              onClick={() =>
                complete(email, name || email.split("@")[0] || "Aura User")
              }
            >
              {busy ? "Connecting…" : `Continue with ${active?.brand ?? "provider"}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
