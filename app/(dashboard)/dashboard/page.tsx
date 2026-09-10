import { BentoGrid } from "@/components/dashboard/bento-grid";
import { StatsFooter } from "@/components/dashboard/stats-footer";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">
          Workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Launch a long-form draft, train voice, or generate visuals from one
          laboratory.
        </p>
      </div>
      <BentoGrid />
      <StatsFooter />
    </div>
  );
}
