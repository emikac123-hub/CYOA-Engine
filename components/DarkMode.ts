import { StyleSheet } from "react-native";

export const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === "dark" ? "#111" : "#fff",
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
      color: theme === "dark" ? "#fff" : "#000",
      textAlign: "center",
    },
    optionButton: {
      paddingVertical: 14,
    },
    optionText: {
      fontSize: 16,
      color: theme === "dark" ? "#fff" : "#333",
    },
  });
