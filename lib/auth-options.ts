import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import { upsertOAuthUser } from "@/lib/db/store";

function env(name: string) {
  return process.env[name]?.trim() || undefined;
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(env("GOOGLE_CLIENT_ID") && env("GOOGLE_CLIENT_SECRET")
      ? [
          GoogleProvider({
            clientId: env("GOOGLE_CLIENT_ID")!,
            clientSecret: env("GOOGLE_CLIENT_SECRET")!,
            authorization: {
              params: { prompt: "select_account", access_type: "offline" },
            },
          }),
        ]
      : []),
    ...(env("GITHUB_CLIENT_ID") && env("GITHUB_CLIENT_SECRET")
      ? [
          GitHubProvider({
            clientId: env("GITHUB_CLIENT_ID")!,
            clientSecret: env("GITHUB_CLIENT_SECRET")!,
          }),
        ]
      : []),
    ...(env("AZURE_AD_CLIENT_ID") && env("AZURE_AD_CLIENT_SECRET")
      ? [
          AzureADProvider({
            clientId: env("AZURE_AD_CLIENT_ID")!,
            clientSecret: env("AZURE_AD_CLIENT_SECRET")!,
            tenantId: env("AZURE_AD_TENANT_ID") || "common",
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  secret: env("NEXTAUTH_SECRET") || env("AUTH_SECRET"),
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email || !account?.provider) return false;
      const provider = mapProvider(account.provider);
      if (!provider) return false;

      const result = await upsertOAuthUser({
        provider,
        email: user.email,
        name: user.name || user.email.split("@")[0] || "Aura User",
      });
      return result.ok;
    },
    async jwt({ token, user, account }) {
      if (account?.provider) {
        token.oauthProvider = mapProvider(account.provider) || undefined;
      }
      if (user?.email) token.email = user.email;
      if (user?.name) token.name = user.name;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) || session.user.email;
        session.user.name = (token.name as string) || session.user.name;
      }
      (session as { oauthProvider?: string }).oauthProvider =
        token.oauthProvider as string | undefined;
      return session;
    },
  },
};

function mapProvider(provider: string): "google" | "github" | "microsoft" | null {
  if (provider === "google") return "google";
  if (provider === "github") return "github";
  if (provider === "azure-ad") return "microsoft";
  return null;
}

export function configuredOAuthProviders() {
  return {
    google: Boolean(env("GOOGLE_CLIENT_ID") && env("GOOGLE_CLIENT_SECRET")),
    github: Boolean(env("GITHUB_CLIENT_ID") && env("GITHUB_CLIENT_SECRET")),
    microsoft: Boolean(env("AZURE_AD_CLIENT_ID") && env("AZURE_AD_CLIENT_SECRET")),
  };
}
