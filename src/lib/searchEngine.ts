/**
 * Servora Advanced Fuzzy & Tokenized Search Engine
 * Zero-cost, high-speed relevance scoring algorithm for Products, Services & Artisans.
 */

// Simple Levenshtein distance for typo matching
export function levenshteinDistance(a: string, b: string): number {
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

// Tokenize and clean text into normalized search terms
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

// Calculate relevance score for a target text block against search tokens
export function calculateRelevanceScore(
  item: {
    titleOrName: string;
    category?: string;
    descriptionOrBio?: string;
    locationOrArea?: string;
  },
  queryTokens: string[]
): number {
  if (!queryTokens || queryTokens.length === 0) return 1;

  const titleTokens = tokenizeText(item.titleOrName);
  const categoryTokens = item.category ? tokenizeText(item.category) : [];
  const descTokens = item.descriptionOrBio ? tokenizeText(item.descriptionOrBio) : [];
  const areaTokens = item.locationOrArea ? tokenizeText(item.locationOrArea) : [];

  let score = 0;

  for (const qToken of queryTokens) {
    let tokenScore = 0;

    // 1. Title / Name exact or substring match
    if (item.titleOrName.toLowerCase().includes(qToken)) {
      tokenScore += 100;
    } else {
      // Fuzzy match on title words
      for (const tWord of titleTokens) {
        if (tWord.includes(qToken) || qToken.includes(tWord)) {
          tokenScore += 70;
          break;
        }
        if (qToken.length > 3 && tWord.length > 3 && levenshteinDistance(qToken, tWord) <= 2) {
          tokenScore += 50;
          break;
        }
      }
    }

    // 2. Category match
    if (item.category && item.category.toLowerCase().includes(qToken)) {
      tokenScore += 60;
    } else {
      for (const cWord of categoryTokens) {
        if (cWord.includes(qToken) || qToken.includes(cWord)) {
          tokenScore += 40;
          break;
        }
      }
    }

    // 3. Location / Service Area match
    if (item.locationOrArea && item.locationOrArea.toLowerCase().includes(qToken)) {
      tokenScore += 40;
    }

    // 4. Description / Bio match
    if (item.descriptionOrBio && item.descriptionOrBio.toLowerCase().includes(qToken)) {
      tokenScore += 20;
    }

    score += tokenScore;
  }

  return score;
}
