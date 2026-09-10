"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PulseAvatar } from "@/components/brand/pulse-avatar";
import { MoodToggle } from "@/components/theme/mood-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSession, signOut, type AuraSession } from "@/lib/auth";

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [session, setSession] = useState<AuraSession | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  function generate() {
    const query = prompt.trim();
    router.push(
      query
        ? `/editor?topic=${encodeURIComponent(query)}`
        : "/editor?topic=AI%20SEO%20content%20strategy",
    );
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.06] bg-background/80 px-4 py-3 backdrop-blur-xl lg:px-6">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.06)]">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="Describe what you want to create"
          className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button onClick={generate} className="shrink-0 px-4">
          <Sparkles className="h-4 w-4" />
          Generate
        </Button>
      </div>

      <MoodToggle />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full" aria-label="Account">
            <PulseAvatar initials={session?.name ?? "AU"} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{session?.email ?? "Workspace"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/billing")}>
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              signOut();
              router.push("/");
            }}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
