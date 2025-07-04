import storyIndex from "./stories/storyIndex.json";

// Manually map story content by storyId and language
const storyMap: Record<string, Record<string, () => Promise<any>>> = {
  covarnius: {
    en: () => import("./stories/covarnius-en.json"),
    de: () => import("./stories/covarnius-de.json"),
    fr: () => import("./stories/covarnius-fr.json"),
    es: () => import("./stories/covarnius-es.json"),
    is: () => import("./stories/covarnius-is.json"),
    ja: () => import("./stories/covarnius-jp.json"),
  },
};

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
): Promise<{ meta: any; story: any[] }> => {
  const meta = storyIndex.find((story) => story.id === storyId);
  if (!meta) throw new Error(`Metadata for story "${storyId}" not found.`);

  const loader = storyMap[storyId]?.[lang];
  if (!loader) {
    throw new Error(`Story content for "${storyId}" in language "${lang}" not found.`);
  }

  const mod = await loader();
  return {
    meta,
    story: mod.story,
  };
};
