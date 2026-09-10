"use client";

import { cn } from "@/lib/utils";

const particles = [
  { left: "8%", top: "18%", delay: "0s", size: "2px" },
  { left: "22%", top: "72%", delay: "1.2s", size: "3px" },
  { left: "38%", top: "28%", delay: "0.4s", size: "2px" },
  { left: "54%", top: "64%", delay: "2s", size: "2px" },
  { left: "68%", top: "16%", delay: "0.8s", size: "3px" },
  { left: "81%", top: "48%", delay: "1.6s", size: "2px" },
  { left: "91%", top: "78%", delay: "0.2s", size: "2px" },
  { left: "14%", top: "46%", delay: "2.4s", size: "3px" },
];

export function AmbientField({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="aura-orb -left-24 top-10 h-72 w-72 bg-primary/20" />
      <div className="aura-orb animation-delay-2000 right-0 top-32 h-80 w-80 bg-orange-600/20" />
      <div className="aura-orb animation-delay-4000 bottom-0 left-1/3 h-64 w-64 bg-amber-500/10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,77,0,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,77,0,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      {particles.map((particle) => (
        <span
          key={`${particle.left}-${particle.top}`}
          className="absolute rounded-full bg-orange-200 shadow-[0_0_12px_rgba(255,90,20,0.9)] animate-particle"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}
