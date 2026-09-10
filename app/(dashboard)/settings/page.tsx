"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getSession, type AuraSession } from "@/lib/auth";
import { toast } from "sonner";

export default function SettingsPage() {
  const [session, setSession] = useState<AuraSession | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue={session?.name ?? ""} key={session?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue={session?.role ?? ""} key={session?.role} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workspace">Workspace name</Label>
            <Input
              id="workspace"
              defaultValue={session?.company ?? "Aura Laboratory"}
              key={session?.company}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Owner email</Label>
            <Input id="email" defaultValue={session?.email ?? ""} key={session?.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              defaultValue={session?.website ?? ""}
              key={session?.website}
            />
          </div>
          <p className="text-xs text-zinc-500">
            Plan: {session?.plan ?? "Pro"} · Team: {session?.teamSize ?? "Just me"} · Sign-in:{" "}
            {session?.provider ?? "email"}
          </p>
          <div className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-3">
            <div>
              <p className="text-sm text-white">Autopilot publishing</p>
              <p className="text-xs text-zinc-500">
                Queue daily articles after SEO score exceeds 80
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
