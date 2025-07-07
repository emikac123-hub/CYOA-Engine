import storyIndex from "./stories/stories-en.json";

/**
 * Loads a specific story by its ID and language.
 * This is compatible with Metro bundler (React Native / Expo).
 *
 * @param storyId The unique identifier of the story to load (e.g., "covarnius").
 * @param lang Language code (e.g., "en", "de"). Defaults to "en".
 * @returns A Promise with story `meta` and `story` content.
 * @throws Error if the story or language is not supported.
 */
export const loadStory = async (
  storyId: string,
  lang: string = "en"
): Promise<{ meta: any; story: any[]; chapters: any[] }> => {
  const storyFileMap = {
    en: () => import("./stories/stories-en.json"),
    de: () => import("./stories/stories-de.json"),
    fr: () => import("./stories/stories-fr.json"),
    es: () => import("./stories/stories-es.json"),
    is: () => import("./stories/stories-is.json"),
    jp: () => import("./stories/stories-jp.json"),
  };

  const loader = storyFileMap[lang];
  if (!loader) {
    throw new Error(`Unsupported language: ${lang}`);
  }

  const mod = await loader();
  const storyBlock = mod[storyId];

  if (!storyBlock) {
    throw new Error(`Story block for "${storyId}" not found in ${lang}`);
  }

  return {
    meta: storyBlock.meta,
    story: storyBlock.story,
    chapters: storyBlock.meta?.chapters || [],
  };
};
