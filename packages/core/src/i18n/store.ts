import { create } from "zustand";
import { LanguageCode } from "./translate";

type I18nState = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

export const useI18nStore = create<I18nState>((set) => ({
  language: "en",
  setLanguage: (language) => set({ language }),
}));
