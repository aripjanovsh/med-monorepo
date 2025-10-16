import { PrismaClient } from "@prisma/client";

export class LanguageSeed {
  constructor(private prisma: PrismaClient) {}

  async seedLanguages() {
    console.log("🌐 Seeding languages...");

    // Comprehensive list of languages for medical system
    const languages = [
      // Regional languages (Central Asia) - Higher priority
      {
        name: "Uzbek",
        code: "uz",
        nativeName: "O'zbek tili",
        description: "Uzbek language - official language of Uzbekistan",
        weight: 1,
      },
      {
        name: "Russian",
        code: "ru",
        nativeName: "Русский язык",
        description: "Russian language - widely used in Central Asia",
        weight: 2,
      },
      {
        name: "Karakalpak",
        code: "kaa",
        nativeName: "Қарақалпақ тили",
        description: "Karakalpak language - spoken in Karakalpakstan",
        weight: 3,
      },
      {
        name: "Tajik",
        code: "tg",
        nativeName: "тоҷикӣ",
        description: "Tajik language",
        weight: 10,
      },
      {
        name: "Kazakh",
        code: "kk",
        nativeName: "қазақ тілі",
        description: "Kazakh language",
        weight: 11,
      },
      {
        name: "Kyrgyz",
        code: "ky",
        nativeName: "кыргыз тили",
        description: "Kyrgyz language",
        weight: 12,
      },
      {
        name: "Turkmen",
        code: "tk",
        nativeName: "türkmen dili",
        description: "Turkmen language",
        weight: 13,
      },

      // International languages - Medium priority
      {
        name: "English",
        code: "en",
        nativeName: "English",
        description: "English language - international language",
        weight: 20,
      },
      {
        name: "Arabic",
        code: "ar",
        nativeName: "العربية",
        description: "Arabic language",
        weight: 21,
      },
      {
        name: "Persian",
        code: "fa",
        nativeName: "فارسی",
        description: "Persian (Farsi) language",
        weight: 22,
      },
      {
        name: "Turkish",
        code: "tr",
        nativeName: "Türkçe",
        description: "Turkish language",
        weight: 23,
      },

      // Other common languages - Lower priority
      {
        name: "Chinese",
        code: "zh",
        nativeName: "中文",
        description: "Chinese language",
        weight: 30,
      },
      {
        name: "Hindi",
        code: "hi",
        nativeName: "हिन्दी",
        description: "Hindi language",
        weight: 31,
      },
      {
        name: "Urdu",
        code: "ur",
        nativeName: "اردو",
        description: "Urdu language",
        weight: 32,
      },
      {
        name: "Korean",
        code: "ko",
        nativeName: "한국어",
        description: "Korean language",
        weight: 33,
      },
      {
        name: "German",
        code: "de",
        nativeName: "Deutsch",
        description: "German language",
        weight: 40,
      },
      {
        name: "French",
        code: "fr",
        nativeName: "Français",
        description: "French language",
        weight: 41,
      },
      {
        name: "Spanish",
        code: "es",
        nativeName: "Español",
        description: "Spanish language",
        weight: 42,
      },
      {
        name: "Italian",
        code: "it",
        nativeName: "Italiano",
        description: "Italian language",
        weight: 43,
      },
      {
        name: "Japanese",
        code: "ja",
        nativeName: "日本語",
        description: "Japanese language",
        weight: 44,
      },
    ];

    // Use upsert to avoid duplicates
    const createdLanguages = [];
    for (const languageData of languages) {
      const language = await this.prisma.language.upsert({
        where: {
          name: languageData.name,
        },
        update: {
          ...languageData,
        },
        create: {
          ...languageData,
        },
      });
      createdLanguages.push(language);
    }

    return {
      languages: createdLanguages,
      count: createdLanguages.length,
    };
  }
}
