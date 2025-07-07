const fs = require("fs");
const path = require("path");

const languages = ["en", "de", "es", "fr", "is", "jp"];
const isCapitalized = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const firstChar = trimmed[0];
  return (
    firstChar === firstChar.toUpperCase() &&
    /[ „"A-ZÁÉÍÓÚÝÆÖÞ«À¡.¿“]/i.test(firstChar)
  );
};

languages.forEach((lang) => {
  const filePath = path.join(__dirname, `../stories/stories-${lang}.json`);

  describe(`🌐 Translation: ${lang.toUpperCase()}`, () => {
    let story;

    beforeAll(() => {
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const storyBlock = storyData[Object.keys(storyData)[0]];
      story = storyBlock.story;
    });

    test("All nextId values must reference an existing page ID", () => {
      const allIds = new Set(story.map((page) => page.id));
      const brokenLinks = [];

      story.forEach((page) => {
        if (page.choices) {
          page.choices.forEach((choice) => {
            if (!allIds.has(choice.nextId)) {
              brokenLinks.push({
                from: page.id,
                invalidNextId: choice.nextId,
              });
            }
          });
        }
      });

      expect(brokenLinks).toEqual([]);
    });
    test("All 'text' fields should start with a capital letter (excluding known exceptions)", () => {
      if (lang === 'jp') return;

        const EXCLUDED_IDS = new Set([
        "DedicationView",
        "Silver_Ending",
        "Gold_Ending",
      ]);

      const errors = story
        .filter((page) => !EXCLUDED_IDS.has(page.id))
        .map((page) => ({
          id: page.id,
          text: page.text.trim(),
        }))
        .filter((p) => !isCapitalized(p.text));

      if (errors.length > 0) {
        console.warn(
          `⚠️ Found ${errors.length} text fields that do not start with a capital letter:`
        );
        errors.forEach((p, i) => {
          console.warn(`  ${i + 1}. ID: ${p.id} → "${p.text.slice(0, 60)}..."`);
        });
      }

      expect(errors.length).toBe(0);
    });

    test("No story page should have more than 430 characters of text", () => {
      const longPages = story
        .map((page) => ({
          id: page.id,
          length: page.text.trim().length,
          text: page.text.trim(),
        }))
        .filter((p) => p.length > 430);

      if (longPages.length > 0) {
        console.warn(
          `⚠️ ${lang.toUpperCase()} has ${
            longPages.length
          } page(s) exceeding 430 characters:`
        );
        longPages.forEach((p, i) => {
          console.warn(`  ${i + 1}. ID: ${p.id} (${p.length} characters)`);
          console.warn(`     Text Preview: "${p.text.slice(0, 60)}..."`);
        });
      }

      expect(longPages.length).toBe(0);
    });

    test("No duplicate page IDs", () => {
      const idCounts = {};
      story.forEach((page) => {
        idCounts[page.id] = (idCounts[page.id] || 0) + 1;
      });

      const duplicates = Object.entries(idCounts).filter(
        ([id, count]) => count > 1
      );

      expect(duplicates).toEqual([]);
    });

    test("No duplicate page text (excluding known exceptions)", () => {
      const EXCLUDED_IDS = new Set([
        "DedicationView",
        "Silver_Ending",
        "Gold_Ending",
      ]);
      const textMap = {};

      story.forEach((page) => {
        const text = page.text.trim();
        if (!textMap[text]) {
          textMap[text] = [];
        }
        textMap[text].push(page.id);
      });

      const duplicates = Object.entries(textMap)
        .map(([text, ids]) => {
          const filteredIds = ids.filter((id) => !EXCLUDED_IDS.has(id));
          return { text, count: filteredIds.length, ids: filteredIds };
        })
        .filter((entry) => entry.count > 1);

      if (duplicates.length > 0) {
        console.warn(
          `⚠️ Found ${duplicates.length} duplicate text passages (excluding known exceptions):`
        );
        duplicates.forEach((dup, i) => {
          console.warn(
            `  ${i + 1}. (${dup.count}x) "${dup.text.slice(0, 60)}..."`
          );
          console.warn(`     Used in IDs: ${dup.ids.join(", ")}`);
        });
      }

      expect(duplicates.length).toBe(0);
    });

    test("No page should have a choice that loops back to itself (id === nextId)", () => {
      const selfLinking = [];

      story.forEach((page) => {
        if (page.choices) {
          page.choices.forEach((choice) => {
            if (choice.nextId === page.id) {
              selfLinking.push({
                id: page.id,
                text: page.text.trim().slice(0, 60) + "...",
              });
            }
          });
        }
      });

      if (selfLinking.length > 0) {
        console.warn(`⚠️ ${lang.toUpperCase()} has self-linking pages:`);
        selfLinking.forEach((p, i) => {
          console.warn(`  ${i + 1}. ID: ${p.id} links to itself → "${p.text}"`);
        });
      }

      expect(selfLinking.length).toBe(0);
    });
  });
});

// ✅ Update any similar `story = storyData.story` logic in later describe blocks
// For example:
const getStory = (filePath) => {
  const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return storyData[Object.keys(storyData)[0]].story;
};
