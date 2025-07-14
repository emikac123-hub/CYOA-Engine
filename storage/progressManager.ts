import AsyncStorage from "@react-native-async-storage/async-storage";
import storyData from "../stories/stories-en.json";
import { sha1 } from "js-sha1";

const PROGRESS_KEY_PREFIX = "story_progress_";
const CHAPTER_KEY_PREFIX = "story_chapter_";
export const CURRENT_PATH = "currentPath_";
export const HISTORY_KEY_PREFIX = "story_history_"; // e.g. story_history-covarnius
const UNLOCKED_CHAPTERS = "unlockedChapters-";

const DECISION_PATH_PREFIX = "decisionPath:";

export const getDecisionPathKey = (storyId: string, pageId: string) => {
  const hash = sha1(`${storyId}:${pageId}`);
  return `${DECISION_PATH_PREFIX}${storyId}:${hash}`;
};
export const saveProgress = async (storyId: string, pageId: string) => {
  await AsyncStorage.setItem(PROGRESS_KEY_PREFIX + storyId, pageId);
};

export const loadProgress = async (storyId: string): Promise<string | null> => {
  return await AsyncStorage.getItem(PROGRESS_KEY_PREFIX + storyId);
};

export const clearProgress = async (storyId: string) => {
  await AsyncStorage.multiRemove([
    `${PROGRESS_KEY_PREFIX}${storyId}`,
    `${UNLOCKED_CHAPTERS}${storyId}`,
    `${HISTORY_KEY_PREFIX}${storyId}`,
    `${CURRENT_PATH}${storyId}`,
  ]);
  await deleteAllDecisionPathsForStory(storyId);
};

// This is used when language is changed. Clear everything but the chapters the user unlocked.
export const clearProgressOnly = async (storyId: string) => {
  await AsyncStorage.multiRemove([
    PROGRESS_KEY_PREFIX + storyId,
    HISTORY_KEY_PREFIX + storyId,
    `${CURRENT_PATH}${storyId}`,
  ]);
  await deleteAllDecisionPathsForStory(storyId);
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
export const findMatchingDecisionPath = async (
  storyId: string,
  currentPageId: string
): Promise<string[] | null> => {
  console.log("⚡ Resolving matching path for:", currentPageId);
  const allKeys = await AsyncStorage.getAllKeys();
  const pathKeys = allKeys.filter((key) =>
    key.startsWith(`${DECISION_PATH_PREFIX}${storyId}:`)
  );

  const pathPairs = await AsyncStorage.multiGet(pathKeys);

  for (const [key, value] of pathPairs) {
    if (!value) continue;
    try {
      const parsed = JSON.parse(value);
      console.log("🔍 Value===", parsed);
      if (Array.isArray(parsed) && parsed.includes(currentPageId)) {
        console.log("✅ Matching path:", parsed);
        return parsed;
      }
    } catch (err) {
      console.warn("❌ Failed to parse:", key, value);
    }
  }

  console.log("❌ No matching path found.");
  return null;
};

export const saveDecisionPathWithKey = async (
  storyId: string,
  pageId: string,
  path: string[]
) => {
  const key = getDecisionPathKey(storyId, pageId);
  console.log("Stoy ID Being Saved: " + key);
  console.log("Path being saved: " + path);
  await AsyncStorage.setItem(key, JSON.stringify(path));
};
/**
 * Deletes all decision paths for a specific story from AsyncStorage.
 * @param storyId The ID of the story.
 */

export const deleteAllDecisionPathsForStory = async (storyId: string) => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const matchingKeys = allKeys.filter((key) =>
      key.startsWith(`decisionPath:${storyId}:`)
    );

    if (matchingKeys.length === 0) {
      console.log(`ℹ️ No decision paths found for story: ${storyId}`);
      return;
    }

    console.log(`🧹 Deleting decision paths for ${storyId}:`);
    matchingKeys.forEach((key) => console.log(`   ⛔ ${key}`));

    await AsyncStorage.multiRemove(matchingKeys);
    console.log(`✅ All decision paths for "${storyId}" have been deleted.`);
  } catch (error) {
    console.error(`❌ Error deleting decision paths for "${storyId}":`, error);
  }
};
