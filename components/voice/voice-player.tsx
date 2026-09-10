"use client";

import { useEffect, useState } from "react";
import { Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakers, speakText, stopSpeech, type SpeakerId } from "@/lib/speech";
import { cn } from "@/lib/utils";

export function VoicePlayer({
  text,
  speaker,
  onSpeakerChange,
  label = "Hear this voice",
}: {
  text: string;
  speaker: SpeakerId;
  onSpeakerChange?: (id: SpeakerId) => void;
  label?: string;
}) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => stopSpeech(), []);

  function toggle() {
    if (playing) {
      stopSpeech();
      setPlaying(false);
      return;
    }
    const ok = speakText(text, speaker, () => setPlaying(false));
    setPlaying(Boolean(ok));
    if (!ok) setPlaying(false);
  }

  return (
    <div className="space-y-3">
      {onSpeakerChange ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {speakers.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSpeakerChange(item.id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left",
                speaker === item.id
                  ? "border-primary/50 bg-primary/15"
                  : "border-white/10 hover:border-white/20",
              )}
            >
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-[11px] text-zinc-500">{item.hint}</p>
            </button>
          ))}
        </div>
      ) : null}
      <Button type="button" variant={playing ? "secondary" : "default"} onClick={toggle}>
        {playing ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        {playing ? "Stop audio" : label}
      </Button>
    </div>
  );
}
