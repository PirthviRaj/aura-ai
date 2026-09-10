"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";

export function PulseAvatar({
  initials,
  className,
  size = 40,
}: {
  initials: string;
  className?: string;
  size?: number;
}) {
  const id = useId().replace(/:/g, "");
  const mark = initials.slice(0, 2).toUpperCase() || "AU";

  return (
    <motion.div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
    >
      <motion.span
        className="absolute inset-[-6px] rounded-full bg-primary/40 blur-md"
        animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.86, 1.12, 0.86] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg
        viewBox="0 0 40 40"
        className="absolute inset-0"
        aria-hidden
      >
        <defs>
          <linearGradient id={`ava-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffb087" />
            <stop offset="50%" stopColor="#ff4d00" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill="#1a120c" />
        <motion.circle
          cx="20"
          cy="20"
          r="17"
          fill="none"
          stroke={`url(#ava-${id})`}
          strokeWidth="1.6"
          strokeDasharray="20 12"
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "20px 20px" }}
        />
        <motion.circle
          cx="20"
          cy="20"
          r="12.5"
          fill="none"
          stroke="#ffd4b8"
          strokeOpacity="0.55"
          strokeWidth="0.8"
          strokeDasharray="7 10"
          animate={{ rotate: -360 }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "20px 20px" }}
        />
      </svg>
      <motion.span
        className="keep-bright relative z-10 text-[11px] font-bold tracking-wide text-white"
        animate={{ opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {mark}
      </motion.span>
    </motion.div>
  );
}
