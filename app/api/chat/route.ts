import { NextResponse } from "next/server";
import {
  buildChatReply,
  extractPdfStrings,
  type ChatMessage,
} from "@/lib/chat-engine";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let messages: ChatMessage[] = [];
  let fileName = "";
  let fileText = "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    messages = JSON.parse(String(form.get("messages") ?? "[]")) as ChatMessage[];
    fileName = String(form.get("fileName") ?? "");
    fileText = String(form.get("fileText") ?? "");
    const file = form.get("file");
    if (file instanceof File) {
      fileName = fileName || file.name;
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
        fileText = extractPdfStrings(bytes) || fileText;
      } else {
        fileText = fileText || new TextDecoder().decode(bytes);
      }
    }
  } else {
    const body = (await request.json()) as {
      messages?: ChatMessage[];
      fileName?: string;
      fileText?: string;
    };
    messages = body.messages ?? [];
    fileName = body.fileName ?? "";
    fileText = body.fileText ?? "";
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content:
              "You are Aura Chat, an SEO research partner. Answer the actual question. If a document is provided, summarize it and extract SEO opportunities from that document. Do not return a generic 4-step template.",
          },
          ...(fileText
            ? [
                {
                  role: "system" as const,
                  content: `Document ${fileName}:\n${fileText.slice(0, 6000)}`,
                },
              ]
            : []),
          ...messages,
        ],
      });
      const text = completion.choices[0]?.message?.content;
      if (text) return NextResponse.json({ text });
    } catch {
      // Fall through to the local engine so the user still gets a real answer.
    }
  }

  return NextResponse.json({
    text: buildChatReply(messages, { fileName, fileText }),
  });
}
