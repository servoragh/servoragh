import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../app/theme/servora_typography.dart';
import '../../../core/constants/constants.dart';
import '../../../core/services/marketplace_api_service.dart';
import '../../../main.dart';
import '../../../shared/widgets/servora_dropdown_sheet.dart';
import '../../../shared/widgets/servora_live_ticker_bar.dart';
import '../../../shared/widgets/servora_provider_card.dart';
import '../../../shared/widgets/servora_product_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
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
      'sellerSlug': 'kwame-electrical-tamale',
      'providerSlug': 'kwame-electrical-tamale',
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
      'sellerSlug': 'northern-grace-fugu-tamale',
      'providerSlug': 'northern-grace-fugu-tamale',
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
      'sellerSlug': 'fuseini-phone-repair-sakasaka',
      'providerSlug': 'fuseini-phone-repair-sakasaka',
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
      'sellerSlug': 'savannah-fresh-farms',
      'providerSlug': 'savannah-fresh-farms',
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
      'id': 'prov_solar',
      'businessName': 'Tamale Solar & Heavy Power Solutions',
      'name': 'Tamale Solar & Heavy Power Solutions',
      'ownerName': 'Eng. Rashid Mohammed',
      'yearsExperience': 1,
      'serviceArea': 'Tamale, Bolgatanga, Wa',
      'location': 'Tamale, Bolgatanga, Wa',
      'ratingAverage': 5.0,
      'rating': 5.0,
      'reviewCount': 36,
      'completedJobsCount': 85,
      'jobsDone': 85,
      'pricingFixedStart': 250.0,
      'bio': "Northern Ghana's leading distributor of high-efficiency solar panels, lithium wall batteries, pure sine wave inverters, and heavy water pump generators.",
      'phone': '+233246669988',
      'slug': 'tamale-solar-power',
      'trustScore': 100,
      'logoUrl': 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=80',
      'avatarUrl': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      'badges': ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'BUSINESS_VERIFIED'],
    },
    {
      'id': 'prov_fugu_heritage',
      'businessName': 'Northern Heritage Smocks & Fugu Hub',
      'name': 'Northern Heritage Smocks & Fugu Hub',
      'ownerName': 'Chief Fuseini Adam',
      'yearsExperience': 1,
      'serviceArea': 'Tamale, Sakasaka, Choggu',
      'location': 'Tamale, Sakasaka, Choggu',
      'ratingAverage': 4.9,
      'rating': 4.9,
      'reviewCount': 48,
      'completedJobsCount': 120,
      'jobsDone': 120,
      'pricingFixedStart': 85.0,
      'bio': 'Master weaver producing authentic Dagbon royal smocks, heavy handwoven Fugu cotton attire, and ceremonial marriage garments.',
      'phone': '+233245559988',
      'slug': 'northern-heritage-smocks',
      'trustScore': 100,
      'logoUrl': 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&auto=format&fit=crop&q=80',
      'avatarUrl': 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&auto=format&fit=crop&q=80',
      'badges': ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'BUSINESS_VERIFIED'],
    },
    {
      'id': 'prov_kwame',
      'businessName': 'Kwame Electrical & AC Experts',
      'name': 'Kwame Electrical & AC Experts',
      'ownerName': 'Kwame Mensah',
      'yearsExperience': 8,
      'serviceArea': 'Sakasaka, Tamale Central',
      'location': 'Sakasaka, Tamale Central',
      'ratingAverage': 4.9,
      'rating': 4.9,
      'reviewCount': 28,
      'completedJobsCount': 42,
      'jobsDone': 42,
      'pricingFixedStart': 60.0,
      'bio': 'Certified electrical engineer with over 8 years experience in Tamale. Specialist in household wiring, AC gas refilling, breaker troubleshooting, and ceiling fans.',
      'phone': '+233244889900',
      'slug': 'kwame-electrical-tamale',
      'trustScore': 100,
      'logoUrl': 'https://res.cloudinary.com/qch4qejm/image/upload/v1787011297/deoc9i3sjcp2fdvovwwy.jpg',
      'avatarUrl': 'https://res.cloudinary.com/qch4qejm/image/upload/v1787011297/deoc9i3sjcp2fdvovwwy.jpg',
      'badges': ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'BUSINESS_VERIFIED'],
    },
    {
      'id': 'prov_fuseini',
      'businessName': 'Fuseini Mobile Phone & Laptop Hospital',
      'name': 'Fuseini Mobile Phone & Laptop Hospital',
      'ownerName': 'Fuseini Ibrahim',
      'yearsExperience': 6,
      'serviceArea': 'Sakasaka, Aboabo, Central Market',
      'location': 'Sakasaka, Aboabo, Central Market',
      'ratingAverage': 4.8,
      'rating': 4.8,
      'reviewCount': 34,
      'completedJobsCount': 65,
      'jobsDone': 65,
      'pricingFixedStart': 50.0,
      'bio': 'Sakasaka phone hub master technician. Original screen replacement for iPhone, Samsung, Tecno, Infinix. Battery upgrades, charging port soldering, OS flashing.',
      'phone': '+233209988776',
      'slug': 'fuseini-phone-repair-sakasaka',
      'trustScore': 99,
      'logoUrl': 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=500&auto=format&fit=crop&q=80',
      'avatarUrl': 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=500&auto=format&fit=crop&q=80',
      'badges': ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'FAST_RESPONDER'],
    },
    {
      'id': 'prov_fugu_grace',
      'businessName': 'Northern Grace Fugu & Tailoring Hub',
      'name': 'Northern Grace Fugu & Tailoring Hub',
      'ownerName': 'Hajia Fatima Al-Hassan',
      'yearsExperience': 12,
      'serviceArea': 'Aboabo, Tamale Central',
      'location': 'Aboabo, Tamale Central',
      'ratingAverage': 5.0,
      'rating': 5.0,
      'reviewCount': 19,
      'completedJobsCount': 50,
      'jobsDone': 50,
      'pricingFixedStart': 120.0,
      'bio': 'Authentic hand-woven Northern Ghana Fugu (Smocks), embroidery, bespoke Senator kaftans, and bridal attire. Located at Aboabo Market, delivering across Tamale.',
      'phone': '+233245554433',
      'slug': 'northern-grace-fugu-tamale',
      'trustScore': 100,
      'logoUrl': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
      'avatarUrl': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
      'badges': ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'BUSINESS_VERIFIED'],
    },
    {
      'id': 'prov_savannah',
      'businessName': 'Savannah Fresh Farm Produce & Agro-Goods',
      'name': 'Savannah Fresh Farm Produce & Agro-Goods',
      'ownerName': 'Madam Salifu Zenabu',
      'yearsExperience': 1,
      'serviceArea': 'Tamale, Aboabo, Kumasi',
      'location': 'Tamale, Aboabo, Kumasi',
      'ratingAverage': 4.8,
      'rating': 4.8,
      'reviewCount': 62,
      'completedJobsCount': 210,
      'jobsDone': 210,
      'pricingFixedStart': 65.0,
      'bio': 'Direct farm cooperative wholesaler supplying pure unrefined Shea Butter, fresh Tamale Pona yams, organic soybeans, guinea fowl eggs, and raw honey.',
      'phone': '+233247779988',
      'slug': 'savannah-fresh-farms',
      'trustScore': 99,
      'logoUrl': 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=80',
      'avatarUrl': 'https://res.cloudinary.com/qch4qejm/image/upload/v1787871190/tmvisdascbdsgsa4fh5x.jpg',
      'badges': ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'BUSINESS_VERIFIED'],
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

              final providerSlug = provider['slug'] ?? p['providerSlug'] ?? p['sellerSlug'] ?? 'savannah-fresh-farms';

              return {
                'id': p['id'] ?? 'prod',
                'title': p['title'] ?? 'Marketplace Item',
                'category': p['category'] ?? 'General',
                'price': priceNum,
                'originalPrice': originalPriceNum,
                'description': p['description'] ?? 'No detailed description provided by seller.',
                'seller': provider['businessName'] ?? 'Verified Enterprise',
                'sellerSlug': providerSlug,
                'providerSlug': providerSlug,
                'location': provider['serviceArea'] ?? 'Tamale',
                'phone': provider['user']?['phone'] ?? '+233240000000',
                'image': mainImage,
                'images': imageList,
              };
            }).toList();
          }

          if (providers.isNotEmpty) {
            _liveMerchants = providers.map((m) {
              final user = m['user'] is Map ? m['user'] : {};
              final badgesRaw = m['badges'];
              List<String> badgesList = ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'BUSINESS_VERIFIED'];
              if (badgesRaw != null) {
                if (badgesRaw is List) {
                  badgesList = badgesRaw.map((b) => b.toString()).toList();
                } else if (badgesRaw is String && badgesRaw.startsWith('[')) {
                  try {
                    final parsed = jsonDecode(badgesRaw) as List;
                    badgesList = parsed.map((b) => b.toString()).toList();
                  } catch (_) {}
                }
              }

              final avatar = m['logoUrl'] ?? user['avatarUrl'] ?? m['avatarUrl'];
              double? priceStart;
              if (m['pricingFixedStart'] != null) {
                priceStart = double.tryParse(m['pricingFixedStart'].toString());
              }

              return {
                'id': m['id'] ?? 'provider',
                'businessName': m['businessName'] ?? 'Artisan Merchant',
                'name': m['businessName'] ?? 'Artisan Merchant',
                'ownerName': user['name'] ?? m['ownerName'] ?? 'Verified Owner',
                'yearsExperience': int.tryParse((m['yearsExperience'] ?? 1).toString()) ?? 1,
                'serviceArea': m['serviceArea'] ?? 'Tamale',
                'location': m['serviceArea'] ?? 'Tamale',
                'ratingAverage': (m['ratingAverage'] != null ? double.tryParse(m['ratingAverage'].toString()) : null) ?? 5.0,
                'rating': (m['ratingAverage'] != null ? double.tryParse(m['ratingAverage'].toString()) : null) ?? 5.0,
                'reviewCount': int.tryParse((m['reviewCount'] ?? m['reviewsCount'] ?? 0).toString()) ?? 0,
                'completedJobsCount': int.tryParse((m['completedJobsCount'] ?? m['jobsDone'] ?? 0).toString()) ?? 0,
                'jobsDone': int.tryParse((m['completedJobsCount'] ?? m['jobsDone'] ?? 0).toString()) ?? 0,
                'pricingFixedStart': priceStart,
                'bio': m['bio'] ?? m['description'] ?? 'Certified local business and service specialist in Northern Ghana.',
                'phone': user['phone'] ?? m['phone'] ?? '+233240000000',
                'slug': m['slug'] ?? 'tamale-solar-power',
                'trustScore': m['verificationStatus'] == 'VERIFIED' ? 100 : 99,
                'badges': badgesList,
                'logoUrl': avatar,
                'avatarUrl': avatar,
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
                      Image.asset(
                        'assets/images/logo.png',
                        height: 40,
                        fit: BoxFit.contain,
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
                      ).animate().fadeIn(delay: 100.ms, duration: 300.ms).slideY(begin: 0.08, end: 0),
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
                      ).animate().fadeIn(delay: 180.ms, duration: 300.ms).scale(begin: const Offset(0.97, 0.97), end: const Offset(1, 1), curve: Curves.easeOutCubic),
                    ],
                  ),
                ),

                // 4. CONTEXTUAL CATEGORY DISCOVERY (HORIZONTAL CAROUSEL)
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Discover Marketplace Services', style: ServoraTypography.titleLarge(isDark))
                          .animate().fadeIn(duration: 250.ms),
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
                            ).animate().fadeIn(delay: (index * 45).ms, duration: 300.ms).slideX(begin: 0.15, end: 0, curve: Curves.easeOutCubic);
                          },
                        ),
                      ),
                    ],
                  ),
                ),

                // 5. VERIFIED LOCAL BUSINESSES CAROUSEL
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Verified Local Businesses', style: ServoraTypography.titleLarge(isDark)),
                          GestureDetector(
                            onTap: () => context.push('/businesses'),
                            child: const Text('View All ↗', style: TextStyle(color: ServoraColors.emerald600, fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ).animate().fadeIn(duration: 250.ms),
                      const Gap(12),

                      SizedBox(
                        height: 330,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: _liveMerchants.isNotEmpty ? _liveMerchants.length : _fallbackMerchants.length,
                          itemBuilder: (context, index) {
                            final m = _liveMerchants.isNotEmpty ? _liveMerchants[index] : _fallbackMerchants[index];

                            return Padding(
                              padding: const EdgeInsets.only(right: 14),
                              child: ServoraProviderCard(
                                provider: Map<String, dynamic>.from(m as Map),
                                width: 310,
                              ),
                            ).animate().fadeIn(delay: (index * 60).ms, duration: 350.ms).slideX(begin: 0.12, end: 0, curve: Curves.easeOutCubic);
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
                      ).animate().fadeIn(duration: 250.ms),
                      const Gap(12),

                      Builder(
                        builder: (context) {
                          final products = _liveProducts.isNotEmpty ? _liveProducts : _fallbackProducts;
                          return Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Left column (even indices)
                              Expanded(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    for (int i = 0; i < products.length; i += 2)
                                      Padding(
                                        padding: const EdgeInsets.only(bottom: 12),
                                        child: ServoraProductCard(
                                          product: Map<String, dynamic>.from(products[i]),
                                        ).animate().fadeIn(delay: (i * 40).ms, duration: 300.ms).scale(begin: const Offset(0.96, 0.96), end: const Offset(1, 1), curve: Curves.easeOutCubic),
                                      ),
                                  ],
                                ),
                              ),
                              const Gap(12),
                              // Right column (odd indices)
                              Expanded(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    for (int i = 1; i < products.length; i += 2)
                                      Padding(
                                        padding: const EdgeInsets.only(bottom: 12),
                                        child: ServoraProductCard(
                                          product: Map<String, dynamic>.from(products[i]),
                                        ).animate().fadeIn(delay: (i * 40).ms, duration: 300.ms).scale(begin: const Offset(0.96, 0.96), end: const Offset(1, 1), curve: Curves.easeOutCubic),
                                      ),
                                  ],
                                ),
                              ),
                            ],
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
