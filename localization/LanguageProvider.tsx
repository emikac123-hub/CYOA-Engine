// ✅ NEW LanguageProvider.tsx
import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./en.json";
import es from "./es.json";
import is from "./is.json";
import de from "./de.json";
import fr from "./fr.json";
import ja from "./jp.json";

const LANGUAGES: any = { en, es, is, de, fr, ja };
type LangCode = keyof typeof LANGUAGES;

const LanguageContext = createContext({
  lang: "en" as LangCode,
  setLang: (lang: LangCode) => {},
  t: (key: string, vars?: Record<string, string>) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState<LangCode>("en");
  useEffect(() => {
    AsyncStorage.getItem("selectedLanguage").then((saved) => {
      if (saved && LANGUAGES[saved]) setLangState(saved as LangCode);
    });
  }, []);

  const setLang = async (newLang: LangCode) => {
    await AsyncStorage.setItem("selectedLanguage", String(newLang));
    setLangState(newLang);
  };

  const t = (key: string, vars: Record<string, string> = {}) => {
    let text = key.split(".").reduce((obj, part) => obj?.[part], LANGUAGES[lang]);
    if (typeof text !== "string") return key;
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{{${k}}}`, v);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
