"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "@/components/theme/theme-provider";
import { Toaster } from "sonner";

function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="top-center"
      toastOptions={{
        style: {
          background: theme === "light" ? "#ffffff" : "#141418",
          border:
            theme === "light"
              ? "1px solid rgba(124,58,237,0.2)"
              : "1px solid rgba(168,85,247,0.25)",
          color: theme === "light" ? "#18181b" : "#f4f4f5",
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        {children}
        <ThemedToaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
