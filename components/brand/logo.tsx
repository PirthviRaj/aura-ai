"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";

export function AuraLogo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  const id = useId().replace(/:/g, "");

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative grid h-9 w-9 place-items-center">
        <motion.span
          className="absolute inset-[-4px] rounded-full bg-primary/40 blur-md"
          animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.92, 1.08, 0.92] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <svg viewBox="0 0 36 36" className="relative h-9 w-9" aria-hidden>
          <defs>
            <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffb087" />
              <stop offset="50%" stopColor="#ff4d00" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="15.2" fill="#121212" stroke={`url(#ring-${id})`} strokeWidth="1.3" />
          <motion.circle
            cx="18"
            cy="18"
            r="11.4"
            fill="none"
            stroke={`url(#ring-${id})`}
            strokeWidth="1.1"
            strokeDasharray="18 10"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "18px 18px" }}
          />
          <motion.circle
            cx="18"
            cy="18"
            r="7.2"
            fill="none"
            stroke="#ff7a33"
            strokeWidth="0.8"
            strokeDasharray="8 12"
            animate={{ rotate: -360 }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "18px 18px" }}
          />
          <motion.circle
            cx="18"
            cy="18"
            r="3.1"
            fill="#ffd4b8"
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "18px 18px" }}
          />
        </svg>
      </div>
      {showWordmark ? (
        <span className="text-[17px] font-semibold tracking-tight text-foreground">
          Aura{" "}
          <span className="bg-gradient-to-r from-orange-200 via-primary to-orange-500 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer-text">
            AI
          </span>
        </span>
      ) : null}
    </div>
  );
}
