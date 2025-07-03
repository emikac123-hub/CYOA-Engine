const fs = require("fs");
const path = require("path");

const languages = ["en", "de", "es", "fr", "is", "ja"];

languages.forEach((lang) => {
  const filePath = path.join(__dirname, `../stories/covarnius-${lang}.json`);

  describe(`🌐 Translation: ${lang.toUpperCase()}`, () => {
    let story;

    beforeAll(() => {
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      story = storyData.story;
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

    test("No story page should have more than 550 characters of text", () => {
      const longPages = story.filter((page) => page.text.trim().length > 550);
      if (longPages.length > 0) {
        console.warn(
          `⚠️ ${lang.toUpperCase()} has ${longPages.length} long pages:`,
          longPages.map((p) => p.id)
        );
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

    test("No duplicate page text", () => {
      const textCounts = {};
      story.forEach((page) => {
        const text = page.text.trim();
        textCounts[text] = (textCounts[text] || 0) + 1;
      });

      const duplicates = Object.entries(textCounts)
        .filter(([text, count]) => count > 1)
        .map(([text, count]) => ({ text, count }));

      if (duplicates.length > 0) {
        console.warn(`⚠️ ${lang.toUpperCase()} has duplicate text passages:`);
        duplicates.forEach((dup, i) => {
          console.warn(
            `  ${i + 1}. (${dup.count}x) ${dup.text.slice(0, 60)}...`
          );
        });
      }

      expect(duplicates.length).toBe(0);
    });
  });
});
