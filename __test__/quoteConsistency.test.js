// These tests were ran to verify the modifed quote stories are identical to the origanl. Keeping in the repo in case I need to do something similar again.
// const fs = require("fs");
// const path = require("path");

// const stripQuotes = (text) => {
//   return text.replace(/[\"“”„]/g, "").trim();
// };

describe("📝 Quote Style Consistency Test (🇩🇪)", () => {
    test("True to be True.", () => {
        expect(true).toBe(true);
    });
//   let originalData, quotedData;
//   let originalStory, quotedStory;

//   beforeAll(() => {
//     const originalPath = path.join(__dirname, "../stories/stories-de.json");
//     const quotedPath = path.join(
//       __dirname,
//       "../stories/stories-de-quoted.json"
//     );

//     originalData = JSON.parse(fs.readFileSync(originalPath, "utf8"));
//     quotedData = JSON.parse(fs.readFileSync(quotedPath, "utf8"));

//     const storyId = Object.keys(originalData)[0];
//     originalStory = originalData[storyId].story;
//     quotedStory = quotedData[storyId].story;
//   });

//   test("All text fields match (ignoring quote style)", () => {
//     originalStory.forEach((origPage, index) => {
//       const quotedPage = quotedStory[index];

//       // Compare main text
//       if (origPage.text && quotedPage.text) {
//         const strippedOriginal = stripQuotes(origPage.text);
//         const strippedQuoted = stripQuotes(quotedPage.text);
//         expect(strippedQuoted).toBe(strippedOriginal);
//       }

//       // Compare each choice text
//       if (origPage.choices && quotedPage.choices) {
//         origPage.choices.forEach((origChoice, cIdx) => {
//           const quotedChoice = quotedPage.choices[cIdx];
//           if (origChoice.text && quotedChoice.text) {
//             const strippedOriginal = stripQuotes(origChoice.text);
//             const strippedQuoted = stripQuotes(quotedChoice.text);
//             expect(strippedQuoted).toBe(strippedOriginal);
//           }
//         });
//       }
//     });
//   });
// });

// const stripQuotesGui = (text) => {
//   return text.replace(/[\"«»“”„]/g, "").trim();
// };

// describe("📝 Guillemets Consistency Test (🇫🇷)", () => {
//   let originalData, convertedData;
//   let originalStory, convertedStory;

//   beforeAll(() => {
//     const originalPath = path.join(__dirname, "../stories/stories-fr.json");
//     const convertedPath = path.join(
//       __dirname,
//       "../stories/stories-fr-guillemets.json"
//     );

//     originalData = JSON.parse(fs.readFileSync(originalPath, "utf8"));
//     convertedData = JSON.parse(fs.readFileSync(convertedPath, "utf8"));

//     const storyId = Object.keys(originalData)[0];
//     originalStory = originalData[storyId].story;
//     convertedStory = convertedData[storyId].story;
//   });

//   test("All text and choices match (ignoring quote style)", () => {
//     originalStory.forEach((origPage, index) => {
//       const convertedPage = convertedStory[index];

//       // Compare page text
//       if (origPage.text && convertedPage.text) {
//         expect(stripQuotesGui(convertedPage.text)).toBe(
//           stripQuotesGui(origPage.text)
//         );
//       }

//       // Compare choices
//       if (origPage.choices && convertedPage.choices) {
//         origPage.choices.forEach((origChoice, cIdx) => {
//           const convChoice = convertedPage.choices[cIdx];
//           if (origChoice.text && convChoice.text) {
//             expect(stripQuotesGui(convChoice.text)).toBe(
//               stripQuotesGui(origChoice.text)
//             );
//           }
//         });
//       }
//     });
//   });
// });

// describe("📝 Quote Consistency Test (🇮🇸)", () => {
//   let originalData, convertedData;
//   let originalStory, convertedStory;

//   beforeAll(() => {
//     const originalPath = path.join(__dirname, "../stories/stories-is.json");
//     const convertedPath = path.join(
//       __dirname,
//       "../stories/stories-is-quoted.json"
//     );

//     originalData = JSON.parse(fs.readFileSync(originalPath, "utf8"));
//     convertedData = JSON.parse(fs.readFileSync(convertedPath, "utf8"));

//     const storyId = Object.keys(originalData)[0];
//     originalStory = originalData[storyId].story;
//     convertedStory = convertedData[storyId].story;
//   });

//   test("All text and choices match (ignoring quote style)", () => {
//     originalStory.forEach((origPage, index) => {
//       const convertedPage = convertedStory[index];

//       // Compare page text
//       if (origPage.text && convertedPage.text) {
//         expect(stripQuotes(convertedPage.text)).toBe(
//           stripQuotes(origPage.text)
//         );
//       }

//       // Compare choices
//       if (origPage.choices && convertedPage.choices) {
//         origPage.choices.forEach((origChoice, cIdx) => {
//           const convChoice = convertedPage.choices[cIdx];
//           if (origChoice.text && convChoice.text) {
//             expect(stripQuotes(convChoice.text)).toBe(
//               stripQuotes(origChoice.text)
//             );
//           }
//         });
//       }
//     });
//   });
 });
