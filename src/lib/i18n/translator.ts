import type { LanguageCode } from "@/lib/types";
import { LANGUAGE_LABELS } from "@/lib/i18n/labels-enums";

/**
 * Content translation seam.
 *
 * RE:VEAL is global, so a post written in Japanese has to be readable by
 * someone in São Paulo. The real implementation will call a translation API;
 * until then `PassthroughTranslator` marks text as translated without altering
 * it, which is honest about what is happening and keeps the whole "translated /
 * show original" interaction fully built and testable.
 */
export interface TranslationRequest {
  text: string;
  from: LanguageCode;
  to: LanguageCode;
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

export class PassthroughTranslator implements Translator {
  readonly id = "passthrough";

  async translate({ text, from, to }: TranslationRequest): Promise<TranslationResult> {
    return { text, translated: from !== to, from, to, provider: this.id };
  }

  async translateMany(requests: TranslationRequest[]): Promise<TranslationResult[]> {
    return Promise.all(requests.map((r) => this.translate(r)));
  }
}

export const translator: Translator = new PassthroughTranslator();

export function translationNotice(from: LanguageCode, to: LanguageCode): string {
  return `Translated from ${LANGUAGE_LABELS[from]} to ${LANGUAGE_LABELS[to]}`;
}
