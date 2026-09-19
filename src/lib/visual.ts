import { hashString } from "@/lib/utils";

/**
 * RE:VEAL ships no stock photography. Every avatar, cover and thumbnail is a
 * deterministic gradient derived from the entity's seed, so the product reads
 * as one designed system instead of a collage of mismatched images — and so a
 * real image can later replace it without any layout shift.
 */
const GRADIENTS: [string, string, string][] = [
  ["#E7E0FB", "#D6E4FA", "#FBE4EF"],
  ["#F7F0E6", "#EDE4FB", "#DCE9FA"],
  ["#DEEAFB", "#F6E7F1", "#EFEAFD"],
  ["#FBE8F1", "#EFE6FC", "#E2F3EE"],
  ["#EAF3FD", "#F8F1E7", "#E9E2FB"],
  ["#F1E9FC", "#FDEDF3", "#E4F0FB"],
  ["#E5F4EF", "#E8EAFB", "#FAEEE6"],
  ["#FAEDE4", "#F0E7FA", "#DDEBF9"],
];

const INK_TINTS = ["#5B4BA8", "#2F5E9E", "#A85B7C", "#3F7F72", "#7A6420"];

export interface Swatch {
  from: string;
  via: string;
  to: string;
  ink: string;
  angle: number;
}

export function swatch(seed: string): Swatch {
  const hash = hashString(seed);
  const [from, via, to] = GRADIENTS[hash % GRADIENTS.length];
  return {
    from,
    via,
    to,
    ink: INK_TINTS[(hash >> 3) % INK_TINTS.length],
    angle: 110 + (hash % 5) * 22,
  };
}

export function gradientStyle(seed: string): React.CSSProperties {
  const s = swatch(seed);
  return { backgroundImage: `linear-gradient(${s.angle}deg, ${s.from} 0%, ${s.via} 52%, ${s.to} 100%)` };
}

export function inkColor(seed: string): string {
  return swatch(seed).ink;
}

/** Match score -> visual language. Kept in one place so it never drifts. */
export function scoreTone(score: number): { text: string; bg: string; ring: string; label: string } {
  if (score >= 90) return { text: "text-[#4B3BA0]", bg: "bg-lavender-soft", ring: "ring-lavender/35", label: "Exceptional" };
  if (score >= 80) return { text: "text-[#2F5E9E]", bg: "bg-sky-soft", ring: "ring-sky/35", label: "Strong" };
  if (score >= 70) return { text: "text-[#3F7F72]", bg: "bg-mint-soft", ring: "ring-mint/35", label: "Good" };
  return { text: "text-ink-50", bg: "bg-ink-08", ring: "ring-ink-15", label: "Possible" };
}
