import storyIndex from "./stories/storyIndex.json";

/**
 * Loads a specific story by its ID.
 * It retrieves the story's metadata from `storyIndex.json` and then dynamically imports
 * the corresponding story content based on the story ID.
 *
 * @param storyId The unique identifier of the story to load.
 * @returns A Promise that resolves to an object containing the story's metadata and its content.
 * @throws Error if the story metadata or content is not found.
 */
export const loadStory = async (storyId: string): Promise<{
  meta: any;
  story: any[];
}> => {
  // Find the story's metadata in the storyIndex.json file
  const meta = storyIndex.find((story) => story.id === storyId);
  if (!meta) {
    // If metadata is not found, throw an error
    throw new Error(`Metadata for story "${storyId}" not found.`);
  }

  // Load story content based on the provided storyId
  switch (storyId) {
    case "covarnius": {
      // Dynamically import the covarnius story JSON file
      const mod = await import("./stories/covarnius-en.json");
      console.log("Loaded story module:", mod);
      return {
        meta,          // Return the metadata found earlier
        story: mod.story, // Return the story content from the imported module
      };
    }
    default:
      // If the storyId does not match any known story content, throw an error
      throw new Error(`Story content for "${storyId}" not found.`);
  }
};
