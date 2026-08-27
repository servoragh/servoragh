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
import '../../../shared/widgets/servora_dropdown_sheet.dart';
import '../../../shared/widgets/servora_shimmer_skeleton.dart';
import '../../../shared/widgets/servora_live_ticker_bar.dart';

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
      'price': 2400.0,
      'originalPrice': 3000.0,
      'seller': 'Kwame Electrical',
      'location': 'Sakasaka, Tamale',
      'phone': '+233244889900',
      'image': 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80',
      'images': [
        'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80',
        'https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?w=600&q=80',
      ],
      'description':
          'Complete 300W Monocrystalline Solar System kit including pure sine wave inverter, MPPT charge controller, heavy-duty mounting rails, and MC4 cabling. Ideal for homes and shops across Tamale and Northern Region to beat power cuts.\n\n• Warranty: 2 Years Manufacturers Guarantee\n• Delivery: Same-Day Installation Available in Sakasaka, Choggu, and Nyohini.',
    },
    {
      'title': 'Handwoven Royal Dagbon Fugu (Heavy Thread Smock)',
      'category': 'Fugu Smocks',
      'price': 850.0,
      'originalPrice': 1000.0,
      'seller': 'Northern Authentic Fugu',
      'location': 'Nyohini, Tamale',
      'phone': '+233501234567',
      'image': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80',
      'images': [
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80',
      ],
      'description':
          'Authentic 100% handwoven Northern Ghana Dagbon Royal Fugu smock crafted with heavy traditional cotton thread. Tailored for chieftaincy ceremonies, weddings, and formal occasions.\n\n• Size: XL (Custom sizing on request)\n• Origin: Handwoven in Nyohini, Tamale',
    },
    {
      'title': 'DeWalt Heavy Duty Rotary Hammer Power Drill',
      'category': 'Tool Rentals',
      'price': 1200.0,
      'originalPrice': 1500.0,
      'seller': 'Salifu Hardware',
      'location': 'Choggu, Tamale',
      'phone': '+233201122334',
      'image': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
      'images': [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
      ],
      'description':
          'DeWalt 800W corded SDS-Plus Rotary Hammer drill for concrete, stone, and masonry work. Comes with SDS drill bits set, depth gauge, and heavy carrying case.\n\n• Condition: Brand New in Box\n• Warranty: 6 Months Local Repair Warranty',
    },
    {
      'title': 'HP EliteBook 840 G8 Core i7 (16GB RAM, 512GB SSD)',
      'category': 'Phones & Tech',
      'price': 4600.0,
      'originalPrice': 5200.0,
      'seller': 'Tamale Tech Hub',
      'location': 'Central Market',
      'phone': '+233240000000',
      'image': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
      'images': [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
      ],
      'description':
          'HP EliteBook 840 G8 ultrabook featuring 11th Gen Intel Core i7 processor, 16GB DDR4 RAM, 512GB NVMe SSD, backlit keyboard, fingerprint reader, aluminum chassis, and crisp FHD display.\n\n• Condition: Refurbished Grade A (Clean as new)\n• Battery: 6+ Hours Backup',
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

              // Extract Images list
              final imageList = <String>[];
              final rawImgs = p['images'];
              if (rawImgs != null) {
                if (rawImgs is List) {
                  for (final item in rawImgs) {
                    if (item != null && item.toString().isNotEmpty) imageList.add(item.toString());
                  }
                } else if (rawImgs is String && rawImgs.startsWith('[')) {
                  try {
                    final parsed = jsonDecode(rawImgs) as List;
                    for (final item in parsed) {
                      if (item != null && item.toString().isNotEmpty) imageList.add(item.toString());
                    }
                  } catch (_) {}
                } else if (rawImgs is String && rawImgs.startsWith('http')) {
                  imageList.add(rawImgs);
                }
              }

              final mainImage = imageList.isNotEmpty ? imageList[0] : null;

              double priceNum = 0.0;
              if (p['price'] != null) {
                priceNum = double.tryParse(p['price'].toString()) ?? 0.0;
              }

              double? originalPriceNum;
              if (p['originalPrice'] != null) {
                originalPriceNum = double.tryParse(p['originalPrice'].toString());
              }

              return {
                'id': p['id'] ?? 'prod',
                'title': p['title'] ?? 'Marketplace Item',
                'category': p['category'] ?? 'General',
                'price': priceNum,
                'originalPrice': originalPriceNum,
                'description': p['description'] ?? 'No detailed description provided by seller.',
                'seller': provider['businessName'] ?? 'Verified Enterprise',
                'location': provider['serviceArea'] ?? 'Tamale',
                'phone': provider['user']?['phone'] ?? '+233240000000',
                'image': mainImage,
                'images': imageList,
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
                // 1. LIVE ANNOUNCEMENT TICKER BAR (WEB PARITY)
                const ServoraLiveTickerBar(),

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
                          Image.asset(
                            'assets/images/logo.png',
                            width: 42,
                            height: 42,
                            fit: BoxFit.contain,
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

                // 6. MARKETPLACE PRODUCTS FEED (WITH DISCOUNT BADGE & CANCELLED STRIKETHROUGH PRICE)
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
                          childAspectRatio: 0.62,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                        itemCount: _liveProducts.isNotEmpty ? _liveProducts.length : _fallbackProducts.length,
                        itemBuilder: (context, index) {
                          final p = _liveProducts.isNotEmpty ? _liveProducts[index] : _fallbackProducts[index];
                          final imageUrl = p['image'] as String?;

                          final double price = (p['price'] is num) ? (p['price'] as num).toDouble() : 0.0;
                          final double? originalPrice = (p['originalPrice'] is num) ? (p['originalPrice'] as num).toDouble() : null;

                          final hasDiscount = originalPrice != null && originalPrice > price;
                          final discountPct = hasDiscount ? (((originalPrice - price) / originalPrice) * 100).round() : 0;

                          return GestureDetector(
                            onTap: () => context.push('/products/detail', extra: p),
                            child: ServoraCard(
                              padding: EdgeInsets.zero,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Product Cover Image + Discount Tag Badge
                                  Stack(
                                    children: [
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

                                      // Yellow Discount Badge
                                      if (hasDiscount)
                                        Positioned(
                                          top: 6,
                                          right: 6,
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: ServoraColors.amberGold,
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: Text(
                                              '$discountPct% OFF',
                                              style: const TextStyle(
                                                fontSize: 9,
                                                fontWeight: FontWeight.w900,
                                                color: Colors.black,
                                              ),
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),

                                  Padding(
                                    padding: const EdgeInsets.all(10),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
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
                                        const Gap(4),
                                        Text(
                                          p['title'],
                                          style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                              height: 1.15),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const Gap(4),

                                        // Price & Strikethrough Cancelled Price
                                        Wrap(
                                          crossAxisAlignment: WrapCrossAlignment.center,
                                          spacing: 6,
                                          children: [
                                            Text(
                                              'GH₵ ${price.toStringAsFixed(0)}',
                                              style: const TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w900,
                                                color: ServoraColors.emerald600,
                                              ),
                                            ),
                                            if (hasDiscount)
                                              Text(
                                                'GH₵ ${originalPrice.toStringAsFixed(0)}',
                                                style: TextStyle(
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.w600,
                                                  color: Colors.grey[500],
                                                  decoration: TextDecoration.lineThrough,
                                                ),
                                              ),
                                          ],
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
    );
  }
}
