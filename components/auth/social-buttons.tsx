"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import type { SocialProvider } from "@/lib/oauth";
import { toast } from "sonner";

const providers: {
  id: SocialProvider;
  nextAuthId: "google" | "github" | "azure-ad";
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "google",
    nextAuthId: "google",
    label: "Continue with Google",
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
    nextAuthId: "github",
    label: "Continue with GitHub",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.2-4.6-5.1 0-1.1.4-2 1-2.8-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.6-.3 2.5-.3s1.7.1 2.5.3c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.7.8 1 1.7 1 2.8 0 4-2.3 4.8-4.6 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z" />
      </svg>
    ),
  },
  {
    id: "microsoft",
    nextAuthId: "azure-ad",
    label: "Continue with Microsoft",
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

export function SocialAuthButtons({ next = "/dashboard" }: { next?: string }) {
  const [busy, setBusy] = useState<SocialProvider | null>(null);
  const [enabled, setEnabled] = useState<Record<SocialProvider, boolean>>({
    google: false,
    github: false,
    microsoft: false,
  });

  useEffect(() => {
    void fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        setEnabled({
          google: Boolean(data.google),
          github: Boolean(data.github),
          microsoft: Boolean(data["azure-ad"]),
        });
      })
      .catch(() => undefined);
  }, []);

  async function onClick(provider: (typeof providers)[number]) {
    if (!enabled[provider.id]) {
      toast.error(
        "OAuth not set up yet. Add Google / GitHub / Microsoft client ID + secret in .env.local, then restart the server.",
      );
      return;
    }

    setBusy(provider.id);
    try {
      await signIn(provider.nextAuthId, {
        callbackUrl: `/auth/oauth-complete?next=${encodeURIComponent(next)}`,
        redirect: true,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "OAuth failed");
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="secondary"
          className="h-11 w-full justify-center gap-2.5 rounded-full"
          disabled={busy !== null}
          onClick={() => void onClick(provider)}
        >
          {provider.icon}
          <span className="text-sm">
            {busy === provider.id ? "Redirecting to provider…" : provider.label}
          </span>
        </Button>
      ))}
    </div>
  );
}
