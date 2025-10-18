// Simple Cyrillic -> Latin transliteration tailored for Russian/Uzbek Cyrillic.
// Output is lowercased and spaces normalized to single spaces.

const MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  // Uzbek-specific
  қ: "q",
  ғ: "g'",
  ҳ: "h",
  ў: "o'",
  // Uppercase variants will be lowercased before mapping
};

export function transliterateToLatinLower(input: string): string {
  if (!input) return "";
  const lower = input.toLowerCase();
  let out = "";
  for (const ch of lower) {
    out += MAP[ch] ?? ch;
  }
  return out.replace(/\s+/g, " ").trim();
}

export function buildSearchTokens(
  values: Array<string | undefined | null>,
): string {
  const tokens: string[] = [];
  for (const v of values) {
    const s = (v ?? "").toString().trim();
    if (!s) continue;
    const lower = s.toLowerCase();
    const latin = transliterateToLatinLower(s);
    tokens.push(lower);
    if (latin !== lower) tokens.push(latin);
  }
  return tokens.join(" ").replace(/\s+/g, " ").trim();
}
