"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AuraLogo } from "@/components/brand/logo";
import { MoodToggle } from "@/components/theme/mood-toggle";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#features", label: "Platform" },
  { href: "#proof", label: "Proof" },
  { href: "/pricing", label: "Pricing" },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/">
          <AuraLogo />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <MoodToggle />
          <Button asChild variant="ghost" className="text-foreground">
            <Link href="/login">Log in</Link>
          </Button>
            <Button asChild>
            <Link href="/signup">Get access</Link>
          </Button>
        </div>
        <button
          className="rounded-lg p-2 text-zinc-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="space-y-2 border-t border-white/10 px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-2 py-2 text-sm text-zinc-300"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <MoodToggle />
            <Button asChild variant="outline" className="flex-1 text-foreground">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/signup">Get access</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
