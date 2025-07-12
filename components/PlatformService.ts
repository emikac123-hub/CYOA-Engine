import { Platform } from "react-native";

/**
 * Checks if the OS supports the '🫥' emoji (Face with Dotted Outline).
 * iOS 16+ and Android 13+ (API 33+) support it.
 */
export function supportsDottedFaceEmoji(): boolean {
  if (Platform.OS === "ios") {
    const version = Platform.Version;
    const majorVersion = parseInt(
      typeof version === "string" ? version.split(".")[0] : `${version}`,
      10
    );
    return majorVersion >= 16;
  }

  if (Platform.OS === "android") {
    return typeof Platform.Version === "number" && Platform.Version >= 33;
  }

  return false; 
}

/**
 * Returns the best emoji to use for "delete" or "clear" actions.
 */
export function getDeleteEmoji(): string {
  return supportsDottedFaceEmoji() ? "🫥" : "🗑️";
}


export function blurSupported(): boolean {
  if (Platform.OS === "ios") {
    const version = Platform.Version;
    const majorVersion = parseInt(
      typeof version === "string" ? version.split(".")[0] : `${version}`,
      10
    );
    return majorVersion >= 11; // iOS 11+ supports BlurView reliably
  }

  if (Platform.OS === "android") {
    return typeof Platform.Version === "number" && Platform.Version >= 31; // Android 12+ (API 31)
  }

  return false; // Fallback for unknown platforms (web, etc.)
}

