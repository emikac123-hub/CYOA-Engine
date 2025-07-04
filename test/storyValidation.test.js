const fs = require("fs");
const path = require("path");
import {TESTING} from "../constants/Constants"
const languages = ["en", "de", "es", "fr", "is", "jp"];

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

      // Group page IDs by trimmed text
      story.forEach((page) => {
        const text = page.text.trim();
        if (!textMap[text]) {
          textMap[text] = [];
        }
        textMap[text].push(page.id);
      });

      // Find duplicates that are NOT entirely excluded
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
const diplomaticImmunityChapter = {
  en: "Diplomatic Immunity",
  fr: "Immunité Diplomatique",
  de: "Diplomatische Immunität",
  es: "Inmunidad Diplomática",
  is: "Friðhelgi diplómata",
  jp: "外交特権",
};

describe("🌐 Verify Part_1_Diplomatic_Immunity title in all languages", () => {
  const languages = Object.keys(diplomaticImmunityChapter);

  languages.forEach((lang) => {
    test(`${lang.toUpperCase()}: should have correct chapter title and order for Part_1_Diplomatic_Immunity`, () => {
      const filePath = path.join(
        __dirname,
        `../stories/covarnius-${lang}.json`
      );
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const story = storyData.story;

      const page = story.find((p) => p.id === "Part_1_Diplomatic_Immunity");

      expect(page).toBeDefined();
      expect(page.chapter).toBeDefined();
      expect(page.chapter.title).toContain(diplomaticImmunityChapter[lang]);
      expect(page.chapter.order).toEqual(10);
    });
  });
});

const boardingTicketChapter = {
  en: "Boarding Ticket?",
  fr: "Votre billet d’embarquement ?",
  de: "Wo ist dein Boardingpass?",
  es: "¿Tu boleto de embarque?",
  is: "Brottfararmiðinn þinn?",
  jp: "搭乗券はどこですか？",
};

describe("🌐 Verify Part_1_Boarding_Ticket localized prompt", () => {
  const languages = Object.keys(boardingTicketChapter);

  languages.forEach((lang) => {
    test(`${lang.toUpperCase()}: should include localized boarding ticket question`, () => {
      const filePath = path.join(
        __dirname,
        `../stories/covarnius-${lang}.json`
      );
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const story = storyData.story;

      const page = story.find((p) => p.id === "Part_1_Boarding_Ticket");

      expect(page).toBeDefined();
      expect(page.chapter.title).toContain(boardingTicketChapter[lang]);
      expect(page.chapter.order).toEqual(11);
    });
  });
});

const IntroChapter = {
  en: "Adventure Time!",
  fr: "C’est l’heure de l’aventure !",
  de: "Zeit für ein Abenteuer!",
  es: "¡Hora de aventura!",
  is: "Tími til ævintýra!",
  jp: "冒険の時間だ!",
};

describe("🌐 Verify Part_1_Adventure_Time localized title", () => {
  const languages = Object.keys(IntroChapter);

  languages.forEach((lang) => {
    test(`${lang.toUpperCase()}: should include localized Adventure Time text`, () => {
      const filePath = path.join(
        __dirname,
        `../stories/covarnius-${lang}.json`
      );
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const story = storyData.story;

      const page = story.find((p) => p.id === "intro");

      expect(page).toBeDefined();
      expect(page.chapter.title).toContain(IntroChapter[lang]);
      expect(page.chapter.order).toEqual(2);
    });
  });
});

const targetIds = ["Part_1_Dissect_My_Brains", "Part_1_Fork_In_The_Road"];

const ForkInTheRoadChapter = {
  en: "Fork In The Road",
  fr: "Carrefour du destin",
  de: "Weggabelung",
  es: "Encrucijada",
  is: "Á vegamótum",
  jp: "分かれ道",
};

describe("🌐 Verify 'Fork in the Road' chapter titles across all languages and pages", () => {
  const languages = Object.keys(ForkInTheRoadChapter);

  languages.forEach((lang) => {
    targetIds.forEach((id) => {
      test(`${lang.toUpperCase()} | ${id} should contain correct chapter title and order`, () => {
        const filePath = path.join(
          __dirname,
          `../stories/covarnius-${lang}.json`
        );
        const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const story = storyData.story;

        const page = story.find((p) => p.id === id);

        expect(page).toBeDefined();
        expect(page.chapter).toBeDefined();

        expect(page.chapter.title).toContain(ForkInTheRoadChapter[lang]);
        expect(page.chapter.order).toEqual(3);
      });
    });
  });
});

