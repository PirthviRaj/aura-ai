export type SpeakerId = "aria" | "rowan" | "sage";

export const speakers: {
  id: SpeakerId;
  label: string;
  hint: string;
  rate: number;
  pitch: number;
  prefer: RegExp;
}[] = [
  {
    id: "aria",
    label: "Aria",
    hint: "Clear female studio voice",
    rate: 0.96,
    pitch: 1.12,
    prefer: /female|zira|samantha|aria|jenny|sara/i,
  },
  {
    id: "rowan",
    label: "Rowan",
    hint: "Low male strategist voice",
    rate: 0.9,
    pitch: 0.78,
    prefer: /male|david|mark|guy|ryan|daniel/i,
  },
  {
    id: "sage",
    label: "Sage",
    hint: "Neutral laboratory narrator",
    rate: 1,
    pitch: 1,
    prefer: /natural|google|microsoft|english/i,
  },
];

function pickVoice(speaker: SpeakerId) {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const profile = speakers.find((item) => item.id === speaker) ?? speakers[2];
  return (
    voices.find((voice) => profile.prefer.test(`${voice.name} ${voice.lang}`)) ??
    voices.find((voice) => /en/i.test(voice.lang)) ??
    voices[0] ??
    null
  );
}

export function stopSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function speakText(
  text: string,
  speaker: SpeakerId = "aria",
  onEnd?: () => void,
) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return false;
  }

  const profile = speakers.find((item) => item.id === speaker) ?? speakers[0];
  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text.slice(0, 600));
  utterance.rate = profile.rate;
  utterance.pitch = profile.pitch;
  utterance.volume = 1;
  const voice = pickVoice(speaker);
  if (voice) utterance.voice = voice;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  const start = () => window.speechSynthesis.speak(utterance);
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      const ready = pickVoice(speaker);
      if (ready) utterance.voice = ready;
      start();
    };
  } else {
    start();
  }
  return true;
}
