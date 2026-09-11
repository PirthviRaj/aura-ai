"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { signIn } from "@/lib/auth";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const next = params.get("next") || "/dashboard";

  useEffect(() => {
    if (params.get("error") === "oauth") {
      toast.error("Social sign-in failed. Try again or use email.");
    }
  }, [params]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);

    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error(error.message);
        setBusy(false);
        return;
      }
    } else {
      const response = await fetch("/api/db/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        // fallback to legacy localStorage auth
        const result = signIn(email, password);
        if (!result.ok) {
          toast.error(payload.error || result.error);
          setBusy(false);
          return;
        }
      } else if (payload.session) {
        const { setSession } = await import("@/lib/auth");
        setSession(payload.session);
      }
    }

    toast.success("Access granted");
    router.push(next);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
      <Card className="w-full">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold text-foreground">Sign in to Aura</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Use your workspace email and password to continue.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Checking access…" : "Log in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-500">
            New to Aura?{" "}
            <Link href="/signup" className="text-primary">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm text-zinc-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
