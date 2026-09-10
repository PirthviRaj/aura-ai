import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/landing-sections";
import { AmbientField } from "@/components/effects/ambient-field";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background transition-colors duration-700">
      <AmbientField />
      <div className="relative z-10">
        <LandingNavbar />
        {children}
        <LandingFooter />
      </div>
    </div>
  );
}
