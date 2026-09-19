"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LANGUAGE_LABELS } from "@/lib/labels";
import type { LanguageCode } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Content written in one language, read in another.
 *
 * The Translator abstraction is a passthrough today, so the text itself is
 * unchanged — but the whole interaction (notice, toggle, attribution) is real,
 * and connecting a translation API means changing `lib/i18n/translator.ts`
 * alone. Text already in the viewer's language renders plainly, with no notice.
 */
export function TranslatableText({
  text,
  from,
  className,
}: {
  text: string;
  from: LanguageCode;
  className?: string;
}) {
  const { language } = useI18n();
  const [showOriginal, setShowOriginal] = useState(false);
  const needsTranslation = from !== language;

  return (
    <div>
      <p className={cn("leading-relaxed text-ink-70", className)}>{text}</p>
      {needsTranslation && (
        <button
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setShowOriginal((v) => !v);
          }}
          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-ink-30 transition-colors hover:text-lavender"
        >
          <Languages className="size-3" />
          {showOriginal
            ? `Original · ${LANGUAGE_LABELS[from]}`
            : `Translated from ${LANGUAGE_LABELS[from]}`}
        </button>
      )}
    </div>
  );
}
