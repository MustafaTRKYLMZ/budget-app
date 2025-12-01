import { en } from "./locales/en";
import { tr } from "./locales/tr";

export const dictionaries = {
  en,
  tr,
} as const;

export type LanguageCode = keyof typeof dictionaries;
export type TranslationKey = keyof typeof en;

export function translate(language: LanguageCode, key: TranslationKey): string {
  const dict = dictionaries[language];
  return dict[key] ?? key;
}
