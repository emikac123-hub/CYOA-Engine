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
  await AsyncStorage.multiRemove([
    PROGRESS_KEY_PREFIX + storyId,
    `unlockedChapters-${storyId}`,
  ]);
};
// storage/progressManager.ts
export const clearProgressOnly = async (storyId: string) => {
  await AsyncStorage.removeItem(`story_progress_${storyId}`);
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

  // Fallback to the first story in the index
  const fallback = storyIndex[0];
  return {
    storyId: fallback.id,
    pageId: "intro", // assumes the starting point is always "intro"
    title: fallback.title,
  };
};
const CHAPTER_KEY_PREFIX = "story_chapter_";

/**
 * Saves the latest unlocked chapter for a story.
 * @param storyId The unique identifier of the story.
 * @param chapterId The chapter ID to save (e.g., "Part_1_Cowboys_Of_Katonia").
 */
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

/**
 * Loads the most recently unlocked chapter for a story.
 * @param storyId The unique identifier of the story.
 * @returns The saved chapter ID, or null if none is found.
 */
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

/**
 * Clears the chapter progress for a story.
 * @param storyId The unique identifier of the story.
 */
export const clearChapterProgress = async (storyId: string) => {
  try {
    await AsyncStorage.removeItem(CHAPTER_KEY_PREFIX + storyId);
  } catch (error) {
    console.error("Failed to clear chapter progress:", error);
  }
};
