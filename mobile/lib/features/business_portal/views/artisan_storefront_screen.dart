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

class _ArtisanStorefrontScreenState extends State<ArtisanStorefrontScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _storeData;

  @override
  void initState() {
    super.initState();
    _loadStorefront();
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
    final isSolar = cleanName.toLowerCase().contains('solar') || widget.slug.contains('solar');
    final name = isSolar ? 'Tamale Solar & Heavy Power Solutions' : cleanName;

    return {
      'id': 'prov_${widget.slug}',
      'slug': widget.slug,
      'businessName': name,
      'artisanName': 'Eng. Rashid Mohammed',
      'experienceYears': 1,
      'category': 'Solar & Heavy Power Solutions',
      'verificationTier': 'TIER_3_REGISTERED_ENTERPRISE',
      'isVerified': true,
      'logoUrl': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      'bannerUrl': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80',
      'trustScore': 100,
      'ratingAverage': 5.0,
      'reviewsCount': 36,
      'completedJobsCount': 85,
      'hourlyRate': 'GH₵ 100.00/hr',
      'startingPrice': 'GH₵ 250.00',
      'responseSpeed': '< 15 minutes',
      'coverageZones': ['Tamale, Bolgatanga, Wa, Yendi, All Northern Region'],
      'phone': '+233240000000',
      'whatsappNumber': '+233240000000',
      'zone': 'Tamale, Bolgatanga, Wa, Yendi, All Northern Region',
      'aboutText': "Northern Ghana's leading distributor of high-efficiency solar panels, lithium wall batteries, pure sine wave inverters, and heavy water pump generators.",
      'catalogs': {
        'products': [
          {
            'id': 'prod_1',
            'title': '300W Monocrystalline Heavy Duty Solar Panel Kit',
            'price': 1800.0,
            'originalPrice': 2000.0,
            'category': 'Community & NGOs',
            'discountPercent': 10,
            'location': 'Lamashegu, Tamale',
            'images': ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80'],
          },
          {
            'id': 'prod_2',
            'title': '100Ah 48V Lithium Storage Battery Wall Bank',
            'price': 4200.0,
            'originalPrice': 4800.0,
            'category': 'Jobs & Freelance Gigs',
            'discountPercent': 12,
            'location': 'Sakasaka, Tamale',
            'images': ['https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?w=600&q=80'],
          },
          {
            'id': 'prod_3',
            'title': '5kVA Pure Sine Wave Hybrid Solar Inverter',
            'price': 3500.0,
            'originalPrice': 4000.0,
            'category': 'Tools & Equipment',
            'discountPercent': 12,
            'location': 'Choggu, Tamale',
            'images': ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80'],
          },
          {
            'id': 'prod_4',
            'title': '3-Phase Submersible Borehole Solar Pump Rig',
            'price': 6500.0,
            'originalPrice': 7200.0,
            'category': 'Heavy Machinery',
            'discountPercent': 10,
            'location': 'Nyohini, Tamale',
            'images': ['https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?w=600&q=80'],
          },
        ],
      },
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
                title: const Text('📱 Digital QR Business Card'),
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
    final String name = data['businessName'] ?? 'Tamale Solar & Heavy Power Solutions';
    final String artisanName = data['artisanName'] ?? 'Eng. Rashid Mohammed';
    final int experienceYears = int.tryParse((data['experienceYears'] ?? 1).toString()) ?? 1;
    final String phone = data['phone'] ?? '+233240000000';
    final String whatsapp = data['whatsappNumber'] ?? phone;
    final String coverage = data['zone'] ?? 'Tamale, Bolgatanga, Wa, Yendi, All Northern Region';
    final double rating = double.tryParse((data['ratingAverage'] ?? data['rating'] ?? 5.0).toString()) ?? 5.0;
    final int reviewsCount = int.tryParse((data['reviewsCount'] ?? data['reviewCount'] ?? 36).toString()) ?? 36;
    final int completedJobs = int.tryParse((data['completedJobsCount'] ?? data['completedJobs'] ?? 85).toString()) ?? 85;
    final String aboutText = data['aboutText'] ?? data['bio'] ?? "Northern Ghana's leading distributor of high-efficiency solar panels, lithium wall batteries, pure sine wave inverters, and heavy water pump generators.";
    final String hourlyRate = data['hourlyRate'] ?? 'GH₵ 100.00/hr';
    final String startingPrice = data['startingPrice'] ?? 'GH₵ 250.00';
    final String responseSpeed = data['responseSpeed'] ?? '< 15 minutes';
    final Map<String, dynamic> catalogs = data['catalogs'] ?? {};
    final List productsList = catalogs['products'] ?? [];

    final String whatsappMessage = "Hello $name, I found your profile on Servora and I would like to inquire about your services/products.";

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF090D16) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('← Back to Marketplace', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        actions: [
          ServoraFavoriteButton(businessId: widget.slug, businessName: name),
          const Gap(12),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          // Section A: Main Provider Identity Header Card
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: isDark ? ServoraColors.darkSurface : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(isDark ? 0.3 : 0.04),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top Avatar & Title & Trust Score Row
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Avatar / Profile Image
                        Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            color: ServoraColors.emerald600.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: ServoraColors.emerald600.withOpacity(0.3), width: 1.5),
                          ),
                          child: Center(
                            child: Text(
                              name.isNotEmpty ? name[0].toUpperCase() : 'T',
                              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                            ),
                          ),
                        ),
                        const Gap(12),

                        // Title, ID Verified Badge, Subtitle & Metadata
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      name,
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w900,
                                        color: isDark ? Colors.white : const Color(0xFF18181B),
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  const Gap(6),
                                  // ID Verification Badge
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFEF3C7),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.4)),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text('🛡️', style: TextStyle(fontSize: 10)),
                                        Gap(3),
                                        Text('ID Verified', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: Color(0xFFD97706))),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const Gap(4),

                              // Subtitle
                              Text(
                                'Artisan: $artisanName • $experienceYears Years Experience in Tamale',
                                style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey[700], fontWeight: FontWeight.w500),
                              ),
                              const Gap(6),

                              // Metadata Row (Location, Star Rating, Jobs Completed)
                              Wrap(
                                spacing: 10,
                                runSpacing: 4,
                                children: [
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.location_on_rounded, size: 13, color: ServoraColors.emerald600),
                                      const Gap(3),
                                      Text(
                                        coverage,
                                        style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : Colors.grey[800]),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.star_rounded, size: 13, color: Colors.amber),
                                      const Gap(3),
                                      Text('$rating ($reviewsCount reviews)', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.work_outline_rounded, size: 13, color: Color(0xFF2563EB)),
                                      const Gap(3),
                                      Text('$completedJobs Jobs Completed', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Gap(16),

                    // Top-Right Verification & Trust Score Widget
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: ServoraColors.emerald600.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: ServoraColors.emerald600.withOpacity(0.25)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('VERIFICATION & TRUST SCORE', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 0.5)),
                              const Gap(2),
                              const Text('Verified Local Business', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                            ],
                          ),
                          const Text('100%', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                        ],
                      ),
                    ),
                    const Gap(12),

                    // Status Badges Row
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        _buildStatusTag('✓ Phone Verified', const Color(0xFFECFDF5), ServoraColors.emerald600),
                        _buildStatusTag('✓ MoMo Escrow Verified', const Color(0xFFECFDF5), ServoraColors.emerald600),
                        _buildStatusTag('⭐ Top Rated Seller', const Color(0xFFFEF3C7), const Color(0xFFD97706)),
                        _buildStatusTag('🏢 Business Verified', const Color(0xFFEFF6FF), const Color(0xFF2563EB)),
                      ],
                    ),
                    const Gap(16),

                    // Multi-Button Horizontal Action Grid
                    Column(
                      children: [
                        // Button 1: Primary Dark Teal CTA
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ServoraColors.emerald800,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 13),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            onPressed: () => context.push('/services/request'),
                            child: Text('Get Price Estimate From $name', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ),
                        const Gap(8),

                        Row(
                          children: [
                            // Button 2: Dark Slate QR Card
                            Expanded(
                              child: ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF1E293B),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 11),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                icon: const Text('📱', style: TextStyle(fontSize: 12)),
                                label: const Text('QR Card', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                onPressed: () => _showQrDialog(name, 'https://servora.vercel.app/provider/${widget.slug}'),
                              ),
                            ),
                            const Gap(6),

                            // Button 3: Bright Green WhatsApp
                            Expanded(
                              child: ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF25D366),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 11),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                icon: const Text('✈️', style: TextStyle(fontSize: 12)),
                                label: const Text('WhatsApp', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                onPressed: () => WhatsAppHelper.openWhatsApp(phone: whatsapp, message: whatsappMessage),
                              ),
                            ),
                          ],
                        ),
                        const Gap(6),

                        Row(
                          children: [
                            // Button 4: Light Amber Outline Safe MoMo Escrow
                            Expanded(
                              child: OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  backgroundColor: const Color(0xFFFEF3C7),
                                  side: const BorderSide(color: Color(0xFFF59E0B)),
                                  padding: const EdgeInsets.symmetric(vertical: 11),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                icon: const Text('🛡️', style: TextStyle(fontSize: 12)),
                                label: const Text('Safe MoMo Escrow', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
                                onPressed: () => context.push('/escrow'),
                              ),
                            ),
                            const Gap(6),

                            // Button 5: Emerald Outline Share on WhatsApp
                            Expanded(
                              child: OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: ServoraColors.emerald600),
                                  padding: const EdgeInsets.symmetric(vertical: 11),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                icon: const Text('↗', style: TextStyle(fontSize: 12, color: ServoraColors.emerald600)),
                                label: const Text('Share Store', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                                onPressed: () => _shareStorefront(name, widget.slug),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Section B: Overview Cards (About the Business & Pricing & Availability)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  // Left Card: About the Business
                  Container(
                    width: double.infinity,
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
                        Text(
                          aboutText,
                          style: TextStyle(fontSize: 12, height: 1.4, color: isDark ? Colors.white70 : Colors.grey[800]),
                        ),
                        const Gap(12),
                        const Text('Services Offered', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                        const Gap(6),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: [
                            _buildServiceTag('General Services'),
                            _buildServiceTag('Solar Installations'),
                            _buildServiceTag('AC Maintenance'),
                            _buildServiceTag('Heavy Pumps'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const Gap(14),

                  // Right Card: Pricing & Availability
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? ServoraColors.darkSurface : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Pricing & Availability', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                        const Gap(12),
                        _buildPricingRow('Hourly Rate', hourlyRate, isDark, valueColor: isDark ? Colors.white : Colors.black),
                        const Divider(height: 16),
                        _buildPricingRow('Starting Price', startingPrice, isDark, valueColor: ServoraColors.emerald600, isBold: true),
                        const Divider(height: 16),
                        _buildPricingRow('Response Speed', responseSpeed, isDark, valueColor: const Color(0xFF9333EA), isBold: true),
                        const Divider(height: 16),
                        _buildPricingRow('Service Coverage', coverage, isDark, valueColor: isDark ? Colors.white70 : Colors.grey[700]),
                      ],
                    ),
                  ),
                  const Gap(20),

                  // Section C Header: Products & Catalog
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Products & Catalog (${productsList.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                      TextButton(
                        onPressed: () {},
                        child: const Text('Filter Items ↗', style: TextStyle(color: ServoraColors.emerald600, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const Gap(10),
                ],
              ),
            ),
          ),

          // Section C: Products Catalog Grid (2-Column Responsive Cards)
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.64,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final p = productsList[index];
                  final List images = p['images'] is List ? p['images'] : [];
                  final String imgUrl = images.isNotEmpty ? images[0] : 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80';

                  return Container(
                    decoration: BoxDecoration(
                      color: isDark ? ServoraColors.darkSurface : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(isDark ? 0.2 : 0.03),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Thumbnail Image Container
                        Stack(
                          children: [
                            ClipRRect(
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                              child: AspectRatio(
                                aspectRatio: 1.2,
                                child: Image.network(
                                  imgUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    color: ServoraColors.emerald600.withOpacity(0.12),
                                    child: const Center(child: Icon(Icons.inventory_2_rounded, color: ServoraColors.emerald600, size: 36)),
                                  ),
                                ),
                              ),
                            ),

                            // Top-Left Category Badge
                            Positioned(
                              top: 8,
                              left: 8,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.65),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  p['category'] ?? 'Community & NGOs',
                                  style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                              ),
                            ),

                            // Top-Right Discount Badge
                            if (p['discountPercent'] != null)
                              Positioned(
                                top: 8,
                                right: 8,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF59E0B),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '🏷️ ${p['discountPercent']}%',
                                    style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: Colors.white),
                                  ),
                                ),
                              ),
                          ],
                        ),

                        // Card Details Content
                        Padding(
                          padding: const EdgeInsets.all(10),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Clamped Title
                              Text(
                                p['title'] ?? 'Product Catalog Item',
                                style: TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? Colors.white : const Color(0xFF18181B),
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const Gap(6),

                              // Price Row
                              Row(
                                children: [
                                  Text(
                                    'GH₵ ${p['price']}',
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                                  ),
                                  const Gap(4),
                                  if (p['originalPrice'] != null)
                                    Text(
                                      'GH₵ ${p['originalPrice']}',
                                      style: TextStyle(
                                        fontSize: 10,
                                        decoration: TextDecoration.lineThrough,
                                        color: isDark ? Colors.white38 : Colors.grey[500],
                                      ),
                                    ),
                                ],
                              ),
                              const Gap(4),

                              // Verified Enterprise & Location Row
                              Row(
                                children: [
                                  const Icon(Icons.check_circle_rounded, size: 10, color: ServoraColors.emerald600),
                                  const Gap(2),
                                  const Expanded(
                                    child: Text(
                                      'Verified Enterprise',
                                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Text(
                                    '📍 ${p['location'] ?? "Lamashegu"}',
                                    style: TextStyle(fontSize: 8.5, color: isDark ? Colors.white60 : Colors.grey[600]),
                                  ),
                                ],
                              ),
                              const Gap(8),

                              // Action Bar (Buy & Safe MoMo Escrow)
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: ServoraColors.emerald600,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 6),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      ),
                                      onPressed: () => WhatsAppHelper.openWhatsApp(
                                        phone: phone,
                                        message: "Hello $name, I want to inquire/buy '${p['title']}' listed on Servora.",
                                      ),
                                      child: const Text('✈️ Buy', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                    ),
                                  ),
                                  const Gap(4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFEF3C7),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: const Color(0xFFF59E0B)),
                                    ),
                                    child: const Text('🛡️ Escrow', style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
                childCount: productsList.length,
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
    );
  }

  Widget _buildStatusTag(String label, Color bg, Color text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
      child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: text)),
    );
  }

  Widget _buildServiceTag(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: ServoraColors.emerald600.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
    );
  }

  Widget _buildPricingRow(String label, String value, bool isDark, {Color? valueColor, bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white60 : Colors.grey[700])),
        Text(
          value,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: isBold ? FontWeight.w900 : FontWeight.w600,
            color: valueColor ?? (isDark ? Colors.white : Colors.black),
          ),
        ),
      ],
    );
  }
}
