import AsyncStorage from "@react-native-async-storage/async-storage";
import storyData from "../stories/stories-en.json";

const PROGRESS_KEY_PREFIX = "story_progress_";
const CHAPTER_KEY_PREFIX = "story_chapter_";
export const HISTORY_KEY_PREFIX = "story_history_"; // e.g. story_history-covarnius

export const saveProgress = async (storyId: string, pageId: string) => {
  await AsyncStorage.setItem(PROGRESS_KEY_PREFIX + storyId, pageId);
};

export const loadProgress = async (storyId: string): Promise<string | null> => {
  return await AsyncStorage.getItem(PROGRESS_KEY_PREFIX + storyId);
};

export const clearProgress = async (storyId: string) => {
  await AsyncStorage.multiRemove([
    PROGRESS_KEY_PREFIX + storyId,
    `unlockedChapters-${storyId}`,
    HISTORY_KEY_PREFIX + storyId,
  ]);
};

export const clearProgressOnly = async (storyId: string) => {
  await AsyncStorage.multiRemove([
    PROGRESS_KEY_PREFIX + storyId,
    HISTORY_KEY_PREFIX + storyId,
  ]);
};

/**
 * Returns the last played story and pageId.
 * Falls back to the first story's "intro" page if no progress found.
 */
export const getLastPlayedStory = async (): Promise<{
  storyId: string;
  pageId: string;
  title: string;
}> => {
  const allStories = Object.entries(storyData).map(([id, block]: any) => ({
    id,
    title: block.meta?.title || id,
  }));

  for (const story of allStories) {
    const pageId = await AsyncStorage.getItem(PROGRESS_KEY_PREFIX + story.id);
    if (pageId) {
      return {
        storyId: story.id,
        pageId,
        title: story.title,
      };
    }
  }

  // Fallback to the first story
  const fallback = allStories[0];
  return {
    storyId: fallback.id,
    pageId: "intro",
    title: fallback.title,
  };
};

export const saveChapterProgress = async (
  storyId: string,
  chapterId: string
) => {
  try {
    await AsyncStorage.setItem(CHAPTER_KEY_PREFIX + storyId, chapterId);
  } catch (error) {
    console.error("Failed to save chapter progress:", error);
  }
};

export const loadChapterProgress = async (
  storyId: string
): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(CHAPTER_KEY_PREFIX + storyId);
  } catch (error) {
    console.error("Failed to load chapter progress:", error);
    return null;
  }
};

export const clearChapterProgress = async (storyId: string) => {
  try {
    await AsyncStorage.removeItem(CHAPTER_KEY_PREFIX + storyId);
  } catch (error) {
    console.error("Failed to clear chapter progress:", error);
  }
};