const hapalDownTranslations = {
  en: "Let Hapal Down 😢",
  fr: "Décevoir Hapal 😢",
  de: "Hapal enttäuscht 😢",
  es: "Decepcionamos a Hapal 😢",
  is: "Við svikuðum Hapal 😢",
  jp: "ハパルをがっかりさせた 😢",
};

describe("🌐 Verify 'Let Hapal Down' chapter title", () => {
  const languages = Object.keys(hapalDownTranslations);

  languages.forEach((lang) => {
    test(`${lang.toUpperCase()} | Part_1_Hapal_Down includes correct localized title`, () => {
      const filePath = path.join(
        __dirname,
        `../stories/covarnius-${lang}.json`
      );
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const story = storyData.story;

      const page = story.find((p) => p.id === "Part_1_Hapal_Down");

      expect(page).toBeDefined();
      expect(page.chapter.title).toContain(hapalDownTranslations[lang]);
      expect(page.chapter.order).toEqual(6);
    });
  });
});
const hapalstanceTranslations = {
  en: "Random Hapalstance",
  fr: "Coïncidence Hapalesque",
  de: "Zufall à la Hapal",
  es: "Hapalstancia Aleatoria",
  is: "Tilviljun Hapal-stílsins",
  jp: "ハパル的な偶然",
};

describe("🌐 Verify 'Random Hapalstance' chapter title", () => {
  const languages = Object.keys(hapalstanceTranslations);

  languages.forEach((lang) => {
    test(`${lang.toUpperCase()} | Part_1_Hapalstance includes correct localized title`, () => {
      const filePath = path.join(
        __dirname,
        `../stories/covarnius-${lang}.json`
      );
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const story = storyData.story;

      const page = story.find((p) => p.id === "Part_1_Hapalstance");

      expect(page).toBeDefined();
      expect(page.chapter.title).toContain(hapalstanceTranslations[lang]);
      expect(page.chapter.order).toEqual(5);
    });
  });
});

const raidOnCovarniusChapter = {
  en: "Raid on Covarnius",
  fr: "Assaut sur Covarnius",
  de: "Überfall auf Covarnius",
  es: "Ataque a Covarnius",
  is: "Árás á Covarnius",
  jp: "コヴァルニウスへの襲撃",
};

describe("🌐 Verify 'Raid on Covarnius' chapter title on Part_1_Sneak", () => {
  const languages = Object.keys(raidOnCovarniusChapter);

  languages.forEach((lang) => {
    test(`${lang.toUpperCase()}: Part_1_Sneak contains correct chapter title and order`, () => {
      const filePath = path.join(
        __dirname,
        `../stories/covarnius-${lang}.json`
      );
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const story = storyData.story;

      const page = story.find((p) => p.id === "Part_1_Sneak");

      expect(page).toBeDefined();
      expect(page.chapter).toBeDefined();
      expect(page.chapter.title).toContain(raidOnCovarniusChapter[lang]);
      expect(page.chapter.order).toEqual(12); // Change this if order is different
    });
  });
});
const riseAndShineChapter = {
  en: "Rise and Shine",
  fr: "Debout là-dedans !",
  de: "Aufwachen, ihr Schlafmützen!",
  es: "¡Arriba, que ya es hora!",
  is: "Rífið ykkur á fætur!",
  jp: "起きろ、もう朝だ！",
};

describe("🌐 Verify 'Rise and Shine' chapter title on Part_2_Hypersleep", () => {
  const languages = Object.keys(riseAndShineChapter);

  languages.forEach((lang) => {
    test(`${lang.toUpperCase()}: Part_2_Hypersleep has correct chapter title and order`, () => {
      const filePath = path.join(
        __dirname,
        `../stories/covarnius-${lang}.json`
      );
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const story = storyData.story;

      const page = story.find((p) => p.id === "Part_2_Hypersleep");

      expect(page).toBeDefined();
      expect(page.chapter).toBeDefined();
      expect(page.chapter.title).toContain(riseAndShineChapter[lang]);
      expect(page.chapter.order).toEqual(12);
    });
  });
});

const scientistChapterTitle = {
  en: "Time to Help!",
  fr: "Il est temps d’aider !",
  de: "Zeit zu helfen!",
  es: "¡Es hora de ayudar!",
  is: "Tími til að hjálpa!",
  jp: "助ける時間だ！",
};

