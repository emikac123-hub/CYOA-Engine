const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "/images/stories");
const outputFile = path.join(__dirname, "imageMap.ts");

function getImportName(storyId, chapter, fileName) {
  const name = fileName.replace(/\.[^/.]+$/, ""); // remove extension
  return `${storyId}_${chapter}_${name}`.replace(/[^a-zA-Z0-9_]/g, "_");
}

function walkImages() {
  const imports = [];
  const mappings = {};

  const stories = fs.readdirSync(baseDir);

  stories.forEach((storyId) => {
    const storyPath = path.join(baseDir, storyId, "chapters");
    if (!fs.existsSync(storyPath)) return;

    const chapters = fs.readdirSync(storyPath);

    chapters.forEach((chapterId) => {
      const chapterPath = path.join(storyPath, chapterId);
      if (!fs.statSync(chapterPath).isDirectory()) return;

      const files = fs.readdirSync(chapterPath);
      files.forEach((file) => {
        const importName = getImportName(storyId, chapterId, file);
        const importPath = `../assets/images/stories/${storyId}/chapters/${chapterId}/${file}`;
        imports.push(`const ${importName} = require("${importPath}");`);
        mappings[`${storyId}/${chapterId}/${file}`] = importName;
      });
    });
  });

  const mapObject = Object.entries(mappings)
    .map(([key, value]) => `  "${key}": ${value}`)
    .join(",\n");

  const fileContent = `${imports.join("\n")}

const imageMap: Record<string, any> = {
${mapObject}
};

export default imageMap;
`;

  fs.writeFileSync(outputFile, fileContent);
  console.log("✅ imageMap.ts generated!");
}

walkImages();
