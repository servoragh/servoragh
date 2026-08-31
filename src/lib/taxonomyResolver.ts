import { CLASSIFIED_CATEGORIES, CategoryDefinition, SubCategoryDefinition } from "./categoriesData";

/**
 * Resolves any category input (slug, name, or id) to the canonical Category definition.
 */
export function resolveCategory(input?: string | null): CategoryDefinition | null {
  if (!input || !input.trim() || input.trim().toLowerCase() === "all") {
    return null;
  }
  const norm = input.trim().toLowerCase();

  // 1. Try slug exact match
  let found = CLASSIFIED_CATEGORIES.find((c) => c.slug.toLowerCase() === norm);
  if (found) return found;

  // 2. Try name exact match
  found = CLASSIFIED_CATEGORIES.find((c) => c.name.toLowerCase() === norm);
  if (found) return found;

  // 3. Fallback clean string match
  const inputClean = norm.replace(/-/g, " ").replace(/[^a-zA-Z0-9]/g, " ").trim();
  found = CLASSIFIED_CATEGORIES.find((c) => {
    const cSlugClean = c.slug.replace(/-/g, " ").replace(/[^a-zA-Z0-9]/g, " ").trim();
    const cNameClean = c.name.replace(/[^a-zA-Z0-9]/g, " ").trim();
    return cSlugClean === inputClean || cNameClean === inputClean;
  });

  return found || null;
}

/**
 * Resolves any subcategory input (slug, name, or id) within a resolved Category.
 */
export function resolveSubcategory(
  category: CategoryDefinition | null,
  subInput?: string | null
): SubCategoryDefinition | null {
  if (!category || !subInput || !subInput.trim() || subInput.trim().toLowerCase() === "all") {
    return null;
  }
  const norm = subInput.trim().toLowerCase();

  // 1. Try slug exact match
  let found = category.subcategories.find((s) => s.slug.toLowerCase() === norm);
  if (found) return found;

  // 2. Try name exact match
  found = category.subcategories.find((s) => s.name.toLowerCase() === norm);
  if (found) return found;

  // 3. Fallback clean string match
  const inputClean = norm.replace(/-/g, " ").replace(/[^a-zA-Z0-9]/g, " ").trim();
  found = category.subcategories.find((s) => {
    const sSlugClean = s.slug.replace(/-/g, " ").replace(/[^a-zA-Z0-9]/g, " ").trim();
    const sNameClean = s.name.replace(/[^a-zA-Z0-9]/g, " ").trim();
    return sSlugClean === inputClean || sNameClean === inputClean;
  });

  return found || null;
}

/**
 * STRICT CANONICAL TAXONOMY MATCHING ALGORITHM
 * 
 * Rules:
 * 1. Category Only Selected:
 *    Matches if product belongs to canonical category.
 * 2. Category + Subcategory Selected:
 *    Matches if product belongs to BOTH category AND exact subcategory.
 * 3. Empty/Null Product Subcategory Rule:
 *    An empty or null product subcategory MUST NEVER match a specific selected subcategory!
 */
export function matchProductTaxonomy(
  product: { category?: string | null; subCategory?: string | null; categoryId?: string | null; subCategoryId?: string | null },
  selectedCategoryInput?: string | null,
  selectedSubcategoryInput?: string | null
): boolean {
  const targetCategory = resolveCategory(selectedCategoryInput);
  if (!targetCategory) {
    // No category selected ("All") -> match all products
    return true;
  }

  // Resolve Product Category
  const prodCategory = resolveCategory(product.category);
  const prodCatMatches = prodCategory ? prodCategory.slug === targetCategory.slug : false;

  if (!prodCatMatches) {
    return false;
  }

  // Resolve Target Subcategory
  const targetSubcategory = resolveSubcategory(targetCategory, selectedSubcategoryInput);

  // If no specific subcategory is selected -> match category-only
  if (!targetSubcategory) {
    return true;
  }

  // Specific Subcategory IS selected:
  // If product subcategory is null, undefined, or empty -> MUST NEVER MATCH!
  if (!product.subCategory || !product.subCategory.trim()) {
    return false;
  }

  // Resolve Product Subcategory
  const prodSubcategory = resolveSubcategory(targetCategory, product.subCategory);
  if (!prodSubcategory) {
    return false;
  }

  // Strict match on canonical subcategory slug
  return prodSubcategory.slug === targetSubcategory.slug;
}
