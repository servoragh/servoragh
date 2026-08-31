import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../core/constants/constants.dart';
import '../../../core/services/marketplace_api_service.dart';
import '../../core/utils/taxonomy_resolver.dart';

class CategoryPickerSheet extends StatefulWidget {
  final String selectedCategory;
  final String? selectedSubCategory;
  final Function(String category, String? subCategory) onSelect;
  final String title;

  const CategoryPickerSheet({
    super.key,
    required this.selectedCategory,
    this.selectedSubCategory,
    required this.onSelect,
    this.title = 'Select Category & Subcategory',
  });

  static Future<void> show(
    BuildContext context, {
    required String selectedCategory,
    String? selectedSubCategory,
    required Function(String category, String? subCategory) onSelect,
    String title = 'Select Category & Subcategory',
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => CategoryPickerSheet(
        selectedCategory: selectedCategory,
        selectedSubCategory: selectedSubCategory,
        onSelect: onSelect,
        title: title,
      ),
    );
  }

  @override
  State<CategoryPickerSheet> createState() => _CategoryPickerSheetState();
}

class _CategoryPickerSheetState extends State<CategoryPickerSheet> {
  int _step = 1; // 1: Category, 2: Subcategory
  late Map<String, dynamic> _activeCategory;
  String? _tempSubCategory;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  List<dynamic> _rawProducts = [];
  Map<String, int> _liveCategoryCounts = {};
  int _totalListings = 0;

  @override
  void initState() {
    super.initState();
    _tempSubCategory = widget.selectedSubCategory;
    _activeCategory = ServoraConstants.classifiedCategories.firstWhere(
      (c) => c['name'] == widget.selectedCategory,
      orElse: () => ServoraConstants.classifiedCategories[0],
    );
    _loadLiveCategoryCounts();
  }

  Future<void> _loadLiveCategoryCounts() async {
    final products = await MarketplaceApiService.fetchProducts();
    final counts = <String, int>{};
    int total = 0;

    for (final p in products) {
      final catName = (p['category'] ?? '').toString().trim().toLowerCase();
      if (catName.isNotEmpty) {
        counts[catName] = (counts[catName] ?? 0) + 1;
        total++;
      }
    }

    if (mounted) {
      setState(() {
        _rawProducts = products;
        _liveCategoryCounts = counts;
        _totalListings = total;
      });
    }
  }

  int _getSubcategoryAdCount(String catName, String subName) {
    int count = 0;
    for (final p in _rawProducts) {
      if (p is Map &&
          TaxonomyResolver.matchProductTaxonomy(
            product: Map<String, dynamic>.from(p),
            selectedCategoryInput: catName,
            selectedSubcategoryInput: subName,
          )) {
        count++;
      }
    }
    return count;
  }

