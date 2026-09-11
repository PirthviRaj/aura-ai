const fs = require("fs");
const t = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "";
for (const k of [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "AZURE_AD_CLIENT_ID",
  "AZURE_AD_CLIENT_SECRET",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
]) {
  const m = t.match(new RegExp("^" + k + "=(.*)$", "m"));
  const raw = (m && m[1] ? m[1] : "").trim();
  const v = raw.replace(/^["']|["']$/g, "");
  console.log(k + ": " + (v ? "SET" : "MISSING"));
}
