import AsyncStorage from "@react-native-async-storage/async-storage";
import storyIndex from "../stories/storyIndex.json";
const PROGRESS_KEY_PREFIX = "story_progress_";

export const saveProgress = async (storyId: string, pageId: string) => {
  await AsyncStorage.setItem(PROGRESS_KEY_PREFIX + storyId, pageId);
};

export const loadProgress = async (storyId: string): Promise<string | null> => {
  return await AsyncStorage.getItem(PROGRESS_KEY_PREFIX + storyId);
};

export const clearProgress = async (storyId: string) => {
  await AsyncStorage.removeItem(PROGRESS_KEY_PREFIX + storyId);
};
export const getLastPlayedStory = async (): Promise<{
  storyId: string;
  pageId: string;
  title: string;
} | null> => {
  for (const story of storyIndex) {
    const pageId = await AsyncStorage.getItem(PROGRESS_KEY_PREFIX + story.id);
    if (pageId) {
      return {
        storyId: story.id,
        pageId,
        title: story.title,
      };
    }
  }
  return null;
};
