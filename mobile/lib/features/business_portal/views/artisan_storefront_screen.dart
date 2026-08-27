import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../core/services/marketplace_api_service.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../../shared/widgets/servora_favorite_button.dart';

class ArtisanStorefrontScreen extends StatefulWidget {
  final String slug;

  const ArtisanStorefrontScreen({super.key, required this.slug});

  @override
  State<ArtisanStorefrontScreen> createState() => _ArtisanStorefrontScreenState();
}

class _ArtisanStorefrontScreenState extends State<ArtisanStorefrontScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  Map<String, dynamic>? _storeData;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
    _loadStorefront();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadStorefront() async {
    setState(() => _isLoading = true);
    final data = await MarketplaceApiService.fetchPublicProviderBySlug(widget.slug);
    if (mounted) {
      setState(() {
        _isLoading = false;
        _storeData = data ?? _getFallbackData();
      });
    }
  }

  Map<String, dynamic> _getFallbackData() {
    final cleanName = widget.slug.replaceAll('-', ' ').replaceAllMapped(RegExp(r'\b\w'), (m) => m.group(0)!.toUpperCase());
    return {
      'id': 'prov_${widget.slug}',
      'slug': widget.slug,
      'businessName': cleanName.contains('Solar') ? cleanName : '$cleanName Power & Trade Enterprise',
      'category': 'Solar & Electrical Engineering Services',
      'verificationTier': 'TIER_3_REGISTERED_ENTERPRISE',
      'isVerified': true,
      'logoUrl': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      'bannerUrl': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80',
      'ratingAverage': 4.9,
      'reviewsCount': 28,
      'completedJobsCount': 64,
      'joinedDate': '2024-03-12T00:00:00.000Z',
      'phone': '+233240000000',
      'whatsappNumber': '+233240000000',
      'zone': 'Sakasaka, Tamale',
      'latitude': 9.407,
      'longitude': -0.841,
      'isOpenNow': true,
      'businessHours': {
        'monday': {'open': '08:00', 'close': '18:00', 'closed': false},
        'tuesday': {'open': '08:00', 'close': '18:00', 'closed': false},
        'wednesday': {'open': '08:00', 'close': '18:00', 'closed': false},
        'thursday': {'open': '08:00', 'close': '18:00', 'closed': false},
        'friday': {'open': '08:00', 'close': '18:00', 'closed': false},
        'saturday': {'open': '08:00', 'close': '17:00', 'closed': false},
        'sunday': {'open': '10:00', 'close': '16:00', 'closed': false},
      },
      'bio': 'Certified solar & electrical engineers specializing in residential inverter setups, lithium battery bank maintenance, and deep-well solar pump installations across Northern Ghana.',
      'catalogs': {
        'products': [
          {
            'id': 'prod_1',
            'title': '300W Monocrystalline Solar Panel Kit',
            'price': 2500.0,
            'originalPrice': 2800.0,
            'condition': 'Brand New',
            'inStock': true,
          },
          {
            'id': 'prod_2',
            'title': '100Ah Lithium Wall-Mounted Storage Battery',
            'price': 4200.0,
            'originalPrice': 4600.0,
            'condition': 'Brand New',
            'inStock': true,
          },
        ],
        'services': [
          {
            'id': 'serv_1',
            'name': 'Solar Panel Inverter Diagnostics',
            'description': 'Comprehensive testing of solar inverters & MPPT charge controllers.',
            'startingPrice': 150.0,
            'estimatedTime': '2 Hours',
          },
          {
            'id': 'serv_2',
            'name': 'Borehole Solar Pump Wiring',
            'description': 'Heavy-duty 3-phase DC solar pump controller installation.',
            'startingPrice': 350.0,
            'estimatedTime': '4 Hours',
          },
        ],
        'rentals': [
          {
            'id': 'rent_1',
            'title': '5kVA Mobile Pure Sine Wave Inverter Rig',
            'dailyRate': 200.0,
            'depositRequired': 500.0,
            'isAvailable': true,
          },
        ],
        'portfolio': [
          {
            'id': 'port_1',
            'title': '10kVA Hybrid Solar Inverter Installation',
            'location': 'Sakasaka, Tamale',
            'completionDate': '2024-02-15',
          },
          {
            'id': 'port_2',
            'title': 'Lithium Wall Battery Bank Setup',
            'location': 'Choggu, Tamale',
            'completionDate': '2024-01-20',
          },
        ],
      },
      'reviews': [
        {
          'id': 'rev_1',
          'authorName': 'Alhaji Haruna',
          'rating': 5,
          'comment': 'Excellent solar installation! My power has been steady 24/7 without any interruptions.',
          'date': '2024-03-01',
          'isVerifiedPurchase': true,
        },
        {
          'id': 'rev_2',
          'authorName': 'Dr. Fuseini Abdulai',
          'rating': 5,
          'comment': 'Fast responder and clean wiring work. Highly recommended solar engineer in Northern Ghana.',
          'date': '2024-02-18',
          'isVerifiedPurchase': true,
        },
      ],
    };
  }

  void _makePhoneCall(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _shareStorefront(String name, String slug) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        final url = 'https://servora.vercel.app/provider/$slug';
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
              const Gap(16),
              const Text('Share Storefront', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const Gap(16),
              ListTile(
                leading: const Icon(Icons.copy_rounded, color: ServoraColors.emerald600),
                title: const Text('Copy Shortlink'),
                subtitle: Text(url, style: const TextStyle(fontSize: 11)),
                onTap: () {
                  Clipboard.setData(ClipboardData(text: url));
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Storefront shortlink copied to clipboard!'),
                      backgroundColor: ServoraColors.emerald600,
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.qr_code_2_rounded, color: Colors.amber),
                title: const Text('Digital QR Business Card'),
                subtitle: const Text('Show QR code for instant scanning'),
                onTap: () {
                  Navigator.pop(context);
                  _showQrDialog(name, url);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showQrDialog(String name, String url) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Center(child: Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold))),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ServoraColors.emerald600, width: 2),
              ),
              child: const Center(
                child: Icon(Icons.qr_code_2_rounded, size: 140, color: Color(0xFF18181B)),
              ),
            ),
            const Gap(12),
            const Text('Scan to open Storefront on Servora', style: TextStyle(fontSize: 11, color: Colors.grey)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close', style: TextStyle(color: ServoraColors.emerald600, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Loading Storefront...')),
        body: const Center(child: CircularProgressIndicator(color: ServoraColors.emerald600)),
      );
    }

    final data = _storeData ?? {};
    final String name = data['businessName'] ?? 'Business Storefront';
    final String category = data['category'] ?? 'Verified Enterprise';
    final String phone = data['phone'] ?? '+233240000000';
    final String whatsapp = data['whatsappNumber'] ?? phone;
    final String zone = data['zone'] ?? 'Tamale Central';
    final double rating = (data['ratingAverage'] ?? 4.9).toDouble();
    final int reviewsCount = data['reviewsCount'] ?? 28;
    final int jobs = data['completedJobsCount'] ?? 64;
    final String bio = data['bio'] ?? '';
    final Map<String, dynamic> catalogs = data['catalogs'] ?? {};
    final List productsList = catalogs['products'] ?? [];
    final List servicesList = catalogs['services'] ?? [];
    final List rentalsList = catalogs['rentals'] ?? [];
    final List portfolioList = catalogs['portfolio'] ?? [];
    final List reviewsList = data['reviews'] ?? [];

    final String whatsappMessage = "Hello $name, I found your profile on Servora and I would like to inquire about your services/products.";

    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            // 1. Storefront Hero & Identity Header Banner
            SliverAppBar(
              expandedHeight: 230,
              pinned: true,
              leading: IconButton(
                icon: const CircleAvatar(
                  backgroundColor: Colors.black54,
                  child: Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                ),
                onPressed: () => context.pop(),
              ),
              actions: [
                IconButton(
                  icon: const CircleAvatar(
                    backgroundColor: Colors.black54,
                    child: Icon(Icons.share_rounded, color: Colors.white, size: 18),
                  ),
                  onPressed: () => _shareStorefront(name, widget.slug),
                ),
                const Gap(8),
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      data['bannerUrl'] ?? 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80',
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(color: ServoraColors.emerald800),
                    ),
                    Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.transparent, Colors.black87],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                    Positioned(
                      left: 16,
                      bottom: 16,
                      right: 16,
                      child: Row(
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              border: Border.all(color: ServoraColors.emerald600, width: 2),
                              boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 8)],
                            ),
                            child: CircleAvatar(
                              backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
                              child: Text(
                                name.isNotEmpty ? name[0].toUpperCase() : 'S',
                                style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                              ),
                            ),
                          ),
                          const Gap(12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  name,
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const Gap(2),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: ServoraColors.emerald600,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '✓ VERIFIED ENTERPRISE • $category',
                                    style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const Gap(4),
                                Row(
                                  children: [
                                    const Icon(Icons.location_on_rounded, size: 12, color: Colors.amber),
                                    const Gap(3),
                                    Text(
                                      '$zone • 🟢 Open Now',
                                      style: const TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.w600),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Identity Stats & Verification Bar
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.all(16),
                color: isDark ? ServoraColors.darkSurface : Colors.white,
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, color: Colors.amber, size: 18),
                            const Gap(4),
                            Text('$rating ($reviewsCount reviews)', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text('🧰 $jobs Jobs Done', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                        ),
                        ServoraFavoriteButton(businessId: widget.slug, businessName: name),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Persistent 5 Tab Bar Header
            SliverPersistentHeader(
              pinned: true,
              delegate: _SliverTabBarDelegate(
                TabBar(
                  controller: _tabController,
                  isScrollable: true,
                  labelColor: ServoraColors.emerald600,
                  unselectedLabelColor: isDark ? Colors.white60 : Colors.grey[600],
                  indicatorColor: ServoraColors.emerald600,
                  indicatorWeight: 3,
                  labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  tabs: [
                    Tab(text: 'Products (${productsList.length})'),
                    Tab(text: 'Services (${servicesList.length})'),
                    Tab(text: 'Rentals (${rentalsList.length})'),
                    Tab(text: 'Portfolio (${portfolioList.length})'),
                    Tab(text: 'Reviews (${reviewsList.length})'),
                  ],
                ),
                isDark: isDark,
              ),
            ),
          ];
        },
        body: TabBarView(
          controller: _tabController,
          children: [
            // Tab 1: Products
            _buildProductsTab(productsList, isDark),
            // Tab 2: Services
            _buildServicesTab(servicesList, isDark),
            // Tab 3: Rentals
            _buildRentalsTab(rentalsList, isDark),
            // Tab 4: Portfolio
            _buildPortfolioTab(portfolioList, isDark),
            // Tab 5: Reviews & About
            _buildAboutAndReviewsTab(bio, zone, reviewsList, isDark),
          ],
        ),
      ),

      // 2. Persistent Sticky Contact & Action Strip (Mobile Bottom Bar)
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? ServoraColors.darkSurface : Colors.white,
          border: Border(top: BorderSide(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 10, offset: const Offset(0, -4))],
        ),
        child: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.phone_in_talk_rounded, color: ServoraColors.emerald600),
              onPressed: () => _makePhoneCall(phone),
              tooltip: 'Call Direct',
            ),
            const Gap(6),
            Expanded(
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF25D366),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.chat_rounded, size: 18),
                label: const Text('Chat on WhatsApp', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                onPressed: () => WhatsAppHelper.openWhatsApp(phone: whatsapp, message: whatsappMessage),
              ),
            ),
            const Gap(8),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: ServoraColors.emerald600,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('Get Quote', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              onPressed: () => context.push('/services/request'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductsTab(List products, bool isDark) {
    if (products.isEmpty) {
      return const Center(child: Text('No products listed in catalog yet.', style: TextStyle(color: Colors.grey)));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: products.length,
      separatorBuilder: (_, __) => const Gap(12),
      itemBuilder: (context, index) {
        final p = products[index];
        return Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            contentPadding: const EdgeInsets.all(12),
            leading: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(color: ServoraColors.emerald600.withOpacity(0.12), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.inventory_2_rounded, color: ServoraColors.emerald600),
            ),
            title: Text(p['title'] ?? 'Product Item', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            subtitle: Text('Condition: ${p['condition'] ?? "Brand New"} • In Stock', style: const TextStyle(fontSize: 11)),
            trailing: Text('GH₵ ${p['price']}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
          ),
        );
      },
    );
  }

  Widget _buildServicesTab(List services, bool isDark) {
    if (services.isEmpty) {
      return const Center(child: Text('No custom labor services listed yet.', style: TextStyle(color: Colors.grey)));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: services.length,
      separatorBuilder: (_, __) => const Gap(12),
      itemBuilder: (context, index) {
        final s = services[index];
        return Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            contentPadding: const EdgeInsets.all(12),
            leading: const CircleAvatar(backgroundColor: Color(0xFFFEF3C7), child: Icon(Icons.build_rounded, color: Color(0xFFD97706))),
            title: Text(s['name'] ?? 'Labor Service', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            subtitle: Text(s['description'] ?? 'Diagnostics & Repair', style: const TextStyle(fontSize: 11)),
            trailing: Text('From GH₵ ${s['startingPrice']}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
          ),
        );
      },
    );
  }

  Widget _buildRentalsTab(List rentals, bool isDark) {
    if (rentals.isEmpty) {
      return const Center(child: Text('No equipment rental items available.', style: TextStyle(color: Colors.grey)));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: rentals.length,
      separatorBuilder: (_, __) => const Gap(12),
      itemBuilder: (context, index) {
        final r = rentals[index];
        return Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            contentPadding: const EdgeInsets.all(12),
            leading: const CircleAvatar(backgroundColor: Color(0xFFEFF6FF), child: Icon(Icons.construction_rounded, color: Color(0xFF2563EB))),
            title: Text(r['title'] ?? 'Tool Equipment', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            subtitle: Text('Deposit: GH₵ ${r['depositRequired'] ?? 500}', style: const TextStyle(fontSize: 11)),
            trailing: Text('GH₵ ${r['dailyRate']}/day', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
          ),
        );
      },
    );
  }

  Widget _buildPortfolioTab(List portfolio, bool isDark) {
    if (portfolio.isEmpty) {
      return const Center(child: Text('No past work photos uploaded yet.', style: TextStyle(color: Colors.grey)));
    }
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12),
      itemCount: portfolio.length,
      itemBuilder: (context, index) {
        final item = portfolio[index];
        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: ServoraColors.emerald600.withOpacity(0.1),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  ),
                  child: const Center(child: Icon(Icons.camera_alt_rounded, size: 36, color: ServoraColors.emerald600)),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(item['title'] ?? 'Past Project', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAboutAndReviewsTab(String bio, String zone, List reviews, bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Bio Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? ServoraColors.darkSurface : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('About the Business', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                const Gap(8),
                Text(bio, style: const TextStyle(fontSize: 12, height: 1.4)),
                const Gap(12),
                Row(
                  children: [
                    const Icon(Icons.location_on_rounded, size: 14, color: ServoraColors.emerald600),
                    const Gap(4),
                    Text('Location: $zone', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          const Gap(16),

          // Reviews Section
          const Text('Customer Reviews', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const Gap(8),
          if (reviews.isEmpty)
            const Text('No reviews recorded yet.', style: TextStyle(fontSize: 12, color: Colors.grey))
          else
            ...reviews.map((r) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? ServoraColors.darkSurface : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(r['authorName'] ?? 'Customer', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          Row(children: const [Icon(Icons.star_rounded, size: 14, color: Colors.amber), Text('5.0', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))]),
                        ],
                      ),
                      const Gap(4),
                      Text(r['comment'] ?? '', style: const TextStyle(fontSize: 11)),
                    ],
                  ),
                )),
        ],
      ),
    );
  }
}

class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  final bool isDark;

  _SliverTabBarDelegate(this.tabBar, {required this.isDark});

  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: isDark ? ServoraColors.darkSurface : Colors.white,
      child: tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverTabBarDelegate oldDelegate) {
    return oldDelegate.tabBar != tabBar || oldDelegate.isDark != isDark;
  }
}
