"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  LayoutDashboard,
  LayoutTemplate,
  Workflow,
  MessageSquare,
  ImageIcon,
  AudioLines,
  PenLine,
  CreditCard,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { AuraLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/collections", label: "Collections", icon: FolderKanban },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/writer", label: "AI Blog Writer", icon: PenLine },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/chat", label: "Aura Chat", icon: MessageSquare },
  { href: "/images", label: "AI Image", icon: ImageIcon },
  { href: "/brand-voice", label: "Brand Voice", icon: AudioLines },
];

const footerNav = [
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",
          open ? "block" : "hidden",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-white/[0.06] bg-background/90 px-3 py-4 backdrop-blur-xl transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <Link href="/dashboard" onClick={onClose}>
            <AuraLogo />
          </Link>
          <button
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {primaryNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-primary/15 text-white shadow-[inset_0_0_0_1px_rgba(168,85,247,0.25)]"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-primary" : "text-zinc-500 group-hover:text-zinc-200",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/25 to-[#12081d] p-4">
            <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-primary/30 blur-2xl" />
            <div className="relative">
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-orange-200">
                <Sparkles className="h-3.5 w-3.5" />
                Unlock the lab
              </div>
              <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                6,000-word articles, brand voice, and unlimited Aura Chat.
              </p>
              <Button asChild size="sm" className="mt-3 w-full">
                <Link href="/billing" onClick={onClose}>
                  Upgrade now
                </Link>
              </Button>
            </div>
          </div>

          {footerNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                  active
                    ? "text-white"
                    : "text-zinc-500 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
