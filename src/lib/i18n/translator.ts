import type { LanguageCode } from "@/lib/types";
import { LANGUAGE_LABELS } from "@/lib/i18n/labels-enums";
import { contentText } from "@/lib/i18n/content";

/**
 * Content translation seam.
 *
 * RE:VEAL is global, so a post written in Japanese has to be readable by
 * someone in São Paulo. `LookupTranslator` resolves against the stored content
 * translations; a production implementation swaps in a translation API and
 * keeps that table as its cache.
 */
export interface TranslationRequest {
  text: string;
  from: LanguageCode;
  to: LanguageCode;
  /** "<entityId>.<field>" — lets the lookup translator find a stored string. */
  key?: string;
}

export interface TranslationResult {
  text: string;
  translated: boolean;
  from: LanguageCode;
  to: LanguageCode;
  /** Which provider produced this, for attribution in the UI. */
  provider: string;
}

export interface Translator {
  readonly id: string;
  translate(request: TranslationRequest): Promise<TranslationResult>;
  translateMany(requests: TranslationRequest[]): Promise<TranslationResult[]>;
}

/**
 * Resolves against the stored content translations and falls back to the
 * original text. A production implementation calls a translation API here and
 * keeps this table as its cache; nothing downstream changes.
 */
export class LookupTranslator implements Translator {
  readonly id = "lookup";

  async translate({ text, from, to, key }: TranslationRequest): Promise<TranslationResult> {
    const translated = key ? contentText(key, text, to) : text;
    return { text: translated, translated: translated !== text, from, to, provider: this.id };
  }

  async translateMany(requests: TranslationRequest[]): Promise<TranslationResult[]> {
    return Promise.all(requests.map((r) => this.translate(r)));
  }
}

export const translator: Translator = new LookupTranslator();

export function translationNotice(from: LanguageCode, to: LanguageCode): string {
  return `Translated from ${LANGUAGE_LABELS[from]} to ${LANGUAGE_LABELS[to]}`;
}
