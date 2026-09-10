function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapLines(text: string, max = 34, limit = 3) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) {
      lines.push(current);
      current = word;
      if (lines.length >= limit) break;
    } else {
      current = next;
    }
  }
  if (current && lines.length < limit) lines.push(current);
  if (words.join(" ").length > lines.join(" ").length) {
    const last = lines[lines.length - 1] ?? "";
    lines[lines.length - 1] = `${last.slice(0, Math.max(0, max - 1))}…`;
  }
  return lines;
}

type Scene =
  | "dashboard"
  | "research"
  | "glass"
  | "constellation"
  | "product"
  | "office"
  | "orb"
  | "abstract";

function detectScene(prompt: string): Scene {
  const p = prompt.toLowerCase();
  if (/(dashboard|crm|analytics|chart|kpi|saas|ui|interface)/.test(p)) {
    return "dashboard";
  }
  if (/(keyword|research|seo|search|cluster|ranking)/.test(p)) {
    return "research";
  }
  if (/(glass|floating|void|hologram|transparent)/.test(p)) {
    return "glass";
  }
  if (/(constellation|stars|sky|galaxy|network)/.test(p)) {
    return "constellation";
  }
  if (/(product|still|packshot|device|phone|laptop)/.test(p)) {
    return "product";
  }
  if (/(office|desk|editor|writer|strategist|editorial)/.test(p)) {
    return "office";
  }
  if (/(orb|sphere|core|glow|energy|laboratory)/.test(p)) {
    return "orb";
  }
  return "abstract";
}

function palette(seed: number) {
  const hues = [18, 28, 8, 35, 12, 22];
  const h = hues[seed % hues.length];
  return {
    bg0: `hsl(${h} 42% 8%)`,
    bg1: `hsl(${(h + 40) % 360} 55% 16%)`,
    accent: `hsl(${h} 90% 68%)`,
    accent2: `hsl(${(h + 50) % 360} 85% 62%)`,
    soft: `hsl(${h} 40% 88%)`,
    ink: "#f8fafc",
  };
}

function sceneMarkup(scene: Scene, colors: ReturnType<typeof palette>, seed: number) {
  const drift = (seed % 40) - 20;
  switch (scene) {
    case "dashboard":
      return `
        <rect x="90" y="110" width="620" height="340" rx="22" fill="#0b1220" stroke="${colors.accent}" stroke-opacity=".55"/>
        <rect x="120" y="145" width="170" height="100" rx="14" fill="${colors.accent}" fill-opacity=".35"/>
        <rect x="310" y="145" width="170" height="100" rx="14" fill="#ffffff" fill-opacity=".08"/>
        <rect x="500" y="145" width="180" height="100" rx="14" fill="#ffffff" fill-opacity=".06"/>
        <rect x="120" y="270" width="560" height="140" rx="16" fill="#ffffff" fill-opacity=".06"/>
        <path d="M150 370 L230 320 L310 340 L420 280 L520 310 L640 250" fill="none" stroke="${colors.accent2}" stroke-width="4"/>
        <circle cx="640" cy="250" r="7" fill="${colors.accent2}"/>`;
    case "research":
      return `
        <g stroke="${colors.accent}" stroke-opacity=".7" fill="${colors.soft}">
          <path d="M120 390 L240 210 L390 270 L560 140 L700 300" fill="none" stroke-width="2.5"/>
          <circle cx="120" cy="390" r="7"/><circle cx="240" cy="210" r="9"/>
          <circle cx="390" cy="270" r="8"/><circle cx="560" cy="140" r="10"/>
          <circle cx="700" cy="300" r="7"/>
          <path d="M240 210 L330 420 L390 270" fill="none" stroke-width="1.6"/>
        </g>
        <rect x="470" y="340" width="220" height="90" rx="14" fill="#ffffff" fill-opacity=".08" stroke="${colors.accent}" stroke-opacity=".35"/>
        <text x="490" y="375" fill="${colors.soft}" font-size="16" font-family="Segoe UI, Arial">SERP cluster</text>
        <text x="490" y="400" fill="${colors.accent2}" font-size="13" font-family="Segoe UI, Arial">intent map</text>`;
    case "glass":
      return `
        <rect x="160" y="100" width="480" height="300" rx="28" fill="#ffffff" fill-opacity=".09" stroke="${colors.soft}" stroke-opacity=".4"/>
        <rect x="200" y="145" width="150" height="80" rx="14" fill="${colors.accent}" fill-opacity=".45"/>
        <rect x="370" y="145" width="230" height="80" rx="14" fill="#ffffff" fill-opacity=".08"/>
        <rect x="200" y="245" width="400" height="110" rx="16" fill="#ffffff" fill-opacity=".07"/>
        <path d="M230 320 L310 280 L390 300 L490 250 L560 275" fill="none" stroke="${colors.accent2}" stroke-width="4"/>
        <circle cx="640" cy="120" r="36" fill="${colors.accent}" fill-opacity=".35"/>`;
    case "constellation":
      return `
        <g stroke="${colors.accent2}" stroke-opacity=".65" fill="${colors.soft}">
          <path d="M100 420 L220 180 L400 250 L580 110 L720 320" fill="none" stroke-width="2"/>
          <circle cx="100" cy="420" r="5"/><circle cx="220" cy="180" r="8"/>
          <circle cx="400" cy="250" r="6"/><circle cx="580" cy="110" r="9"/>
          <circle cx="720" cy="320" r="5"/><circle cx="310" cy="390" r="4"/>
        </g>
        <circle cx="150" cy="90" r="2" fill="#fff"/><circle cx="480" cy="70" r="1.5" fill="#fff"/>
        <circle cx="690" cy="180" r="2" fill="#fff"/>`;
    case "product":
      return `
        <ellipse cx="400" cy="430" rx="180" ry="28" fill="#000" fill-opacity=".35"/>
        <rect x="290" y="150" width="220" height="250" rx="28" fill="#111827" stroke="${colors.accent}" stroke-width="3"/>
        <rect x="310" y="175" width="180" height="180" rx="16" fill="${colors.bg1}"/>
        <circle cx="400" cy="265" r="42" fill="${colors.accent}" fill-opacity=".8"/>
        <rect x="360" y="370" width="80" height="8" rx="4" fill="${colors.soft}" fill-opacity=".4"/>`;
    case "office":
      return `
        <rect x="70" y="280" width="300" height="180" rx="14" fill="${colors.soft}"/>
        <rect x="95" y="305" width="190" height="10" rx="5" fill="${colors.accent}" fill-opacity=".55"/>
        <rect x="95" y="330" width="240" height="8" rx="4" fill="#fdba74"/>
        <rect x="95" y="350" width="210" height="8" rx="4" fill="#fed7aa"/>
        <rect x="430" y="170" width="260" height="170" rx="18" fill="#111018" stroke="${colors.accent}"/>
        <circle cx="${620 + drift}" cy="120" r="26" fill="${colors.accent2}"/>
        <path d="M${620 + drift} 146 L${590 + drift} 230" stroke="${colors.accent2}" stroke-width="6"/>`;
    case "orb":
      return `
        <circle cx="${340 + drift}" cy="250" r="150" fill="${colors.accent}" fill-opacity=".85"/>
        <circle cx="${340 + drift}" cy="250" r="190" fill="none" stroke="${colors.soft}" stroke-opacity=".3"/>
        <circle cx="620" cy="400" r="80" fill="${colors.accent2}" fill-opacity=".25"/>
        <path d="M80 430 C180 280 280 470 420 300 S680 220 740 340" fill="none" stroke="${colors.soft}" stroke-opacity=".4" stroke-width="2"/>`;
    default:
      return `
        <path d="M80 420 C200 ${260 + drift} 320 480 460 ${300 + drift} S700 200 760 360" fill="none" stroke="${colors.accent}" stroke-width="3"/>
        <circle cx="${280 + drift}" cy="220" r="90" fill="${colors.accent2}" fill-opacity=".35"/>
        <circle cx="560" cy="300" r="120" fill="${colors.accent}" fill-opacity=".2"/>
        <rect x="140" y="140" width="180" height="110" rx="18" fill="#ffffff" fill-opacity=".07" stroke="${colors.soft}" stroke-opacity=".25"/>`;
  }
}

