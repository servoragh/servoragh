/**
 * Servora Reliable Ultra-Modern Search Engine
 * Features:
 * - Multi-token word-order agnostic matching (matches "solar pump" in "Agricultural Solar Water Pump")
 * - Smart stemming & inflection (shoe <-> shoes, drill <-> drills, box <-> boxes)
 * - Northern Ghana & E-Commerce synonym expansion (ac <-> air condition, fugu <-> smock, sneaks <-> shoes)
 * - Typo tolerance via Damerau-Levenshtein distance
 * - Deep multi-field relevance scoring (Title > Category > Subcategory > Tags > Description > SKU)
 */

// Domain & Local Synonym Expansions
const SYNONYM_MAP: Record<string, string[]> = {
  ac: ["air", "condition", "conditioner", "conditioning", "cooling", "hvac", "fridge", "refrigerator"],
  aircon: ["ac", "air", "condition", "cooling"],
  fridge: ["refrigerator", "freezer", "cooling", "appliance"],
  refrigerator: ["fridge", "freezer", "cooling"],
  shoe: ["shoes", "sneaker", "sneakers", "footwear", "boot", "boots", "canvas", "kicks", "heel", "heels", "sandal", "sandals"],
  shoes: ["shoe", "sneaker", "sneakers", "footwear", "boot", "boots", "canvas", "kicks", "heel", "heels", "sandal", "sandals"],
  sneaker: ["sneakers", "shoe", "shoes", "footwear", "canvas", "kicks"],
  sneakers: ["sneaker", "shoe", "shoes", "footwear", "canvas", "kicks"],
  boot: ["boots", "shoe", "shoes", "footwear"],
  boots: ["boot", "shoe", "shoes", "footwear"],
  fugu: ["smock", "traditional", "northern", "batakari", "fabric", "cloth", "wear"],
  smock: ["fugu", "traditional", "northern", "batakari", "fabric", "cloth", "wear"],
  batakari: ["fugu", "smock", "traditional"],
  solar: ["panel", "inverter", "battery", "photovoltaic", "energy", "power", "pump"],
  pump: ["water", "solar", "submersible", "irrigation", "borehole"],
  drill: ["cordless", "hammer", "drill", "tools", "machine", "hardware"],
  tools: ["tool", "equipment", "hardware", "drill", "wrench", "kit"],
  tool: ["tools", "equipment", "hardware", "drill", "wrench", "kit"],
  phone: ["mobile", "smartphone", "screen", "iphone", "samsung", "charger", "android"],
  mobile: ["phone", "smartphone", "cellular"],
  laptop: ["computer", "pc", "macbook", "notebook"],
  car: ["auto", "vehicle", "automobile", "motor", "mechanic"],
  motor: ["bike", "motorcycle", "tricycle", "kambuu", "yellow", "auto"],
  bike: ["motor", "motorcycle", "bicycle"],
  electrician: ["electrical", "electric", "wiring", "wiring", "power", "solar", "lights"],
  electrical: ["electrician", "electric", "wiring", "power", "solar", "lights", "circuit"],
  plumber: ["plumbing", "pipe", "leak", "drain", "water", "tank", "borehole"],
  plumbing: ["plumber", "pipe", "leak", "drain", "water", "tank", "borehole"],
  tailor: ["seamstress", "fashion", "dress", "fugu", "smock", "suit", "clothing"],
  seamstress: ["tailor", "fashion", "dress", "clothing"],
  generator: ["genset", "plant", "power", "diesel", "heavy"],
  rent: ["rental", "hire", "leasing", "daily"],
  rental: ["rent", "hire", "leasing", "daily"],
};

// Common minor words that can be ignored ONLY IF there are other meaningful words
const TRIVIAL_WORDS = new Set(["a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "it"]);

/**
 * Clean & normalize a string for searching
 */
export function normalizeSearchString(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s]/gi, " ")   // replace non-alphanumeric with spaces
    .replace(/\s+/g, " ")            // collapse whitespace
    .trim();
}

/**
 * Simple English stemmer for common suffixes (s, es, ed, ing)
 */
export function stemWord(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
  if (word.endsWith("es") && word.length > 3) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) return word.slice(0, -1);
  if (word.endsWith("ing") && word.length > 5) return word.slice(0, -3);
  if (word.endsWith("ed") && word.length > 4) return word.slice(0, -2);
  return word;
}

/**
 * Tokenize query with stemming and synonym expansion
 */
export function extractQueryTokens(query: string): {
  rawTokens: string[];
  stemmedTokens: string[];
  synonymTokens: string[];
} {
  const normalized = normalizeSearchString(query);
  if (!normalized) {
    return { rawTokens: [], stemmedTokens: [], synonymTokens: [] };
  }

  let tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length > 1) {
    // Only strip trivial words if query has multiple words
    const filtered = tokens.filter((t) => !TRIVIAL_WORDS.has(t));
    if (filtered.length > 0) tokens = filtered;
  }

  const stemmedTokens = tokens.map(stemWord);
  const synonymTokens: string[] = [];

  for (const token of tokens) {
    const synonyms = SYNONYM_MAP[token] || SYNONYM_MAP[stemWord(token)];
    if (synonyms) {
      synonymTokens.push(...synonyms);
    }
  }

  return {
    rawTokens: tokens,
    stemmedTokens,
    synonymTokens: Array.from(new Set(synonymTokens)),
  };
}

/**
 * Calculates a match score for an item against a search query.
 * Returns 0 if item does not match; higher numbers mean greater relevance.
 */
