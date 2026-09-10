"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";

export function MoodToggle() {
  const { theme, toggleTheme } = useTheme();
  const light = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={light ? "Switch to dark mood" : "Switch to light mood"}
      className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/5 transition-colors hover:border-primary/40"
    >
      <motion.span
        className="absolute inset-0"
        animate={{
          background: light
            ? "radial-gradient(circle at 30% 20%, rgba(250,204,21,0.35), transparent 60%)"
            : "radial-gradient(circle at 70% 80%, rgba(168,85,247,0.4), transparent 62%)",
        }}
      />
      <motion.span
        key={theme}
        initial={{ rotate: -80, scale: 0.4, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="relative"
      >
        {light ? (
          <Sun className="h-4 w-4 text-amber-500" />
        ) : (
          <Moon className="h-4 w-4 text-orange-200" />
        )}
      </motion.span>
    </button>
  );
}
