import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../core/services/marketplace_api_service.dart';
import '../../../shared/widgets/servora_product_card.dart';
import '../../../shared/widgets/servora_shimmer_skeleton.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _queryController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  Timer? _debounceTimer;

  bool _isSearching = false;
  String _activeTab = 'all'; // 'all', 'products', 'artisans', 'rentals', 'community'
  final String _selectedZone = 'All Northern Ghana';

  int _totalHits = 0;
  List<dynamic> _allHits = [];
  List<dynamic> _productsHits = [];
  List<dynamic> _artisansHits = [];
  List<dynamic> _rentalsHits = [];
  List<dynamic> _communityHits = [];

  List<String> _recentSearches = [
    'Solar Inverter Sakasaka',
    'Fugu Smock Nyohini',
    'Plumber Choggu',
    'Heavy Drill Generator Rental',
  ];

  List<Map<String, dynamic>> _trendingSearches = [
    {'tag': '⚡ Solar Inverter Sakasaka', 'query': 'Solar Inverter Sakasaka'},
    {'tag': '🧵 Dagbon Royal Fugu', 'query': 'Fugu Smock Nyohini'},
    {'tag': '🚜 Borehole Drilling Machine', 'query': 'Borehole Drilling Machine'},
    {'tag': '🔧 Auto Electrician Fitter', 'query': 'Auto Electrician Fitter'},
    {'tag': '🚰 Plumber Choggu', 'query': 'Plumber Choggu'},
    {'tag': '🔨 Welder Metal Gate', 'query': 'Welder Metal Gate'},
  ];

  @override
  void initState() {
    super.initState();
    _loadTrendingSearches();
    _focusNode.requestFocus();
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _queryController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _loadTrendingSearches() async {
    final trending = await MarketplaceApiService.fetchTrendingSearches();
    if (mounted && trending.isNotEmpty) {
      setState(() => _trendingSearches = trending);
    }
  }

  void _onQueryChanged(String val) {
    _debounceTimer?.cancel();
    if (val.trim().isEmpty) {
      setState(() {
        _isSearching = false;
        _totalHits = 0;
        _allHits = [];
        _productsHits = [];
        _artisansHits = [];
        _rentalsHits = [];
        _communityHits = [];
      });
      return;
    }

    _debounceTimer = Timer(const Duration(milliseconds: 160), () {
      _executeSearch(val.trim());
    });
  }

  Future<void> _executeSearch(String query) async {
    setState(() => _isSearching = true);

    // Save to recent searches
    if (!_recentSearches.contains(query)) {
      setState(() {
        _recentSearches = [query, ..._recentSearches].take(6).toList();
      });
    }

    final data = await MarketplaceApiService.universalSearch(
      query,
      zone: _selectedZone != 'All Northern Ghana' ? _selectedZone : null,
      entity: _activeTab != 'all' ? _activeTab : null,
      limit: 30,
    );

    if (mounted) {
      if (data != null && data['hits'] is Map) {
        final hitsMap = data['hits'] as Map;
        setState(() {
          _isSearching = false;
          _totalHits = (data['totalHits'] is num) ? (data['totalHits'] as num).toInt() : 0;
          _allHits = (hitsMap['all'] is List) ? hitsMap['all'] as List : [];
          _productsHits = (hitsMap['products'] is List) ? hitsMap['products'] as List : [];
          _artisansHits = (hitsMap['artisans'] is List) ? hitsMap['artisans'] as List : [];
          _rentalsHits = (hitsMap['rentals'] is List) ? hitsMap['rentals'] as List : [];
          _communityHits = (hitsMap['community'] is List) ? hitsMap['community'] as List : [];
        });
      } else {
        setState(() {
          _isSearching = false;
          _totalHits = 0;
          _allHits = [];
          _productsHits = [];
          _artisansHits = [];
          _rentalsHits = [];
          _communityHits = [];
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? ServoraColors.darkBackground : const Color(0xFFF8FAFC),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: isDark ? ServoraColors.darkSurface : Colors.white,
        elevation: 0,
        titleSpacing: 12,
        title: Row(
          children: [
            GestureDetector(
              onTap: () => context.pop(),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white10 : Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.arrow_back_ios_new_rounded, size: 16),
              ),
            ),
            const Gap(8),
            Expanded(
              child: Container(
                height: 46,
                decoration: BoxDecoration(
                  color: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(23),
                  border: Border.all(color: ServoraColors.emerald600.withOpacity(0.35)),
                ),
                child: TextField(
                  controller: _queryController,
                  focusNode: _focusNode,
                  onChanged: _onQueryChanged,
                  textInputAction: TextInputAction.search,
                  onSubmitted: (val) => _executeSearch(val),
                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600),
                  decoration: InputDecoration(
                    hintText: 'Search solar, fugu, plumbers, rentals...',
                    hintStyle: TextStyle(
                      fontSize: 12.5,
                      color: isDark ? Colors.white38 : Colors.grey[500],
                    ),
                    prefixIcon: const Icon(Icons.search_rounded, color: ServoraColors.emerald600, size: 20),
                    suffixIcon: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (_queryController.text.isNotEmpty)
                          GestureDetector(
                            onTap: () {
                              _queryController.clear();
                              _onQueryChanged('');
                            },
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 6),
                              child: Icon(Icons.cancel_rounded, size: 18, color: Colors.grey),
                            ),
                          ),
                        const Padding(
                          padding: EdgeInsets.only(right: 12),
                          child: Icon(Icons.mic_none_rounded, size: 18, color: ServoraColors.emerald600),
                        ),
                      ],
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Filter Tabs (Shown when query exists)
          if (_queryController.text.isNotEmpty) _buildCategoryTabs(isDark),

          // Main View Body
          Expanded(
            child: _queryController.text.isEmpty
                ? _buildDiscoveryView(isDark)
                : _buildSearchResultsView(isDark),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryTabs(bool isDark) {
    final tabs = [
      {'id': 'all', 'label': 'All ($_totalHits)', 'icon': Icons.auto_awesome_rounded},
      {'id': 'products', 'label': 'Products (${_productsHits.length})', 'icon': Icons.shopping_bag_outlined},
      {'id': 'artisans', 'label': 'Artisans (${_artisansHits.length})', 'icon': Icons.business_outlined},
      {'id': 'rentals', 'label': 'Rentals (${_rentalsHits.length})', 'icon': Icons.handyman_outlined},
      {'id': 'community', 'label': 'Requests (${_communityHits.length})', 'icon': Icons.people_outline_rounded},
    ];

    return Container(
      color: isDark ? ServoraColors.darkSurface : Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: tabs.map((t) {
            final isActive = _activeTab == t['id'];
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: GestureDetector(
                onTap: () {
                  setState(() => _activeTab = t['id'] as String);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                    color: isActive
                        ? ServoraColors.emerald600
                        : (isDark ? Colors.white10 : const Color(0xFFF1F5F9)),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: isActive
                        ? [BoxShadow(color: ServoraColors.emerald600.withOpacity(0.3), blurRadius: 6)]
                        : null,
                  ),
                  child: Row(
                    children: [
                      Icon(
                        t['icon'] as IconData,
                        size: 13,
                        color: isActive ? Colors.white : (isDark ? Colors.white70 : Colors.grey[700]),
                      ),
                      const Gap(5),
                      Text(
                        t['label'] as String,
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                          color: isActive ? Colors.white : (isDark ? Colors.white70 : Colors.grey[800]),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildSearchResultsView(bool isDark) {
    if (_isSearching) {
      return ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: 4,
        separatorBuilder: (_, __) => const Gap(12),
        itemBuilder: (context, index) => ServoraShimmerSkeleton.productCardSkeleton(context),
      );
    }

    List<dynamic> currentList = [];
    if (_activeTab == 'all') {
      currentList = _allHits;
    } else if (_activeTab == 'products') {
      currentList = _productsHits;
    } else if (_activeTab == 'artisans') {
      currentList = _artisansHits;
    } else if (_activeTab == 'rentals') {
      currentList = _rentalsHits;
    } else {
      currentList = _communityHits;
    }

    // Sort by relevance score descending (most accurate at the top)
    final sortedList = List<dynamic>.from(currentList)..sort((a, b) {
      final scoreA = (a is Map && a['score'] is num) ? (a['score'] as num).toDouble() : 0.0;
      final scoreB = (b is Map && b['score'] is num) ? (b['score'] as num).toDouble() : 0.0;
      return scoreB.compareTo(scoreA);
    });

    // Zero-Match Demand Fallback Card
    if (sortedList.isEmpty) {
      return Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: Colors.amber.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Text('🔍', style: TextStyle(fontSize: 34)),
                ),
              ),
              const Gap(16),
              Text(
                'Can\'t find "${_queryController.text}"?',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const Gap(6),
              Text(
                'Zero listings matched your search in Tamale. Broadcast a live service call to over 500+ verified artisans and suppliers.',
                style: TextStyle(fontSize: 12, color: isDark ? Colors.white54 : Colors.grey[600]),
                textAlign: TextAlign.center,
              ),
              const Gap(20),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: ServoraColors.emerald600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 2,
                ),
                icon: const Icon(Icons.bolt_rounded, size: 18),
                label: Text(
                  'Broadcast Request for "${_queryController.text}" ✈️',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
                onPressed: () {
                  context.push('/requests');
                },
              ),
            ],
          ),
        ),
      );
    }

    // Dynamic 2-Column Masonry for Products or Rentals
    if (_activeTab == 'products' || _activeTab == 'rentals') {
      return SingleChildScrollView(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  for (int i = 0; i < sortedList.length; i += 2)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ServoraProductCard(
                        product: Map<String, dynamic>.from(sortedList[i] as Map),
                      ),
                    ),
                ],
              ),
            ),
            const Gap(12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  for (int i = 1; i < sortedList.length; i += 2)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ServoraProductCard(
                        product: Map<String, dynamic>.from(sortedList[i] as Map),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // Multi-Entity Feed View (All Tab, Artisans Tab, Community Tab)
    return ListView.separated(
      padding: const EdgeInsets.all(14),
      itemCount: sortedList.length,
      separatorBuilder: (_, __) => const Gap(12),
      itemBuilder: (context, index) {
        final item = sortedList[index] as Map;
        final entityType = item['entityType']?.toString() ?? 'product';
        final rawTitle = item['title']?.toString() ?? 'Marketplace Item';
        final cleanTitle = rawTitle.replaceAll(RegExp(r'<[^>]*>'), '');
        final rawSubtitle = item['subtitle']?.toString() ?? '';
        final cleanSubtitle = rawSubtitle.replaceAll(RegExp(r'<[^>]*>'), '');
        final priceDisplay = item['priceDisplay']?.toString() ?? '';
        final category = item['category']?.toString() ?? 'General';
        final zone = item['zone']?.toString() ?? 'Tamale';
        final isVerified = item['isVerified'] == true;

        String? imageUrl;
        final rawImg = item['image'];
        if (rawImg is String && rawImg.isNotEmpty) {
          imageUrl = rawImg;
        } else if (rawImg is List && rawImg.isNotEmpty) {
          imageUrl = rawImg[0]?.toString();
        } else if (item['images'] is List && (item['images'] as List).isNotEmpty) {
          imageUrl = (item['images'] as List)[0]?.toString();
        }

        final slug = item['slug']?.toString() ?? item['id']?.toString() ?? '';

        return GestureDetector(
          onTap: () {
            if (entityType == 'product') {
              context.push('/products/$slug', extra: Map<String, dynamic>.from(item));
            } else if (entityType == 'artisan') {
              context.push('/biz/$slug');
            } else {
              context.push('/products/detail', extra: Map<String, dynamic>.from(item));
            }
          },
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? ServoraColors.darkSurface : Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image Thumbnail
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: imageUrl != null && imageUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: imageUrl,
                          width: 72,
                          height: 72,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(
                            width: 72,
                            height: 72,
                            color: isDark ? Colors.white10 : Colors.grey[200],
                          ),
                          errorWidget: (_, __, ___) => _buildFallbackIcon(entityType),
                        )
                      : _buildFallbackIcon(entityType),
                ),
                const Gap(12),

                // Content Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Badge Row
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: ServoraColors.emerald600.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              entityType.toUpperCase(),
                              style: const TextStyle(
                                fontSize: 8.5,
                                fontWeight: FontWeight.w900,
                                color: ServoraColors.emerald600,
                              ),
                            ),
                          ),
                          const Gap(6),
                          Expanded(
                            child: Text(
                              '$category • $zone',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: isDark ? Colors.white54 : Colors.grey[600],
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (isVerified)
                            const Icon(Icons.verified_rounded, size: 14, color: ServoraColors.emerald600),
                        ],
                      ),
                      const Gap(4),

                      // Title
                      Text(
                        cleanTitle,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, height: 1.2),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const Gap(4),

                      // Subtitle
                      if (cleanSubtitle.isNotEmpty)
                        Text(
                          cleanSubtitle,
                          style: TextStyle(
                            fontSize: 10.5,
                            color: isDark ? Colors.white60 : Colors.grey[700],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),

                      const Gap(6),

                      // Price & Action
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          if (priceDisplay.isNotEmpty)
                            Text(
                              priceDisplay,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                color: ServoraColors.emerald600,
                              ),
                            )
                          else
                            Text(
                              'View Details',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white54 : Colors.grey[500],
                              ),
                            ),
                          const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'View',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: ServoraColors.emerald600,
                                ),
                              ),
                              Icon(Icons.chevron_right_rounded, size: 16, color: ServoraColors.emerald600),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFallbackIcon(String entityType) {
    IconData icon = Icons.inventory_2_rounded;
    Color color = ServoraColors.emerald600;

    if (entityType == 'artisan') {
      icon = Icons.business_center_rounded;
      color = Colors.blue;
    } else if (entityType == 'rental') {
      icon = Icons.handyman_rounded;
      color = Colors.amber;
    } else if (entityType == 'community') {
      icon = Icons.people_rounded;
      color = Colors.purple;
    }

    return Container(
      width: 56,
      height: 56,
      color: color.withOpacity(0.12),
      child: Center(child: Icon(icon, size: 26, color: color)),
    );
  }

  Widget _buildDiscoveryView(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Recent Searches
          if (_recentSearches.isNotEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Searches',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white54 : Colors.grey[600],
                  ),
                ),
                GestureDetector(
                  onTap: () => setState(() => _recentSearches = []),
                  child: const Text('Clear', style: TextStyle(fontSize: 11, color: Colors.grey)),
                ),
              ],
            ),
            const Gap(8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _recentSearches.map((term) {
                return GestureDetector(
                  onTap: () {
                    _queryController.text = term;
                    _executeSearch(term);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isDark ? ServoraColors.darkSurface : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder,
                      ),
                    ),
                    child: Text(term, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                  ),
                );
              }).toList(),
            ),
            const Gap(24),
          ],

          // Trending in Northern Ghana
          Text(
            'Trending in Northern Ghana',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white54 : Colors.grey[600],
            ),
          ),
          const Gap(10),
          Column(
            children: _trendingSearches.map((item) {
              final tag = item['tag']?.toString() ?? '';
              final query = item['query']?.toString() ?? tag;

              return ListTile(
                dense: true,
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: ServoraColors.emerald600.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.trending_up_rounded, size: 16, color: ServoraColors.emerald600),
                ),
                title: Text(
                  tag,
                  style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold),
                ),
                trailing: const Icon(Icons.north_east_rounded, size: 14, color: Colors.grey),
                onTap: () {
                  final cleanQuery = query.replaceAll(RegExp(r'^[^\w\s]+'), '').trim();
                  _queryController.text = cleanQuery;
                  _executeSearch(cleanQuery);
                },
              );
            }).toList(),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 200.ms);
  }
}
