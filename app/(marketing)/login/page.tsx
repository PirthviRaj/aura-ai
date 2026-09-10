"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SocialAuthButtons } from "@/components/auth/social-buttons";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
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
      const result = signIn(email, password);
      if (!result.ok) {
        toast.error(result.error);
        setBusy(false);
        return;
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
            {isSupabaseConfigured()
              ? "Authenticate with a connected provider or workspace credentials."
              : "Continue with a provider, or use the credentials issued at enrollment."}
          </p>

          <div className="mt-6">
            <SocialAuthButtons next={next} />
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-zinc-500">
            <span className="h-px flex-1 bg-white/10" />
            or email
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
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
