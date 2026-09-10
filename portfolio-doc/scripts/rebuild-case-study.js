/**
 * Rebuild Aura AI case study HTML with:
 * - stronger slide-1 brand header
 * - crisp CSS vector MacBook + iPhone (retina-sharp)
 * - light theme screen UIs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "Aura-AI-Product-Case-Study.html");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Aura AI</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #f4f1ec;
      --bg-2: #ffffff;
      --line: rgba(20, 16, 12, 0.1);
      --text: #16120f;
      --muted: #6b645c;
      --accent: #ff4d00;
      --accent-2: #e64500;
      --mint: #059669;
      --screen: #ffffff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; scroll-snap-type: y mandatory; }
    body {
      font-family: "Manrope", sans-serif;
      background: var(--bg);
      color: var(--text);
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    .slide {
      min-height: 100vh;
      scroll-snap-align: start;
      position: relative;
      padding: 0 0 40px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    .slide::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 55% 42% at 85% 0%, rgba(255,77,0,0.12), transparent 55%),
        radial-gradient(ellipse 40% 35% at 5% 100%, rgba(255,122,51,0.08), transparent 50%),
        linear-gradient(180deg, #faf8f5 0%, #f0ebe4 100%);
      pointer-events: none;
    }
    .slide > * { position: relative; z-index: 1; }
    .wrap {
      max-width: 1180px;
      margin: 0 auto;
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 20px clamp(18px, 4vw, 56px) 0;
      min-height: 0;
    }
    .wrap.hero-layout,
    .wrap.split-visual {
      display: grid;
      align-content: center;
    }

    .topbar {
      position: relative;
      z-index: 2;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px clamp(18px, 4vw, 56px);
      background:
        linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,248,242,0.94) 55%, rgba(255,77,0,0.08) 100%);
      border-bottom: 1px solid rgba(20, 16, 12, 0.08);
    }
    .topbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .topbar-mark {
      width: 30px; height: 30px;
      border-radius: 9px;
      background: linear-gradient(145deg, #ff8a4c, #ff4d00 55%, #c2410c);
      box-shadow: 0 6px 16px rgba(255,77,0,0.28);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .topbar-mark span {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: #fff;
      box-shadow: inset 0 0 0 2px rgba(255,255,255,0.35);
    }
    .topbar-brand strong {
      font-family: "Space Grotesk", sans-serif;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #16120f;
      line-height: 1;
    }
    .topbar-brand em {
      display: block;
      margin-top: 3px;
      font-style: normal;
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 700;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .topbar-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 11px;
      border-radius: 999px;
      background: #16120f;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .topbar-chip i {
      width: 6px; height: 6px; border-radius: 50%;
      background: #ff4d00;
      box-shadow: 0 0 0 3px rgba(255,77,0,0.25);
      display: inline-block;
    }
    .topbar-tag {
      padding: 6px 11px;
      border-radius: 999px;
      border: 1px solid rgba(255,77,0,0.28);
      background: #fff;
      color: var(--accent-2);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .eyebrow {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 12px;
    }
    .brand-mark {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }
    .brand-mark .orb {
      width: 28px; height: 28px; border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #ffd4b8, #ff4d00 55%, #9a3412);
      box-shadow: 0 8px 18px rgba(255,77,0,0.28);
      flex-shrink: 0;
    }
    .brand-mark .name {
      font-family: "Space Grotesk", sans-serif;
      font-size: clamp(34px, 5vw, 52px);
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1;
      color: var(--text);
    }
    h1 {
      font-family: "Space Grotesk", sans-serif;
      font-size: clamp(22px, 2.6vw, 30px);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.15;
      max-width: 22ch;
      margin-bottom: 12px;
      color: var(--text);
    }
    h2 {
      font-family: "Space Grotesk", sans-serif;
      font-size: clamp(22px, 2.8vw, 34px);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.12;
      margin-bottom: 10px;
      max-width: 22ch;
      color: var(--text);
    }
    .accent {
      background: linear-gradient(90deg, #ff7a33, #ff4d00);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .lead, .body-copy {
      color: var(--muted);
      font-size: clamp(13px, 1.15vw, 15px);
      line-height: 1.65;
      max-width: 48ch;
      margin-bottom: 12px;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 8px; }
    .card {
      background: rgba(255,255,255,0.82);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 16px;
      box-shadow: 0 10px 28px rgba(40, 24, 10, 0.05);
    }
    .card .tag {
      display: block;
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 7px;
      font-weight: 700;
    }
    .card h3 {
      font-family: "Space Grotesk", sans-serif;
      font-size: 15px;
      margin-bottom: 7px;
      color: var(--text);
    }
    .card p, .card li {
      color: var(--muted);
      font-size: 12.5px;
      line-height: 1.5;
    }
    .card ul { list-style: none; display: grid; gap: 6px; margin-top: 6px; }
    .card li { display: flex; gap: 7px; color: #4a433c; }
    .card li::before { content: "▹"; color: var(--accent); flex-shrink: 0; }

    .hero-layout {
      display: grid;
      grid-template-columns: 0.92fr 1.08fr;
      gap: 28px;
      align-items: center;
    }
    .split-visual {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 22px;
      align-items: center;
    }

    .devices {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      position: relative;
    }
    .laptop {
      position: relative;
      width: 100%;
      max-width: 580px;
    }
    .mac-chrome {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 10.2;
      background: linear-gradient(180deg, #d9d9d9 0%, #c4c4c4 42%, #b6b6b6 100%);
      border-radius: 14px 14px 0 0;
      padding: 10px 10px 0;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.65),
        0 28px 48px rgba(40, 20, 8, 0.16);
    }
    .mac-chrome .lid-edge {
      position: absolute; left: 8%; right: 8%; top: 0; height: 2px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent);
    }
    .mac-bezel {
      position: relative;
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      border-radius: 8px 8px 0 0;
      padding: 14px 10px 10px;
      overflow: hidden;
    }
    .mac-cam {
      position: absolute; top: 5px; left: 50%; transform: translateX(-50%);
      width: 6px; height: 6px; border-radius: 50%;
      background: #0d0d0d; box-shadow: inset 0 0 0 1px #2a2a2a;
    }
    .mac-cam::after {
      content: ""; position: absolute; inset: 1.5px; border-radius: 50%;
      background: #1e3a5f; opacity: 0.7;
    }
    .mac-menu {
      height: 18px; background: #f5f5f7; border-radius: 2px 2px 0 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 8px; font-size: 8px; color: #1d1d1f; font-weight: 500;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      font-family: "Space Grotesk", sans-serif;
    }
    .mac-menu .l { display: flex; gap: 8px; align-items: center; }
    .mac-menu .apple { font-size: 11px; line-height: 1; }
    .mac-menu .r { display: flex; gap: 7px; align-items: center; opacity: 0.85; font-size: 7.5px; }
    .laptop-screen-in {
      position: relative;
      z-index: 2;
      width: 100%;
      height: calc(100% - 18px);
      overflow: hidden;
      background: var(--screen);
    }
    .mac-base {
      position: relative;
      height: 12px;
      margin: 0 -1.5% 0;
      background: linear-gradient(180deg, #cfcfcf, #a8a8a8);
      border-radius: 0 0 10px 10px;
      box-shadow: 0 2px 0 #9a9a9a;
    }
    .mac-base::before {
      content: ""; position: absolute; left: 50%; top: 3px; transform: translateX(-50%);
      width: 16%; height: 4px; border-radius: 0 0 3px 3px; background: #8e8e8e;
    }
    .phone-wrap {
      margin-left: -44px;
      margin-bottom: 8px;
      z-index: 4;
      position: relative;
    }
    .phone { position: relative; width: 178px; }
    .phone-chrome {
      position: relative;
      width: 100%;
      aspect-ratio: 9 / 19.4;
      background: linear-gradient(145deg, #ececef 0%, #c9c9cd 45%, #b2b2b6 100%);
      border-radius: 28px;
      padding: 7px;
      box-shadow:
        inset 0 1px 1px rgba(255,255,255,0.75),
        inset 0 -1px 1px rgba(0,0,0,0.12),
        0 22px 40px rgba(40, 20, 8, 0.18);
    }
    .phone-chrome::before,
    .phone-chrome::after {
      content: ""; position: absolute; background: #a8a8ac; border-radius: 2px;
    }
    .phone-chrome::before {
      left: -2px; top: 18%; width: 2px; height: 8%;
      box-shadow: 0 22px 0 #a8a8ac, 0 40px 0 #a8a8ac;
    }
    .phone-chrome::after {
      right: -2px; top: 26%; width: 2px; height: 12%;
    }
    .phone-glass {
      position: relative;
      width: 100%; height: 100%;
      background: #0a0a0a;
      border-radius: 22px;
      overflow: hidden;
    }
    .phone-notch {
      position: absolute; z-index: 5; top: 8px; left: 50%; transform: translateX(-50%);
      width: 38%; height: 18px; background: #0a0a0a; border-radius: 12px;
    }
    .phone-notch::before {
      content: ""; position: absolute; left: 18%; top: 7px; width: 28%; height: 3px;
      background: #1a1a1a; border-radius: 2px;
    }
    .phone-notch::after {
      content: ""; position: absolute; right: 14%; top: 5px; width: 6px; height: 6px;
      border-radius: 50%; background: #12263a; box-shadow: inset 0 0 0 1px #0d1a28;
    }
    .phone-screen-in {
      position: absolute;
      z-index: 2;
      inset: 0;
      overflow: hidden;
      border-radius: 22px;
      background: var(--screen);
      padding: 32px 11px 12px;
    }
    .mini-phone {
      position: relative;
      width: 210px;
      margin: 0 auto;
    }
    .mini-phone .phone-chrome {
      width: 100%;
      box-shadow:
        inset 0 1px 1px rgba(255,255,255,0.75),
        inset 0 -1px 1px rgba(0,0,0,0.12),
        0 18px 32px rgba(40, 20, 8, 0.16);
    }
    .mini-phone .phone-screen-in { padding: 32px 11px 12px; }

    .devices.solo-laptop .phone-wrap { display: none !important; }
    .devices.solo-laptop .laptop { width: min(100%, 700px); max-width: 700px; }
    .devices.solo-phone .laptop { display: none !important; }
    .devices.solo-phone .phone-wrap {
      margin-left: 0;
      display: flex !important;
      justify-content: center;
      width: 100%;
    }
    .devices.solo-phone .phone { width: 236px; }

    /* Crisp light screen UI */
    .dash {
      width: 100%; height: 100%;
      padding: 12px;
      background: linear-gradient(180deg, #fffaf6, #ffffff);
      display: flex; flex-direction: column; gap: 9px; overflow: hidden;
    }
    .dash-top { display: flex; justify-content: space-between; align-items: center; }
    .dash-brand {
      display: flex; align-items: center; gap: 7px;
      font-size: 12px; font-weight: 700;
      font-family: "Space Grotesk", sans-serif;
      color: var(--text);
    }
    .dash-brand i {
      width: 13px; height: 13px; border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #ffd4b8, #ff4d00 60%, #9a3412);
      display: inline-block;
    }
    .pill {
      display: inline-flex; padding: 3px 8px; border-radius: 999px;
      background: rgba(255,77,0,0.1); color: var(--accent-2);
      border: 1px solid rgba(255,77,0,0.25); font-size: 9px; font-weight: 700;
    }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
    .stat {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 10px; padding: 9px;
    }
    .stat b {
      display: block; font-family: "Space Grotesk", sans-serif;
      font-size: 15px; margin-bottom: 2px; color: var(--text);
    }
    .stat span { font-size: 9px; color: var(--muted); }
    .panel {
      flex: 1; min-height: 0;
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 11px; padding: 9px; overflow: hidden;
    }
    .panel h4 {
      font-size: 11px; margin-bottom: 7px;
      font-family: "Space Grotesk", sans-serif; color: var(--text);
    }
    .row {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 9.5px; color: #4a433c;
      padding: 6px 0; border-bottom: 1px solid rgba(20,16,12,0.06);
    }
    .row:last-child { border-bottom: none; }
    .row em { font-style: normal; color: var(--mint); font-size: 9px; font-weight: 700; }
    .bars { display: flex; align-items: flex-end; gap: 4px; height: 46px; margin-top: 7px; }
    .bars i {
      flex: 1; border-radius: 2px 2px 0 0;
      background: linear-gradient(180deg, #ff7a33, #ff4d00); opacity: 0.92;
    }
    .writer-layout {
      display: flex; gap: 9px; height: 100%; padding: 11px;
      background: linear-gradient(180deg, #fffaf6, #fff);
    }
    .writer-side {
      width: 28%; border-right: 1px solid var(--line); padding-right: 8px;
    }
    .writer-main { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
    .line { height: 5px; border-radius: 3px; background: rgba(20,16,12,0.08); margin-bottom: 5px; }
    .line.m { width: 82%; }
    .line.s { width: 58%; }
    .score { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
    .ring {
      width: 36px; height: 36px; border-radius: 50%;
      background:
        radial-gradient(circle at center, #fff 55%, transparent 56%),
        conic-gradient(#ff4d00 0 78%, rgba(20,16,12,0.08) 78% 100%);
      display: grid; place-items: center;
      font-size: 10px; font-weight: 700; color: var(--text);
    }

    /* Phone UI — crisp workspace */
    .phone-ui {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: linear-gradient(180deg, #ffffff, #faf7f3);
    }
    .phone-ui .label { font-size: 10px; color: var(--muted); font-weight: 500; }
    .phone-ui .value {
      font-family: "Space Grotesk", sans-serif;
      font-size: 22px; font-weight: 700; margin: 0 0 4px; color: var(--text);
      letter-spacing: -0.03em;
    }
    .phone-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 2px; }
    .phone-stat {
      background: #f4f1ec; border: 1px solid var(--line);
      border-radius: 12px; padding: 8px 9px;
    }
    .phone-stat span { display: block; font-size: 9px; color: var(--muted); margin-bottom: 2px; }
    .phone-stat strong {
      font-family: "Space Grotesk", sans-serif;
      font-size: 16px; color: var(--text); font-weight: 700;
    }
    .activity-label {
      font-size: 10px; color: var(--muted); font-weight: 600; margin: 2px 0 2px;
    }
    .asset-row {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 9px; border-radius: 12px;
      background: #fff; border: 1px solid var(--line);
      margin-bottom: 5px;
      box-shadow: 0 1px 2px rgba(40,24,10,0.03);
    }
    .asset-ico {
      width: 26px; height: 26px; border-radius: 8px;
      display: grid; place-items: center; font-size: 12px;
      background: rgba(255,77,0,0.12); color: var(--accent);
      flex-shrink: 0; font-weight: 700;
    }
    .asset-row .info { flex: 1; min-width: 0; }
    .asset-row .info strong { display: block; font-size: 11px; color: var(--text); font-weight: 700; }
    .asset-row .info span { font-size: 9px; color: var(--muted); }
    .asset-row .amt {
      font-size: 11px; font-weight: 700; color: var(--accent);
      background: rgba(255,77,0,0.1);
      padding: 3px 8px; border-radius: 999px;
    }
    .asset-row .amt.mint { color: var(--mint); background: rgba(5,150,105,0.1); }

    .flow {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 8px; margin-top: 14px;
    }
    .flow-item {
      background: rgba(255,255,255,0.85);
      border: 1px solid var(--line);
      border-radius: 12px; padding: 12px 8px; text-align: center;
    }
    .flow-item .n {
      width: 22px; height: 22px; margin: 0 auto 6px; border-radius: 6px;
      display: grid; place-items: center; font-size: 10px; font-weight: 700;
      color: var(--accent); background: rgba(255,77,0,0.1);
      border: 1px solid rgba(255,77,0,0.25);
    }
    .flow-item strong { display: block; font-size: 11px; margin-bottom: 2px; color: var(--text); }
    .flow-item p { font-size: 10px; color: var(--muted); }

    .stack { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
    .chip {
      border: 1px solid var(--line); background: #fff;
      border-radius: 999px; padding: 6px 11px; font-size: 11px; color: #3f3832;
    }

    .dots {
      position: fixed; right: 16px; top: 50%; transform: translateY(-50%);
      display: flex; flex-direction: column; gap: 9px; z-index: 40;
    }
    .dots a {
      width: 8px; height: 8px; border-radius: 50%;
      border: 1px solid rgba(20,16,12,0.25); display: block; background: transparent;
    }
    .dots a.active {
      background: var(--accent); border-color: var(--accent);
      box-shadow: 0 0 12px rgba(255,77,0,0.35);
    }

    @media (max-width: 960px) {
      .hero-layout, .split-visual, .grid-2, .grid-3, .flow { grid-template-columns: 1fr; }
      .phone-wrap { margin-left: 0; margin-top: 14px; }
      .devices { flex-direction: column; align-items: center; }
      .brand-mark .name { font-size: 40px; }
    }

    @page { size: A4 landscape; margin: 0; }
    @media print {
      .dots { display: none !important; }
      html { scroll-snap-type: none; }
      .slide {
        width: 297mm; height: 210mm; min-height: 210mm; max-height: 210mm;
        page-break-after: always; break-after: page;
        padding: 0 0 12mm;
      }
      .wrap { padding: 10mm 16mm 0; }
      .topbar { padding: 8mm 16mm; }
      .slide:last-child { page-break-after: auto; }
    }
  </style>
</head>
<body>
  <nav class="dots" aria-label="Slides">
    <a href="#s1" class="active"></a><a href="#s2"></a><a href="#s3"></a>
    <a href="#s4"></a><a href="#s5"></a><a href="#s6"></a><a href="#s7"></a>
  </nav>

  <div id="device-kit" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden" aria-hidden="true">
    <div class="devices">
      <div class="laptop">
        <div class="mac-chrome">
          <span class="lid-edge"></span>
          <div class="mac-bezel">
            <span class="mac-cam"></span>
            <div class="mac-menu">
              <div class="l"><span class="apple">&#63743;</span><span>Finder</span></div>
              <div class="r"><span>Wi-Fi</span><span>Sun 1:44 PM</span></div>
            </div>
            <div class="laptop-screen-in">
              <div class="dash">
                <div class="dash-top">
                  <div class="dash-brand"><i></i> Aura Workspace</div>
                  <span class="pill">Live</span>
                </div>
                <div class="stat-grid">
                  <div class="stat"><b>87</b><span>SEO score</span></div>
                  <div class="stat"><b>12</b><span>Collections</span></div>
                </div>
                <div class="panel">
                  <h4>Today · Pipeline</h4>
                  <div class="row"><span>Blog draft — CRM guide</span><em>Ready</em></div>
                  <div class="row"><span>Chat research — intent map</span><em>Ready</em></div>
                  <div class="row"><span>Brand voice — TTS pass</span><em>Queued</em></div>
                  <div class="bars"><i style="height:55%"></i><i style="height:78%"></i><i style="height:42%"></i><i style="height:90%"></i><i style="height:66%"></i><i style="height:48%"></i></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mac-base"></div>
      </div>
      <div class="phone-wrap">
        <div class="phone">
          <div class="phone-chrome">
            <div class="phone-glass">
              <span class="phone-notch"></span>
              <div class="phone-screen-in">
                <div class="phone-ui">
                  <div class="label">Workspace</div>
                  <div class="value">Aura AI</div>
                  <div class="phone-stats">
                    <div class="phone-stat"><span>SEO score</span><strong>87</strong></div>
                    <div class="phone-stat"><span>In review</span><strong>06</strong></div>
                  </div>
                  <div class="activity-label">Today</div>
                  <div class="asset-row"><div class="asset-ico">✎</div><div class="info"><strong>Generate draft</strong><span>Ready</span></div><div class="amt">Go</div></div>
                  <div class="asset-row"><div class="asset-ico">◎</div><div class="info"><strong>Chat research</strong><span>Ready</span></div><div class="amt">Go</div></div>
                  <div class="asset-row"><div class="asset-ico">▤</div><div class="info"><strong>Collections</strong><span>Assets</span></div><div class="amt mint">12</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <section class="slide" id="s1">
    <header class="topbar">
      <div class="topbar-brand">
        <div class="topbar-mark" aria-hidden="true"><span></span></div>
        <div>
          <strong>Aura AI</strong>
          <em>SEO Content Platform</em>
        </div>
      </div>
    </header>
    <div class="wrap hero-layout">
      <div>
        <div class="brand-mark">
          <span class="orb" aria-hidden="true"></span>
          <span class="name">Aura AI</span>
        </div>
        <h1>Rank-ready content operations on <span class="accent">autopilot</span></h1>
        <p class="lead">
          A commissioned SEO content platform for the client — research, drafting, quality scoring,
          brand voice, and campaign visuals inside one authenticated workspace.
        </p>
        <p class="body-copy">
          <strong style="color:var(--text)">AI role:</strong> integrated into Writer, Chat, and Images
          (optional GPT-4o / DALL·E or Pollinations) to draft, research, and generate visuals;
          workflows + SEO scoring automate the path from brief to publish-ready asset.
        </p>
      </div>
      <div data-slot="hero"></div>
    </div>
  </section>

  <section class="slide" id="s2">
    <div class="wrap split-visual">
      <div>
        <p class="eyebrow">01 · Main Motive</p>
        <h2>Give content operations a single system of record</h2>
        <p class="body-copy">
          <strong style="color:var(--text)">Motive:</strong> compress research, drafting, scoring, and asset organization
          into one product surface so SEO teams ship consistently — with quality controls intact.
        </p>
        <div class="grid-3" style="grid-template-columns:1fr;gap:10px">
          <div class="card"><span class="tag">Mission</span><h3>Operationalize SEO content</h3><p>Every input becomes a usable asset — draft, research answer, voice profile, or visual.</p></div>
          <div class="card"><span class="tag">Intent</span><h3>Replace tool sprawl</h3><p>One coherent platform instead of docs + chat tabs + image apps + spreadsheets.</p></div>
          <div class="card"><span class="tag">North star</span><h3>Faster cycle, higher confidence</h3><p>Shorter path from brief to publish-ready draft with reusable collections.</p></div>
        </div>
      </div>
      <div data-slot="motive"></div>
    </div>
  </section>

  <section class="slide" id="s3">
    <div class="wrap split-visual">
      <div data-slot="why"></div>
      <div>
        <p class="eyebrow">02 · Why Built</p>
        <h2>Market friction versus product response</h2>
        <div class="grid-2">
          <div class="card"><span class="tag">Friction</span><h3>Fragmented stack</h3><ul><li>Briefs live in docs</li><li>Research in chat tabs</li><li>Assets scattered</li></ul></div>
          <div class="card"><span class="tag">Response</span><h3>Unified workspace</h3><ul><li>Auth-gated product</li><li>Shared collections</li><li>Score before publish</li></ul></div>
        </div>
      </div>
    </div>
  </section>

  <section class="slide" id="s4">
    <div class="wrap split-visual">
      <div>
        <p class="eyebrow">03 · Business Value</p>
        <h2>Commercial outcomes the product is built to protect</h2>
        <div class="grid-2">
          <div class="card"><span class="tag">Retention</span><h3>Workspace memory</h3><p>Collections and brand voice pull teams back into the same system of record.</p></div>
          <div class="card"><span class="tag">Throughput</span><h3>Shorter cycle time</h3><p>Brief → draft → score → assets without tool-switching tax.</p></div>
          <div class="card"><span class="tag">Quality</span><h3>Publish confidence</h3><p>SEO heuristics and voice checks reduce rewrite loops.</p></div>
          <div class="card"><span class="tag">Scale</span><h3>Repeatable pipelines</h3><p>Templates and workflows encode how the team ships.</p></div>
        </div>
      </div>
      <div data-slot="business"></div>
    </div>
  </section>

  <section class="slide" id="s5">
    <div class="wrap split-visual">
      <div data-slot="journey"></div>
      <div>
        <p class="eyebrow">04 · User Benefits</p>
        <h2>What operators feel day to day</h2>
        <div class="flow">
          <div class="flow-item"><div class="n">1</div><strong>Brief</strong><p>Topic in</p></div>
          <div class="flow-item"><div class="n">2</div><strong>Draft</strong><p>Writer</p></div>
          <div class="flow-item"><div class="n">3</div><strong>Score</strong><p>Editor</p></div>
          <div class="flow-item"><div class="n">4</div><strong>Voice</strong><p>Brand TTS</p></div>
          <div class="flow-item"><div class="n">5</div><strong>Ship</strong><p>Collections</p></div>
        </div>
        <div class="stack">
          <span class="chip">Less context switching</span>
          <span class="chip">Clear next action</span>
          <span class="chip">Reusable assets</span>
        </div>
      </div>
    </div>
  </section>

  <section class="slide" id="s6">
    <div class="wrap split-visual">
      <div>
        <p class="eyebrow">05 · Core Intelligence</p>
        <h2>What AI does — and how it runs</h2>
        <p class="body-copy" style="margin-bottom:12px">
          AI is the production layer inside the workspace —
          it drafts copy, answers research prompts, and creates campaign images on demand.
          Automation comes from templates, workflows, and SEO scoring that move a brief toward a publish-ready asset
          without hopping between tools.
        </p>
        <div class="grid-2">
          <div class="card"><span class="tag">Write</span><h3>Draft generation</h3><p>Topic + template → draft via GPT-4o when keyed; local engine keeps Writer usable without a key.</p></div>
          <div class="card"><span class="tag">Chat</span><h3>Research assistant</h3><p>Intent maps, angles, and outlines through the chat API — same workspace, same session.</p></div>
          <div class="card"><span class="tag">Images</span><h3>Visual generation</h3><p>Prompt → DALL·E 3 or Pollinations; offline path stays prompt-aware so screens never go blank.</p></div>
          <div class="card"><span class="tag">Automate</span><h3>Score + workflows</h3><p>SEO heuristics score structure/intent/depth; templates and workflows repeat the pipeline.</p></div>
        </div>
      </div>
      <div data-slot="intel"></div>
    </div>
  </section>

  <section class="slide" id="s7">
    <div class="wrap split-visual">
      <div>
        <p class="eyebrow">06 · Full Picture</p>
        <h2>Product surface at a glance</h2>
        <div class="grid-2">
          <div class="card"><span class="tag">What</span><h3>Aura AI workspace</h3><p>Marketing, auth, Writer, Templates, Editor, Chat, Brand Voice, Images, Workflows, Collections.</p></div>
          <div class="card"><span class="tag">Who</span><h3>SEO & content teams</h3><p>Operators who need throughput without sacrificing review discipline.</p></div>
          <div class="card"><span class="tag">Stack</span><h3>Next.js · TypeScript</h3><p>App Router, optional Supabase Auth, OpenAI / Pollinations image path.</p></div>
          <div class="card"><span class="tag">Outcome</span><h3>Client deliverable</h3><p>Commissioned commercial product built for the client — AI integrated, workflows automated, not a disconnected demo.</p></div>
        </div>
      </div>
      <div data-slot="full"></div>
    </div>
  </section>

  <script>
    const screens = {
      writer: \`<div class="writer-layout"><div class="writer-side"><div class="dash-brand" style="margin-bottom:10px"><i></i> Writer</div><div class="row"><span>Blog Writer</span></div><div class="row"><span>Templates</span></div><div class="row"><span>Workflows</span></div><div class="row"><span>Collections</span></div></div><div class="writer-main"><span class="pill" style="align-self:flex-start">Topic → Draft</span><div class="panel" style="flex:1"><h4>Best CRM for Small Businesses</h4><div class="line"></div><div class="line m"></div><div class="line s"></div><div class="line"></div><div class="line m"></div><div class="score"><div class="ring">87</div><div style="font-size:9px;color:#6b645c;line-height:1.35">SEO score<br/>Structure · Intent · Depth</div></div></div></div></div>\`,
      modules: \`<div class="dash"><div class="dash-top"><div class="dash-brand"><i></i> Platform</div><span class="pill">Modules</span></div><div class="stat-grid" style="grid-template-columns:1fr 1fr 1fr"><div class="stat"><b style="font-size:12px">Writer</b><span>Draft engine</span></div><div class="stat"><b style="font-size:12px">Chat</b><span>Research</span></div><div class="stat"><b style="font-size:12px">Images</b><span>Visuals</span></div><div class="stat"><b style="font-size:12px">Voice</b><span>Brand TTS</span></div><div class="stat"><b style="font-size:12px">Editor</b><span>SEO score</span></div><div class="stat"><b style="font-size:12px">Flows</b><span>Pipelines</span></div></div><div class="panel"><h4>System health</h4><div class="row"><span>/api/generate</span><em>Online</em></div><div class="row"><span>/api/chat</span><em>Online</em></div><div class="row"><span>/api/images</span><em>Online</em></div></div></div>\`
    };

    function cloneDevices(mode, screenHtml, phoneHtml) {
      const kit = document.querySelector("#device-kit .devices").cloneNode(true);
      kit.classList.remove("solo-laptop", "solo-phone");
      if (mode) kit.classList.add(mode);
      if (screenHtml) {
        const hole = kit.querySelector(".laptop-screen-in");
        if (hole) hole.innerHTML = screenHtml;
      }
      if (phoneHtml) {
        const hole = kit.querySelector(".phone-screen-in");
        if (hole) hole.innerHTML = phoneHtml;
      }
      return kit;
    }

    function miniPhone(html) {
      const wrap = document.createElement("div");
      wrap.className = "mini-phone";
      const phone = document.querySelector("#device-kit .phone").cloneNode(true);
      wrap.appendChild(phone.firstElementChild.cloneNode(true));
      if (html) {
        const screen = wrap.querySelector(".phone-screen-in");
        if (screen) screen.innerHTML = html;
      }
      return wrap;
    }

    const phoneHome = document.querySelector("#device-kit .phone-screen-in").innerHTML;

    const slots = {
      hero: () => cloneDevices("", null, null),
      motive: () => cloneDevices("solo-laptop", screens.writer, null),
      why: () => cloneDevices("solo-phone", null, phoneHome),
      business: () => cloneDevices("solo-laptop", screens.modules, null),
      journey: () => cloneDevices("solo-phone", null, phoneHome),
      intel: () => miniPhone(phoneHome),
      full: () => cloneDevices("solo-laptop", screens.modules, null),
    };

    Object.entries(slots).forEach(([key, fn]) => {
      const el = document.querySelector(\`[data-slot="\${key}"]\`);
      if (el) el.appendChild(fn());
    });

    const slides = [...document.querySelectorAll(".slide")];
    const topbar = document.querySelector("#s1 .topbar");
    if (topbar) {
      slides.slice(1).forEach((slide) => {
        if (!slide.querySelector(".topbar")) {
          slide.insertBefore(topbar.cloneNode(true), slide.firstChild);
        }
      });
    }
    const dots = [...document.querySelectorAll(".dots a")];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = slides.indexOf(entry.target);
        dots.forEach((d, i) => d.classList.toggle("active", i === idx));
      });
    }, { threshold: 0.55 });
    slides.forEach((s) => io.observe(s));
  </script>
</body>
</html>
`;

fs.writeFileSync(htmlPath, html);
console.log("Wrote", htmlPath, Math.round(html.length / 1024) + "KB");
