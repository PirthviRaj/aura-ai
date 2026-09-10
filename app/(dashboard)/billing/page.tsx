import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    price: "$19",
    detail: "250k words · 1 brand voice",
  },
  {
    name: "Pro",
    price: "$49",
    detail: "2.5M words · Aura Chat · AI images",
    current: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    detail: "SSO, seats, and private models",
  },
];

export default function BillingPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Billing</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Current plan: Pro. Upgrade for more seats and private inference.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.current ? "border-glow" : ""}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-white">{plan.name}</h2>
                {plan.current ? <Badge variant="success">Current</Badge> : null}
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{plan.price}</p>
              <p className="mt-2 text-sm text-zinc-400">{plan.detail}</p>
              <Button className="mt-5 w-full" variant={plan.current ? "secondary" : "default"}>
                {plan.current ? "Manage plan" : "Upgrade to Pro"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