  String _formatAdsCount(int count) {
    if (count <= 0) return '0 ads';
    if (count == 1) return '1 ad';
    if (count >= 1000000) return '${(count / 1000000).toStringAsFixed(1)}M+ ads';
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}k+ ads';
    return '$count ads';
  }

  List<Map<String, dynamic>> get _filteredCategories {
    if (_searchQuery.isEmpty) return ServoraConstants.classifiedCategories;
    final q = _searchQuery.toLowerCase().trim();
    return ServoraConstants.classifiedCategories.where((cat) {
      final name = (cat['name'] ?? '').toString().toLowerCase();
      final desc = (cat['description'] ?? '').toString().toLowerCase();
      final List subs = cat['subcategories'] ?? [];
      final subMatches = subs.any((s) => (s['name'] ?? '').toString().toLowerCase().contains(q));
      return name.contains(q) || desc.contains(q) || subMatches;
    }).toList();
  }

  void _selectCategory(Map<String, dynamic> cat) {
    setState(() {
      _activeCategory = cat;
      final List subs = cat['subcategories'] ?? [];
      _tempSubCategory = subs.isNotEmpty ? subs[0]['name'].toString() : null;
      _step = 2; // Advance to Subcategory View!
    });
  }

  void _confirmSelection() {
    widget.onSelect(
      _activeCategory['name'].toString(),
      _tempSubCategory,
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1C1917) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 20, offset: Offset(0, -5)),
        ],
      ),
      child: Column(
        children: [
          // Drag Handle
          const Gap(10),
          Center(
            child: Container(
              width: 40,
              height: 4.5,
              decoration: BoxDecoration(
                color: isDark ? Colors.grey[700] : Colors.grey[300],
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const Gap(10),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                if (_step == 2)
                  IconButton(
                    onPressed: () => setState(() => _step = 1),
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                    color: ServoraColors.emerald600,
                  ),
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: ServoraColors.emerald600.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.layers_rounded, color: ServoraColors.emerald600, size: 20),
                ),
                const Gap(12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.title,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : const Color(0xFF1C1917),
                        ),
                      ),
                      Text(
                        _step == 2
                            ? 'Pick subcategory for ${_activeCategory['name']}'
                            : 'Total $_totalListings Active Ads Across 17 Verticals',
                        style: TextStyle(
                          fontSize: 11,
                          color: ServoraColors.emerald600,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded, size: 22),
                  color: Colors.grey[400],
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Live Search Bar
          Padding(
            padding: const EdgeInsets.all(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0C0A09) : const Color(0xFFF5F5F4),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? const Color(0xFF292524) : const Color(0xFFE7E5E4)),
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (val) {
                  setState(() {
                    _searchQuery = val;
                    if (_step == 2) _step = 1;
                  });
                },
                decoration: InputDecoration(
                  icon: const Icon(Icons.search_rounded, color: ServoraColors.emerald600, size: 20),
                  hintText: 'Search category or subcategory (e.g. Solar, Cars)...',
                  hintStyle: const TextStyle(fontSize: 12, color: Colors.grey),
                  border: InputBorder.none,
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded, size: 16),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                ),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : const Color(0xFF1C1917),
                ),
              ),
            ),
          ),

          // Body: Step 1 (Categories) vs Step 2 (Subcategories)
          Expanded(
            child: _step == 1 ? _buildCategoriesList(isDark) : _buildSubcategoriesList(isDark),
          ),

          // Footer Confirm Button (Step 2)
          if (_step == 2)
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _confirmSelection,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ServoraColors.emerald600,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 2,
                    ),
                    child: Text(
                      'Confirm: ${_activeCategory['name']} ${_tempSubCategory != null ? '› $_tempSubCategory' : ''}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCategoriesList(bool isDark) {
    final categories = _filteredCategories;

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: categories.length,
      separatorBuilder: (_, __) => const Gap(8),
      itemBuilder: (context, index) {
        final cat = categories[index];
        final isSelected = _activeCategory['name'] == cat['name'];
        final List subs = cat['subcategories'] ?? [];

        final catNameKey = (cat['name'] ?? '').toString().trim().toLowerCase();
        int realCount = 0;
        for (final entry in _liveCategoryCounts.entries) {
          if (entry.key.contains(catNameKey) || catNameKey.contains(entry.key)) {
            realCount += entry.value;
          }
        }
        final adsText = _formatAdsCount(realCount);

        return InkWell(
          onTap: () => _selectCategory(cat),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isSelected
                  ? (isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5))
                  : (isDark ? const Color(0xFF262626) : const Color(0xFFF5F5F4)),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected
                    ? ServoraColors.emerald600
                    : (isDark ? const Color(0xFF292524) : const Color(0xFFE7E5E4)),
                width: isSelected ? 1.5 : 1,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: isSelected ? ServoraColors.emerald600 : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.black12),
                  ),
                  child: Center(
                    child: Text(
                      cat['icon'].toString(),
                      style: const TextStyle(fontSize: 20),
                    ),
                  ),
                ),
                const Gap(12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        cat['name'].toString(),
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : const Color(0xFF1C1917),
                        ),
                      ),
                      const Gap(2),
                      Text(
                        '${subs.length} subcategories • $adsText',
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey[500],
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isSelected)
                  const Icon(Icons.check_circle_rounded, color: ServoraColors.emerald600, size: 20)
                else
                  Icon(Icons.chevron_right_rounded, color: Colors.grey[400], size: 20),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSubcategoriesList(bool isDark) {
    final List subs = _activeCategory['subcategories'] ?? [];

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        // Category Header Banner
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0C0A09) : const Color(0xFFF5F5F4),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? const Color(0xFF292524) : const Color(0xFFE7E5E4)),
          ),
          child: Row(
            children: [
              Text(_activeCategory['icon'].toString(), style: const TextStyle(fontSize: 24)),
              const Gap(12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _activeCategory['name'].toString(),
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: isDark ? Colors.white : const Color(0xFF1C1917),
                      ),
                    ),
                    Text(
                      _activeCategory['description'].toString(),
                      style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const Gap(12),

        // General Option
        Builder(builder: (context) {
          final generalCount = _getSubcategoryAdCount(_activeCategory['name'].toString(), '');
          final generalCountText = _formatAdsCount(generalCount);
          final isSelected = _tempSubCategory == null;

          return InkWell(
            onTap: () => setState(() => _tempSubCategory = null),
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isSelected
                    ? ServoraColors.emerald600
                    : (isDark ? const Color(0xFF262626) : Colors.white),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected ? ServoraColors.emerald600 : Colors.grey[300]!,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'All (${_activeCategory['name']})',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : (isDark ? Colors.white : Colors.grey[800]),
                        ),
                      ),
                      Text(
                        generalCount > 0 ? '$generalCountText in vertical' : '0 active listings',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: isSelected ? const Color(0xFFD1FAE5) : (generalCount > 0 ? ServoraColors.emerald600 : Colors.grey[400]),
                        ),
                      ),
                    ],
                  ),
                  if (isSelected)
                    const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
                ],
              ),
            ),
          );
        }),
        const Gap(8),

        // Subcategory Items with Exact Live Counts
        ...subs.map((s) {
          final subName = s['name'].toString();
          final isSelected = _tempSubCategory == subName;
          final subCount = _getSubcategoryAdCount(_activeCategory['name'].toString(), subName);
          final subCountText = _formatAdsCount(subCount);

          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: InkWell(
              onTap: () => setState(() => _tempSubCategory = subName),
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected
                      ? ServoraColors.emerald600
                      : (isDark ? const Color(0xFF262626) : Colors.white),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected
                        ? ServoraColors.emerald600
                        : (isDark ? const Color(0xFF292524) : const Color(0xFFE7E5E4)),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          subName,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? Colors.white : (isDark ? Colors.white : Colors.grey[800]),
                          ),
                        ),
                        Text(
                          subCount > 0 ? '$subCountText live' : '0 active listings',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: isSelected
                                ? const Color(0xFFD1FAE5)
                                : (subCount > 0 ? ServoraColors.emerald600 : Colors.grey[400]),
                          ),
                        ),
                      ],
                    ),
                    if (isSelected)
                      const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }
}
