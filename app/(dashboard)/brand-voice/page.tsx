"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VoicePlayer } from "@/components/voice/voice-player";
import {
  defaultVoiceSample,
  getBrandVoice,
  saveBrandVoice,
  trainBrandVoice,
  type BrandVoice,
} from "@/lib/workspace";
import { speakText, type SpeakerId } from "@/lib/speech";
import { toast } from "sonner";

export default function BrandVoicePage() {
  const [sample, setSample] = useState(defaultVoiceSample);
  const [voice, setVoice] = useState<BrandVoice | null>(null);
  const [speaker, setSpeaker] = useState<SpeakerId>("aria");
  const [progress, setProgress] = useState(0);
  const [training, setTraining] = useState(false);

  useEffect(() => {
    const stored = getBrandVoice();
    setVoice(stored);
    setSample(stored.sample || defaultVoiceSample);
    setSpeaker(stored.speaker || "aria");
  }, []);

  function persistSpeaker(next: SpeakerId) {
    setSpeaker(next);
    const stored = getBrandVoice();
    saveBrandVoice({ ...stored, sample, speaker: next });
    setVoice({ ...stored, sample, speaker: next });
  }

  function train() {
    if (sample.trim().length < 20) {
      toast.error("Add a sample so Aura can learn the voice.");
      return;
    }

    setTraining(true);
    setProgress(10);
    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(value + 16, 90));
    }, 140);

    window.setTimeout(() => {
      window.clearInterval(timer);
      const next = trainBrandVoice(sample, speaker);
      setVoice(next);
      setProgress(100);
      setTraining(false);
      toast.success("Voice trained. Playing audio preview.");
      speakText(
        `Your ${next.speaker} brand voice is ready. ${sample}`,
        next.speaker,
      );
    }, 1100);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Brand Voice</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Train the tone, pick a speaker, then hear the audio out loud.
          </p>
        </div>
        {voice?.trained ? (
          <Badge variant="success">Trained · {speaker}</Badge>
        ) : (
          <Badge variant="secondary">Not trained</Badge>
        )}
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-5 p-6">
          <Textarea
            value={sample}
            onChange={(e) => setSample(e.target.value)}
            className="min-h-[180px]"
          />
          <VoicePlayer
            text={sample}
            speaker={speaker}
            onSpeakerChange={persistSpeaker}
            label="Play sample audio"
          />
          {training || progress > 0 ? <Progress value={progress} /> : null}
          <div className="flex justify-end">
            <Button onClick={train} disabled={training}>
              {training ? "Training voice…" : voice?.trained ? "Retrain voice" : "Train voice"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {voice?.trained ? (
        <Card className="mt-4 border-glow">
          <CardContent className="space-y-3 p-6">
            <p className="text-sm font-medium text-white">Learned profile</p>
            <p className="text-sm text-zinc-400">{voice.cadence}</p>
            <div className="flex flex-wrap gap-2">
              {voice.traits.map((trait) => (
                <Badge key={trait}>{trait}</Badge>
              ))}
            </div>
            <VoicePlayer
              text={`This is the trained Aura brand voice. ${voice.sample}`}
              speaker={voice.speaker}
              label="Hear trained voice"
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
