import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../app/theme/servora_typography.dart';
import '../../../core/constants/constants.dart';
import '../../../core/services/marketplace_api_service.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../../main.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/servora_dropdown_sheet.dart';
import '../../../shared/widgets/servora_shimmer_skeleton.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  String _selectedLocation = 'Sakasaka, Tamale';
  bool _isLoadingLiveApi = false;
  List<Map<String, dynamic>> _liveProducts = [];
  List<Map<String, dynamic>> _liveMerchants = [];

  final List<Map<String, String>> _discoveryCategories = [
    {'name': 'Electrical & Solar', 'icon': '⚡', 'subtitle': 'Wiring & inverters'},
    {'name': 'Plumbing & Borehole', 'icon': '🚰', 'subtitle': 'Pumps & piping'},
    {'name': 'Fugu & Weaving', 'icon': '🧵', 'subtitle': 'Dagbon smocks'},
    {'name': 'Automotive Mechanic', 'icon': '🔧', 'subtitle': 'Car & truck repairs'},
    {'name': 'Building & Masonry', 'icon': '🧱', 'subtitle': 'Plots & masons'},
    {'name': 'Tool Heavy Rentals', 'icon': '🚜', 'subtitle': 'Generators & drills'},
    {'name': 'Delivery & Haulage', 'icon': '🚚', 'subtitle': 'Express dispatch'},
  ];

  final List<Map<String, dynamic>> _fallbackProducts = [
    {
      'title': '300W Monocrystalline Solar Panel & Inverter Kit',
      'category': 'Solar & Tech',
      'price': 'GH₵ 2,400.00',
      'seller': 'Kwame Electrical',
      'location': 'Sakasaka, Tamale',
      'phone': '+233244889900',
      'image': 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80',
    },
    {
      'title': 'Handwoven Royal Dagbon Fugu (Heavy Thread Smock)',
      'category': 'Fugu Smocks',
      'price': 'GH₵ 850.00',
      'seller': 'Northern Authentic Fugu',
      'location': 'Nyohini, Tamale',
      'phone': '+233501234567',
      'image': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80',
    },
    {
      'title': 'DeWalt Heavy Duty Rotary Hammer Power Drill',
      'category': 'Tool Rentals',
      'price': 'GH₵ 1,200.00',
      'seller': 'Salifu Hardware',
      'location': 'Choggu, Tamale',
      'phone': '+233201122334',
      'image': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
    },
    {
      'title': 'HP EliteBook 840 G8 Core i7 (16GB RAM, 512GB SSD)',
      'category': 'Phones & Tech',
      'price': 'GH₵ 4,600.00',
      'seller': 'Tamale Tech Hub',
      'location': 'Central Market',
      'phone': '+233240000000',
      'image': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
    },
  ];

  final List<Map<String, dynamic>> _fallbackMerchants = [
    {
      'name': 'Kwame Electrical & Solar Systems',
      'category': 'Electrical & Solar',
      'location': 'Sakasaka, Tamale',
      'rating': 4.9,
      'jobsDone': 48,
      'phone': '+233244889900',
      'slug': 'kwame-electrical-tamale',
    },
    {
      'name': 'Northern Authentic Fugu Weavers',
      'category': 'Fugu & Fashion',
      'location': 'Nyohini, Tamale',
      'rating': 5.0,
      'jobsDone': 62,
      'phone': '+233501234567',
      'slug': 'northern-fugu-fabrics',
    },
    {
      'name': 'Salifu Plumbing & Borehole Guild',
      'category': 'Plumbing & Pumps',
      'location': 'Choggu, Tamale',
      'rating': 4.8,
      'jobsDone': 35,
      'phone': '+233201122334',
      'slug': 'salifu-plumbing-tamale',
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadLiveProductionData();
  }

  Future<void> _loadLiveProductionData() async {
    if (!mounted) return;
    setState(() => _isLoadingLiveApi = true);

    try {
      final products = await MarketplaceApiService.fetchProducts();
      final providers = await MarketplaceApiService.fetchBusinesses();

      if (mounted) {
        setState(() {
          if (products.isNotEmpty) {
            _liveProducts = products.map((p) {
              final provider = p['provider'] ?? {};
              String? imgUrl;
              final rawImgs = p['images'];
              if (rawImgs != null) {
                if (rawImgs is List && rawImgs.isNotEmpty) {
                  imgUrl = rawImgs[0].toString();
                } else if (rawImgs is String && rawImgs.startsWith('[')) {
                  try {
                    final parsed = jsonDecode(rawImgs) as List;
                    if (parsed.isNotEmpty) imgUrl = parsed[0].toString();
                  } catch (_) {}
                } else if (rawImgs is String && rawImgs.startsWith('http')) {
                  imgUrl = rawImgs;
                }
              }

              return {
                'title': p['title'] ?? 'Marketplace Item',
                'category': p['category'] ?? 'General',
                'price': 'GH₵ ${(p['price'] ?? 0).toString()}',
                'seller': provider['businessName'] ?? 'Verified Enterprise',
                'location': provider['serviceArea'] ?? 'Tamale',
                'phone': provider['user']?['phone'] ?? '+233240000000',
                'image': imgUrl,
              };
            }).toList();
          }

          if (providers.isNotEmpty) {
            _liveMerchants = providers.map((m) {
              return {
                'name': m['businessName'] ?? 'Artisan Merchant',
                'category': m['category'] ?? 'Local Trade',
                'location': m['serviceArea'] ?? 'Tamale',
                'rating': (m['ratingAverage'] ?? 5.0).toDouble(),
                'jobsDone': 24,
                'phone': m['phone'] ?? '+233240000000',
                'slug': m['slug'] ?? 'biz',
              };
            }).toList();
          }
        });
      }
    } catch (_) {}

    if (mounted) setState(() => _isLoadingLiveApi = false);
  }

  Future<void> _openLocationPicker() async {
    final result = await ServoraBottomSheetPicker.show(
      context: context,
      title: 'Select Northern Ghana Zone 📍',
      items: ServoraConstants.northernNeighborhoods,
      selectedValue: _selectedLocation,
      searchHint: 'Search Sakasaka, Nyohini, Choggu...',
      titleIcon: Icons.location_on_rounded,
    );

    if (result != null && mounted) {
      setState(() => _selectedLocation = result);
    }
  }

  void _showProductDetailModal(BuildContext context, Map<String, dynamic> p) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalCtx) {
        final isDark = Theme.of(modalCtx).brightness == Brightness.dark;
        final imageUrl = p['image'] as String?;

        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(modalCtx).size.height * 0.85,
          ),
          decoration: BoxDecoration(
            color: isDark ? ServoraColors.darkBackground : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 5,
                    decoration: BoxDecoration(
                      color: Colors.grey[400],
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
                const Gap(16),
                if (imageUrl != null && imageUrl.isNotEmpty) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: CachedNetworkImage(
                      imageUrl: imageUrl,
                      height: 200,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => const ServoraShimmerSkeleton(
                          width: double.infinity, height: 200, borderRadius: 20),
                      errorWidget: (_, __, ___) => Container(
                        height: 160,
                        color: ServoraColors.emerald600.withOpacity(0.1),
                        child: const Icon(Icons.inventory_2_rounded,
                            size: 50, color: ServoraColors.emerald600),
                      ),
                    ),
                  ),
                  const Gap(16),
                ],
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: ServoraColors.emerald600.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        p['category'] ?? 'General',
                        style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: ServoraColors.emerald600),
                      ),
                    ),
                    const StatusBadge(
                      label: 'IN STOCK',
                      backgroundColor: Color(0xFFD1FAE5),
                      textColor: Color(0xFF047857),
                    ),
                  ],
                ),
                const Gap(12),
                Text(
                  p['title'] ?? 'Marketplace Item',
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.w900, height: 1.25),
                ),
                const Gap(8),
                Text(
                  p['price'] ?? 'GH₵ 0.00',
                  style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: ServoraColors.emerald600),
                ),
                const Divider(height: 30),
                ServoraCard(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
                        child: Text(
                          (p['seller'] ?? 'S')[0],
                          style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: ServoraColors.emerald600),
                        ),
                      ),
                      const Gap(12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p['seller'] ?? 'Verified Merchant',
                              style: const TextStyle(
                                  fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'Location: ${p['location']} • Verified Ghana Card',
                              style: TextStyle(
                                  fontSize: 11, color: Colors.grey[600]),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const Gap(24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF25D366),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25)),
                    ),
                    icon: const Icon(Icons.chat_rounded, size: 20),
                    label: const Text('Buy via WhatsApp Direct 💬',
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.bold)),
                    onPressed: () {
                      WhatsAppHelper.openWhatsApp(
                        phone: p['phone'] ?? '+233240000000',
                        message:
                            'Hello, I am interested in buying "${p['title']}" listed on Servora.gh app.',
                      );
                    },
                  ),
                ),
                const Gap(10),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: ServoraColors.amberDark,
                      side: const BorderSide(
                          color: ServoraColors.amberGold, width: 1.5),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25)),
                    ),
                    icon: const Icon(Icons.shield_rounded, size: 20),
                    label: const Text('Buy with Safe MoMo Escrow 🛡️',
                        style: TextStyle(
                            fontSize: 14, fontWeight: FontWeight.bold)),
                    onPressed: () {
                      Navigator.of(modalCtx).pop();
                      context.push('/escrow');
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? ServoraColors.darkSurface : Colors.white;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          color: ServoraColors.emerald600,
          onRefresh: _loadLiveProductionData,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. TOP ANNOUNCEMENT BAR
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  color: isDark ? const Color(0xFF0F172A) : ServoraColors.emerald900,
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: ServoraColors.emerald500,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const Gap(8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1D4ED8).withOpacity(0.4),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFF3B82F6), width: 0.8),
                        ),
                        child: const Text(
                          'BUSINESS OWNER',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                      const Gap(8),
                      const Expanded(
                        child: Text(
                          'Are you a seller in Northern Ghana?',
                          style: TextStyle(fontSize: 11, color: Colors.white70),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      GestureDetector(
                        onTap: () => context.push('/auth/login'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: ServoraColors.emerald600,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'Register ➔',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // 2. LOGO HEADER & EDITORIAL ACTIONS
                if (_isLoadingLiveApi)
                  const LinearProgressIndicator(
                    backgroundColor: Colors.transparent,
                    color: ServoraColors.emerald600,
                    minHeight: 2,
                  ),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 42,
                            height: 42,
                            decoration: const BoxDecoration(
                              color: ServoraColors.emerald600,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.build_circle_rounded, color: Colors.white, size: 24),
                          ),
                          const Gap(10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text('Servora', style: ServoraTypography.titleLarge(isDark)),
                                  const Text('.gh', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                                ],
                              ),
                              const Text(
                                'NORTHERN MARKETPLACE',
                                style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: ServoraColors.emerald600, letterSpacing: 0.8),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          GestureDetector(
                            onTap: _openLocationPicker,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: isDark ? ServoraColors.darkSurface : const Color(0xFFE2E8F0),
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: ServoraColors.emerald600.withOpacity(0.3)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.location_on_rounded, size: 14, color: ServoraColors.emerald600),
                                  const Gap(4),
                                  Text(
                                    _selectedLocation.length > 14
                                        ? '${_selectedLocation.substring(0, 12)}...'
                                        : _selectedLocation,
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                  const Icon(Icons.arrow_drop_down_rounded, size: 16, color: ServoraColors.emerald600),
                                ],
                              ),
                            ),
                          ),
                          const Gap(8),

                          // Dark/Light Theme Switcher
                          GestureDetector(
                            onTap: () {
                              themeModeNotifier.value = isDark ? ThemeMode.light : ThemeMode.dark;
                            },
                            child: CircleAvatar(
                              radius: 18,
                              backgroundColor: isDark ? ServoraColors.darkSurface : const Color(0xFFE2E8F0),
                              child: Icon(
                                isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                                size: 18,
                                color: isDark ? Colors.amber : ServoraColors.emerald600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // 3. EDITORIAL SEARCH HERO SECTION
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: isDark
                          ? [const Color(0xFF0F172A), const Color(0xFF022C22)]
                          : [const Color(0xFFECFDF5), const Color(0xFFD1FAE5)],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: ServoraColors.emerald600.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: ServoraColors.emerald600.withOpacity(0.3)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.verified_user_outlined, size: 12, color: ServoraColors.emerald600),
                            Gap(4),
                            Text(
                              '#1 Local Trade & Service Hub in Northern Ghana',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: ServoraColors.emerald700),
                            ),
                          ],
                        ),
                      ),
                      const Gap(12),

                      Text(
                        'What do you need today in Northern Ghana?',
                        style: ServoraTypography.displayMedium(isDark),
                      ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.1, end: 0),
                      const Gap(6),

                      Text(
                        'Instant quotes from verified electricians, plumbers, fugu tailors & drivers across $_selectedLocation.',
                        style: ServoraTypography.bodyMedium(isDark),
                      ),
                      const Gap(16),

                      // Interactive Full-Screen Search Bar Trigger
                      GestureDetector(
                        onTap: () => context.push('/search'),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isDark ? ServoraColors.darkSurface : Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.06),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.search_rounded, color: ServoraColors.emerald600, size: 22),
                              const Gap(10),
                              const Expanded(
                                child: Text(
                                  'Search electricians, smocks, plumbers...',
                                  style: TextStyle(fontSize: 13, color: Colors.grey, fontWeight: FontWeight.w500),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: ServoraColors.emerald600,
                                  borderRadius: BorderRadius.circular(18),
                                ),
                                child: const Row(
                                  children: [
                                    Text('Search', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                    Gap(4),
                                    Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 14),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const Gap(16),

                      // Post Request Big Emerald CTA
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ServoraColors.emerald600,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                            elevation: 0,
                          ),
                          icon: const Icon(Icons.add_circle_outline_rounded, size: 20),
                          label: const Text('Post Request & Get Prices', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                          onPressed: () => context.push('/services/request'),
                        ),
                      ),
                    ],
                  ),
                ),

                // 4. CONTEXTUAL CATEGORY DISCOVERY (HORIZONTAL CAROUSEL)
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Discover Marketplace Services', style: ServoraTypography.titleLarge(isDark)),
                      const Gap(12),

                      SizedBox(
                        height: 100,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: _discoveryCategories.length,
                          itemBuilder: (context, index) {
                            final cat = _discoveryCategories[index];
                            return GestureDetector(
                              onTap: () => context.push('/search'),
                              child: Container(
                                width: 140,
                                margin: const EdgeInsets.only(right: 10),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: cardBg,
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(
                                    color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(cat['icon']!, style: const TextStyle(fontSize: 22)),
                                    const Gap(6),
                                    Text(
                                      cat['name']!,
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(
                                      cat['subtitle']!,
                                      style: TextStyle(fontSize: 9, color: Colors.grey[500]),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),

                // 5. VERIFIED MERCHANTS CAROUSEL
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Verified Local Merchants', style: ServoraTypography.titleLarge(isDark)),
                          GestureDetector(
                            onTap: () => context.push('/search'),
                            child: const Text('View All ↗', style: TextStyle(color: ServoraColors.emerald600, fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const Gap(12),

                      SizedBox(
                        height: 160,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: _liveMerchants.isNotEmpty ? _liveMerchants.length : _fallbackMerchants.length,
                          itemBuilder: (context, index) {
                            final m = _liveMerchants.isNotEmpty ? _liveMerchants[index] : _fallbackMerchants[index];

                            return GestureDetector(
                              onTap: () => context.push('/biz/${m['slug']}'),
                              child: Container(
                                width: 220,
                                margin: const EdgeInsets.only(right: 12),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: cardBg,
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(
                                    color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        CircleAvatar(
                                          radius: 18,
                                          backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
                                          child: Text(
                                            m['name'][0],
                                            style: const TextStyle(fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                                          ),
                                        ),
                                        const Gap(10),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                m['name'],
                                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              Text(
                                                m['location'],
                                                style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const Spacer(),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            const Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                                            const Gap(4),
                                            Text(
                                              '${m['rating']} (${m['jobsDone']} jobs)',
                                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                            ),
                                          ],
                                        ),
                                        ElevatedButton(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: ServoraColors.emerald600,
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                            minimumSize: Size.zero,
                                          ),
                                          onPressed: () {
                                            WhatsAppHelper.openWhatsApp(
                                              phone: m['phone'],
                                              message: 'Hello ${m['name']}, I found your business profile on Servora.gh app.',
                                            );
                                          },
                                          child: const Text('Contact', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const Gap(24),

                // 6. MARKETPLACE PRODUCTS FEED (WITH PRODUCT IMAGE DISPLAY & CLICKABLE MODAL DETAILED VIEW)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Local Products & Supplies', style: ServoraTypography.titleLarge(isDark)),
                          GestureDetector(
                            onTap: () => context.push('/products'),
                            child: const Text('View All ↗', style: TextStyle(color: ServoraColors.emerald600, fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const Gap(12),

                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.60,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                        itemCount: _liveProducts.isNotEmpty ? _liveProducts.length : _fallbackProducts.length,
                        itemBuilder: (context, index) {
                          final p = _liveProducts.isNotEmpty ? _liveProducts[index] : _fallbackProducts[index];
                          final imageUrl = p['image'] as String?;

                          return GestureDetector(
                            onTap: () => context.push('/products/detail', extra: p),
                            child: ServoraCard(
                              padding: EdgeInsets.zero,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Product Cover Image
                                  ClipRRect(
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                                    child: imageUrl != null && imageUrl.isNotEmpty
                                        ? CachedNetworkImage(
                                            imageUrl: imageUrl,
                                            height: 110,
                                            width: double.infinity,
                                            fit: BoxFit.cover,
                                            placeholder: (_, __) => const ServoraShimmerSkeleton(
                                                width: double.infinity, height: 110, borderRadius: 0),
                                            errorWidget: (_, __, ___) => Container(
                                              height: 110,
                                              color: ServoraColors.emerald600.withOpacity(0.1),
                                              child: const Center(
                                                child: Icon(Icons.inventory_2_rounded,
                                                    size: 32, color: ServoraColors.emerald600),
                                              ),
                                            ),
                                          )
                                        : Container(
                                            height: 110,
                                            color: ServoraColors.emerald600.withOpacity(0.1),
                                            child: const Center(
                                              child: Icon(Icons.inventory_2_rounded,
                                                  size: 32, color: ServoraColors.emerald600),
                                            ),
                                          ),
                                  ),

                                  Padding(
                                    padding: const EdgeInsets.all(10),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: ServoraColors.emerald600.withOpacity(0.12),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            p['category'],
                                            style: const TextStyle(
                                                fontSize: 9,
                                                fontWeight: FontWeight.bold,
                                                color: ServoraColors.emerald600),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const Gap(6),
                                        Text(
                                          p['title'],
                                          style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                              height: 1.2),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const Gap(4),
                                        Text(
                                          p['price'],
                                          style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w900,
                                            color: ServoraColors.emerald600,
                                          ),
                                        ),
                                        const Gap(2),
                                        Text(
                                          '${p['seller']} • ${p['location']}',
                                          style: TextStyle(
                                              fontSize: 9, color: Colors.grey[600]),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const Gap(8),

                                        Row(
                                          children: [
                                            Expanded(
                                              child: ElevatedButton.icon(
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: ServoraColors.emerald600,
                                                  foregroundColor: Colors.white,
                                                  padding: const EdgeInsets.symmetric(vertical: 6),
                                                  minimumSize: Size.zero,
                                                ),
                                                icon: const Icon(Icons.send_rounded, size: 12),
                                                label: const Text('Buy',
                                                    style: TextStyle(
                                                        fontSize: 11,
                                                        fontWeight: FontWeight.bold)),
                                                onPressed: () {
                                                  WhatsAppHelper.openWhatsApp(
                                                    phone: p['phone'],
                                                    message:
                                                        'Hello, I want to buy "${p['title']}" listed on Servora.gh.',
                                                  );
                                                },
                                              ),
                                            ),
                                            const Gap(4),
                                            GestureDetector(
                                              onTap: () => context.push('/escrow'),
                                              child: Container(
                                                padding: const EdgeInsets.all(6),
                                                decoration: BoxDecoration(
                                                  color: ServoraColors.amberLight,
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: const Icon(Icons.shield_rounded,
                                                    size: 16, color: ServoraColors.amberDark),
                                              ),
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
                      ),
                    ],
                  ),
                ),
                const Gap(30),
              ],
            ),
          ),
        ),
      ),

      // 7. FLOATING MATERIAL 3 BOTTOM NAVIGATION BAR
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          if (index == 0) {
            setState(() => _currentIndex = 0);
          } else if (index == 1) {
            context.push('/products');
          } else if (index == 2) {
            context.push('/delivery');
          } else if (index == 3) {
            context.push('/services/request');
          } else if (index == 4) {
            context.push('/community');
          } else if (index == 5) {
            context.push('/profile');
          }
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home_filled, color: ServoraColors.emerald600), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.shopping_bag_outlined), selectedIcon: Icon(Icons.shopping_bag_rounded, color: ServoraColors.emerald600), label: 'Products'),
          NavigationDestination(icon: Icon(Icons.local_shipping_outlined), selectedIcon: Icon(Icons.local_shipping_rounded, color: ServoraColors.emerald600), label: 'Delivery'),
          NavigationDestination(
            icon: CircleAvatar(
              radius: 14,
              backgroundColor: ServoraColors.emerald600,
              child: Icon(Icons.add_rounded, color: Colors.white, size: 18),
            ),
            label: 'Post',
          ),
          NavigationDestination(icon: Icon(Icons.people_outline_rounded), selectedIcon: Icon(Icons.people_rounded, color: ServoraColors.emerald600), label: 'Notice Board'),
          NavigationDestination(icon: Icon(Icons.person_outline_rounded), selectedIcon: Icon(Icons.person_rounded, color: ServoraColors.emerald600), label: 'Account'),
        ],
      ),
    );
  }
}
