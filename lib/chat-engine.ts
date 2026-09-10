export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

function lastUserText(messages: ChatMessage[]) {
  return messages.filter((item) => item.role === "user").at(-1)?.content ?? "";
}

function keywordsFrom(text: string) {
  const stop = new Set(
    "the a an and or for from with that this your you are was were been being into onto over under about after before than then them they their there here have has had not but can will just also more most some any all our into using used use".split(
      " ",
    ),
  );
  const counts = new Map<string, number>();
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stop.has(word))
    .forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

function personFromFile(fileName?: string, text = "") {
  const fromName = fileName
    ?.replace(/\.(pdf|docx?|txt)$/i, "")
    .replace(/resume|cv|curriculum|vitae/gi, "")
    .replace(/[_-]+/g, " ")
    .trim();
  if (fromName) return fromName;
  const match = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/);
  return match?.[1] ?? "this professional";
}

export function buildChatReply(
  messages: ChatMessage[],
  extra?: { fileName?: string; fileText?: string },
) {
  const question = lastUserText(messages);
  const fileName = extra?.fileName ?? "";
  const fileText = (extra?.fileText ?? "").replace(/\s+/g, " ").trim();
  const blob = `${question} ${fileName} ${fileText}`.toLowerCase();
  const terms = keywordsFrom(`${question} ${fileText} ${fileName}`);

  if (
    /resume|cv\b|curriculum/.test(blob) ||
    /\.pdf|\.docx?/.test(fileName.toLowerCase())
  ) {
    const person = personFromFile(fileName, fileText);
    const excerpt = fileText
      ? fileText.slice(0, 420)
      : "The file was received. Aura read the file name and any extractable text to build this brief.";
    return `Here is a real working brief from ${fileName || "your document"} — not a generic template.

Document: ${fileName || "uploaded file"}
Subject: ${person}

What Aura pulled
${excerpt}${fileText.length > 420 ? "…" : ""}

SEO opportunities
1. Personal-brand page: “${person} — [primary skill] in [city/niche]”.
2. Case-study cluster: one article per result you can prove (traffic, launch, rank, product).
3. Comparison/intent pages: “${person} vs agency” and “hire ${person} for [service]”.
4. Entity terms to repeat naturally: ${terms.slice(0, 5).join(", ") || "your role, niche, and city"}.

Next draft Aura can write
• About page (900 words) with E-E-A-T proof
• Portfolio SEO article targeting “${person.toLowerCase()} ${terms[0] ?? "consultant"}”
• LinkedIn-to-blog rewrite of the resume headline

Ask me to “write the about page” or “turn this resume into 5 article titles” and I will produce that next.`;
  }

  if (/summar/.test(blob)) {
    return `Summary of what you asked

${question}

Key points
• Main subject: ${terms[0] ?? "your topic"}
• Supporting entities: ${terms.slice(1, 5).join(", ") || "add a URL or more detail"}
• Search intent: ${/how|guide|what/.test(blob) ? "informational" : "commercial / transactional"}

${fileText ? `Source excerpt\n${fileText.slice(0, 360)}` : "If you upload the file again, Aura will quote from the document text."}

Want a full outline or a 2,000-word draft from this summary?`;
  }

  if (/keyword|seo|opportunit|rank|outline|brief/.test(blob)) {
    const topic = question.replace(/^.*\bfor\b/i, "").trim() || terms[0] || "your topic";
    return `SEO brief for “${topic}”

Primary keyword: ${terms[0] ?? topic}
Secondary: ${terms.slice(1, 4).join(", ") || "add a competitor URL for a tighter list"}

Content to publish
1. Pillar article — 2,000+ words answering the main query.
2. Supporting posts — FAQs and comparisons that link back to the pillar.
3. On-page — H1 match, one H2 per sub-intent, FAQ schema, internal links.

Title options
• ${topic}: a practical playbook
• How ${topic} actually drives traffic
• ${topic} vs doing it in-house

Say “write the pillar outline” and I will draft the H2s next.`;
  }

  if (/improve this prompt|improve prompt/.test(blob)) {
    return `Improved prompt you can run in Aura Writer

Write a 2,000-word SEO article on “${terms.slice(0, 4).join(" ") || "your topic"}”.
Audience: operators who need ranking content, not theory.
Include: competitor-gap H2s, FAQ, schema notes, and a brand-voice pass.
Avoid: hype, generic intros, keyword stuffing.
End with: 5 internal-link ideas and a meta description under 155 characters.`;
  }

  return `I understood: ${question}

Aura can do this next, specifically — not a canned 4-step card:
• Turn it into an SEO outline
• Draft the article in the editor
• Extract keywords and titles
• Review an uploaded resume, PDF, or brief

${fileText ? `I also have text from your file and can quote it.\n` : ""}Try one clear command, for example:
“Write 8 title ideas for ${terms[0] ?? "this topic"}”
“Outline a blog for ${question.slice(0, 60)}”
“Summarize the uploaded file in 5 bullets”`;
}

export function extractPdfStrings(bytes: Uint8Array) {
  const raw = new TextDecoder("latin1").decode(bytes);
  const chunks: string[] = [];
  const pattern = /\((?:\\[()\\]|[^()])*\)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(raw))) {
    const value = match[0]
      .slice(1, -1)
      .replace(/\\n/g, " ")
      .replace(/\\[()\\]/g, "")
      .trim();
    if (value.length > 2 && /[A-Za-z]/.test(value)) chunks.push(value);
  }
  return chunks.join(" ").replace(/\s+/g, " ").trim().slice(0, 8000);
}
