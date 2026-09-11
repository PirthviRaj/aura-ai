const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "..", ".env.local");
const t = fs.readFileSync(file, "utf8");
for (const k of [
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]) {
  const m = t.match(new RegExp("^" + k + "=(.*)$", "m"));
  const raw = (m && m[1] ? m[1] : "").trim();
  const v = raw.replace(/^"|"$/g, "").replace(/^'|'$/g, "").trim();
  console.log(k + ": " + (v ? "OK" : "MISSING"));
}
