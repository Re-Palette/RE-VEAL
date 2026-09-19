"use client";

import { useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { AI_MATCH_EXAMPLES } from "@/lib/match/interpret";
import type { Intent } from "@/lib/match/interpret";
import { CITY_BY_ID, COUNTRY_BY_ID } from "@/lib/data/geo";
import { CATEGORY_LABELS, ROLE_LABELS } from "@/lib/labels";
import type { MatchResult } from "@/lib/types";

export interface AiMatchResponse {
  intent: Intent;
  results: MatchResult[];
  interpreter: string;
}

/**
 * AI Match.
 *
 * The request and response shapes are already what an LLM-backed endpoint
 * would use; /api/match currently answers with multilingual intent extraction
 * plus rule-based re-ranking. Nothing in this component changes when a model
 * is connected.
 */
export function AiMatch({
  onResults,
  autoOpen = false,
}: {
  onResults: (response: AiMatchResponse | undefined) => void;
  autoOpen?: boolean;
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<Intent | undefined>();
  const [error, setError] = useState<string | undefined>();

  const run = async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data = (await response.json()) as AiMatchResponse;
      setIntent(data.intent);
      onResults(data);
    } catch {
      setError("Could not reach the match service. Try again.");
      onResults(undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="ai-match"
      className="relative overflow-hidden rounded-panel border border-white/70 glass shadow-lift"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(90% 130% at 4% 0%, #efe9ff 0%, transparent 55%), radial-gradient(80% 120% at 98% 10%, #e3effc 0%, transparent 52%)",
        }}
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50 backdrop-blur">
              <Wand2 className="size-3.5 text-lavender" />
              AI Match
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em] sm:text-[28px]">
              Describe who you want to work with.
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-70">
              あなたにおすすめの人・ブランド・プロジェクトをAIが探します。 Write it in any language —
              Japanese, English, Korean or Chinese.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <Textarea
            rows={3}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") run(prompt);
            }}
            placeholder="韓国の美容クリエイターと作品を作りたい / I want to collaborate with a Japanese skincare brand"
            className="bg-white/80 text-[15px]"
          />
          <Button
            variant="accent"
            size="lg"
            onClick={() => run(prompt)}
            disabled={loading || prompt.trim().length === 0}
            className="lg:mb-1"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {loading ? "Matching…" : "Start AI Match"}
          </Button>
        </div>

        {!intent && (
          <div className="mt-4 flex flex-wrap gap-2">
            {AI_MATCH_EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => {
                  setPrompt(example);
                  run(example);
                }}
                className="rounded-full border border-ink-08 bg-white/80 px-3 py-1.5 text-xs font-medium text-ink-50 transition-colors hover:border-lavender/40 hover:text-ink"
              >
                {example}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-blush">{error}</p>}

        {intent && (
          <div className="mt-5 rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-30">
              Understood as
            </p>
            <div className="flex flex-wrap gap-1.5">
              {intent.cityIds.map((id) => (
                <Badge key={id} variant="sky" size="sm">
                  {CITY_BY_ID.get(id)?.name}
                </Badge>
              ))}
              {intent.countryIds.map((id) => (
                <Badge key={id} variant="sky" size="sm">
                  {COUNTRY_BY_ID.get(id)?.name} {COUNTRY_BY_ID.get(id)?.flag}
                </Badge>
              ))}
              {intent.categories.map((c) => (
                <Badge key={c} variant="lavender" size="sm">
                  {CATEGORY_LABELS[c]}
                </Badge>
              ))}
              {intent.roles.map((r) => (
                <Badge key={r} variant="mint" size="sm">
                  {ROLE_LABELS[r]}
                </Badge>
              ))}
              {intent.kinds.map((k) => (
                <Badge key={k} variant="gold" size="sm" className="capitalize">
                  {k}
                </Badge>
              ))}
              {intent.cityIds.length === 0 &&
                intent.countryIds.length === 0 &&
                intent.categories.length === 0 &&
                intent.roles.length === 0 && (
                  <span className="text-[13px] text-ink-50">
                    Nothing specific recognised — showing your strongest matches overall.
                  </span>
                )}
            </div>
            <button
              onClick={() => {
                setIntent(undefined);
                setPrompt("");
                onResults(undefined);
              }}
              className="mt-3 text-xs font-medium text-ink-30 transition-colors hover:text-lavender"
            >
              Clear and start again
            </button>
          </div>
        )}

        {autoOpen && !intent && (
          <p className="mt-4 text-xs text-ink-30">
            Tip: press ⌘/Ctrl + Enter to run without leaving the keyboard.
          </p>
        )}
      </div>
    </section>
  );
}