/** Offline fallback that still reflects the prompt (scene + title). */
export function makeArtDataUrl(prompt: string) {
  const text = (prompt || "Aura studio frame").trim();
  const seed = hash(text);
  const scene = detectScene(text);
  const colors = palette(seed);
  const lines = wrapLines(text);
  const titleY = 48;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.bg1}"/>
      <stop offset="100%" stop-color="${colors.bg0}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="560" fill="url(#bg)"/>
  <circle cx="700" cy="60" r="120" fill="${colors.accent}" fill-opacity=".18"/>
  ${sceneMarkup(scene, colors, seed)}
  <rect x="36" y="24" width="728" height="${36 + lines.length * 28}" rx="16" fill="#000000" fill-opacity=".35"/>
  ${lines
    .map(
      (line, index) =>
        `<text x="56" y="${titleY + index * 28}" fill="${colors.ink}" font-size="22" font-family="Segoe UI, Arial, sans-serif" font-weight="600">${escapeXml(line)}</text>`,
    )
    .join("\n  ")}
  <text x="56" y="530" fill="${colors.soft}" fill-opacity=".7" font-size="13" font-family="Segoe UI, Arial">${escapeXml(scene)} · aura studio</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function promptSeed(prompt: string) {
  return hash(prompt || "aura") % 1_000_000;
}

export function buildImagePrompt(prompt: string) {
  const clean = prompt.trim().replace(/\s+/g, " ");
  return `${clean}. Highly detailed, sharp focus, coherent composition that literally matches the subject described, no watermark, no text overlay unless the prompt asks for text`;
}

export function pollinationsUrl(prompt: string, seed?: number) {
  const finalSeed = seed ?? promptSeed(prompt) ^ Date.now();
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    buildImagePrompt(prompt),
  )}?width=1280&height=720&nologo=true&enhance=true&seed=${finalSeed}`;
}

export type StudioKind = "orb" | "desk" | "constellation" | "glass";

export const studioGallery: { kind: StudioKind; title: string }[] = [
  { kind: "orb", title: "Core light" },
  { kind: "desk", title: "Editor desk" },
  { kind: "constellation", title: "Keyword sky" },
  { kind: "glass", title: "Live dashboard" },
];

export function makeStudioShot(kind: StudioKind) {
  const prompts: Record<StudioKind, string> = {
    orb: "ember laboratory energy orb",
    desk: "editorial content strategist desk",
    constellation: "SEO keyword constellation map",
    glass: "glass analytics dashboard floating in void",
  };
  return makeArtDataUrl(prompts[kind]);
}
