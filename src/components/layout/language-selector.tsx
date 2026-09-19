"use client";

import { Check, Languages } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useI18n } from "@/lib/i18n/context";
import { LANGUAGE_LABELS, LANGUAGE_SHORT } from "@/lib/labels";
import { LANGUAGES } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useI18n();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-ink-15 bg-white/70 px-3 text-xs font-medium text-ink-70 transition-colors hover:border-lavender/40 hover:text-ink",
          compact ? "h-9" : "h-10",
        )}
        aria-label="Change language"
      >
        <Languages className="size-4 text-ink-30" />
        {LANGUAGE_SHORT[language]}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-44 rounded-2xl border border-ink-08 bg-white p-1.5 shadow-float animate-rise"
        >
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-30">Language</p>
          {LANGUAGES.map((code) => (
            <DropdownMenu.Item
              key={code}
              onSelect={() => setLanguage(code)}
              className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-lavender-soft"
            >
              {LANGUAGE_LABELS[code]}
              {language === code && <Check className="size-4 text-lavender" />}
            </DropdownMenu.Item>
          ))}
          <p className="border-t border-ink-08 px-3 pb-1 pt-2.5 text-[11px] leading-relaxed text-ink-30">
            Posts written in other languages are shown translated.
          </p>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
