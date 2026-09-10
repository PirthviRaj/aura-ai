import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tiers = [
  {
    name: "Starter",
    price: "$19",
    features: [
      "Core writing workspace",
      "SEO score on every draft",
      "Collections for campaign assets",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    features: [
      "Expanded generation capacity",
      "Aura Chat + document research",
      "Brand Voice + AI Images",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "SSO & audit-ready controls",
      "Private model routing options",
      "Dedicated success engagement",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold text-white">
          Commercial access plans
        </h1>
        <p className="mt-3 text-zinc-400">
          Structured tiers for SEO and content operations teams. Scale capacity
          and intelligence routing as the engagement grows.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.name} className={tier.highlight ? "border-glow" : ""}>
            <CardContent className="p-6">
              <p className="text-sm text-zinc-400">{tier.name}</p>
              <p className="mt-3 text-4xl font-semibold text-white">{tier.price}</p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-400">
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full">
                <Link href="/signup">Select {tier.name}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
