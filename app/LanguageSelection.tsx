import { useLanguage } from "../localization/LanguageProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
const { theme } = useTheme();
const languages = [
  { code: "en", label: "🇺🇸/🇬🇧 English" },
  { code: "de", label: "🇩🇪 Deutsch" },
  { code: "es", label: "🇪🇸 Español" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "is", label: "🇮🇸 Íslenska" },
  { code: "jp", label: "🇯🇵 日本語" },
];

const LanguageSelection = () => {
  const { theme } = useTheme();
  const s = styles(theme);
  const navigation = useNavigation();
  const { setLang, t } = useLanguage(); // ✅ get the `t` function from context

  const selectLanguage = async (code: string) => {
    await AsyncStorage.setItem("selectedLanguage", code);
    setLang(code);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={s.container}>
        <Text style={s.title}>{t("languageChoice")}</Text>
        <FlatList
          data={languages}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.languageButton}
              onPress={() => selectLanguage(item.code)}
            >
              <Text style={s.languageText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default LanguageSelection;



export const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === "dark" ? "#111" : "#fff",
      padding: 20,
    },
    title: {
      fontSize: 22,
      color: theme === "dark" ? "#fff" : "#000",
      marginBottom: 20,
      textAlign: "center",
    },
    languageButton: {
      backgroundColor: theme === "dark" ? "#222" : "#eee",
      padding: 15,
      borderRadius: 10,
      marginBottom: 12,
      alignItems: "center",
    },
    languageText: {
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: 18,
    },
  });
