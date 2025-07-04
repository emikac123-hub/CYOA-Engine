import { Stack } from "expo-router";
import { LanguageProvider } from "../localization/LanguageProvider";

export default function RootLayout() {
  return (
    <LanguageProvider>
   <Stack screenOptions={{ headerShown: false }} />
    </LanguageProvider>
  );
}
export const screenOptions = {
  headerShown: false,
};
