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

const languages = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "is", label: "Íslenska" },
  { code: "ja", label: "日本語" },
];

const LanguageSelection = () => {
  const navigation = useNavigation();
  const { setLang, t } = useLanguage(); // ✅ get the `t` function from context

  const selectLanguage = async (code: string) => {
    await AsyncStorage.setItem("selectedLanguage", code);
    setLang(code);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("languageChoice")}</Text>
        <FlatList
          data={languages}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => selectLanguage(item.code)}
            >
              <Text style={styles.languageText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default LanguageSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  languageButton: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  languageText: {
    color: "#fff",
    fontSize: 18,
  },
});