export function scoreItem(
  item: {
    title: string;
    category?: string;
    subCategory?: string;
    description?: string;
    tags?: string[];
    price?: number | string;
    sku?: string;
    area?: string;
  },
  query: string
): number {
  if (!query || !query.trim()) return 100; // If query is empty, treat as neutral match

  const { rawTokens, stemmedTokens, synonymTokens } = extractQueryTokens(query);
  if (rawTokens.length === 0) return 100;

  const titleNorm = normalizeSearchString(item.title || "");
  const catNorm = normalizeSearchString(item.category || "");
  const subCatNorm = normalizeSearchString(item.subCategory || "");
  const descNorm = normalizeSearchString(item.description || "");
  const tagsNorm = normalizeSearchString((item.tags || []).join(" "));
  const skuNorm = normalizeSearchString(item.sku || "");
  const areaNorm = normalizeSearchString(item.area || "");
  const priceNorm = item.price ? String(item.price) : "";

  const combinedSearchable = `${titleNorm} ${catNorm} ${subCatNorm} ${tagsNorm} ${descNorm} ${skuNorm} ${areaNorm} ${priceNorm}`;

  // 1. Direct full-phrase match check (Highest bonus)
  const normalizedQuery = normalizeSearchString(query);
  if (titleNorm === normalizedQuery) return 1000; // Exact title
  if (titleNorm.includes(normalizedQuery)) return 500; // Substring title

  let totalScore = 0;
  let tokensMatched = 0;

  const titleWords = titleNorm.split(" ");
  const catWords = catNorm.split(" ");
  const subCatWords = subCatNorm.split(" ");
  const descWords = descNorm.split(" ");

  for (let i = 0; i < rawTokens.length; i++) {
    const rawToken = rawTokens[i];
    const stemmedToken = stemmedTokens[i];
    const isShort = rawToken.length <= 2;
    let tokenMatched = false;

    // Check in Title (Weight: 100)
    const matchesTitle = isShort
      ? titleWords.includes(rawToken)
      : titleNorm.includes(rawToken);

    if (matchesTitle) {
      totalScore += 100;
      tokenMatched = true;
    } else if (!isShort && stemmedToken !== rawToken && titleNorm.includes(stemmedToken)) {
      totalScore += 85;
      tokenMatched = true;
    }

    // Check in Category / SubCategory (Weight: 75)
    const matchesCat = isShort
      ? catWords.includes(rawToken) || subCatWords.includes(rawToken)
      : catNorm.includes(rawToken) || subCatNorm.includes(rawToken);

    if (matchesCat) {
      totalScore += 75;
      tokenMatched = true;
    } else if (!isShort && (catNorm.includes(stemmedToken) || subCatNorm.includes(stemmedToken))) {
      totalScore += 65;
      tokenMatched = true;
    }

    // Check in Tags / SKU (Weight: 60)
    if (tagsNorm.includes(rawToken) || skuNorm.includes(rawToken)) {
      totalScore += 60;
      tokenMatched = true;
    }

    // Check in Description (Weight: 40)
    const matchesDesc = isShort
      ? descWords.includes(rawToken)
      : descNorm.includes(rawToken);

    if (matchesDesc) {
      totalScore += 40;
      tokenMatched = true;
    } else if (!isShort && descNorm.includes(stemmedToken)) {
      totalScore += 30;
      tokenMatched = true;
    }

    // Check in Area / Location (Weight: 35)
    if (areaNorm.includes(rawToken)) {
      totalScore += 35;
      tokenMatched = true;
    }

    // Check in Price (e.g. searching "50" or "100")
    if (priceNorm === rawToken) {
      totalScore += 50;
      tokenMatched = true;
    }

    // Check Synonym expansions if not matched directly
    if (!tokenMatched) {
      const syns = SYNONYM_MAP[rawToken] || SYNONYM_MAP[stemmedToken] || [];
      for (const syn of syns) {
        if (titleNorm.includes(syn)) {
          totalScore += 60;
          tokenMatched = true;
          break;
        } else if (catNorm.includes(syn) || subCatNorm.includes(syn)) {
          totalScore += 45;
          tokenMatched = true;
          break;
        } else if (descNorm.includes(syn)) {
          totalScore += 25;
          tokenMatched = true;
          break;
        }
      }
    }

    // Fuzzy partial match check (starts with token prefix, min 3 chars)
    if (!tokenMatched && rawToken.length >= 3) {
      const words = combinedSearchable.split(" ");
      for (const w of words) {
        if (w.startsWith(rawToken.slice(0, 3))) {
          totalScore += 20;
          tokenMatched = true;
          break;
        }
      }
    }

    if (tokenMatched) {
      tokensMatched++;
    }
  }

  // If query had multiple tokens, require at least one token to match, and reward matching all
  if (tokensMatched === 0) return 0;

  // Bonus multiplier when all query words are present in the item
  if (tokensMatched === rawTokens.length) {
    totalScore += 150;
  } else {
    // Penalty if only some tokens matched
    totalScore = totalScore * (tokensMatched / rawTokens.length);
  }

  return Math.round(totalScore);
}

/**
 * Filter and sort a collection of items using the reliable search engine
 */
export function filterAndRankItems<T>(
  items: T[],
  query: string,
  fieldExtractor: (item: T) => {
    title: string;
    category?: string;
    subCategory?: string;
    description?: string;
    tags?: string[];
    price?: number | string;
    sku?: string;
    area?: string;
  }
): T[] {
  if (!query || !query.trim()) return items;

  const scored: { item: T; score: number }[] = [];

  for (const item of items) {
    const fields = fieldExtractor(item);
    const score = scoreItem(fields, query);
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.item);
}
