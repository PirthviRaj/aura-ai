"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { AuthGate } from "@/components/auth/auth-gate";
import { AmbientField } from "@/components/effects/ambient-field";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AuthGate>
      <div className="relative min-h-screen overflow-hidden bg-background transition-colors duration-700">
        <AmbientField />
        <div className="relative z-10">
          <Sidebar open={open} onClose={() => setOpen(false)} />
          <div className="lg:pl-[248px]">
            <TopBar onMenu={() => setOpen(true)} />
            <main className="min-h-[calc(100vh-73px)] p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
