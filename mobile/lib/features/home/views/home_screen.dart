import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/constants.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/servora_dropdown_sheet.dart';
import '../../../core/utils/whatsapp_helper.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  String _selectedLocation = 'Tamale';

  final List<Map<String, String>> _trendingTags = [
    {'label': 'Electrical & Solar', 'icon': '⚡'},
    {'label': 'Phone Repair', 'icon': '📱'},
    {'label': 'Fugu Tailors', 'icon': '🧵'},
    {'label': 'Plumbing', 'icon': '🚰'},
    {'label': 'Rentals', 'icon': '🚜'},
  ];

  final List<Map<String, dynamic>> _verticals = [
    {
      'title': 'Post Job Request',
      'sub': 'Get instant artisan bids',
      'icon': Icons.add_rounded,
      'isHighlight': true,
      'bgColor': const Color(0xFFF59E0B),
      'iconColor': Colors.black,
      'textColor': Colors.black,
    },
    {
      'title': 'Electrical & Solar',
      'sub': 'Wiring, inverters & pumps',
      'icon': Icons.electrical_services_rounded,
      'bgColor': const Color(0xFFFEF3C7),
      'iconColor': const Color(0xFFB45309),
    },
    {
      'title': 'Phones & Tech',
      'sub': 'Mobiles, laptops & repairs',
      'icon': Icons.smartphone_rounded,
      'bgColor': const Color(0xFFF3E8FF),
      'iconColor': const Color(0xFF7E22CE),
    },
    {
      'title': 'Fugu & Tailoring',
      'sub': 'Traditional Dagbon wear',
      'icon': Icons.checkroom_rounded,
      'bgColor': const Color(0xFFFCE7F3),
      'iconColor': const Color(0xFFBE185D),
    },
    {
      'title': 'Tool & Heavy Rentals',
      'sub': 'Generators, drills & mixers',
      'icon': Icons.agriculture_rounded,
      'bgColor': const Color(0xFFE0F2FE),
      'iconColor': const Color(0xFF0369A1),
    },
    {
      'title': 'Agribusiness & Farm',
      'sub': 'Produce, seeds & equipment',
      'icon': Icons.eco_rounded,
      'bgColor': const Color(0xFFDCFCE7),
      'iconColor': const Color(0xFF15803D),
    },
    {
      'title': 'Trending Requests',
      'sub': 'Popular local jobs',
      'icon': Icons.local_fire_department_rounded,
      'bgColor': const Color(0xFFFEE2E2),
      'iconColor': const Color(0xFFB91C1C),
    },
    {
      'title': 'Artisan Services',
      'sub': 'Plumbers, carpenters & masons',
      'icon': Icons.build_rounded,
      'bgColor': const Color(0xFFE0E7FF),
      'iconColor': const Color(0xFF4338CA),
    },
    {
      'title': 'Electronics & Appliances',
      'sub': 'TVs, fridges & sound',
      'icon': Icons.tv_rounded,
      'bgColor': const Color(0xFFDBEAFE),
      'iconColor': const Color(0xFF1D4ED8),
    },
    {
      'title': 'Custom Tailoring',
      'sub': 'Smock weaving & fitting',
      'icon': Icons.content_cut_rounded,
      'bgColor': const Color(0xFFFAE8FF),
      'iconColor': const Color(0xFFA21CAF),
    },
    {
      'title': 'Property & Land Sites',
      'sub': 'Plot sales & building sites',
      'icon': Icons.home_work_rounded,
      'bgColor': const Color(0xFFE0E7FF),
      'iconColor': const Color(0xFF3730A3),
    },
    {
      'title': 'Jobs & Gigs',
      'sub': 'Local driver & trade hires',
      'icon': Icons.work_rounded,
      'bgColor': const Color(0xFFCCFBF1),
      'iconColor': const Color(0xFF0F766E),
    },
  ];

  final List<Map<String, dynamic>> _cities = [
    {'city': 'Tamale', 'count': '45+ Businesses'},
    {'city': 'Bolgatanga', 'count': '28+ Businesses'},
    {'city': 'Wa', 'count': '24+ Businesses'},
    {'city': 'Yendi', 'count': '18+ Businesses'},
    {'city': 'Damongo', 'count': '14+ Businesses'},
    {'city': 'Nalerigu', 'count': '12+ Businesses'},
  ];

  final List<Map<String, dynamic>> _products = [
    {
      'title': 'Community Water Borehole Maintenance Call',
      'tag': 'Community & NGOs',
      'discount': null,
      'price': 'GH₵ 0.00',
      'originalPrice': null,
      'seller': 'Master Super Admin',
      'location': 'Bolgatanga',
      'phone': '+233240000000',
    },
    {
      'title': 'Licensed Commercial Heavy Truck Driver (License C & E)',
      'tag': 'Jobs & Freelance Gigs',
      'discount': '10% OFF',
      'price': 'GH₵ 1,800.00',
      'originalPrice': 'GH₵ 2,000.00',
      'seller': 'Verified Enterprise',
      'location': 'Lamashegu',
      'phone': '+233501234567',
    },
    {
      'title': 'SME Mobile Money Escrow Bookkeeping & Records',
      'tag': 'Finance & Accounting',
      'discount': '25% OFF',
      'price': 'GH₵ 450.00',
      'originalPrice': 'GH₵ 600.00',
      'seller': 'Master Super Admin',
      'location': 'Aboabo Market',
      'phone': '+233201122334',
    },
    {
      'title': 'RGD Business Name Registration & GRA Tax Filing',
      'tag': 'Legal & Advisory',
      'discount': '24% OFF',
      'price': 'GH₵ 650.00',
      'originalPrice': 'GH₵ 850.00',
      'seller': 'Verified Enterprise',
      'location': 'Sakasaka',
      'phone': '+233244889900',
    },
  ];

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
    final cardBg = isDark ? const Color(0xFF111827) : Colors.white;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. TOP ANNOUNCEMENT BAR (MATCHING WEB SCREENSHOT 1)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                color: isDark ? const Color(0xFF0F172A) : const Color(0xFF022C22),
                child: Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1D4ED8).withOpacity(0.4),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF3B82F6), width: 0.8),
                      ),
                      child: const Text(
                        'BUSINESS OWNER',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Are you a seller in Northern Ghana?',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.white70,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => context.push('/auth/login'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF059669),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Row(
                          children: [
                            Text(
                              'Register ➔',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // 2. SERVORA LOGO APP BAR (MATCHING WEB SCREENSHOT 1)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: const BoxDecoration(
                            color: Color(0xFF059669),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.build_circle_rounded,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Text(
                                  'Servora',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                Text(
                                  '.gh',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                    color: const Color(0xFF059669),
                                  ),
                                ),
                              ],
                            ),
                            const Text(
                              'NORTHERN MARKETPLACE',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF059669),
                                letterSpacing: 0.8,
                              ),
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
                              color: isDark ? const Color(0xFF1F2937) : const Color(0xFFE2E8F0),
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFF059669)),
                                const SizedBox(width: 4),
                                Text(
                                  _selectedLocation,
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                                const Icon(Icons.arrow_drop_down_rounded, size: 16, color: Color(0xFF059669)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF1F5F9),
                          child: const Icon(Icons.dark_mode_outlined, size: 18),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // 3. HERO BANNER SECTION (MATCHING WEB SCREENSHOT 1)
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
                    // Mint Pill Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF059669).withOpacity(0.3)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.verified_user_outlined, size: 14, color: Color(0xFF059669)),
                          SizedBox(width: 6),
                          Text(
                            '#1 Local Service & Trade Marketplace in Northern Ghana',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF047857),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Main Heading
                    RichText(
                      text: TextSpan(
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                          height: 1.2,
                        ),
                        children: const [
                          TextSpan(text: 'Find trusted local services in '),
                          TextSpan(
                            text: 'Northern Ghana.',
                            style: TextStyle(color: Color(0xFF059669)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Get instant quotes from Ghana Card verified artisans, electricians, plumbers, tailors, and suppliers across Tamale, Bolga & Wa.',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? Colors.grey[400] : Colors.grey[700],
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Search Widget Bar
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF111827) : Colors.white,
                        borderRadius: BorderRadius.circular(30),
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
                          const SizedBox(width: 12),
                          const Icon(Icons.search_rounded, color: Color(0xFF059669), size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              onSubmitted: (_) => context.push('/search'),
                              decoration: const InputDecoration(
                                hintText: 'Search products, electricians, smocks...',
                                hintStyle: TextStyle(fontSize: 12, color: Colors.grey),
                                border: InputBorder.none,
                                isDense: true,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.tune_rounded, size: 18, color: Colors.grey),
                            onPressed: () => context.push('/search'),
                          ),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF059669),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(24),
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            ),
                            icon: const Text('Search', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            label: const Icon(Icons.arrow_forward_rounded, size: 16),
                            onPressed: () => context.push('/search'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Trending Tags Horizontal Scroll
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          Text(
                            'Trending: ',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey[600],
                            ),
                          ),
                          ..._trendingTags.map((tag) {
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: Chip(
                                backgroundColor: isDark ? const Color(0xFF111827) : Colors.white,
                                side: BorderSide(color: isDark ? const Color(0xFF1F2937) : const Color(0xFFE2E8F0)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                labelPadding: const EdgeInsets.symmetric(horizontal: 6),
                                avatar: Text(tag['icon']!),
                                label: Text(
                                  tag['label']!,
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                            );
                          }).toList(),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Big Emerald CTA Button: (+) Post Request & Get Prices
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF059669),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(26),
                          ),
                        ),
                        icon: const Icon(Icons.add_circle_outline_rounded, size: 22),
                        label: const Text(
                          'Post Request & Get Prices',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        onPressed: () => context.push('/services/request'),
                      ),
                    ),
                    const SizedBox(height: 10),

                    Center(
                      child: GestureDetector(
                        onTap: () => context.push('/auth/login'),
                        child: Text(
                          'Are you a business owner or seller? Register your Business ➔',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.grey[300] : const Color(0xFF0F172A),
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Trust Badges Row
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildTrustBadge('✓ Phone & ID Verified'),
                          const SizedBox(width: 8),
                          _buildTrustBadge('✓ Direct WhatsApp Messages'),
                          const SizedBox(width: 8),
                          _buildTrustBadge('✓ 100% Free Service'),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // 4. EXPLORE 18 UNIVERSAL INDUSTRY VERTICALS (2-COLUMN GRID - SCREENSHOT 2)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.auto_awesome_rounded, color: Color(0xFF059669), size: 20),
                        const SizedBox(width: 8),
                        const Text(
                          'Explore 18 Universal Industry Verticals',
                          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Browse products, artisan services, equipment rentals, and trade calls across Northern Ghana.',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 16),

                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 1.35,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemCount: _verticals.length,
                      itemBuilder: (context, index) {
                        final v = _verticals[index];
                        final isHighlight = v['isHighlight'] ?? false;

                        return ServoraCard(
                          backgroundColor: isHighlight
                              ? const Color(0xFFF59E0B)
                              : cardBg,
                          padding: const EdgeInsets.all(12),
                          onTap: () {
                            if (isHighlight) {
                              context.push('/services/request');
                            } else {
                              context.push('/search');
                            }
                          },
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: v['bgColor'],
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(v['icon'], color: v['iconColor'], size: 20),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    v['title'],
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: isHighlight ? Colors.black : null,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    v['sub'],
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: isHighlight ? Colors.black.withOpacity(0.7) : Colors.grey[600],
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              // 5. FIND VERIFIED BUSINESSES & WORKERS (CITY GRID - SCREENSHOT 3)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ServoraCard(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'FIND LOCAL BUSINESSES',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF059669),
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.bolt_rounded, color: Colors.amber, size: 22),
                          const SizedBox(width: 6),
                          const Text(
                            'Find Verified Businesses & Workers',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD1FAE5),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'NORTHERN GHANA ACTIVE',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF047857),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Select your city or area to find active local businesses & get instant price estimates:',
                        style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 14),

                      // City Selection Buttons 2-Column Grid
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 2.5,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                        ),
                        itemCount: _cities.length,
                        itemBuilder: (context, index) {
                          final c = _cities[index];
                          final isSelected = c['city'] == _selectedLocation;

                          return GestureDetector(
                            onTap: () => setState(() => _selectedLocation = c['city']),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? const Color(0xFFECFDF5)
                                    : (isDark ? const Color(0xFF1F2937) : const Color(0xFFF8FAFC)),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: isSelected
                                      ? const Color(0xFF059669)
                                      : (isDark ? const Color(0xFF374151) : const Color(0xFFE2E8F0)),
                                  width: isSelected ? 1.5 : 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.location_on_outlined,
                                    size: 16,
                                    color: isSelected ? const Color(0xFF059669) : Colors.grey,
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          c['city'],
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: isSelected ? const Color(0xFF059669) : null,
                                          ),
                                        ),
                                        Text(
                                          c['count'],
                                          style: TextStyle(
                                            fontSize: 9,
                                            color: Colors.grey[500],
                                          ),
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
                      const SizedBox(height: 16),

                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF059669),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(24),
                            ),
                          ),
                          icon: const Icon(Icons.arrow_forward_rounded, size: 18),
                          label: Text(
                            'Post Job Request in $_selectedLocation ➔',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          onPressed: () => context.push('/services/request'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // 6. MOST NEEDED SERVICES IN NORTHERN GHANA (STACKED CARDS - SCREENSHOT 4)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Column(
                        children: [
                          const Text(
                            'Most Needed Services in Northern Ghana',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Browse top service categories requested daily across Northern Ghana.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    _buildServiceCard(
                      icon: Icons.bolt_rounded,
                      bgColor: const Color(0xFFFEF3C7),
                      iconColor: const Color(0xFFB45309),
                      title: 'Electrical & Solar Systems',
                      description:
                          'House wiring, solar inverter installations, circuit breaker repairs, fridge gas refill, generator servicing.',
                      cta: 'Find Electrical Experts ➔',
                    ),
                    const SizedBox(height: 12),
                    _buildServiceCard(
                      icon: Icons.smartphone_rounded,
                      bgColor: const Color(0xFFDCFCE7),
                      iconColor: const Color(0xFF15803D),
                      title: 'Device & Laptop Repairs',
                      description:
                          'Smartphone screen replacement, laptop battery upgrade, charging port fixing, and micro-soldering diagnostics.',
                      cta: 'Electronics & Phone Repair ➔',
                    ),
                    const SizedBox(height: 12),
                    _buildServiceCard(
                      icon: Icons.content_cut_rounded,
                      bgColor: const Color(0xFFF3E8FF),
                      iconColor: const Color(0xFF7E22CE),
                      title: 'Fugu & Bespoke Tailoring',
                      description:
                          'Authentic Northern Ghana Smocks (Fugu), embroidery, Senator kaftans, and custom wedding attire.',
                      cta: 'Smock & Tailoring Artisans ➔',
                    ),
                  ],
                ),
              ),

              // 7. LOCAL PRODUCTS & SUPPLIES FOR SALE (PRODUCT GRID - SCREENSHOT 5)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'NORTHERN BUSINESS MARKETPLACE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF059669),
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Expanded(
                          child: Text(
                            'Local Products & Supplies for Sale',
                            style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                          ),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF059669),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            minimumSize: Size.zero,
                          ),
                          onPressed: () => context.push('/search'),
                          child: const Text('View All ➔', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.65,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemCount: _products.length,
                      itemBuilder: (context, index) {
                        final p = _products[index];

                        return ServoraCard(
                          padding: const EdgeInsets.all(10),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Product Tag Pill
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE2E8F0),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  p['tag'],
                                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black87),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Expanded(
                                child: Text(
                                  p['title'],
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, height: 1.2),
                                  maxLines: 3,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                p['price'],
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF059669),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  CircleAvatar(
                                    radius: 9,
                                    backgroundColor: const Color(0xFF059669),
                                    child: Text(
                                      p['seller'][0],
                                      style: const TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      '${p['seller']} • ${p['location']}',
                                      style: TextStyle(fontSize: 9, color: Colors.grey[600]),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),

                              // Buy & Escrow Button
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF059669),
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 6),
                                        minimumSize: Size.zero,
                                      ),
                                      icon: const Icon(Icons.send_rounded, size: 12),
                                      label: const Text('Buy', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                      onPressed: () {
                                        WhatsAppHelper.openWhatsApp(
                                          phone: p['phone'],
                                          message: 'Hello, I want to purchase "${p['title']}" listed on Servora.gh app.',
                                        );
                                      },
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFEF3C7),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Icon(Icons.shield_rounded, size: 16, color: Color(0xFFB45309)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),

      // 8. FLOATING BOTTOM NAVIGATION BAR WITH (+) CENTER FAB (MATCHING SCREENSHOT 1)
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        selectedItemColor: const Color(0xFF059669),
        unselectedItemColor: Colors.grey[500],
        type: BottomNavigationBarType.fixed,
        selectedFontSize: 10,
        unselectedFontSize: 10,
        onTap: (index) {
          if (index == 2) {
            context.push('/services/request');
            return;
          }
          setState(() => _currentIndex = index);
          if (index == 1) context.push('/search');
          if (index == 3) context.push('/community');
          if (index == 4) context.push('/profile');
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_bag_outlined), label: 'Products'),
          BottomNavigationBarItem(
            icon: CircleAvatar(
              radius: 18,
              backgroundColor: Color(0xFF059669),
              child: Icon(Icons.add_rounded, color: Colors.white, size: 22),
            ),
            label: 'Post',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.people_outline_rounded), label: 'Notice Board'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline_rounded), label: 'Account'),
        ],
      ),
    );
  }

  Widget _buildTrustBadge(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF047857)),
      ),
    );
  }

  Widget _buildServiceCard({
    required IconData icon,
    required Color bgColor,
    required Color iconColor,
    required String title,
    required String description,
    required String cta,
  }) {
    return ServoraCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Text(
            description,
            style: TextStyle(fontSize: 12, color: Colors.grey[600], height: 1.3),
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => context.push('/search'),
            child: Text(
              cta,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF059669),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
