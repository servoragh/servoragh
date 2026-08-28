import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../core/services/marketplace_api_service.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/servora_shimmer_skeleton.dart';
import '../../../core/utils/whatsapp_helper.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _queryController = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  bool _isSearching = false;
  List<dynamic> _searchResults = [];

  final List<String> _recentSearches = [
    'Solar Inverter Sakasaka',
    'Fugu Smock Nyohini',
    'Plumber Choggu',
    'Heavy Drill Rental',
  ];

  final List<String> _popularSearches = [
    '⚡ 3-Phase Solar Cabling',
    '📱 Smartphone Screen Repair',
    '🧵 Dagbon Royal Fugu',
    '🚜 Borehole Rig Lease',
    '🚚 Kia Haulage Truck',
  ];

  @override
  void initState() {
    super.initState();
    _focusNode.requestFocus();
  }

  Future<void> _performSearch(String query) async {
    if (query.trim().isEmpty) {
      setState(() {
        _isSearching = false;
        _searchResults = [];
      });
      return;
    }

    setState(() => _isSearching = true);
    final results = await MarketplaceApiService.fetchProducts();
    if (mounted) {
      setState(() {
        _isSearching = false;
        _searchResults = results.where((item) {
          final title = (item['title'] ?? '').toString().toLowerCase();
          final cat = (item['category'] ?? '').toString().toLowerCase();
          final q = query.toLowerCase().trim();
          return title.contains(q) || cat.contains(q);
        }).toList();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        titleSpacing: 16,
        title: Row(
          children: [
            Expanded(
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: isDark ? ServoraColors.darkSurface : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: ServoraColors.emerald600.withOpacity(0.4)),
                ),
                child: TextField(
                  controller: _queryController,
                  focusNode: _focusNode,
                  onChanged: _performSearch,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                  decoration: InputDecoration(
                    hintText: 'Search plumbers, smocks, solar, trucks...',
                    hintStyle: TextStyle(
                      fontSize: 13,
                      color: isDark ? ServoraColors.textMutedDark : ServoraColors.textMutedLight,
                    ),
                    prefixIcon: const Icon(Icons.search_rounded, color: ServoraColors.emerald600, size: 20),
                    suffixIcon: _queryController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.cancel_rounded, size: 18),
                            onPressed: () {
                              _queryController.clear();
                              _performSearch('');
                            },
                          )
                        : null,
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ),
            const Gap(10),
            TextButton(
              onPressed: () => context.pop(),
              child: const Text(
                'Cancel',
                style: TextStyle(
                  color: ServoraColors.emerald600,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
      body: _queryController.text.trim().isEmpty
          ? _buildDefaultDiscoveryView(isDark)
          : _buildSearchResultsView(isDark),
    );
  }

  Widget _buildDefaultDiscoveryView(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Recent Searches Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recent Searches',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              GestureDetector(
                onTap: () => setState(() => _recentSearches.clear()),
                child: const Text(
                  'Clear',
                  style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const Gap(10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _recentSearches.map((item) {
              return ActionChip(
                backgroundColor: isDark ? ServoraColors.darkSurface : const Color(0xFFF1F5F9),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                label: Text(item, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                onPressed: () {
                  _queryController.text = item;
                  _performSearch(item);
                },
              );
            }).toList(),
          ),
          const Gap(24),

          // Popular Searches Section
          const Text(
            'Popular Searches Today 🔥',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const Gap(12),
          Column(
            children: _popularSearches.map((item) {
              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const CircleAvatar(
                  radius: 16,
                  backgroundColor: Color(0xFFECFDF5),
                  child: Icon(Icons.trending_up_rounded, size: 16, color: ServoraColors.emerald600),
                ),
                title: Text(item, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.grey),
                onTap: () {
                  final cleanQuery = item.replaceAll(RegExp(r'^[^\w\s]+'), '').trim();
                  _queryController.text = cleanQuery;
                  _performSearch(cleanQuery);
                },
              );
            }).toList(),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 200.ms);
  }

  Widget _buildSearchResultsView(bool isDark) {
    if (_isSearching) {
      return ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: 4,
        separatorBuilder: (_, __) => const Gap(14),
        itemBuilder: (context, index) => ServoraShimmerSkeleton.productCardSkeleton(context),
      );
    }

    if (_searchResults.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('🔍', style: TextStyle(fontSize: 48)),
            const Gap(12),
            Text(
              'No results found for "${_queryController.text}"',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const Gap(6),
            const Text(
              'Try searching for "Solar", "Fugu", or "Plumbing"',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _searchResults.length,
      separatorBuilder: (_, __) => const Gap(12),
      itemBuilder: (context, index) {
        final item = _searchResults[index];
        final provider = item['provider'] ?? {};

        return GestureDetector(
          onTap: () => context.push('/products/detail', extra: item),
          child: ServoraCard(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: ServoraColors.emerald600.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Center(
                    child: Icon(Icons.inventory_2_rounded, color: ServoraColors.emerald600, size: 28),
                  ),
                ),
                const Gap(14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item['title'] ?? 'Marketplace Listing',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const Gap(4),
                      Text(
                        'GH₵ ${item['price'] ?? 0} • ${provider['businessName'] ?? 'Verified Seller'}',
                        style: const TextStyle(fontSize: 12, color: ServoraColors.emerald600, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ServoraColors.emerald600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    minimumSize: Size.zero,
                  ),
                  onPressed: () {
                    WhatsAppHelper.openWhatsApp(
                      phone: provider['user']?['phone'] ?? '+233240000000',
                      message: 'Hello, I found your listing "${item['title']}" via Servora.gh search.',
                    );
                  },
                  child: const Text('Contact', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ).animate().fadeIn(duration: (150 + index * 50).ms).slideY(begin: 0.1, end: 0);
      },
    );
  }
}
