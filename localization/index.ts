import en from "./en.json";
import es from "./es.json";
import is from "./is.json";

const LANGUAGES: Record<string, any> = {
  en,
  es,
  is,
};

let currentLang = "en";

export const setLanguage = (lang: string) => {
  if (LANGUAGES[lang]) currentLang = lang;
};

export const t = (key: string, vars: Record<string, string> = {}) => {
  const parts = key.split(".");
  let text = parts.reduce((obj, part) => obj?.[part], LANGUAGES[currentLang]);

  if (typeof text !== "string") return key;

  // Replace placeholders like {{title}}
  Object.entries(vars).forEach(([k, v]) => {
    text = text.replace(`{{${k}}}`, v);
  });

  return text;
};
