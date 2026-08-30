import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/constants/constants.dart';
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
  bool _isCategoryRailsView = true; // Horizontal Category Rails vs Full Grid View
  final Map<String, int> _cardImageIndex = {};
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  static const String _defaultBannerUrl =
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80';

  @override
  void initState() {
    super.initState();
    _loadStorefront();
  }

  @override
  void dispose() {
    _searchController.dispose();
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
    final isSolar = cleanName.toLowerCase().contains('solar') || widget.slug.contains('solar');
    final name = isSolar ? 'Tamale Solar & Heavy Power Solutions' : cleanName;

    return {
      'id': 'prov_${widget.slug}',
      'slug': widget.slug,
      'businessName': name,
      'artisanName': 'Eng. Rashid Mohammed',
      'experienceYears': 1,
      'tagline': 'Verified Northern Ghana Enterprise',
      'category': 'Verified Enterprise',
      'verificationStatus': 'VERIFIED',
      'verificationTier': 'VERIFIED',
      'isVerified': true,
      'logoUrl': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      'bannerUrl': _defaultBannerUrl,
      'storefrontPhotoUrl': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
      'addressDetails': 'Tamale Central Market, Shed #12',
      'landmark': 'Near Main Commercial Road',
      'latitude': 9.4074,
      'longitude': -0.8416,
      'trustScore': 100,
      'ratingAverage': 5.0,
      'reviewsCount': 24,
      'phone': '+233240000000',
      'whatsappNumber': '+233240000000',
      'zone': 'Tamale Central',
      'description': "Northern Ghana's verified distributor and service provider offering high quality products, heavy tool rentals, and professional artisan services.",
      'catalogs': {
        'products': [
          {
            'id': 'prod_1',
            'title': '300W Monocrystalline Heavy Duty Solar Panel Kit',
            'price': 1800.0,
            'originalPrice': 2000.0,
            'category': 'Solar & Tech',
            'discountPercent': 10,
            'location': 'Sakasaka, Tamale',
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
        if (imagesRaw.startsWith('http') || imagesRaw.startsWith('/')) {
          return [imagesRaw];
        }
      }
    }
    return [];
  }

  Future<void> _makePhoneCall(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open phone dialer for $phone')),
        );
      }
    }
  }

  Future<void> _openGoogleMaps(double? lat, double? lng, String address) async {
    Uri uri;
    if (lat != null && lng != null && lat != 0.0 && lng != 0.0) {
      uri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
    } else {
      final q = Uri.encodeComponent('$address, Tamale, Ghana');
      uri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$q');
    }

    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open Google Maps')),
        );
      }
    }
  }

  void _shareStorefront(String name, String slug) {
    final url = '${ServoraConstants.webBaseUrl}/biz/$slug';
    Share.share('Check out $name on Servora Northern Ghana Marketplace: $url');
  }

  void _showQrDialog(String name, String url) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('$name QR Code', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 200,
              height: 200,
              child: QrImageView(
                data: url,
                version: QrVersions.auto,
                size: 200.0,
                backgroundColor: Colors.white,
              ),
            ),
            const Gap(12),
            Text(url, style: const TextStyle(fontSize: 10.5, color: Colors.grey), textAlign: TextAlign.center),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Clipboard.setData(ClipboardData(text: url));
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Storefront URL copied to clipboard!')),
              );
            },
            child: const Text('Copy Link', style: TextStyle(color: ServoraColors.emerald600, fontWeight: FontWeight.bold)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
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
        backgroundColor: isDark ? const Color(0xFF090D16) : const Color(0xFFF8FAFC),
        appBar: AppBar(title: const Text('Loading Storefront...')),
        body: const Center(child: CircularProgressIndicator(color: ServoraColors.emerald600)),
      );
    }

    final data = _storeData ?? _getFallbackData();
    final String name = data['businessName'] ?? data['name'] ?? 'Servora Merchant';
    final String zone = data['zone'] ?? data['serviceArea'] ?? 'Tamale Central';
    final String phone = data['phone'] ?? '+233240000000';
    final String whatsapp = data['whatsappNumber'] ?? data['whatsapp'] ?? phone;
    final String addressDetails = data['addressDetails'] ?? data['landmark'] ?? '$zone, Tamale';
    final String landmark = data['landmark'] ?? '';
    final String description = data['description'] ?? data['bio'] ?? '';
    final String tagline = data['tagline'] ?? '';
    final double? latitude = (data['latitude'] != null) ? double.tryParse(data['latitude'].toString()) : null;
    final double? longitude = (data['longitude'] != null) ? double.tryParse(data['longitude'].toString()) : null;

    final catalogs = (data['catalogs'] is Map) ? data['catalogs'] as Map<String, dynamic> : <String, dynamic>{};
    final List productsList = (catalogs['products'] is List) ? catalogs['products'] : [];
    final List rentalsList = (catalogs['rentals'] is List) ? catalogs['rentals'] : [];
    final List servicesList = (catalogs['services'] is List) ? catalogs['services'] : [];

    final String logoUrl = data['logoUrl'] ?? data['user']?['avatarUrl'] ?? '';
    final String rawBanner = data['bannerUrl'] ?? '';
    final String bannerUrl = rawBanner.isNotEmpty ? rawBanner : _defaultBannerUrl;
    final String storefrontPhotoUrl = data['storefrontPhotoUrl'] ?? '';

    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (didPop) return;
        if (Navigator.of(context).canPop()) {
          context.pop();
        } else {
          context.go('/businesses');
        }
      },
      child: Scaffold(
        backgroundColor: isDark ? const Color(0xFF090D16) : const Color(0xFFF8FAFC),
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () {
              if (Navigator.of(context).canPop()) {
                context.pop();
              } else {
                context.go('/businesses');
              }
            },
          ),
          title: Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
          actions: [
            ServoraFavoriteButton(businessId: widget.slug, businessName: name),
            IconButton(
              icon: const Icon(Icons.share_rounded, size: 20),
              onPressed: () => _shareStorefront(name, widget.slug),
            ),
            const Gap(6),
          ],
        ),
        body: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // 1. TOP COVER BANNER IMAGE
            SliverToBoxAdapter(
              child: GestureDetector(
                onTap: () => ServoraImageLightbox.show(context, title: name, images: [bannerUrl]),
                child: Stack(
                  children: [
                    SizedBox(
                      height: 155,
                      width: double.infinity,
                      child: CachedNetworkImage(
                        imageUrl: bannerUrl,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: isDark ? Colors.grey[900] : Colors.grey[200],
                          child: const Center(
                            child: SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(strokeWidth: 2, color: ServoraColors.emerald600),
                            ),
                          ),
                        ),
                        errorWidget: (_, __, ___) => Container(color: Colors.grey[800]),
                      ),
                    ),
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.black.withOpacity(0.35),
                              Colors.transparent,
                              Colors.black.withOpacity(0.75),
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 10,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.65),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.photo_size_select_actual_outlined, color: Colors.white, size: 12),
                            Gap(4),
                            Text('Cover Photo', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // 2. MAIN IDENTITY OVERVIEW CARD
            SliverToBoxAdapter(
              child: Transform.translate(
                offset: const Offset(0, -18),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? ServoraColors.darkSurface : Colors.white,
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(isDark ? 0.3 : 0.06),
                          blurRadius: 14,
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
                            // Logo Avatar
                            GestureDetector(
                              onTap: () {
                                if (logoUrl.isNotEmpty) {
                                  ServoraImageLightbox.show(context, title: '$name Logo', images: [logoUrl]);
                                }
                              },
                              child: Container(
                                width: 62,
                                height: 62,
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: ServoraColors.emerald600.withOpacity(0.4), width: 1.5),
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(15),
                                  child: logoUrl.isNotEmpty
                                      ? CachedNetworkImage(
                                          imageUrl: logoUrl,
                                          fit: BoxFit.cover,
                                          errorWidget: (_, __, ___) => Center(
                                            child: Text(
                                              name.isNotEmpty ? name[0].toUpperCase() : 'S',
                                              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                                            ),
                                          ),
                                        )
                                      : Center(
                                          child: Text(
                                            name.isNotEmpty ? name[0].toUpperCase() : 'S',
                                            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                                          ),
                                        ),
                                ),
                              ),
                            ),
                            const Gap(12),

                            // Store Name & Badges
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Wrap(
                                    spacing: 6,
                                    runSpacing: 4,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: ServoraColors.emerald600.withOpacity(0.12),
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: ServoraColors.emerald600.withOpacity(0.3)),
                                        ),
                                        child: const Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(Icons.verified_rounded, size: 11, color: ServoraColors.emerald600),
                                            Gap(3),
                                            Text(
                                              'Verified Business',
                                              style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: ServoraColors.emerald600),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: isDark ? Colors.white10 : const Color(0xFFF1F5F9),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          zone,
                                          style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: isDark ? Colors.white70 : Colors.grey[700]),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Gap(4),
                                  Text(
                                    name,
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w900,
                                      color: isDark ? Colors.white : const Color(0xFF18181B),
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  if (tagline.isNotEmpty) ...[
                                    const Gap(2),
                                    Text(
                                      tagline,
                                      style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey[700], fontWeight: FontWeight.w500),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                        const Gap(14),

                        // Action Buttons Bar
                        Wrap(
                          spacing: 7,
                          runSpacing: 7,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF25D366),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 9),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                elevation: 0,
                              ),
                              icon: const Icon(Icons.chat_bubble_rounded, size: 13),
                              label: const Text('WhatsApp', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              onPressed: () => WhatsAppHelper.openWhatsApp(
                                phone: whatsapp,
                                message: "Hello $name, I am contacting you via your Servora storefront.",
                              ),
                            ),
                            OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 9),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              icon: const Icon(Icons.phone_rounded, size: 13),
                              label: const Text('Call', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              onPressed: () => _makePhoneCall(phone),
                            ),
                            OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              icon: const Icon(Icons.request_quote_rounded, size: 13, color: ServoraColors.emerald600),
                              label: const Text('Quote', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              onPressed: () => context.push(
                                '/services/request',
                                extra: {
                                  'prefillMerchant': name,
                                  'merchantSlug': widget.slug,
                                },
                              ),
                            ),
                            OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 9),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              icon: const Icon(Icons.qr_code_2_rounded, size: 14, color: ServoraColors.emerald600),
                              label: const Text('QR', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              onPressed: () => _showQrDialog(name, '${ServoraConstants.webBaseUrl}/biz/${widget.slug}'),
                            ),
                            ServoraFavoriteButton(
                              businessId: widget.slug,
                              businessName: name,
                            ),
                          ],
                        ),

                        if (description.isNotEmpty) ...[
                          const Gap(12),
                          const Divider(height: 1),
                          const Gap(10),
                          Text(
                            description,
                            style: TextStyle(
                              fontSize: 11.5,
                              height: 1.45,
                              color: isDark ? Colors.white70 : Colors.grey[800],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // 3. COMPACT QUICK DETAILS BAR (Replaces oversized 400px cards with sleek chips)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  child: Row(
                    children: [
                      // Location & Direction Chip
                      GestureDetector(
                        onTap: () => _openGoogleMaps(latitude, longitude, addressDetails),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: isDark ? ServoraColors.darkSurface : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.location_on_rounded, size: 14, color: ServoraColors.emerald600),
                              const Gap(6),
                              Text(
                                landmark.isNotEmpty ? '$addressDetails ($landmark)' : addressDetails,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                              const Gap(6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: ServoraColors.emerald600.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'Directions 🚗',
                                  style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const Gap(8),

                      // Storefront Photo Preview Chip
                      if (storefrontPhotoUrl.isNotEmpty) ...[
                        GestureDetector(
                          onTap: () => ServoraImageLightbox.show(context, title: '$name Storefront', images: [storefrontPhotoUrl]),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            decoration: BoxDecoration(
                              color: isDark ? ServoraColors.darkSurface : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.storefront_rounded, size: 14, color: Color(0xFFD97706)),
                                Gap(6),
                                Text(
                                  'Workshop Photo 📸',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const Gap(8),
                      ],

                      // Buyer Protection Chip
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: isDark ? ServoraColors.darkSurface : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.shield_rounded, size: 14, color: Color(0xFF2563EB)),
                            Gap(6),
                            Text(
                              'Escrow & Buyer Protection Active 🛡️',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SliverToBoxAdapter(child: Gap(14)),

            // 4. SEARCH & VIEW SWITCHER HEADER
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: Row(
                  children: [
                    // Search Bar
                    Expanded(
                      child: Container(
                        height: 42,
                        decoration: BoxDecoration(
                          color: isDark ? ServoraColors.darkSurface : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1),
                          ),
                        ),
                        child: TextField(
                          controller: _searchController,
                          onChanged: (val) => setState(() => _searchQuery = val),
                          style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                          decoration: InputDecoration(
                            hintText: 'Search items in $name...',
                            hintStyle: TextStyle(
                              fontSize: 11.5,
                              color: isDark ? Colors.white38 : Colors.grey[500],
                            ),
                            prefixIcon: const Icon(Icons.search_rounded, color: ServoraColors.emerald600, size: 18),
                            suffixIcon: _searchQuery.isNotEmpty
                                ? GestureDetector(
                                    onTap: () {
                                      _searchController.clear();
                                      setState(() => _searchQuery = '');
                                    },
                                    child: const Icon(Icons.cancel_rounded, size: 16, color: Colors.grey),
                                  )
                                : null,
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                    ),
                    const Gap(8),

                    // View Mode Toggle (Horizontal Rails vs Full Grid)
                    GestureDetector(
                      onTap: () => setState(() => _isCategoryRailsView = !_isCategoryRailsView),
                      child: Container(
                        height: 42,
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          color: _isCategoryRailsView ? ServoraColors.emerald600.withOpacity(0.12) : (isDark ? ServoraColors.darkSurface : Colors.white),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: _isCategoryRailsView ? ServoraColors.emerald600 : (isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              _isCategoryRailsView ? Icons.view_carousel_rounded : Icons.grid_view_rounded,
                              size: 16,
                              color: _isCategoryRailsView ? ServoraColors.emerald600 : (isDark ? Colors.white70 : Colors.grey[700]),
                            ),
                            const Gap(4),
                            Text(
                              _isCategoryRailsView ? 'Rails' : 'Grid',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: _isCategoryRailsView ? ServoraColors.emerald600 : (isDark ? Colors.white70 : Colors.grey[700]),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SliverToBoxAdapter(child: Gap(10)),

            // 5. PRODUCTS SHOWCASE (Horizontal Category Rails OR 2-Column Grid)
            if (_searchQuery.trim().isNotEmpty || !_isCategoryRailsView) ...[
              // GRID CATALOG VIEW
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: isDark ? ServoraColors.darkSurface : Colors.white,
                      borderRadius: BorderRadius.circular(14),
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
              const SliverToBoxAdapter(child: Gap(6)),

              if (_activeTabIndex == 0) ...[
                if (productsList.isEmpty)
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: Text('No products listed by this merchant.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    sliver: SliverToBoxAdapter(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                for (int i = 0; i < productsList.length; i += 2)
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: _buildStorefrontProductCard(
                                      context: context,
                                      p: productsList[i] is Map ? Map<String, dynamic>.from(productsList[i]) : <String, dynamic>{},
                                      index: i,
                                      isDark: isDark,
                                      storeData: data,
                                      name: name,
                                      phone: phone,
                                      whatsapp: whatsapp,
                                      zone: zone,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          const Gap(10),
                          Expanded(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                for (int i = 1; i < productsList.length; i += 2)
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: _buildStorefrontProductCard(
                                      context: context,
                                      p: productsList[i] is Map ? Map<String, dynamic>.from(productsList[i]) : <String, dynamic>{},
                                      index: i,
                                      isDark: isDark,
                                      storeData: data,
                                      name: name,
                                      phone: phone,
                                      whatsapp: whatsapp,
                                      zone: zone,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ] else if (_activeTabIndex == 1) ...[
                if (rentalsList.isEmpty)
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: Text('No equipment rentals listed.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => _buildRentalCard(rentalsList[index], isDark, name, whatsapp),
                        childCount: rentalsList.length,
                      ),
                    ),
                  ),
              ] else ...[
                if (servicesList.isEmpty)
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: Text('No custom services listed.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => _buildServiceCard(servicesList[index], isDark, name, whatsapp),
                        childCount: servicesList.length,
                      ),
                    ),
                  ),
              ],
            ] else ...[
              // HORIZONTAL CATEGORY RAILS VIEW (SWIPE SIDEWAYS + VERTICAL BROWSE)

              // RAIL 1: FEATURED PRODUCTS CAROUSEL (SWIPE SIDEWAYS)
              if (productsList.isNotEmpty) ...[
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(14, 8, 14, 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.stars_rounded, size: 16, color: ServoraColors.emerald600),
                            Gap(6),
                            Text(
                              'FEATURED & TOP SELLERS',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.3),
                            ),
                          ],
                        ),
                        Text(
                          '${productsList.length} items  ➔',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 255,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      itemCount: productsList.length,
                      separatorBuilder: (_, __) => const Gap(12),
                      itemBuilder: (context, index) {
                        final p = productsList[index] is Map ? Map<String, dynamic>.from(productsList[index]) : <String, dynamic>{};
                        return SizedBox(
                          width: 175,
                          child: _buildStorefrontProductCard(
                            context: context,
                            p: p,
                            index: index,
                            isDark: isDark,
                            storeData: data,
                            name: name,
                            phone: phone,
                            whatsapp: whatsapp,
                            zone: zone,
                          ),
                        );
                      },
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: Gap(16)),
              ],

              // RAIL 2: EQUIPMENT & TOOL RENTALS CAROUSEL (SWIPE SIDEWAYS)
              if (rentalsList.isNotEmpty) ...[
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(14, 6, 14, 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.handyman_rounded, size: 16, color: Color(0xFFD97706)),
                            Gap(6),
                            Text(
                              'EQUIPMENT & MACHINE RENTALS',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.3),
                            ),
                          ],
                        ),
                        Text(
                          '${rentalsList.length} tools  ➔',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD97706)),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 230,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      itemCount: rentalsList.length,
                      separatorBuilder: (_, __) => const Gap(12),
                      itemBuilder: (context, index) {
                        final r = rentalsList[index];
                        return SizedBox(
                          width: 220,
                          child: _buildHorizontalRentalCard(r, isDark, name, whatsapp),
                        );
                      },
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: Gap(16)),
              ],

              // RAIL 3: ARTISAN SERVICES OFFERED (SWIPE SIDEWAYS)
              if (servicesList.isNotEmpty) ...[
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(14, 6, 14, 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.build_circle_rounded, size: 16, color: ServoraColors.emerald600),
                            Gap(6),
                            Text(
                              'SPECIALIZED TRADE SERVICES',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.3),
                            ),
                          ],
                        ),
                        Text(
                          '${servicesList.length} services  ➔',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 230,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      itemCount: servicesList.length,
                      separatorBuilder: (_, __) => const Gap(12),
                      itemBuilder: (context, index) {
                        final s = servicesList[index];
                        return SizedBox(
                          width: 220,
                          child: _buildHorizontalServiceCard(s, isDark, name, whatsapp),
                        );
                      },
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: Gap(16)),
              ],

              // VERTICAL ALL PRODUCTS CATALOG SECTION (SCROLL UP & DOWN)
              if (productsList.isNotEmpty) ...[
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(14, 8, 14, 8),
                    child: Row(
                      children: [
                        const Icon(Icons.inventory_2_rounded, size: 16, color: ServoraColors.emerald600),
                        const Gap(6),
                        Text(
                          'ALL STORE GOODS & PRODUCE (${productsList.length})',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.3),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  sliver: SliverToBoxAdapter(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              for (int i = 0; i < productsList.length; i += 2)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: _buildStorefrontProductCard(
                                    context: context,
                                    p: productsList[i] is Map ? Map<String, dynamic>.from(productsList[i]) : <String, dynamic>{},
                                    index: i,
                                    isDark: isDark,
                                    storeData: data,
                                    name: name,
                                    phone: phone,
                                    whatsapp: whatsapp,
                                    zone: zone,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        const Gap(10),
                        Expanded(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              for (int i = 1; i < productsList.length; i += 2)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: _buildStorefrontProductCard(
                                    context: context,
                                    p: productsList[i] is Map ? Map<String, dynamic>.from(productsList[i]) : <String, dynamic>{},
                                    index: i,
                                    isDark: isDark,
                                    storeData: data,
                                    name: name,
                                    phone: phone,
                                    whatsapp: whatsapp,
                                    zone: zone,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
            const SliverToBoxAdapter(child: SizedBox(height: 40)),
          ],
        ),
      ),
    );
  }

  Widget _buildHorizontalRentalCard(dynamic r, bool isDark, String name, String whatsapp) {
    final rImages = _parseImagesList(r['images']);
    final currentImg = rImages.isNotEmpty ? rImages[0] : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80';

    return Container(
      decoration: BoxDecoration(
        color: isDark ? ServoraColors.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: SizedBox(
              height: 110,
              width: double.infinity,
              child: CachedNetworkImage(
                imageUrl: currentImg,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => Container(color: Colors.amber.withOpacity(0.2)),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  r['title'] ?? 'Rental Tool',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const Gap(4),
                Text(
                  'GH₵ ${r['dailyRate'] ?? "0.00"} / day',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFFD97706)),
                ),
                const Gap(8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD97706),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      minimumSize: Size.zero,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      elevation: 0,
                    ),
                    onPressed: () => WhatsAppHelper.openWhatsApp(
                      phone: whatsapp,
                      message: "Hello $name, I want to rent '${r['title']}' listed on your Servora storefront.",
                    ),
                    child: const Text('Rent on WhatsApp', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHorizontalServiceCard(dynamic s, bool isDark, String name, String whatsapp) {
    final sPhotos = _parseImagesList(s['portfolioPhotos'] ?? s['images']);
    final currentImg = sPhotos.isNotEmpty ? sPhotos[0] : 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80';

    return Container(
      decoration: BoxDecoration(
        color: isDark ? ServoraColors.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: SizedBox(
              height: 110,
              width: double.infinity,
              child: CachedNetworkImage(
                imageUrl: currentImg,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => Container(color: ServoraColors.emerald600.withOpacity(0.2)),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  s['name'] ?? 'Artisan Service',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const Gap(4),
                Text(
                  s['startingPrice'] != null ? 'From GH₵ ${s['startingPrice']}' : 'Custom Estimate',
                  style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                ),
                const Gap(8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ServoraColors.emerald600,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      minimumSize: Size.zero,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      elevation: 0,
                    ),
                    onPressed: () => WhatsAppHelper.openWhatsApp(
                      phone: whatsapp,
                      message: "Hello $name, I would like to request a quote for '${s['name']}' via Servora.",
                    ),
                    child: const Text('Request Quote', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRentalCard(dynamic r, bool isDark, String name, String whatsapp) {
    final rImages = _parseImagesList(r['images']);
    final currentImg = rImages.isNotEmpty ? rImages[0] : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? ServoraColors.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GestureDetector(
            onTap: () => ServoraImageLightbox.show(
              context,
              title: r['title'] ?? 'Rental Equipment',
              images: rImages.isNotEmpty ? rImages : [currentImg],
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
              child: SizedBox(
                height: 140,
                width: double.infinity,
                child: CachedNetworkImage(
                  imageUrl: currentImg,
                  fit: BoxFit.cover,
                  errorWidget: (_, __, ___) => Container(color: Colors.amber.withOpacity(0.15)),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(r['title'] ?? 'Tool / Machinery Rental', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                if (r['description'] != null) ...[
                  const Gap(4),
                  Text(r['description'], style: TextStyle(fontSize: 11, color: isDark ? Colors.white70 : Colors.grey[700]), maxLines: 2, overflow: TextOverflow.ellipsis),
                ],
                const Gap(10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('GH₵ ${r['dailyRate'] ?? "0.00"} / day', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFFD97706))),
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
                        message: "Hello $name, I want to rent '${r['title']}' listed on your Servora storefront.",
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
  }

  Widget _buildServiceCard(dynamic s, bool isDark, String name, String whatsapp) {
    final sPhotos = _parseImagesList(s['portfolioPhotos'] ?? s['images']);
    final currentImg = sPhotos.isNotEmpty ? sPhotos[0] : '';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? ServoraColors.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(18),
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
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                child: SizedBox(
                  height: 140,
                  width: double.infinity,
                  child: CachedNetworkImage(
                    imageUrl: currentImg,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => const SizedBox.shrink(),
                  ),
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(s['name'] ?? 'Artisan Service', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                if (s['description'] != null) ...[
                  const Gap(4),
                  Text(s['description'], style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white70 : Colors.grey[700])),
                ],
                const Gap(10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      s['startingPrice'] != null ? 'Starting: GH₵ ${s['startingPrice']}' : 'Custom Estimate',
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
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Text(
              '$label ($count)',
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.bold,
                color: isSel ? Colors.white : (isDark ? Colors.white60 : Colors.grey[700]),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStorefrontProductCard({
    required BuildContext context,
    required Map<String, dynamic> p,
    required int index,
    required bool isDark,
    required Map<String, dynamic> storeData,
    required String name,
    required String phone,
    required String whatsapp,
    required String zone,
  }) {
    final pImages = _parseImagesList(p['images']);
    final activeIdx = _cardImageIndex[p['id']?.toString() ?? '$index'] ?? 0;
    final currentImg = pImages.isNotEmpty
        ? pImages[activeIdx.clamp(0, pImages.length - 1)]
        : 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80';

    final double price = (p['price'] is num)
        ? (p['price'] as num).toDouble()
        : (double.tryParse(p['price']?.toString() ?? '0') ?? 0.0);
    final double? originalPrice = (p['originalPrice'] != null)
        ? double.tryParse(p['originalPrice'].toString())
        : null;
    final hasDiscount = originalPrice != null && originalPrice > price;
    final discountPct = hasDiscount
        ? (((originalPrice - price) / originalPrice) * 100).round()
        : 0;

    final Map<String, dynamic> productPayload = {
      ...p,
      'images': pImages,
      'image': currentImg,
      'seller': {
        'id': storeData['id'] ?? 'business',
        'name': name,
        'businessName': name,
        'slug': storeData['slug'] ?? widget.slug,
        'logoUrl': storeData['logoUrl'] ?? '',
        'phone': phone,
        'whatsapp': whatsapp,
        'zone': zone,
        'ratingAverage': storeData['ratingAverage'] ?? 5.0,
        'reviewsCount': storeData['reviewsCount'] ?? 18,
      },
    };

    return GestureDetector(
      onTap: () {
        context.push(
          '/products/${p['slug'] ?? p['id']}',
          extra: productPayload,
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? ServoraColors.darkSurface : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.25 : 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Main Image & Badges
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  child: AspectRatio(
                    aspectRatio: 1.15,
                    child: CachedNetworkImage(
                      imageUrl: currentImg,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(
                        color: isDark ? Colors.grey[850] : Colors.grey[100],
                      ),
                      errorWidget: (_, __, ___) => Container(
                        color: ServoraColors.emerald600.withOpacity(0.12),
                        child: const Center(
                          child: Icon(Icons.inventory_2_rounded, color: ServoraColors.emerald600, size: 32),
                        ),
                      ),
                    ),
                  ),
                ),

                // Discount Badge (Top Left)
                if (hasDiscount)
                  Positioned(
                    top: 6,
                    left: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.red[600],
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '$discountPct% OFF',
                        style: const TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),

                // Lightbox preview button (Bottom Right)
                Positioned(
                  bottom: 6,
                  right: 6,
                  child: GestureDetector(
                    onTap: () {
                      ServoraImageLightbox.show(
                        context,
                        title: p['title'] ?? 'Product',
                        images: pImages.isNotEmpty ? pImages : [currentImg],
                        initialIndex: activeIdx,
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.75),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        pImages.length > 1 ? '📸 ${pImages.length}' : '🔍 Zoom',
                        style: const TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // Product Details Body
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (p['category'] != null && p['category'].toString().isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(bottom: 2),
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                      decoration: BoxDecoration(
                        color: ServoraColors.emerald600.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        p['category'].toString().toUpperCase(),
                        style: const TextStyle(
                          fontSize: 7.5,
                          fontWeight: FontWeight.w800,
                          color: ServoraColors.emerald600,
                        ),
                      ),
                    ),

                  Text(
                    p['title'] ?? 'Product Listing',
                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, height: 1.2),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Gap(4),

                  // Price
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        'GH₵ ${price.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                      ),
                      if (hasDiscount) ...[
                        const Gap(4),
                        Text(
                          'GH₵ ${originalPrice.toStringAsFixed(0)}',
                          style: TextStyle(
                            fontSize: 9,
                            decoration: TextDecoration.lineThrough,
                            color: isDark ? Colors.white38 : Colors.grey[500],
                          ),
                        ),
                      ],
                    ],
                  ),
                  const Gap(6),

                  // Buy on WhatsApp Action Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ServoraColors.emerald600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        minimumSize: Size.zero,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                      ),
                      onPressed: () => WhatsAppHelper.openWhatsApp(
                        phone: whatsapp,
                        message: "Hello $name, I want to buy '${p['title']}' listed on your Servora storefront.",
                      ),
                      child: const Text('Buy on WhatsApp', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
