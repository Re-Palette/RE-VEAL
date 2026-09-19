"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { LanguageCode } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Content written in one language, read in another.
 *
 * The label is deliberately honest in both directions: when a translation
 * exists the viewer can flip back to the original, and when one does not the
 * text says so rather than implying it was translated. Connecting a real
 * translation API means editing lib/i18n/translator.ts alone.
 */
export function TranslatableText({
  text,
  from,
  contentKey,
  className,
}: {
  text: string;
  from: LanguageCode;
  /** "<entityId>.<field>" — when a stored translation exists it is used. */
  contentKey?: string;
  className?: string;
}) {
  const { language, t, languageName, content, isTranslated } = useI18n();
  const [showOriginal, setShowOriginal] = useState(false);

  const translated = contentKey ? isTranslated(contentKey) : false;
  const body = translated && !showOriginal && contentKey ? content(contentKey, text) : text;
  const differentLanguage = from !== language;

  if (!differentLanguage) {
    return <p className={cn("leading-relaxed text-ink-70", className)}>{text}</p>;
  }

  return (
    <div>
      <p className={cn("leading-relaxed text-ink-70", className)}>{body}</p>
      {translated ? (
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
            ? t("content.original", { language: languageName(from) })
            : t("content.translatedFrom", { language: languageName(from) })}
        </button>
      ) : (
        <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-ink-30">
          <Languages className="size-3" />
          {t("content.notTranslated", { language: languageName(from) })}
        </span>
      )}
    </div>
  );
}
