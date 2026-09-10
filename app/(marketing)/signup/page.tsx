"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SocialAuthButtons } from "@/components/auth/social-buttons";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { signUp } from "@/lib/auth";
import { toast } from "sonner";

const roles = [
  "Founder / Operator",
  "SEO Lead",
  "Content Strategist",
  "Agency",
  "Marketing",
  "Developer",
];

const selectClass =
  "flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

export default function SignupPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [terms, setTerms] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!terms) {
      toast.error("Accept the terms to create an account.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            role: form.role,
          },
        },
      });
      if (error) {
        toast.error(error.message);
        setBusy(false);
        return;
      }
    } else {
      const result = signUp(form);
      if (!result.ok) {
        toast.error(result.error);
        setBusy(false);
        return;
      }
    }

    toast.success("Account created. Welcome to the lab.");
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-2xl items-center px-4 py-12">
      <Card className="w-full">
        <CardContent className="p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-foreground">Create workspace access</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isSupabaseConfigured()
              ? "Enroll with Google, GitHub, Microsoft, or work email via secured auth."
              : "Complete enrollment with a provider or work email to unlock the platform modules."}
          </p>

          <div className="mt-6">
            <SocialAuthButtons next="/dashboard" />
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-zinc-500">
            <span className="h-px flex-1 bg-white/10" />
            or continue with email
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor="firstName">
                <Input
                  id="firstName"
                  required
                  autoComplete="given-name"
                  placeholder="Aria"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </Field>
              <Field label="Last name" htmlFor="lastName">
                <Input
                  id="lastName"
                  required
                  autoComplete="family-name"
                  placeholder="Reynolds"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Work email" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Password" htmlFor="password">
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                />
              </Field>
              <Field label="Confirm password" htmlFor="confirmPassword">
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Role" htmlFor="role">
              <select
                id="role"
                required
                className={selectClass}
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
              >
                <option value="" className="bg-[#141418]">
                  Select your role
                </option>
                {roles.map((role) => (
                  <option key={role} value={role} className="bg-[#141418]">
                    {role}
                  </option>
                ))}
              </select>
            </Field>

            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-1 accent-[#ff4d00]"
              />
              <span>
                I agree to the Aura AI terms, privacy policy, and receiving
                product updates for this workspace.
              </span>
            </label>

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Provisioning…" : "Create workspace"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-500">
            Already have access?{" "}
            <Link href="/login" className="text-primary">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
