"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SocialProvider } from "@/lib/oauth";

const copy: Record<
  SocialProvider,
  { title: string; brand: string; accent: string; hint: string }
> = {
  google: {
    title: "Sign in with Google",
    brand: "Google",
    accent: "#4285F4",
    hint: "Choose a Google account to continue to Aura AI",
  },
  github: {
    title: "Sign in with GitHub",
    brand: "GitHub",
    accent: "#24292f",
    hint: "Authorize Aura AI to use your GitHub identity",
  },
  microsoft: {
    title: "Sign in with Microsoft",
    brand: "Microsoft",
    accent: "#00a4ef",
    hint: "Use your Microsoft account to continue to Aura AI",
  },
};

function isProvider(value: string): value is SocialProvider {
  return value === "google" || value === "github" || value === "microsoft";
}

export default function OAuthConsentPage() {
  const params = useParams<{ provider: string }>();
  const providerParam = typeof params?.provider === "string" ? params.provider : "google";
  const provider = isProvider(providerParam) ? providerParam : "google";
  const meta = copy[provider];
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const accounts = useMemo(
    () => [
      { email: "you@gmail.com", name: "You", hint: "Personal" },
      { email: "work@company.com", name: "Work Account", hint: "Work" },
    ],
    [],
  );

  function finish(selectedEmail: string, selectedName: string) {
    if (!window.opener) {
      window.location.href = "/login";
      return;
    }
    setBusy(true);
    window.opener.postMessage(
      {
        type: "aura-oauth-success",
        provider,
        email: selectedEmail.trim().toLowerCase(),
        name: selectedName.trim() || selectedEmail.split("@")[0],
      },
      window.location.origin,
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#0b0b0d] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141418] p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <ProviderMark provider={provider} />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              {meta.brand}
            </p>
            <h1 className="text-lg font-semibold">{meta.title}</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-zinc-400">{meta.hint}</p>

        <div className="mt-5 space-y-2">
          {accounts.map((account) => (
            <button
              key={account.email}
              type="button"
              disabled={busy}
              onClick={() => finish(account.email, account.name)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left transition hover:border-white/25 hover:bg-white/[0.06]"
            >
              <span
                className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold text-white"
                style={{ background: meta.accent }}
              >
                {account.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
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

        <div className="my-5 flex items-center gap-3 text-xs text-zinc-500">
          <span className="h-px flex-1 bg-white/10" />
          or use another account
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="oauth-name">Full name</Label>
            <Input
              id="oauth-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aria Reynolds"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oauth-email">Email</Label>
            <Input
              id="oauth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <Button
            className="w-full"
            disabled={busy || !email.includes("@")}
            onClick={() =>
              finish(email, name || email.split("@")[0] || "Aura User")
            }
          >
            {busy ? "Connecting…" : `Continue with ${meta.brand}`}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => window.close()}
            disabled={busy}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProviderMark({ provider }: { provider: SocialProvider }) {
  if (provider === "google") {
    return (
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white">
        <span className="text-lg font-bold text-[#4285F4]">G</span>
      </span>
    );
  }
  if (provider === "github") {
    return (
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold text-zinc-900">
        GH
      </span>
    );
  }
  return (
    <span className="grid h-10 w-10 place-items-center rounded-full bg-white">
      <span className="grid h-5 w-5 grid-cols-2 gap-0.5">
        <span className="bg-[#f25022]" />
        <span className="bg-[#7fba00]" />
        <span className="bg-[#00a4ef]" />
        <span className="bg-[#ffb900]" />
      </span>
    </span>
  );
}
