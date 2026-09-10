"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Laboratory } from "@/components/landing/laboratory";

const faqs = [
  {
    q: "What problem does Aura AI solve?",
    a: "Content and SEO teams often work across disconnected tools for research, drafting, scoring, and assets. Aura consolidates that loop into one commercial workspace with measurable draft quality.",
  },
  {
    q: "Who is the platform designed for?",
    a: "SEO leads, content strategists, agencies, and growth teams that need consistent, rank-oriented output with brand voice control and operational workflows.",
  },
  {
    q: "How is intelligence handled in the product?",
    a: "Writing and chat can route through GPT-4o when configured; otherwise topic-specific engines still return usable drafts. Images use DALL·E 3 or a live prompt model. SEO scoring and workflows provide the control layer around generation.",
  },
];

export function LandingSections() {
  return (
    <>
      <Laboratory />

      <section id="proof" className="mx-auto max-w-6xl px-4 py-8">
        <Card className="overflow-hidden">
          <CardContent className="relative grid gap-8 p-6 md:grid-cols-3 md:p-10">
            {[
              ["One workspace", "Research, write, score, and organize"],
              ["Quality gated", "SEO score before publish decisions"],
              ["Ops ready", "Auth, modules, and deployment path"],
            ].map(([stat, label]) => (
              <div key={label}>
                <div className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {stat}
                </div>
                <p className="mt-2 text-sm text-zinc-400">{label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-6 text-2xl font-semibold text-white">
          Engagement overview
        </h2>
        <Accordion type="single" collapsible>
          {faqs.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="px-4 pb-20">
        <div className="surface-dark mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-primary/30 bg-gradient-to-br from-[#2a1408] via-[#121212] to-[#0a0a0a] p-8 text-center md:p-14">
          <h2 className="keep-bright text-3xl font-semibold text-white">
            Put ranking content on a governed autopilot
          </h2>
          <p className="keep-bright mx-auto mt-3 max-w-xl text-sm text-zinc-300">
            Workspace access is gated by account creation. Dashboard modules —
            Writer, Chat, Editor, and Collections — unlock after sign-in.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/signup">Open workspace enrollment</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 text-sm text-zinc-500">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p>© {new Date().getFullYear()} Aura AI — commercial product system.</p>
        <div className="flex gap-4">
          <Link href="/pricing" className="hover:text-white">
            Plans
          </Link>
          <Link href="/login" className="hover:text-white">
            Sign in
          </Link>
          <Link href="/login?next=/dashboard" className="hover:text-white">
            Workspace
          </Link>
        </div>
      </div>
    </footer>
  );
}