describe("🌐 Verify 'After all, I am a scientist!' chapter title on Part_1_Not_Scientist", () => {
  const languages = Object.keys(scientistChapterTitle);

  languages.forEach((lang) => {
    test(`${lang.toUpperCase()}: Part_1_Not_Scientist has correct chapter title and order`, () => {
      const filePath = path.join(
        __dirname,
        `../stories/covarnius-${lang}.json`
      );
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const story = storyData.story;

      const page = story.find((p) => p.id === "Part_1_Not_Scientist");

      expect(page).toBeDefined();
      expect(page.chapter).toBeDefined();
      expect(page.chapter.title).toContain(scientistChapterTitle[lang]);
      expect(page.chapter.order).toEqual(9);
    });
  });
});
const fakinItChapter = {
  en: "Fakin' It",
  fr: "En pleine imposture",
  de: "Hochstapler am Werk",
  es: "Fingiendo ser quien no soy",
  is: "Að þykjast",
  jp: "なりすまし中",
};

describe("🌐 Verify 'Fakin' It' chapter title on Part_1_Fake_Til_You_Make", () => {
  const languages = Object.keys(fakinItChapter);

  languages.forEach((lang) => {
    test(`${lang.toUpperCase()}: Part_1_Fake_Til_You_Make has correct chapter title and order`, () => {
      const filePath = path.join(
        __dirname,
        `../stories/covarnius-${lang}.json`
      );
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const story = storyData.story;

      const page = story.find((p) => p.id === "Part_1_Fake_Til_You_Make");

      expect(page).toBeDefined();
      expect(page.chapter).toBeDefined();
      expect(page.chapter.title).toContain(fakinItChapter[lang]);
      expect(page.chapter.order).toEqual(8);
    });
  });
});
const theKingChapter = {
  en: "The King",
  fr: "Le Roi",
  de: "Der König",
  es: "El Rey",
  is: "Kóngurinn",
  jp: "王様",
};

describe("🌐 Verify 'The King' chapter title on Part_1_Greatest_Scientist", () => {
  const languages = Object.keys(theKingChapter);

  languages.forEach((lang) => {
    test(`${lang.toUpperCase()}: Part_1_Greatest_Scientist has correct chapter title and order`, () => {
      const filePath = path.join(
        __dirname,
        `../stories/covarnius-${lang}.json`
      );
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const story = storyData.story;

      const page = story.find((p) => p.id === "Part_1_Greatest_Scientist");

      expect(page).toBeDefined();
      expect(page.chapter).toBeDefined();
      expect(page.chapter.title).toContain(theKingChapter[lang]);
      expect(page.chapter.order).toEqual(7);
    });
  });
});
const saveTheHapalChapter = {
  en: "Save the Hapal",
  fr: "Sauver Hapal",
  de: "Rettet Hapal",
  es: "¡Salva al Hapal!",
  is: "Bjargið Hapal",
  jp: "ハパルを救え！",
};

describe("🌐 Verify 'Save the Hapal' chapter title on Part_1_Save_The_Hapal", () => {
  const languages = Object.keys(saveTheHapalChapter);

  languages.forEach((lang) => {
    test(`${lang.toUpperCase()}: Part_1_Save_The_Hapal has correct chapter title and order`, () => {
      const filePath = path.join(
        __dirname,
        `../stories/covarnius-${lang}.json`
      );
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const story = storyData.story;

      const page = story.find((p) => p.id === "Part_1_Save_The_Hapal");

      expect(page).toBeDefined();
      expect(page.chapter).toBeDefined();
      expect(page.chapter.title).toContain(saveTheHapalChapter[lang]);
      expect(page.chapter.order).toEqual(6);
    });
  });
});
const cowboysOfKatoniaChapter = {
  en: "Cowboys of Katonia",
  fr: "Les cowboys de Katonia",
  de: "Die Cowboys von Katonia",
  es: "Los vaqueros de Katonia",
  is: "Kúrekarnir frá Katonia",
  jp: "カトニアのカウボーイたち"
};

describe("🌐 Verify 'Cowboys of Katonia' chapter title on Part_1_Cowboys_Of_Katonia", () => {
  const languages = Object.keys(cowboysOfKatoniaChapter);

  languages.forEach((lang) => {
    test(`${lang.toUpperCase()}: Part_1_Cowboys_Of_Katonia has correct chapter title and order`, () => {
      const filePath = path.join(__dirname, `../stories/covarnius-${lang}.json`);
      const storyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const story = storyData.story;

      const page = story.find((p) => p.id === "Part_1_Cowboys_Of_Katonia");

      expect(page).toBeDefined();
      expect(page.chapter).toBeDefined();
      expect(page.chapter.title).toContain(cowboysOfKatoniaChapter[lang]);
      expect(page.chapter.order).toEqual(4);
    });
  });
});
// __tests__/constants.test.ts


describe("TESTING constant", () => {
  it("should be set to false before commit", () => {
    expect(TESTING).toBe(false);
  });
});
