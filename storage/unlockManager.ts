import AsyncStorage from "@react-native-async-storage/async-storage";

const UNLOCK_KEY_PREFIX = "story_unlocked_";

export const isStoryUnlocked = async (storyId: string): Promise<boolean> => {
  const value = await AsyncStorage.getItem(UNLOCK_KEY_PREFIX + storyId);
  return value === "true";
};

export const unlockStory = async (storyId: string): Promise<void> => {
  await AsyncStorage.setItem(UNLOCK_KEY_PREFIX + storyId, "true");
};
