"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeoGauge } from "@/components/shared/seo-gauge";

const avatars = [
  { initials: "AL", from: "from-orange-500", to: "to-red-600" },
  { initials: "MK", from: "from-amber-400", to: "to-orange-600" },
  { initials: "JR", from: "from-rose-400", to: "to-orange-500" },
  { initials: "TS", from: "from-amber-400", to: "to-red-500" },
  { initials: "NP", from: "from-yellow-400", to: "to-orange-500" },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 md:pb-24 md:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-aura-grid" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[110px] animate-pulse-glow" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-orange-200">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Enterprise SEO content platform
          </div>
          <h1 className="text-balance text-[2.05rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
            Rank-ready content operations on{" "}
            <span className="text-gradient">Autopilot</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-[15px] leading-relaxed text-zinc-400 lg:mx-0">
            Aura AI is a commissioned content system for SEO and marketing teams —
            research, long-form drafting, quality scoring, brand voice, and visuals
            in one governed workspace.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button asChild size="lg" variant="glow" className="w-full sm:w-auto">
              <Link href="/signup">Request workspace access</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/login?next=/dashboard">Enter the platform</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <div className="flex -space-x-2">
              {avatars.map((avatar) => (
                <div
                  key={avatar.initials}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 border-[#121212] bg-gradient-to-br text-[11px] font-semibold text-white ${avatar.from} ${avatar.to}`}
                >
                  {avatar.initials}
                </div>
              ))}
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300">
              Built for{" "}
              <span className="font-semibold text-white">SEO &amp; content teams</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto w-full max-w-[380px] lg:max-w-none"
        >
          <div className="absolute -inset-6 rounded-[32px] bg-primary/15 blur-3xl" />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative glass-strong rounded-[28px] p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Quality control
                </p>
                <p className="text-sm font-medium text-white">
                  Draft readiness report
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                99% Human Content
              </span>
            </div>

            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <SeoGauge value={85} />
              <div className="w-full space-y-3 text-left">
                {[
                  "Analyse competitor keywords",
                  "Write outline",
                  "Generate long-form draft",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-primary">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm text-zinc-200">{item}</p>
                      <p className="text-[11px] text-zinc-500">
                        {index === 2 ? "Queued" : "Complete"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
