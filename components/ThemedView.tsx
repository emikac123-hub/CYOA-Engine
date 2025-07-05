import { View, type ViewProps } from "react-native";
import { useTheme } from "../context/ThemeContext";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor = "#fff",
  darkColor = "#000",
  ...otherProps
}: ThemedViewProps) {
  const { theme } = useTheme();

  const backgroundColor = theme === "dark" ? darkColor : lightColor;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
