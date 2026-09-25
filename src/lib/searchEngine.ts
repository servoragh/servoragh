import { scoreItem } from "./reliableSearch";

/**
 * Servora Hybrid Typo-Tolerant Global Search Engine
 * High-performance, zero-cost fuzzy search algorithm supporting Levenshtein distance,
 * trigram matching, stop-word removal, and location proximity boosting.
 */

// Common grammatical stop words to strip out only when query contains other terms
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "for", "in", "at", "to", "with", "of", "by",
  "on", "from", "is", "it", "my", "me", "your", "our", "us", "are", "be", "this",
  "that", "these", "those", "can", "need", "want", "looking"
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
  const words = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // unaccent
    .replace(/[^\w\s]/gi, " ")       // remove punctuation
    .split(/\s+/)
    .filter((t) => t.length >= 1);

  const filtered = words.filter((t) => !STOP_WORDS.has(t));
  return filtered.length > 0 ? filtered : words;
}

/**
 * Calculates a comprehensive relevance score for any item against search query tokens,
 * applying typo tolerance, multi-token awareness, synonym expansion, and location proximity boosting.
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

  const queryString = queryTokens.join(" ");
  const baseScore = scoreItem(
    {
      title: item.titleOrName,
      category: item.category,
      description: item.descriptionOrBio,
      area: item.locationOrArea,
      tags: item.tags,
    },
    queryString
  );

  let locationBonus = 0;
  if (userLocation && (item.locationOrArea || "").toLowerCase().includes(userLocation.toLowerCase())) {
    locationBonus = 50;
  }

  return baseScore + locationBonus;
}
