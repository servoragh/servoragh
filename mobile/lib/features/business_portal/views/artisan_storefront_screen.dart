import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../core/services/marketplace_api_service.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../../shared/widgets/servora_favorite_button.dart';
import '../../../shared/widgets/servora_image_lightbox.dart';

class ArtisanStorefrontScreen extends StatefulWidget {
  final String slug;

  const ArtisanStorefrontScreen({super.key, required this.slug});

  @override
  State<ArtisanStorefrontScreen> createState() => _ArtisanStorefrontScreenState();
}

class _ArtisanStorefrontScreenState extends State<ArtisanStorefrontScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _storeData;
  int _activeTabIndex = 0; // 0: Products, 1: Rentals, 2: Services
  final Map<String, int> _cardImageIndex = {};

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
            'category': 'Solar & Power',
            'discountPercent': 10,
            'location': 'Lamashegu, Tamale',
            'images': ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80'],
          },
          {
            'id': 'prod_2',
            'title': '100Ah 48V Lithium Storage Battery Wall Bank',
            'price': 4200.0,
            'originalPrice': 4800.0,
            'category': 'Energy Storage',
            'discountPercent': 12,
            'location': 'Sakasaka, Tamale',
            'images': ['https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?w=600&q=80'],
          },
        ],
        'rentals': [
          {
            'id': 'rent_1',
            'title': 'Heavy Duty 5kVA Solar Generator & Power Trailer',
            'dailyRate': 150.0,
            'depositRequired': 500.0,
            'isAvailable': true,
            'operatorIncluded': true,
            'images': ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80'],
          },
        ],
        'services': [
          {
            'id': 'serv_1',
            'name': 'Solar Panel Roof Inspection & Load Balancing',
            'description': 'Professional diagnostics, inverter sync, and performance optimization for residential and industrial solar grids.',
            'startingPrice': 250.0,
            'estimatedTime': '2-4 hours',
            'portfolioPhotos': ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80'],
          },
        ],
      },
    };
  }

  List<String> _parseImagesList(dynamic imagesRaw) {
    if (imagesRaw == null) return [];
    if (imagesRaw is List) {
      return imagesRaw.map((e) => e.toString()).where((e) => e.isNotEmpty).toList();
    }
    if (imagesRaw is String) {
      try {
        final decoded = jsonDecode(imagesRaw);
        if (decoded is List) {
          return decoded.map((e) => e.toString()).where((e) => e.isNotEmpty).toList();
        }
      } catch (_) {
        if (imagesRaw.isNotEmpty) return [imagesRaw];
      }
    }
    return [];
  }

  void _shareStorefront(String name, String slug) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        final url = 'https://servora.vercel.app/biz/$slug';
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
                title: const Text('Copy Link'),
                subtitle: Text(url, style: const TextStyle(fontSize: 11)),
                onTap: () {
                  Clipboard.setData(ClipboardData(text: url));
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Storefront link copied to clipboard!'),
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
                subtitle: const Text('Show QR code for instant customer scanning'),
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
    final String name = data['businessName'] ?? 'Verified Merchant Profile';
    final String artisanName = data['artisanName'] ?? data['user']?['name'] ?? name;
    final int experienceYears = int.tryParse((data['experienceYears'] ?? 1).toString()) ?? 1;
    final String phone = data['phone'] ?? data['user']?['phone'] ?? '+233240000000';
    final String whatsapp = data['whatsappNumber'] ?? phone;
    final String coverage = data['zone'] ?? 'Tamale, Northern Ghana';
    final double rating = double.tryParse((data['ratingAverage'] ?? data['rating'] ?? 5.0).toString()) ?? 5.0;
    final int reviewsCount = int.tryParse((data['reviewsCount'] ?? data['reviewCount'] ?? 0).toString()) ?? 0;
    final String aboutText = data['aboutText'] ?? data['bio'] ?? data['description'] ?? "Verified business offering high quality products, equipment rentals, and artisan services in Northern Ghana.";

    final Map<String, dynamic> catalogs = data['catalogs'] ?? {};
    final List productsList = catalogs['products'] ?? (data['products'] is List ? data['products'] : []);
    final List rentalsList = catalogs['rentals'] ?? (data['rentals'] is List ? data['rentals'] : []);
    final List servicesList = catalogs['services'] ?? (data['services'] is List ? data['services'] : []);

    final String logoUrl = data['logoUrl'] ?? data['user']?['avatarUrl'] ?? '';
    final String bannerUrl = data['bannerUrl'] ?? data['storefrontPhotoUrl'] ?? '';

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF090D16) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Storefront', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
        actions: [
          ServoraFavoriteButton(businessId: widget.slug, businessName: name),
          IconButton(
            icon: const Icon(Icons.share_rounded, size: 20),
            onPressed: () => _shareStorefront(name, widget.slug),
          ),
          const Gap(8),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          // Optional Storefront Banner Image
          if (bannerUrl.isNotEmpty)
            SliverToBoxAdapter(
              child: GestureDetector(
                onTap: () => ServoraImageLightbox.show(context, title: name, images: [bannerUrl]),
                child: SizedBox(
                  height: 140,
                  width: double.infinity,
                  child: Image.network(
                    bannerUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                  ),
                ),
              ),
            ),

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
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Avatar / Profile Logo Image
                        GestureDetector(
                          onTap: logoUrl.isNotEmpty
                              ? () => ServoraImageLightbox.show(context, title: name, images: [logoUrl])
                              : null,
                          child: Container(
                            width: 68,
                            height: 68,
                            decoration: BoxDecoration(
                              color: ServoraColors.emerald600.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: ServoraColors.emerald600.withOpacity(0.3), width: 1.5),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(15),
                              child: logoUrl.isNotEmpty
                                  ? Image.network(
                                      logoUrl,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Center(
                                        child: Text(
                                          name.isNotEmpty ? name[0].toUpperCase() : 'S',
                                          style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                                        ),
                                      ),
                                    )
                                  : Center(
                                      child: Text(
                                        name.isNotEmpty ? name[0].toUpperCase() : 'S',
                                        style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                                      ),
                                    ),
                            ),
                          ),
                        ),
                        const Gap(12),

                        // Title & Badges
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
                                        Text('Verified', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: Color(0xFFD97706))),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const Gap(4),
                              Text(
                                'Artisan: $artisanName • $experienceYears yrs exp',
                                style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey[700], fontWeight: FontWeight.w500),
                              ),
                              const Gap(6),
                              Wrap(
                                spacing: 10,
                                runSpacing: 4,
                                children: [
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.location_on_rounded, size: 12, color: ServoraColors.emerald600),
                                      const Gap(3),
                                      Text(coverage, style: TextStyle(fontSize: 10, color: isDark ? Colors.white70 : Colors.grey[800], fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.star_rounded, size: 13, color: Colors.amber),
                                      const Gap(2),
                                      Text(
                                        rating > 0 ? '$rating ($reviewsCount reviews)' : 'New Merchant',
                                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (aboutText.isNotEmpty) ...[
                      const Gap(12),
                      Text(
                        aboutText,
                        style: TextStyle(
                          fontSize: 11.5,
                          height: 1.4,
                          color: isDark ? Colors.white70 : Colors.grey[800],
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const Gap(14),

                    // WhatsApp Instant Action Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF25D366),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                        icon: const Icon(Icons.chat_bubble_rounded, size: 16),
                        label: const Text('Chat / Order on WhatsApp', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                        onPressed: () => WhatsAppHelper.openWhatsApp(
                          phone: whatsapp,
                          message: "Hello $name, I found your verified profile on Servora and would like to make an inquiry.",
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Section B: 3-Tab Segment Selector (Products, Tool Rentals, Services Portfolio)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: isDark ? ServoraColors.darkSurface : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                ),
                child: Row(
                  children: [
                    _buildSegmentTab(0, 'Products', productsList.length, isDark),
                    _buildSegmentTab(1, 'Rentals', rentalsList.length, isDark),
                    _buildSegmentTab(2, 'Services', servicesList.length, isDark),
                  ],
                ),
              ),
            ),
          ),

          // Section C: Active Tab Content
          if (_activeTabIndex == 0) ...[
            // PRODUCTS TAB
            if (productsList.isEmpty)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Center(child: Text('No products listed by this merchant.', style: TextStyle(fontSize: 12, color: Colors.grey))),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.62,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final p = productsList[index];
                      final pImages = _parseImagesList(p['images']);
                      final activeIdx = _cardImageIndex[p['id']?.toString() ?? '$index'] ?? 0;
                      final currentImg = pImages.isNotEmpty
                          ? pImages[activeIdx.clamp(0, pImages.length - 1)]
                          : 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80';

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
                            // Thumbnail & Lightbox Trigger
                            GestureDetector(
                              onTap: () => ServoraImageLightbox.show(
                                context,
                                title: p['title'] ?? 'Product',
                                images: pImages.isNotEmpty ? pImages : [currentImg],
                                initialIndex: activeIdx,
                              ),
                              child: Stack(
                                children: [
                                  ClipRRect(
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                    child: AspectRatio(
                                      aspectRatio: 1.2,
                                      child: Image.network(
                                        currentImg,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => Container(
                                          color: ServoraColors.emerald600.withOpacity(0.12),
                                          child: const Center(child: Icon(Icons.inventory_2_rounded, color: ServoraColors.emerald600, size: 36)),
                                        ),
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    top: 6,
                                    right: 6,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.black.withOpacity(0.7),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text('🔍 Zoom', style: TextStyle(fontSize: 8.5, color: Colors.white, fontWeight: FontWeight.bold)),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Multi-Image Mini Thumbnails
                            if (pImages.length > 1)
                              Container(
                                height: 28,
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                child: ListView.separated(
                                  scrollDirection: Axis.horizontal,
                                  itemCount: pImages.length,
                                  separatorBuilder: (_, __) => const Gap(4),
                                  itemBuilder: (context, idx) {
                                    final isSel = activeIdx == idx;
                                    return GestureDetector(
                                      onTap: () => setState(() => _cardImageIndex[p['id']?.toString() ?? '$index'] = idx),
                                      child: Container(
                                        width: 22,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(4),
                                          border: Border.all(
                                            color: isSel ? ServoraColors.emerald600 : Colors.grey.withOpacity(0.4),
                                            width: isSel ? 2 : 1,
                                          ),
                                        ),
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(3),
                                          child: Image.network(pImages[idx], fit: BoxFit.cover),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),

                            // Details
                            Padding(
                              padding: const EdgeInsets.all(8),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    p['title'] ?? 'Product',
                                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const Gap(4),
                                  Text(
                                    'GH₵ ${p['price']}',
                                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                                  ),
                                  const Gap(6),
                                  SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: ServoraColors.emerald600,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 4),
                                        minimumSize: Size.zero,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      ),
                                      onPressed: () => WhatsAppHelper.openWhatsApp(
                                        phone: whatsapp,
                                        message: "Hello $name, I want to inquire about '${p['title']}' listed on Servora.",
                                      ),
                                      child: const Text('Buy on WhatsApp', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                    ),
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
          ] else if (_activeTabIndex == 1) ...[
            // TOOL & EQUIPMENT RENTALS TAB
            if (rentalsList.isEmpty)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Center(child: Text('No equipment rentals listed by this merchant.', style: TextStyle(fontSize: 12, color: Colors.grey))),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final r = rentalsList[index];
                      final rImages = _parseImagesList(r['images']);
                      final currentImg = rImages.isNotEmpty
                          ? rImages[0]
                          : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80';

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: isDark ? ServoraColors.darkSurface : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Equipment Photo Banner
                            GestureDetector(
                              onTap: () => ServoraImageLightbox.show(
                                context,
                                title: r['title'] ?? 'Rental Equipment',
                                images: rImages.isNotEmpty ? rImages : [currentImg],
                              ),
                              child: Stack(
                                children: [
                                  ClipRRect(
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                    child: SizedBox(
                                      height: 140,
                                      width: double.infinity,
                                      child: Image.network(
                                        currentImg,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => Container(
                                          color: Colors.amber.withOpacity(0.15),
                                          child: const Center(child: Icon(Icons.handyman_rounded, color: Colors.amber, size: 40)),
                                        ),
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    top: 8,
                                    right: 8,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.black.withOpacity(0.7),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.zoom_in_rounded, size: 12, color: Colors.white),
                                          Gap(3),
                                          Text('Full View', style: TextStyle(fontSize: 9.5, color: Colors.white, fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            Padding(
                              padding: const EdgeInsets.all(14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    r['title'] ?? 'Tool / Machinery Rental',
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                  ),
                                  if (r['description'] != null) ...[
                                    const Gap(4),
                                    Text(
                                      r['description'],
                                      style: TextStyle(fontSize: 11, color: isDark ? Colors.white70 : Colors.grey[700]),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                  const Gap(10),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'GH₵ ${r['dailyRate'] ?? "0.00"} / day',
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFFD97706)),
                                      ),
                                      ElevatedButton.icon(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFFD97706),
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        ),
                                        icon: const Icon(Icons.handyman_rounded, size: 14),
                                        label: const Text('Rent on WhatsApp', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                        onPressed: () => WhatsAppHelper.openWhatsApp(
                                          phone: whatsapp,
                                          message: "Hello $name, I want to rent '${r['title']}' listed on Servora.",
                                        ),
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
                    childCount: rentalsList.length,
                  ),
                ),
              ),
          ] else ...[
            // SERVICES PORTFOLIO TAB
            if (servicesList.isEmpty)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Center(child: Text('No custom services listed by this artisan.', style: TextStyle(fontSize: 12, color: Colors.grey))),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final s = servicesList[index];
                      final sPhotos = _parseImagesList(s['portfolioPhotos'] ?? s['images']);
                      final currentImg = sPhotos.isNotEmpty ? sPhotos[0] : '';

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: isDark ? ServoraColors.darkSurface : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (currentImg.isNotEmpty)
                              GestureDetector(
                                onTap: () => ServoraImageLightbox.show(
                                  context,
                                  title: s['name'] ?? 'Service Portfolio',
                                  images: sPhotos,
                                ),
                                child: Stack(
                                  children: [
                                    ClipRRect(
                                      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                      child: SizedBox(
                                        height: 140,
                                        width: double.infinity,
                                        child: Image.network(
                                          currentImg,
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                                        ),
                                      ),
                                    ),
                                    if (sPhotos.length > 1)
                                      Positioned(
                                        bottom: 8,
                                        right: 8,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: Colors.black.withOpacity(0.75),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            '👁️ ${sPhotos.length} Work Photos',
                                            style: const TextStyle(fontSize: 9.5, color: Colors.white, fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),

                            Padding(
                              padding: const EdgeInsets.all(14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    s['name'] ?? 'Artisan Service',
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                  ),
                                  if (s['description'] != null) ...[
                                    const Gap(4),
                                    Text(
                                      s['description'],
                                      style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white70 : Colors.grey[700]),
                                    ),
                                  ],
                                  const Gap(10),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        s['startingPrice'] != null
                                            ? 'Starting: GH₵ ${s['startingPrice']}'
                                            : 'Custom Estimate',
                                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                                      ),
                                      ElevatedButton.icon(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: ServoraColors.emerald600,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        ),
                                        icon: const Icon(Icons.send_rounded, size: 13),
                                        label: const Text('Request Quote', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                        onPressed: () => WhatsAppHelper.openWhatsApp(
                                          phone: whatsapp,
                                          message: "Hello $name, I would like to request a quote for '${s['name']}' via Servora.",
                                        ),
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
                    childCount: servicesList.length,
                  ),
                ),
              ),
          ],
          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
    );
  }

  Widget _buildSegmentTab(int index, String label, int count, bool isDark) {
    final isSel = _activeTabIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeTabIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSel ? ServoraColors.emerald600 : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: Text(
              '$label ($count)',
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.bold,
                color: isSel ? Colors.white : (isDark ? Colors.white60 : Colors.grey[700]),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
