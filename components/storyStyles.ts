import { StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const storyStyles = (theme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    image: {
      width: SCREEN_WIDTH - 32,
      height: 200,
      borderRadius: 12,
      marginBottom: 16,
    },
    textContainer: {
      flex: 1,
      justifyContent: "center",
    },
    storyText: {
      fontSize: 18,
      color: theme === "dark" ? "#fff" : "#000",
      lineHeight: 26,
    },
    storyContent: {
      paddingBottom: 24,
    },
    choicesContainer: {
      marginTop: 20,
    },
    choiceButton: {
      backgroundColor: theme === "dark" ? "#333" : "#eee",
      padding: 12,
      marginVertical: 8,
      borderRadius: 10,
    },
    choiceText: {
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: 16,
      textAlign: "center",
    },
    paywall: {
      position: "absolute",
      top: 100,
      left: 20,
      right: 20,
      backgroundColor: theme === "dark" ? "#111" : "#f2f2f2",
      padding: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme === "dark" ? "#444" : "#ccc",
      alignItems: "center",
    },
    paywallText: {
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: 18,
      marginBottom: 16,
      textAlign: "center",
    },
    purchaseButton: {
      backgroundColor: "#00ccff",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      marginBottom: 10,
    },
    purchaseButtonText: {
      color: "#000",
      fontSize: 16,
      fontWeight: "bold",
    },
    cancelText: {
      color: theme === "dark" ? "#aaa" : "#555",
      textDecorationLine: "underline",
      marginTop: 10,
    },
    backButton: {
      backgroundColor: theme === "dark" ? "#222" : "#ddd",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 12,
      alignSelf: "stretch",
      borderColor: theme === "dark" ? "#444" : "#aaa",
      borderWidth: 1,
    },
    backText: {
      color: theme === "dark" ? "#ccc" : "#000",
      fontSize: 16,
      textAlign: "center",
    },
    choiceTracker: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 20,
      opacity: 0.6,
    },

    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },

    activeDot: {
      backgroundColor: "#00ccff",
    },

    inactiveDot: {
      backgroundColor: "#aaa",
    },
    // Inside your stylesheet (e.g., storyStyles.ts or inline)
    blurContainer: {
      backgroundColor: "transparent", // optional; lets the blur show through
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      overflow: "hidden", // ensures blur doesn't spill out
    },
  });
