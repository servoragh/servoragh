/**
 * Servora Hybrid Typo-Tolerant Global Search Engine
 * High-performance, zero-cost fuzzy search algorithm supporting Levenshtein distance,
 * trigram matching, stop-word removal, and location proximity boosting.
 */

// Common stop words to strip out from search queries
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "for", "in", "at", "to", "with", "of", "by",
  "on", "from", "is", "it", "my", "me", "your", "our", "us", "are", "be", "this",
  "that", "these", "those", "can", "need", "want", "looking", "find", "get", "buy",
  "hire", "rent", "sell", "service", "services", "shop", "near", "tamale", "ghana"
]);

/**
 * Standard Levenshtein distance for typo matching.
 * Measures single-character edits (insertions, deletions, substitutions).
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Generates character trigrams for fuzzy substring similarity (e.g. "cemet" -> ["cem", "eme", "met"]).
 */
export function getTrigrams(text: string): Set<string> {
  const clean = `  ${text.toLowerCase()}  `;
  const trigrams = new Set<string>();
  for (let i = 0; i < clean.length - 2; i++) {
    trigrams.add(clean.substring(i, i + 3));
  }
  return trigrams;
}

/**
 * Trigram similarity coefficient between 0.0 and 1.0 (Dice / Jaccard index)
 */
export function trigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const setA = getTrigrams(a);
  const setB = getTrigrams(b);

  let intersection = 0;
  for (const tri of setA) {
    if (setB.has(tri)) intersection++;
  }

  const total = setA.size + setB.size;
  return total === 0 ? 0 : (2 * intersection) / total;
}

/**
 * Tokenize and normalize text into clean search tokens, removing stop words and punctuation.
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // unaccent
    .replace(/[^\w\s]/gi, " ")       // remove punctuation
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Calculates a comprehensive relevance score for any item against search query tokens,
 * applying typo tolerance (Levenshtein/Trigram) and location proximity boosting.
 */
export function calculateRelevanceScore(
  item: {
    titleOrName: string;
    category?: string;
    descriptionOrBio?: string;
    locationOrArea?: string;
    tags?: string[];
  },
  queryTokens: string[],
  userLocation?: string
): number {
  if (!queryTokens || queryTokens.length === 0) return 1;

  const rawTitle = item.titleOrName.toLowerCase();
  const rawCat = (item.category || "").toLowerCase();
  const rawDesc = (item.descriptionOrBio || "").toLowerCase();
  const rawLoc = (item.locationOrArea || "").toLowerCase();

  const titleTokens = tokenizeText(item.titleOrName);
  const categoryTokens = item.category ? tokenizeText(item.category) : [];

  let score = 0;

  for (const qToken of queryTokens) {
    let tokenScore = 0;

    // 1. Title / Name Match
    if (rawTitle === qToken) {
      tokenScore += 150; // Exact match
    } else if (rawTitle.includes(qToken)) {
      tokenScore += 100; // Exact substring match
    } else {
      // Fuzzy & Typo Matching against Title Tokens
      for (const tWord of titleTokens) {
        if (tWord.includes(qToken) || qToken.includes(tWord)) {
          tokenScore += 80;
          break;
        }

        // Trigram similarity match
        const triSim = trigramSimilarity(qToken, tWord);
        if (triSim > 0.45) {
          tokenScore += Math.round(triSim * 90);
          break;
        }

        // Levenshtein distance typo match (e.g. "cemet" -> "cement", "weldr" -> "welder")
        const maxDist = qToken.length > 5 ? 2 : qToken.length > 3 ? 1 : 0;
        if (maxDist > 0 && levenshteinDistance(qToken, tWord) <= maxDist) {
          tokenScore += 65;
          break;
        }
      }
    }

    // 2. Category Match
    if (rawCat.includes(qToken)) {
      tokenScore += 80;
    } else {
      for (const cWord of categoryTokens) {
        if (cWord.includes(qToken) || qToken.includes(cWord)) {
          tokenScore += 50;
          break;
        }
        if (trigramSimilarity(qToken, cWord) > 0.5) {
          tokenScore += 40;
          break;
        }
      }
    }

    // 3. Location & Proximity Boost
    if (rawLoc.includes(qToken)) {
      tokenScore += 60;
    }
    if (userLocation && rawLoc.includes(userLocation.toLowerCase())) {
      tokenScore += 40; // Neighborhood Proximity Bonus
    }

    // 4. Description & Bio Match
    if (rawDesc.includes(qToken)) {
      tokenScore += 30;
    } else {
      const triSimDesc = trigramSimilarity(qToken, rawDesc);
      if (triSimDesc > 0.35) {
        tokenScore += Math.round(triSimDesc * 40);
      }
    }

    score += tokenScore;
  }

  return score;
}
