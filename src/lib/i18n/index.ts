import { LANGUAGES, type LanguageCode } from "@/lib/types";
import { translateKey, type UIKey } from "@/lib/i18n/dictionary";
import { ENUM_LABELS, LANGUAGE_LABELS, LANGUAGE_SHORT, type EnumLabels } from "@/lib/i18n/labels-enums";
import {
  CITY_LABELS,
  COUNTRY_LABELS,
  INTEREST_LABELS,
  SKILL_LABELS,
  localize,
} from "@/lib/i18n/labels-taxonomy";

export type { UIKey };
export type { EnumLabels };
export { LANGUAGE_LABELS, LANGUAGE_SHORT };

export const DEFAULT_LANGUAGE: LanguageCode = "en";
export const LANGUAGE_COOKIE = "reveal_lang";

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

/**
 * Everything a component needs to render in one language.
 *
 * The same object is produced on the server (from the locale cookie) and on the
 * client (from the provider), so a component can be written once and used in
 * either place without caring which side it renders on.
 */
export interface I18n {
  language: LanguageCode;
  /** UI chrome. `params` fills {placeholders}. */
  t: (key: UIKey, params?: Record<string, string | number>) => string;
  /** Enum labels: L.role[...], L.category[...], L.availability[...] and so on. */
  L: EnumLabels;
  skill: (id: string) => string;
  interest: (id: string) => string;
  city: (id: string) => string;
  country: (id: string) => string;
  languageName: (code: LanguageCode) => string;
  /** Joins with the locale's list separator — "、" in Japanese, ", " in English. */
  list: (items: string[]) => string;
  /** Joins complete sentences; CJK locales do not put a space between them. */
  sentences: (parts: string[]) => string;
  and: (a: string, b: string) => string;
}

const cache = new Map<LanguageCode, I18n>();

export function createI18n(language: LanguageCode): I18n {
  const cached = cache.get(language);
  if (cached) return cached;

  const t: I18n["t"] = (key, params) => translateKey(key, language, params);

  const i18n: I18n = {
    language,
    t,
    L: ENUM_LABELS[language] ?? ENUM_LABELS.en,
    skill: (id) => localize(SKILL_LABELS, id, language),
    interest: (id) => localize(INTEREST_LABELS, id, language),
    city: (id) => localize(CITY_LABELS, id, language),
    country: (id) => localize(COUNTRY_LABELS, id, language),
    languageName: (code) => LANGUAGE_LABELS[code],
    list: (items) => items.filter(Boolean).join(t("format.listJoin")),
    sentences: (parts) => parts.filter(Boolean).join(t("format.sentenceJoin")),
    and: (a, b) => (a && b ? t("format.and", { a, b }) : a || b),
  };

  cache.set(language, i18n);
  return i18n;
}
