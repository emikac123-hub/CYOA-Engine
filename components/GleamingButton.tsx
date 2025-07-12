import React, { useEffect, useRef } from "react";
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Easing,
  AccessibilityProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "context/ThemeContext";
type Props = {
  title: string;
  onPress: () => void;
} & AccessibilityProps;
export default function GleamingButton({
  title,
  onPress,
  style = {},
  textStyle = {},
}) {
  const animation = useRef(new Animated.Value(-1)).current;
  const { theme } = useTheme();
  const s = styles(theme);
  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.delay(3000 + Math.random() * 3000), // random delay
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, []);

  const translateX = animation.interpolate({
    inputRange: [-1, 1],
    outputRange: [-300, 300],
  });

  return (
    <TouchableOpacity style={[s.button, style]} onPress={onPress}>
      <Text style={[s.buttonText, textStyle]}>{title}</Text>
      <Animated.View
        pointerEvents="none"
        style={[
          s.shimmerOverlay,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.shimmer, { transform: [{ rotate: "-10deg" }] }]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    button: {
      backgroundColor:
        theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0)",
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 16,
      marginVertical: 10,
      width: "80%",
      alignItems: "center",
      borderWidth: 2,
      borderColor:
        theme === "dark" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.3)",
      overflow: "hidden",
    },
    buttonText: {
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: 17,
      fontWeight: "500",
      letterSpacing: 0.3,
      textAlign: "center",
      zIndex: 2,
      flexShrink: 1,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor:
        theme === "dark" ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.5)", // subtle backdrop
      borderRadius: 8,
      textShadowColor: theme === "dark" ? "#000" : "#fff",
textShadowOffset: { width: 0, height: 1 },
textShadowRadius: 2,
    },

    shimmerOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1,
    },
    shimmer: {
      width: 80,
      height: "100%",
    },
  });
