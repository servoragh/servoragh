import '../constants/constants.dart';

class TaxonomyResolver {
  /// Resolves any category input (slug or name) to canonical category definition map.
  static Map<String, dynamic>? resolveCategory(String? input) {
    if (input == null || input.trim().isEmpty || input.trim().toLowerCase() == 'all') {
      return null;
    }
    final norm = input.trim().toLowerCase();

    // 1. Try slug exact match
    for (final cat in ServoraConstants.classifiedCategories) {
      if ((cat['slug'] ?? '').toString().toLowerCase() == norm) {
        return cat;
      }
    }

    // 2. Try name exact match
    for (final cat in ServoraConstants.classifiedCategories) {
      if ((cat['name'] ?? '').toString().toLowerCase() == norm) {
        return cat;
      }
    }

    // 3. Fallback clean string match
    final inputClean = norm.replaceAll('-', ' ').replaceAll(RegExp(r'[^a-zA-Z0-9 ]'), '').trim();
    for (final cat in ServoraConstants.classifiedCategories) {
      final cSlugClean = (cat['slug'] ?? '').toString().replaceAll('-', ' ').replaceAll(RegExp(r'[^a-zA-Z0-9 ]'), '').trim();
      final cNameClean = (cat['name'] ?? '').toString().replaceAll(RegExp(r'[^a-zA-Z0-9 ]'), '').trim();
      if (cSlugClean == inputClean || cNameClean == inputClean) {
        return cat;
      }
    }

    return null;
  }

  /// Resolves any subcategory input (slug or name) within a resolved category.
  static Map<String, dynamic>? resolveSubcategory(Map<String, dynamic>? category, String? subInput) {
    if (category == null || subInput == null || subInput.trim().isEmpty || subInput.trim().toLowerCase() == 'all') {
      return null;
    }
    final norm = subInput.trim().toLowerCase();
    final List subs = category['subcategories'] ?? [];

    // 1. Try slug exact match
    for (final s in subs) {
      if ((s['slug'] ?? '').toString().toLowerCase() == norm) {
        return Map<String, dynamic>.from(s);
      }
    }

    // 2. Try name exact match
    for (final s in subs) {
      if ((s['name'] ?? '').toString().toLowerCase() == norm) {
        return Map<String, dynamic>.from(s);
      }
    }

    // 3. Fallback clean string match
    final inputClean = norm.replaceAll('-', ' ').replaceAll(RegExp(r'[^a-zA-Z0-9 ]'), '').trim();
    for (final s in subs) {
      final sSlugClean = (s['slug'] ?? '').toString().replaceAll('-', ' ').replaceAll(RegExp(r'[^a-zA-Z0-9 ]'), '').trim();
      final sNameClean = (s['name'] ?? '').toString().replaceAll(RegExp(r'[^a-zA-Z0-9 ]'), '').trim();
      if (sSlugClean == inputClean || sNameClean == inputClean) {
        return Map<String, dynamic>.from(s);
      }
    }

    return null;
  }

  /// STRICT CANONICAL TAXONOMY MATCHING ALGORITHM
  /// 
  /// Rules:
  /// 1. Category Only Selected:
  ///    Matches if product belongs to canonical category.
  /// 2. Category + Subcategory Selected:
  ///    Matches if product belongs to BOTH category AND exact subcategory.
  /// 3. Empty/Null Product Subcategory Rule:
  ///    An empty or null product subcategory MUST NEVER match a specific selected subcategory!
  static bool matchProductTaxonomy({
    required Map<String, dynamic> product,
    String? selectedCategoryInput,
    String? selectedSubcategoryInput,
  }) {
    final targetCategory = resolveCategory(selectedCategoryInput);
    if (targetCategory == null) {
      // No category selected ("All") -> match all products
      return true;
    }

    // Resolve Product Category
    final pCatStr = (product['category'] ?? '').toString();
    final prodCategory = resolveCategory(pCatStr);
    final prodCatMatches = prodCategory != null &&
        (prodCategory['slug'] ?? '').toString() == (targetCategory['slug'] ?? '').toString();

    if (!prodCatMatches) {
      return false;
    }

    // Resolve Target Subcategory
    final targetSubcategory = resolveSubcategory(targetCategory, selectedSubcategoryInput);

    // If no specific subcategory is selected -> match category-only
    if (targetSubcategory == null) {
      return true;
    }

    // Specific Subcategory IS selected:
    // If product subcategory is null, empty, or missing -> MUST NEVER MATCH!
    final pSubStr = (product['subCategory'] ?? product['subcategory'] ?? '').toString().trim();
    if (pSubStr.isEmpty) {
      return false;
    }

    // Resolve Product Subcategory
    final prodSubcategory = resolveSubcategory(targetCategory, pSubStr);
    if (prodSubcategory == null) {
      return false;
    }

    // Strict match on canonical subcategory slug
    return (prodSubcategory['slug'] ?? '').toString() == (targetSubcategory['slug'] ?? '').toString();
  }
}
