import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../app/theme/servora_typography.dart';
import '../../../core/services/marketplace_api_service.dart';
import '../../../shared/widgets/servora_provider_card.dart';
import '../../../shared/widgets/servora_shimmer_skeleton.dart';

class BusinessesScreen extends StatefulWidget {
  const BusinessesScreen({super.key});

  @override
  State<BusinessesScreen> createState() => _BusinessesScreenState();
}

class _BusinessesScreenState extends State<BusinessesScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _businesses = [];
  String _selectedCategory = 'All';
  String _searchQuery = '';

  final List<String> _categories = [
    'All',
    'Electrical & Solar',
    'Electronics & Phone',
    'Fugu & Tailoring',
    'Plumbing & Water',
    'Building & Trade',
  ];

  final List<Map<String, dynamic>> _fallbackBusinesses = [
    {
      'id': 'p1',
      'businessName': 'Kwame Electrical & AC Experts',
      'ownerName': 'Kwame Mensah',
      'yearsExperience': 8,
      'serviceArea': 'Sakasaka, Tamale Central',
      'ratingAverage': 4.9,
      'reviewCount': 28,
      'completedJobsCount': 42,
      'pricingFixedStart': 60.0,
      'bio': 'Certified electrical engineer with over 8 years experience in Tamale. Specialist in household wiring, AC gas refilling, breaker troubleshooting, and ceiling fans.',
      'phone': '+233244889900',
      'slug': 'kwame-electrical-tamale',
      'trustScore': 100,
      'badges': ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'BUSINESS_VERIFIED'],
    },
    {
      'id': 'p2',
      'businessName': 'Fuseini Mobile Phone & Laptop Hospital',
      'ownerName': 'Fuseini Ibrahim',
      'yearsExperience': 6,
      'serviceArea': 'Sakasaka Market, Tamale',
      'ratingAverage': 4.8,
      'reviewCount': 34,
      'completedJobsCount': 65,
      'pricingFixedStart': 50.0,
      'bio': 'Sakasaka phone hub master technician. Original screen replacement for iPhone, Samsung, Tecno, Infinix. Battery upgrades, charging port soldering, OS flashing.',
      'phone': '+233209988776',
      'slug': 'fuseini-phone-repair-sakasaka',
      'trustScore': 99,
      'badges': ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'FAST_RESPONDER'],
    },
    {
      'id': 'p3',
      'businessName': 'Northern Grace Fugu & Tailoring Hub',
      'ownerName': 'Hajia Fatima Al-Hassan',
      'yearsExperience': 12,
      'serviceArea': 'Aboabo Market, Tamale',
      'ratingAverage': 5.0,
      'reviewCount': 19,
      'completedJobsCount': 50,
      'pricingFixedStart': 120.0,
      'bio': 'Authentic hand-woven Northern Ghana Fugu (Smocks), embroidery, bespoke Senator kaftans, and bridal attire. Located at Aboabo Market, delivering across Tamale.',
      'phone': '+233245554433',
      'slug': 'northern-grace-fugu-tamale',
      'trustScore': 100,
      'badges': ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'BUSINESS_VERIFIED'],
    },
    {
      'id': 'p4',
      'businessName': 'Tamale Solar & Heavy Power Systems',
      'ownerName': 'Eng. Rashid Mohammed',
      'yearsExperience': 5,
      'serviceArea': 'Tamale Central, Choggu',
      'ratingAverage': 4.9,
      'reviewCount': 31,
      'completedJobsCount': 58,
      'pricingFixedStart': 250.0,
      'bio': 'Northern Ghana\'s leading distributor & installer of high-efficiency solar panels, lithium batteries, pure sine wave inverters, and heavy water pump generators.',
      'phone': '+233240000000',
      'slug': 'tamale-solar-power',
      'trustScore': 100,
      'badges': ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'BUSINESS_VERIFIED'],
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadBusinesses();
  }

  Future<void> _loadBusinesses() async {
    setState(() => _isLoading = true);
    try {
      final live = await MarketplaceApiService.fetchBusinesses();
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (live.isNotEmpty) {
            _businesses = live.map((m) {
              final user = m['user'] is Map ? m['user'] : {};
              final badgesRaw = m['badges'];
              List<String> badgesList = ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'BUSINESS_VERIFIED'];
              if (badgesRaw != null) {
                if (badgesRaw is List) {
                  badgesList = badgesRaw.map((b) => b.toString()).toList();
                }
              }

              return {
                'id': m['id'] ?? 'provider',
                'businessName': m['businessName'] ?? 'Artisan Merchant',
                'name': m['businessName'] ?? 'Artisan Merchant',
                'ownerName': user['name'] ?? m['ownerName'] ?? 'Verified Owner',
                'yearsExperience': (m['yearsExperience'] ?? 5),
                'serviceArea': m['serviceArea'] ?? 'Tamale',
                'location': m['serviceArea'] ?? 'Tamale',
                'ratingAverage': (m['ratingAverage'] ?? 4.9).toDouble(),
                'rating': (m['ratingAverage'] ?? 4.9).toDouble(),
                'reviewCount': m['reviewCount'] ?? 28,
                'completedJobsCount': m['completedJobsCount'] ?? 42,
                'jobsDone': m['completedJobsCount'] ?? 42,
                'pricingFixedStart': m['pricingFixedStart'],
                'bio': m['bio'] ?? m['description'] ?? 'Certified local business and service specialist in Northern Ghana.',
                'phone': user['phone'] ?? m['phone'] ?? '+233240000000',
                'slug': m['slug'] ?? m['id']?.toString() ?? 'savannah-fresh-farms',
                'trustScore': m['verificationStatus'] == 'VERIFIED' ? 100 : 99,
                'badges': badgesList,
              };
            }).toList();
          } else {
            _businesses = _fallbackBusinesses;
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _businesses = _fallbackBusinesses;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filteredList = _businesses.where((b) {
      final name = (b['businessName'] ?? b['name'] ?? '').toString().toLowerCase();
      final bio = (b['bio'] ?? b['description'] ?? '').toString().toLowerCase();
      final query = _searchQuery.toLowerCase().trim();
      final matchesQuery = query.isEmpty || name.contains(query) || bio.contains(query);
      return matchesQuery;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Text(
              'Servora',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: isDark ? Colors.white : const Color(0xFF18181B),
              ),
            ),
            const Text(
              '.gh',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: ServoraColors.emerald600,
              ),
            ),
            const Gap(8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: ServoraColors.emerald600.withOpacity(0.15),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'BUSINESSES',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  color: ServoraColors.emerald600,
                  letterSpacing: 0.6,
                ),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_business_rounded, color: ServoraColors.emerald600),
            onPressed: () => context.push('/auth/login'),
            tooltip: 'Register Business',
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? ServoraColors.darkSurface : Colors.white,
              border: Border(
                bottom: BorderSide(
                  color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder,
                ),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Verified Local Businesses',
                  style: ServoraTypography.titleLarge(isDark),
                ),
                const Gap(4),
                Text(
                  'Top Rated Verified Businesses & Artisans in Northern Ghana',
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? Colors.white60 : Colors.grey[600],
                  ),
                ),
                const Gap(12),

                // Search Bar
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search electric, solar, smocks, phone repair...',
                    prefixIcon: const Icon(Icons.search_rounded, color: ServoraColors.emerald600),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    filled: true,
                    fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(
                        color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: ServoraColors.emerald600, width: 1.5),
                    ),
                  ),
                ),
                const Gap(12),

                // Category Filter Pills
                SizedBox(
                  height: 34,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _categories.length,
                    itemBuilder: (context, index) {
                      final cat = _categories[index];
                      final isSelected = cat == _selectedCategory;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedCategory = cat),
                        child: Container(
                          margin: const EdgeInsets.only(right: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? ServoraColors.emerald600
                                : (isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9)),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected
                                  ? ServoraColors.emerald600
                                  : (isDark ? ServoraColors.darkCardBorder : Colors.transparent),
                            ),
                          ),
                          child: Text(
                            cat,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              color: isSelected
                                  ? Colors.white
                                  : (isDark ? Colors.white70 : Colors.grey[800]),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // Business List View
          Expanded(
            child: _isLoading
                ? ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: 4,
                    separatorBuilder: (_, __) => const Gap(14),
                    itemBuilder: (context, index) => ServoraShimmerSkeleton.productCardSkeleton(context),
                  )
                : filteredList.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.storefront_rounded, size: 48, color: Colors.grey),
                            const Gap(12),
                            const Text(
                              'No businesses found matching search',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                            const Gap(6),
                            TextButton(
                              onPressed: () => setState(() {
                                _searchQuery = '';
                                _selectedCategory = 'All';
                              }),
                              child: const Text(
                                'Clear Search Filters',
                                style: TextStyle(color: ServoraColors.emerald600, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        color: ServoraColors.emerald600,
                        onRefresh: _loadBusinesses,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: filteredList.length,
                          separatorBuilder: (_, __) => const Gap(14),
                          itemBuilder: (context, index) {
                            return ServoraProviderCard(
                              provider: filteredList[index],
                              width: double.infinity,
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
