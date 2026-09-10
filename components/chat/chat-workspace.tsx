"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Globe,
  Library,
  Paperclip,
  Send,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const features = [
  {
    icon: Globe,
    title: "Real-Time Search",
    copy: "Ground answers in live web results before you write.",
  },
  {
    icon: FileText,
    title: "Chat with any files",
    copy: "Drop PDF or Word docs and interrogate the source.",
  },
  {
    icon: BookOpen,
    title: "Infobase",
    copy: "Store key brand facts, offers, and banned phrases.",
  },
];

type Message = { role: "user" | "assistant"; content: string };

export function ChatWorkspace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function send(text = input, file?: File) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const form = new FormData();
      form.set("messages", JSON.stringify(next));
      if (file) {
        form.set("fileName", file.name);
        form.set("file", file);
        if (file.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(file.name)) {
          form.set("fileText", await file.text());
        }
      }
      const response = await fetch("/api/chat", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as { text?: string };
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            data.text ??
            "I can research, outline, and draft ranking content. Ask me for a brief or drop a document.",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Aura could not reach the chat engine. Try again, or upload a .txt copy of the file.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-3xl flex-col">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-primary">
              Aura Chat
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Your SEO research partner
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Search the web, chat with files, and keep an Infobase of what
              never changes.
            </p>
          </motion.div>
          <div className="grid w-full gap-3 sm:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="p-4 text-left">
                    <Icon className="mb-3 h-5 w-5 text-primary" />
                    <p className="text-sm font-medium text-white">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                      {feature.copy}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-4 pb-6">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "ml-auto bg-primary/20 text-foreground"
                  : "glass text-foreground",
              )}
            >
              {message.content}
            </div>
          ))}
          {busy ? (
            <div className="glass w-fit rounded-2xl px-4 py-3 text-sm text-zinc-400">
              Aura is thinking…
            </div>
          ) : null}
        </div>
      )}

      <div className="sticky bottom-0 space-y-3 rounded-2xl glass-strong p-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toast("Prompts Library — 48 SEO briefs ready")}
          >
            <Library className="h-3.5 w-3.5" />
            Prompts Library
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setInput((value) =>
                value
                  ? `Improve this prompt for ranking content: ${value}`
                  : "Improve this prompt: write a 2,000 word article that can rank for AI SEO writer",
              )
            }
          >
            <WandSparkles className="h-3.5 w-3.5" />
            Improve Prompt
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip className="h-3.5 w-3.5" />
            Upload Document
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                toast.success(`Reading ${file.name}`);
                void send(
                  `Summarize and extract SEO opportunities from ${file.name}`,
                  file,
                );
              }
            }}
          />
        </div>
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Ask Aura to research, outline, or rewrite…"
            className="min-h-[52px] resize-none"
          />
          <Button
            size="icon"
            className="h-[52px] w-[52px]"
            onClick={() => void send()}
            disabled={busy}
          >
            {busy ? <Sparkles className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
