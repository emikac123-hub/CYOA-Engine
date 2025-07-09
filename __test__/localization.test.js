const fs = require("fs");
const path = require("path");

describe("JSON Structure Consistency", () => {
  const basePath = path.join(__dirname, "../localization"); // Adjust as needed
  const languages = ["en", "jp", "es", "fr", "is", "de"];

  const readJsonFile = (language) => {
    const filePath = path.join(basePath, `${language}.json`);
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  };

  const getAllKeys = (obj, prefix = "") => {
    return Object.keys(obj).reduce((acc, key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null) {
        return acc.concat(getAllKeys(obj[key], fullKey));
      }
      return acc.concat(fullKey);
    }, []);
  };

  it("should have the same keys across all language files", () => {
    const enJson = readJsonFile("en");
    const enKeys = getAllKeys(enJson).sort();

    languages.forEach((language) => {
      if (language === "en") return;

      const otherJson = readJsonFile(language);
      const otherKeys = getAllKeys(otherJson).sort();

      const missing = enKeys.filter((key) => !otherKeys.includes(key));
      const extra = otherKeys.filter((key) => !enKeys.includes(key));

      if (missing.length > 0 || extra.length > 0) {
        console.error(`❌ Key mismatch in "${language}.json":`);
        if (missing.length > 0) {
          console.error(`  🔻 Missing keys:\n    ${missing.join("\n    ")}`);
        }
        if (extra.length > 0) {
          console.error(`  🔺 Extra keys:\n    ${extra.join("\n    ")}`);
        }
      }

      expect(otherKeys).toEqual(enKeys);
    });
  });
});
