import React from "react";
import { Modal, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ConfettiCannon from "react-native-confetti-cannon";
import { useLanguage } from "localization/LanguageProvider";
import { useTheme } from "context/ThemeContext";
import { stripEmoji } from "app/story";
const ChapterUnlockPopup = ({ visible, title, confettiKey, onClose }) => {
  if (!visible) return null;
  const { t } = useLanguage();
  const { theme } = useTheme();
  const s = styles(theme);
  
  return (
    
    <Modal transparent animationType="fade" visible={visible}>
      <View style={s.overlay}>
        {/* 🎊 Confetti */}
        <ConfettiCannon
          count={80}
          origin={{ x: 200, y: 0 }}
          explosionSpeed={300}
          fallSpeed={2000}
          fadeOut
          autoStart
          key={confettiKey} // ✅ rerun on key change
        />

        {/* 🌈 Gradient border box */}
        <LinearGradient
          colors={["#FF5F6D", "#FFC371", "#47CACC", "#7A5FFF", "#FF5F6D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.gradientBorder}
        >
          <View style={s.innerBox}>
            <Text style={s.subtitle}>{t("unlockPopup.unlocked")}</Text>
            <Text style={s.title}>🎉 {stripEmoji(title)}</Text>

            <TouchableOpacity onPress={onClose} style={s.okButton}>
              <Text style={s.okText}>🫡 OK</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};
const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)", // semi-transparent overlay for both themes
      justifyContent: "center",
      alignItems: "center",
    },
    gradientBorder: {
      padding: 4,
      borderRadius: 16,
    },
    innerBox: {
      backgroundColor: theme === "dark" ? "#111" : "#fff",
      paddingVertical: 30,
      paddingHorizontal: 50,
      borderRadius: 12,
      alignItems: "center",
    },
    subtitle: {
      fontSize: 16,
      color: theme === "dark" ? "#bbb" : "#444",
      marginBottom: 8,
      fontWeight: "500",
    },
    title: {
      fontSize: 24,
      color: theme === "dark" ? "#fff" : "#000",
      fontWeight: "bold",
      textAlign: "center",
    },
    okButton: {
      marginTop: 20,
      paddingVertical: 10,
      paddingHorizontal: 30,
      backgroundColor: "#00ccff",
      borderRadius: 8,
    },
    okText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default ChapterUnlockPopup;
