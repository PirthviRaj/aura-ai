"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  AudioLines,
  Check,
  ImageIcon,
  LayoutTemplate,
  PenLine,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBrandVoice } from "@/lib/workspace";
import { makeStudioShot, studioGallery } from "@/lib/image-art";

export function BentoGrid() {
  const [voiceReady, setVoiceReady] = useState(false);

  useEffect(() => {
    setVoiceReady(getBrandVoice().trained);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-2 md:row-span-2"
      >
        <Link href="/writer" className="block h-full">
          <Card className="group h-full min-h-[320px] border-glow transition-all hover:-translate-y-1 hover:shadow-glow-lg">
            <CardContent className="relative flex h-full flex-col overflow-hidden p-6">
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-shine group-hover:opacity-100" />
              <div className="flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <PenLine className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-primary" />
              </div>

              <div className="mt-5 grid flex-1 gap-4 sm:grid-cols-[1fr_120px]">
                <div className="space-y-2">
                  {[
                    "Analyse competitor keywords",
                    "Write outline + FAQ schema",
                    "Draft up to 6,000 words",
                    "Score SEO before publish",
                  ].map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300"
                    >
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/20 text-primary">
                        {index < 2 ? <Check className="h-3 w-3" /> : index + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
                <div className="hidden place-items-center rounded-2xl border border-primary/20 bg-primary/10 sm:grid">
                  <div className="text-center">
                    <p className="text-3xl font-semibold text-white">85%</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                      SEO
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-2xl font-semibold text-white">AI Blog Writer</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Generate long-form SEO optimized content up to 6000 words
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <MiniCard
        href="/brand-voice"
        title="Brand Voice"
        copy="Upload samples to learn your tone"
        icon={AudioLines}
        delay={0.05}
        badge={voiceReady ? "Trained" : "Not trained"}
        success={voiceReady}
      />
      <MiniCard
        href="/templates"
        title="Templates"
        copy="Powerful AI templates to brainstorm"
        icon={LayoutTemplate}
        delay={0.1}
        badge="6 ready"
      />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="md:col-span-2"
      >
        <Link href="/images" className="block h-full">
          <Card className="group h-full overflow-hidden border-glow transition-all hover:-translate-y-1 hover:shadow-glow-lg">
            <CardContent className="relative p-0">
              <div className="grid gap-0 sm:grid-cols-[1.35fr_0.85fr]">
                <div className="relative min-h-[200px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={makeStudioShot("orb")}
                    alt="Core light"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-black/40 text-white backdrop-blur-md keep-bright">
                      <ImageIcon className="h-4 w-4" />
                    </span>
                    <Badge className="keep-bright border-white/20 bg-black/35 text-white">
                      Live studio
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-semibold keep-bright text-white">
                      AI Images
                    </h3>
                    <p className="mt-1 text-sm keep-bright text-white/80">
                      Create original images in seconds
                    </p>
                  </div>
                </div>
                <div className="grid grid-rows-3">
                  {studioGallery.slice(1).map((shot, index) => (
                    <div
                      key={shot.kind}
                      className="relative overflow-hidden border-t border-white/10 sm:border-l sm:border-t-0 sm:border-white/10"
                      style={{ borderTopWidth: index === 0 ? 0 : undefined }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={makeStudioShot(shot.kind)}
                        alt={shot.title}
                        className="h-[72px] w-full object-cover sm:h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />
                      <p className="absolute bottom-2 left-3 text-xs font-medium keep-bright text-white">
                        {shot.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  );
}

function MiniCard({
  href,
  title,
  copy,
  icon: Icon,
  delay,
  badge,
  success,
}: {
  href: string;
  title: string;
  copy: string;
  icon: typeof PenLine;
  delay: number;
  badge: string;
  success?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link href={href} className="block h-full">
        <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-glow">
          <CardContent className="relative flex h-full flex-col justify-between p-6">
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <Badge variant={success ? "success" : "secondary"}>{badge}</Badge>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{copy}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
