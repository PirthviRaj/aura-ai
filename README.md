# Aura AI

Commercial SEO & AI content operations platform (Next.js 14 App Router).

Built as a **commissioned product system** for enterprise-style content teams: research, drafting, scoring, brand voice, images, workflows, and collections in one authenticated workspace.

## Product scope

| Module | Role in the system |
|--------|--------------------|
| **AI Blog Writer** | Topic → structured SEO draft |
| **Templates** | Brief-specific draft → editor + collections |
| **Aura Chat** | Research answers; optional PDF/TXT context |
| **Brand Voice** | Tone traits + browser speech preview |
| **AI Images** | Prompt-matched visuals (model or studio fallback) |
| **Workflows** | Pipeline from input → draft surface |
| **Collections** | Organize, status, and reuse campaign assets |
| **Editor** | Draft review + SEO score + regenerate |

Intelligence routing is intentional: optional **GPT-4o** / **DALL·E 3** when keys are present; otherwise topic-specific engines keep the product operational.

## Local run

```bash
npm install
npm run dev
```

Open http://localhost:3000

1. **Enroll / Sign in** — required before dashboard modules unlock  
2. Operate Writer, Chat, Images, Templates, and Collections  

### Auth

- **Without Supabase:** provider consent flow + local workspace session  
- **With Supabase:** enable Google / GitHub / Azure and set redirect to `/auth/callback`

## Environment

Copy `.env.example` → `.env.local`:

```
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Deploy

Vercel-ready. Add production env vars, then:

```bash
npm run build
npm start
```

## Case study

High-level engagement presentation: `portfolio-doc/Aura-AI-Product-Case-Study.html`
