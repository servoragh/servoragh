import 'dart:convert';
import 'dart:ui';
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
import '../../products/widgets/storefront_cart_bottom_sheet.dart';
import '../../services/widgets/storefront_booking_modal.dart';
import '../widgets/storefront_rental_modal.dart';
import '../widgets/storefront_review_modal.dart';

class ArtisanStorefrontScreen extends StatefulWidget {
  final String slug;

  const ArtisanStorefrontScreen({super.key, required this.slug});

  @override
  State<ArtisanStorefrontScreen> createState() => _ArtisanStorefrontScreenState();
}

class _ArtisanStorefrontScreenState extends State<ArtisanStorefrontScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _storeData;
  String _activeNavSection = 'all'; // 'all', 'shop', 'rentals', 'services', 'about', 'reviews'
  bool _isCategoryRailsView = true; // Horizontal Category Rails vs Full Grid
  final Map<String, int> _cardImageIndex = {};
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  // In-Store Shopping Cart
  final List<StorefrontCartItem> _cartItems = [];

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

  Future<void> _loadStorefront({bool forceRefresh = false}) async {
    if (!forceRefresh) setState(() => _isLoading = true);
    final data = await MarketplaceApiService.fetchPublicProviderBySlug(widget.slug, forceRefresh: forceRefresh);
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
      'tagline': 'Pure Northern Shea Butter, Fresh Yams & Agro Produce',
      'category': 'Verified Enterprise',
      'verificationStatus': 'TIER_2_VERIFIED_ARTISAN',
      'verificationTier': 'TIER_2_VERIFIED',
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
      'zone': 'Aboabo',
      'description': "Direct farm-to-table wholesaler of pure Northern Shea Butter, fresh Tamale yams, guinea fowl eggs, organic soybeans, and unprocessed honey.",
      'businessHours': {
        'monday': {'open': '07:30', 'close': '18:00', 'closed': false},
        'tuesday': {'open': '07:30', 'close': '18:00', 'closed': false},
        'wednesday': {'open': '07:30', 'close': '18:00', 'closed': false},
        'thursday': {'open': '07:30', 'close': '18:00', 'closed': false},
        'friday': {'open': '07:30', 'close': '18:00', 'closed': false},
        'saturday': {'open': '08:00', 'close': '17:00', 'closed': false},
        'sunday': {'open': '09:00', 'close': '14:00', 'closed': true},
      },
      'catalogs': {
        'products': [
          {
            'id': 'prod_1',
            'title': 'Pure Organic Grade A Northern Shea Butter (25kg Tub)',
            'price': 450.0,
            'originalPrice': 520.0,
            'category': 'Agro Produce',
            'discountPercent': 13,
            'location': 'Aboabo, Tamale',
            'images': ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80'],
          },
          {
            'id': 'prod_2',
            'title': 'Export Grade Pona Fresh Yams (Bulk 50 Tubers)',
            'price': 900.0,
            'originalPrice': 1050.0,
            'category': 'Tubers & Roots',
            'discountPercent': 14,
            'location': 'Aboabo, Tamale',
            'images': ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80'],
          },
          {
            'id': 'prod_3',
            'title': 'Organic Northern Guinea Fowl Eggs (Crate of 30)',
            'price': 120.0,
            'originalPrice': 140.0,
            'category': 'Poultry & Eggs',
            'discountPercent': 14,
            'location': 'Aboabo, Tamale',
            'images': ['https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80'],
          },
          {
            'id': 'prod_4',
            'title': 'Raw Unpasteurized Wildflower Forest Honey (5 Litres)',
            'price': 280.0,
            'originalPrice': 320.0,
            'category': 'Agro Produce',
            'discountPercent': 12,
            'location': 'Aboabo, Tamale',
            'images': ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80'],
          },
        ],
        'rentals': [
          {
            'id': 'rent_1',
            'title': 'Motorized Grain & Shea Nut Milling Machine',
            'dailyRate': 85.0,
            'securityDeposit': 200.0,
            'isAvailable': true,
            'operatorIncluded': true,
            'images': ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80'],
          },
        ],
        'services': [
          {
            'id': 'serv_1',
            'name': 'Bulk Packaging, Crating & Logistics to Accra/Kumasi',
            'description': 'End-to-end sorting, export-grade packaging, and cold/dry haulage dispatch to southern markets.',
            'startingPrice': 150.0,
            'estimatedDuration': 'Same Day Dispatch',
            'portfolioPhotos': ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80'],
          },
        ],
      },
      'reviews': [
        {
          'id': 'rev_1',
          'userName': 'Ibrahim Yakubu',
          'rating': 5,
          'comment': 'Best quality shea butter supplier in Northern Ghana. Fast delivery to Accra via VIP parcel.',
          'isVerified': true,
          'createdAt': '2026-08-20T10:00:00Z',
        },
        {
          'id': 'rev_2',
          'userName': 'Hajia Amina',
          'rating': 5,
          'comment': 'The fresh yams arrived intact without any rot. Honest merchant, 100% recommended!',
          'isVerified': true,
          'createdAt': '2026-08-15T14:30:00Z',
        },
      ],
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

  bool _isOpenNow(dynamic hoursRaw) {
    if (hoursRaw == null) return true; // Default open if unconfigured
    try {
      final Map<String, dynamic> hours = hoursRaw is Map ? Map<String, dynamic>.from(hoursRaw) : {};
      final now = DateTime.now();
      final dayKey = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
      ][now.weekday - 1];

      if (hours.containsKey(dayKey)) {
        final dayInfo = hours[dayKey];
        if (dayInfo is Map && dayInfo['closed'] == true) return false;
        if (dayInfo is Map && dayInfo['open'] != null && dayInfo['close'] != null) {
          final openParts = dayInfo['open'].toString().split(':');
          final closeParts = dayInfo['close'].toString().split(':');
          final openMin = int.parse(openParts[0]) * 60 + int.parse(openParts[1]);
          final closeMin = int.parse(closeParts[0]) * 60 + int.parse(closeParts[1]);
          final curMin = now.hour * 60 + now.minute;
          return curMin >= openMin && curMin <= closeMin;
        }
      }
    } catch (_) {}
    return true;
  }

  void _addToCart(Map<String, dynamic> product) {
    final pImages = _parseImagesList(product['images']);
    final price = (product['price'] is num)
        ? (product['price'] as num).toDouble()
        : (double.tryParse(product['price']?.toString() ?? '0') ?? 0.0);
    final title = product['title'] ?? 'Product';
    final id = product['id']?.toString() ?? title;

    setState(() {
      final existingIndex = _cartItems.indexWhere((item) => item.id == id);
      if (existingIndex >= 0) {
        _cartItems[existingIndex].quantity += 1;
      } else {
        _cartItems.add(
          StorefrontCartItem(
            id: id,
            title: title,
            price: price,
            image: pImages.isNotEmpty ? pImages.first : null,
            quantity: 1,
          ),
        );
      }
    });

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('🛍️ Added "$title" to your shopping bag!'),
        backgroundColor: ServoraColors.emerald600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        action: SnackBarAction(
          label: 'View Bag',
          textColor: Colors.white,
          onPressed: _openCart,
        ),
      ),
    );
  }

  void _openCart() {
    final data = _storeData ?? _getFallbackData();
    StorefrontCartBottomSheet.show(
      context: context,
      businessName: data['businessName'] ?? data['name'] ?? 'Store',
      businessSlug: widget.slug,
      businessPhone: data['phone'] ?? '+233240000000',
      businessWhatsApp: data['whatsappNumber'] ?? data['whatsapp'] ?? data['phone'] ?? '',
      businessAddress: data['addressDetails'] ?? data['zone'] ?? 'Tamale',
      cartItems: _cartItems,
      onCartUpdated: (items) => setState(() {
        _cartItems.clear();
        _cartItems.addAll(items);
      }),
      onOrderPlaced: () => setState(() => _cartItems.clear()),
    );
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
        body: const Center(child: CircularProgressIndicator(color: ServoraColors.emerald600)),
      );
    }

    final data = _storeData ?? _getFallbackData();
    final String name = data['businessName'] ?? data['name'] ?? 'Servora Merchant';
    final String zone = data['zone'] ?? data['serviceArea'] ?? 'Aboabo';
    final String phone = data['phone'] ?? '+233240000000';
    final String whatsapp = data['whatsappNumber'] ?? data['whatsapp'] ?? phone;
    final String addressDetails = data['addressDetails'] ?? data['landmark'] ?? '$zone, Tamale';
    final String landmark = data['landmark'] ?? '';
    final String description = data['description'] ?? data['bio'] ?? '';
    final String tagline = data['tagline'] ?? '';
    final double? latitude = (data['latitude'] != null) ? double.tryParse(data['latitude'].toString()) : null;
    final double? longitude = (data['longitude'] != null) ? double.tryParse(data['longitude'].toString()) : null;
    final double rating = (data['ratingAverage'] != null) ? double.tryParse(data['ratingAverage'].toString()) ?? 5.0 : 5.0;
    final int reviewsCount = data['reviewsCount'] ?? (data['reviews'] is List ? (data['reviews'] as List).length : 24);
    final bool openNow = _isOpenNow(data['businessHours']);

    final catalogs = (data['catalogs'] is Map) ? data['catalogs'] as Map<String, dynamic> : <String, dynamic>{};
    final List productsList = (data['products'] is List) ? data['products'] : ((catalogs['products'] is List) ? catalogs['products'] : []);
    final List rentalsList = (data['rentals'] is List) ? data['rentals'] : ((catalogs['rentals'] is List) ? catalogs['rentals'] : []);
    final List servicesList = (data['services'] is List) ? data['services'] : ((catalogs['services'] is List) ? catalogs['services'] : []);
    final List reviewsList = (data['reviews'] is List) ? data['reviews'] : [];

    final String logoUrl = data['logoUrl'] ?? data['user']?['avatarUrl'] ?? '';
    final String rawBanner = data['bannerUrl'] ?? '';
    final String bannerUrl = rawBanner.isNotEmpty ? rawBanner : _defaultBannerUrl;
    final String storefrontPhotoUrl = data['storefrontPhotoUrl'] ?? '';

    // Search Filtering
    final q = _searchQuery.trim().toLowerCase();
    final filteredProducts = productsList.where((p) {
      if (q.isEmpty) return true;
      final t = (p['title'] ?? '').toString().toLowerCase();
      final c = (p['category'] ?? '').toString().toLowerCase();
      final d = (p['description'] ?? '').toString().toLowerCase();
      return t.contains(q) || c.contains(q) || d.contains(q);
    }).toList();

    final filteredRentals = rentalsList.where((r) {
      if (q.isEmpty) return true;
      final t = (r['title'] ?? '').toString().toLowerCase();
      final c = (r['category'] ?? '').toString().toLowerCase();
      return t.contains(q) || c.contains(q);
    }).toList();

    final filteredServices = servicesList.where((s) {
      if (q.isEmpty) return true;
      final n = (s['serviceName'] ?? s['name'] ?? '').toString().toLowerCase();
      final d = (s['description'] ?? '').toString().toLowerCase();
      return n.contains(q) || d.contains(q);
    }).toList();

    final totalCartCount = _cartItems.fold(0, (sum, i) => sum + i.quantity);
    final totalCartPrice = _cartItems.fold(0.0, (sum, i) => sum + i.totalPrice);

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
        // Floating Shopping Bag Indicator
        floatingActionButton: _cartItems.isNotEmpty
            ? FloatingActionButton.extended(
                backgroundColor: ServoraColors.emerald600,
                foregroundColor: Colors.white,
                elevation: 6,
                icon: const Icon(Icons.shopping_bag_rounded),
                label: Text(
                  'Bag ($totalCartCount) • GH₵ ${totalCartPrice.toStringAsFixed(0)} ➔',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5),
                ),
                onPressed: _openCart,
              )
            : null,
        body: RefreshIndicator(
          onRefresh: () => _loadStorefront(forceRefresh: true),
          color: ServoraColors.emerald600,
          child: CustomScrollView(
            physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
            slivers: [
              // ==========================================
              // 1. IMMERSIVE PARALLAX SLIVER APP BAR
              // ==========================================
              SliverAppBar(
                expandedHeight: 230,
                pinned: true,
                stretch: true,
                elevation: 0,
                backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
                leading: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: _buildFrostedCircleButton(
                    icon: Icons.arrow_back_rounded,
                    onTap: () {
                      if (Navigator.of(context).canPop()) {
                        context.pop();
                      } else {
                        context.go('/businesses');
                      }
                    },
                    isDark: isDark,
                  ),
                ),
                actions: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 3.0),
                    child: _buildFrostedCircleButton(
                      icon: Icons.share_rounded,
                      onTap: () => _shareStorefront(name, widget.slug),
                      isDark: isDark,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(3, 8, 12, 8),
                    child: ServoraFavoriteButton(
                      businessId: widget.slug,
                      businessName: name,
                    ),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  stretchModes: const [StretchMode.zoomBackground, StretchMode.blurBackground],
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      CachedNetworkImage(
                        imageUrl: bannerUrl,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Container(color: Colors.grey[900]),
                        errorWidget: (_, __, ___) => Container(color: const Color(0xFF064E3B)),
                      ),
                      // Ambient Luxury Gradient Scrim
                      DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withOpacity(0.55),
                              Colors.transparent,
                              Colors.black.withOpacity(0.85),
                            ],
                          ),
                        ),
                      ),
                      // Floating Cover Lightbox Pill
                      Positioned(
                        bottom: 14,
                        right: 14,
                        child: GestureDetector(
                          onTap: () => ServoraImageLightbox.show(context, title: name, images: [bannerUrl]),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.6),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white24, width: 0.8),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.photo_library_rounded, size: 12, color: Colors.white),
                                Gap(5),
                                Text('Cover Photo', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w700)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ==========================================
              // 2. STOREFRONT IDENTITY & BRAND HERO
              // ==========================================
              SliverToBoxAdapter(
                child: Container(
                  color: isDark ? const Color(0xFF0F172A) : Colors.white,
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Luxury Brand Squircle Avatar with Verified Ring
                          GestureDetector(
                            onTap: () {
                              if (logoUrl.isNotEmpty) {
                                ServoraImageLightbox.show(context, title: '$name Logo', images: [logoUrl]);
                              }
                            },
                            child: Stack(
                              children: [
                                Container(
                                  width: 68,
                                  height: 68,
                                  decoration: BoxDecoration(
                                    color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(20),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.08),
                                        blurRadius: 10,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                    border: Border.all(
                                      color: ServoraColors.emerald600,
                                      width: 2.0,
                                    ),
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(18),
                                    child: logoUrl.isNotEmpty
                                        ? CachedNetworkImage(
                                            imageUrl: logoUrl,
                                            fit: BoxFit.cover,
                                            errorWidget: (_, __, ___) => Center(
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
                                Positioned(
                                  bottom: -2,
                                  right: -2,
                                  child: Container(
                                    padding: const EdgeInsets.all(3),
                                    decoration: const BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.verified_rounded, size: 18, color: ServoraColors.emerald600),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Gap(14),

                          // Title, Tagline & Rating
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                      decoration: BoxDecoration(
                                        color: ServoraColors.emerald600.withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.verified_user_rounded, size: 10, color: ServoraColors.emerald600),
                                          Gap(3),
                                          Text('TIER 2 VERIFIED', style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: ServoraColors.emerald600, letterSpacing: 0.3)),
                                        ],
                                      ),
                                    ),
                                    const Gap(6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                      decoration: BoxDecoration(
                                        color: isDark ? Colors.white12 : const Color(0xFFF1F5F9),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(zone, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: isDark ? Colors.white70 : Colors.grey[700])),
                                    ),
                                  ],
                                ),
                                const Gap(4),
                                Text(
                                  name,
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                                    letterSpacing: -0.3,
                                    height: 1.2,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (tagline.isNotEmpty) ...[
                                  const Gap(3),
                                  Text(
                                    tagline,
                                    style: TextStyle(
                                      fontSize: 11.5,
                                      color: isDark ? Colors.white60 : const Color(0xFF64748B),
                                      fontWeight: FontWeight.w500,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                                const Gap(4),
                                Row(
                                  children: [
                                    const Icon(Icons.star_rounded, size: 14, color: Color(0xFFF59E0B)),
                                    const Gap(2),
                                    Text('$rating', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900)),
                                    Text(' ($reviewsCount reviews)', style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.grey[600])),
                                    const Text(' • ', style: TextStyle(color: Colors.grey)),
                                    Text(
                                      openNow ? '🟢 Open Today' : '🔴 Closed Now',
                                      style: TextStyle(
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.bold,
                                        color: openNow ? ServoraColors.emerald600 : Colors.redAccent,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Gap(16),

                      // Primary Action Strip: Full Dominant WhatsApp Button + Quick Action Icons
                      Row(
                        children: [
                          // Dominant Emerald WhatsApp CTA
                          Expanded(
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF25D366),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                elevation: 0,
                              ),
                              icon: const Icon(Icons.chat_bubble_rounded, size: 16),
                              label: const Text(
                                'Chat & Order on WhatsApp',
                                style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, letterSpacing: 0.2),
                              ),
                              onPressed: () => WhatsAppHelper.openWhatsApp(
                                phone: whatsapp,
                                message: "Hello $name, I am contacting you via your Servora storefront (servora.gh/biz/@${widget.slug}).",
                              ),
                            ),
                          ),
                          const Gap(8),

                          // Call Action
                          _buildActionIconPill(
                            icon: Icons.phone_rounded,
                            tooltip: 'Call',
                            onTap: () => _makePhoneCall(phone),
                            isDark: isDark,
                          ),
                          const Gap(8),

                          // Quote Action
                          _buildActionIconPill(
                            icon: Icons.request_quote_rounded,
                            tooltip: 'Quote',
                            onTap: () {
                              if (servicesList.isNotEmpty) {
                                StorefrontBookingModal.show(
                                  context: context,
                                  service: servicesList.first,
                                  businessName: name,
                                  businessSlug: widget.slug,
                                  businessPhone: phone,
                                  businessWhatsApp: whatsapp,
                                );
                              } else {
                                context.push(
                                  '/services/request',
                                  extra: {'prefillMerchant': name, 'merchantSlug': widget.slug},
                                );
                              }
                            },
                            isDark: isDark,
                          ),
                          const Gap(8),

                          // QR Code Action
                          _buildActionIconPill(
                            icon: Icons.qr_code_2_rounded,
                            tooltip: 'QR Code',
                            onTap: () => _showQrDialog(name, '${ServoraConstants.webBaseUrl}/biz/${widget.slug}'),
                            isDark: isDark,
                          ),
                        ],
                      ),

                      if (description.isNotEmpty) ...[
                        const Gap(14),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF1E293B).withOpacity(0.5) : const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
                          ),
                          child: Text(
                            description,
                            style: TextStyle(
                              fontSize: 11.5,
                              height: 1.45,
                              color: isDark ? Colors.white70 : const Color(0xFF475569),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              // ==========================================
              // 3. SLEEK MICRO-TRUST CAPSULE BAR
              // ==========================================
              SliverToBoxAdapter(
                child: Container(
                  margin: const EdgeInsets.only(top: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    child: Row(
                      children: [
                        // Location & Map Directions Pill
                        GestureDetector(
                          onTap: () => _openGoogleMaps(latitude, longitude, addressDetails),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF0F172A) : Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.location_on_rounded, size: 13, color: ServoraColors.emerald600),
                                const Gap(5),
                                Text(
                                  landmark.isNotEmpty ? '$addressDetails ($landmark)' : addressDetails,
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                                const Gap(5),
                                const Text('➔ Map', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                              ],
                            ),
                          ),
                        ),
                        const Gap(8),

                        // Storefront Photo Pill (Opens Lightbox)
                        if (storefrontPhotoUrl.isNotEmpty) ...[
                          GestureDetector(
                            onTap: () => ServoraImageLightbox.show(context, title: '$name Storefront', images: [storefrontPhotoUrl]),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF0F172A) : Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.storefront_rounded, size: 13, color: Color(0xFFD97706)),
                                  Gap(5),
                                  Text('Workshop Photo 📸', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                          ),
                          const Gap(8),
                        ],

                        // Delivery & Fulfillment Pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF0F172A) : Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.local_shipping_rounded, size: 13, color: ServoraColors.emerald600),
                              Gap(5),
                              Text('Local Delivery & Pickup Available 📦', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                        const Gap(8),

                        // Buyer Protection Escrow Pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF0F172A) : Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.shield_rounded, size: 13, color: Color(0xFF2563EB)),
                              Gap(5),
                              Text('Escrow Protected 🛡️', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // ==========================================
              // 4. SEARCH & VIEW MODE SWITCHER BAR
              // ==========================================
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(14, 14, 14, 8),
                  child: Row(
                    children: [
                      // Search Bar
                      Expanded(
                        child: Container(
                          height: 40,
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF0F172A) : Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
                          ),
                          child: TextField(
                            controller: _searchController,
                            onChanged: (val) => setState(() => _searchQuery = val),
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                            decoration: InputDecoration(
                              hintText: 'Search items in $name...',
                              hintStyle: TextStyle(fontSize: 11.5, color: isDark ? Colors.white38 : Colors.grey[500]),
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
                              contentPadding: const EdgeInsets.symmetric(vertical: 9),
                            ),
                          ),
                        ),
                      ),
                      const Gap(8),

                      // View Mode Switcher: Rails (Sideways) vs Grid (All)
                      GestureDetector(
                        onTap: () => setState(() => _isCategoryRailsView = !_isCategoryRailsView),
                        child: Container(
                          height: 40,
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: _isCategoryRailsView ? ServoraColors.emerald600.withOpacity(0.12) : (isDark ? const Color(0xFF0F172A) : Colors.white),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: _isCategoryRailsView ? ServoraColors.emerald600 : (isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _isCategoryRailsView ? Icons.view_carousel_rounded : Icons.grid_view_rounded,
                                size: 15,
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

              // ==========================================
              // 5. DYNAMIC CATEGORY NAVIGATION TABS
              // ==========================================
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    child: Row(
                      children: [
                        _buildNavPill('all', 'All Highlights', isDark),
                        if (productsList.isNotEmpty) _buildNavPill('shop', 'Shop (${productsList.length})', isDark),
                        if (rentalsList.isNotEmpty) _buildNavPill('rentals', 'Rentals (${rentalsList.length})', isDark),
                        if (servicesList.isNotEmpty) _buildNavPill('services', 'Services (${servicesList.length})', isDark),
                        _buildNavPill('about', 'About & Hours', isDark),
                        _buildNavPill('reviews', 'Reviews ($reviewsCount)', isDark),
                      ],
                    ),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: Gap(8)),

              // ==========================================
              // 6. ADAPTIVE CATALOG CONTENT DISPLAY
              // ==========================================
              if (_activeNavSection == 'about') ...[
                _buildAboutAndHoursSection(data, isDark, openNow, latitude, longitude, addressDetails),
              ] else if (_activeNavSection == 'reviews') ...[
                _buildReviewsSection(data, reviewsList, isDark),
              ] else if (_searchQuery.trim().isNotEmpty || !_isCategoryRailsView || _activeNavSection == 'shop') ...[
                // GRID VIEW OR SEARCH RESULTS
                if (_activeNavSection == 'shop' || _activeNavSection == 'all') ...[
                  _buildProductsGrid(filteredProducts, data, name, phone, whatsapp, zone, isDark),
                ],
                if (_activeNavSection == 'rentals' || (_activeNavSection == 'all' && filteredRentals.isNotEmpty)) ...[
                  _buildRentalsList(filteredRentals, name, whatsapp, phone, addressDetails, isDark),
                ],
                if (_activeNavSection == 'services' || (_activeNavSection == 'all' && filteredServices.isNotEmpty)) ...[
                  _buildServicesList(filteredServices, name, whatsapp, phone, isDark),
                ],
              ] else ...[
                // ==========================================
                // ULTRA-MODERN HORIZONTAL CATEGORY RAILS VIEW
                // ==========================================

                // RAIL 1: FEATURED PRODUCTS CAROUSEL
                if (productsList.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.local_fire_department_rounded, size: 16, color: Color(0xFFEF4444)),
                              Gap(6),
                              Text('FEATURED HARVEST & BEST SELLERS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.3)),
                            ],
                          ),
                          GestureDetector(
                            onTap: () => setState(() => _activeNavSection = 'shop'),
                            child: const Text('See All ➔', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: 300,
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

                // RAIL 2: MACHINERY & TOOL RENTALS CAROUSEL
                if (rentalsList.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 6, 16, 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.handyman_rounded, size: 15, color: Color(0xFFD97706)),
                              Gap(6),
                              Text('MACHINERY & TOOL RENTALS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.3)),
                            ],
                          ),
                          GestureDetector(
                            onTap: () => setState(() => _activeNavSection = 'rentals'),
                            child: const Text('See All ➔', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: 225,
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
                            child: _buildHorizontalRentalCard(r, isDark, name, whatsapp, phone, addressDetails),
                          );
                        },
                      ),
                    ),
                  ),
                  const SliverToBoxAdapter(child: Gap(16)),
                ],

                // RAIL 3: TRADE & ARTISAN SERVICES CAROUSEL
                if (servicesList.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 6, 16, 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.build_circle_rounded, size: 15, color: ServoraColors.emerald600),
                              Gap(6),
                              Text('SPECIALIZED TRADE SERVICES', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.3)),
                            ],
                          ),
                          GestureDetector(
                            onTap: () => setState(() => _activeNavSection = 'services'),
                            child: const Text('See All ➔', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: 225,
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
                            child: _buildHorizontalServiceCard(s, isDark, name, whatsapp, phone),
                          );
                        },
                      ),
                    ),
                  ),
                  const SliverToBoxAdapter(child: Gap(16)),
                ],

                // VERTICAL ALL GOODS GRID SECTION
                if (productsList.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                      child: Row(
                        children: [
                          const Icon(Icons.inventory_2_rounded, size: 15, color: ServoraColors.emerald600),
                          const Gap(6),
                          Text('ALL STORE GOODS & PRODUCE (${productsList.length})', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.3)),
                        ],
                      ),
                    ),
                  ),
                  _buildProductsGrid(productsList, data, name, phone, whatsapp, zone, isDark),
                ],
              ],

              const SliverToBoxAdapter(child: SizedBox(height: 70)),
            ],
          ),
        ),
      ),
    );
  }

  // ==========================================
  // HELPER WIDGETS
  // ==========================================
  Widget _buildNavPill(String id, String label, bool isDark) {
    final isSel = _activeNavSection == id;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: GestureDetector(
        onTap: () => setState(() => _activeNavSection = id),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: isSel ? ServoraColors.emerald600 : (isDark ? const Color(0xFF0F172A) : Colors.white),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSel ? ServoraColors.emerald600 : (isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: isSel ? Colors.white : (isDark ? Colors.white70 : Colors.grey[700]),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFrostedCircleButton({
    required IconData icon,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.4),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white24, width: 0.8),
          ),
          child: IconButton(
            icon: Icon(icon, color: Colors.white, size: 18),
            onPressed: onTap,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ),
      ),
    );
  }

  Widget _buildActionIconPill({
    required IconData icon,
    required String tooltip,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(11),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
        ),
        child: Icon(icon, size: 18, color: isDark ? Colors.white : const Color(0xFF0F172A)),
      ),
    );
  }

  Widget _buildProductsGrid(List items, Map<String, dynamic> data, String name, String phone, String whatsapp, String zone, bool isDark) {
    if (items.isEmpty) {
      return const SliverToBoxAdapter(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: Center(child: Text('No goods found.', style: TextStyle(fontSize: 12, color: Colors.grey))),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      sliver: SliverToBoxAdapter(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  for (int i = 0; i < items.length; i += 2)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _buildStorefrontProductCard(
                        context: context,
                        p: items[i] is Map ? Map<String, dynamic>.from(items[i]) : <String, dynamic>{},
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
                  for (int i = 1; i < items.length; i += 2)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _buildStorefrontProductCard(
                        context: context,
                        p: items[i] is Map ? Map<String, dynamic>.from(items[i]) : <String, dynamic>{},
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
    );
  }

  Widget _buildRentalsList(List items, String name, String whatsapp, String phone, String address, bool isDark) {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => _buildRentalCard(items[index], isDark, name, whatsapp, phone, address),
          childCount: items.length,
        ),
      ),
    );
  }

  Widget _buildServicesList(List items, String name, String whatsapp, String phone, bool isDark) {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => _buildServiceCard(items[index], isDark, name, whatsapp, phone),
          childCount: items.length,
        ),
      ),
    );
  }

  Widget _buildAboutAndHoursSection(Map<String, dynamic> data, bool isDark, bool openNow, double? lat, double? lng, String address) {
    final Map<String, dynamic> hours = data['businessHours'] is Map ? Map<String, dynamic>.from(data['businessHours']) : {};
    final days = [
      {'key': 'monday', 'label': 'Monday'},
      {'key': 'tuesday', 'label': 'Tuesday'},
      {'key': 'wednesday', 'label': 'Wednesday'},
      {'key': 'thursday', 'label': 'Thursday'},
      {'key': 'friday', 'label': 'Friday'},
      {'key': 'saturday', 'label': 'Saturday'},
      {'key': 'sunday', 'label': 'Sunday'},
    ];

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Business Operating Hours
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.schedule_rounded, size: 16, color: ServoraColors.emerald600),
                          Gap(6),
                          Text('BUSINESS OPERATING HOURS', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, letterSpacing: 0.3)),
                        ],
                      ),
                      Text(
                        openNow ? '🟢 Open Now' : '🔴 Closed Now',
                        style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: openNow ? ServoraColors.emerald600 : Colors.redAccent),
                      ),
                    ],
                  ),
                  const Gap(12),
                  const Divider(height: 1),
                  const Gap(10),
                  for (final d in days) ...[
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(d['label']!, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : Colors.grey[800])),
                          Text(
                            (() {
                              if (!hours.containsKey(d['key'])) return '08:00 AM - 06:00 PM';
                              final info = hours[d['key']];
                              if (info is Map && info['closed'] == true) return 'Closed';
                              if (info is Map && info['open'] != null) return '${info['open']} - ${info['close']}';
                              return '08:00 AM - 06:00 PM';
                            })(),
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.bold,
                              color: (() {
                                if (hours.containsKey(d['key']) && hours[d['key']]['closed'] == true) return Colors.redAccent;
                                return isDark ? Colors.white60 : Colors.grey[700];
                              })(),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const Gap(14),

            // Location & Map Navigation Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.location_on_rounded, size: 16, color: ServoraColors.emerald600),
                      Gap(6),
                      Text('STORE LOCATION & ACCESS', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, letterSpacing: 0.3)),
                    ],
                  ),
                  const Gap(8),
                  Text(address, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                  const Gap(12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ServoraColors.emerald600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      icon: const Icon(Icons.navigation_rounded, size: 15),
                      label: const Text('Open in Google Maps (Live GPS Directions)', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                      onPressed: () => _openGoogleMaps(lat, lng, address),
                    ),
                  ),
                ],
              ),
            ),
            const Gap(14),

            // Store Policies & Trust
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.verified_user_rounded, size: 16, color: Color(0xFF2563EB)),
                      Gap(6),
                      Text('SERVORA BUYER PROTECTION & POLICIES', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, letterSpacing: 0.3)),
                    ],
                  ),
                  const Gap(10),
                  Text(
                    '• Funds Held in Vault: Payments made via Servora Escrow MoMo are safely held in vault until you confirm receipt of goods or service completion.\n'
                    '• Return Policy: Damaged or non-conforming items can be rejected upon courier dispatch inspection.\n'
                    '• Verified Credentials: This merchant has submitted official identification and operational details for customer safety.',
                    style: TextStyle(fontSize: 11.5, height: 1.5, color: isDark ? Colors.white70 : Colors.grey[800]),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewsSection(Map<String, dynamic> data, List reviews, bool isDark) {
    final double rating = (data['ratingAverage'] != null) ? double.tryParse(data['ratingAverage'].toString()) ?? 5.0 : 5.0;
    final String name = data['businessName'] ?? data['name'] ?? 'Store';

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Rating Summary & Write Review Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 24, color: Color(0xFFF59E0B)),
                          const Gap(4),
                          Text('$rating', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
                          const Text(' / 5.0', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                      Text('${reviews.length} customer ratings', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                    ],
                  ),
                  const Spacer(),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ServoraColors.emerald600,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.rate_review_rounded, size: 14),
                    label: const Text('Write Review', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                    onPressed: () => StorefrontReviewModal.show(
                      context: context,
                      businessName: name,
                      businessSlug: widget.slug,
                      targetUserId: data['userId'],
                      onReviewSubmitted: () => _loadStorefront(forceRefresh: true),
                    ),
                  ),
                ],
              ),
            ),
            const Gap(14),

            // Reviews List
            if (reviews.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 32),
                child: Center(
                  child: Column(
                    children: [
                      const Icon(Icons.star_outline_rounded, size: 36, color: Colors.grey),
                      const Gap(8),
                      const Text('No reviews posted yet.', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      const Gap(4),
                      Text('Be the first verified customer to leave feedback for $name!', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                    ],
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: reviews.length,
                separatorBuilder: (_, __) => const Gap(10),
                itemBuilder: (context, index) {
                  final r = reviews[index];
                  final rRating = r['rating'] ?? 5;
                  final rUser = r['userName'] ?? 'Verified Buyer';
                  final rComment = r['comment'] ?? '';

                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF0F172A) : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 14,
                                  backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
                                  child: Text(rUser[0].toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                                ),
                                const Gap(8),
                                Text(rUser, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                const Gap(6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                  decoration: BoxDecoration(color: ServoraColors.emerald600.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                                  child: const Text('Verified', style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w800, color: ServoraColors.emerald600)),
                                ),
                              ],
                            ),
                            Row(
                              children: List.generate(5, (sIdx) {
                                return Icon(
                                  sIdx < rRating ? Icons.star_rounded : Icons.star_outline_rounded,
                                  size: 13,
                                  color: const Color(0xFFF59E0B),
                                );
                              }),
                            ),
                          ],
                        ),
                        const Gap(8),
                        Text(rComment, style: TextStyle(fontSize: 11.5, height: 1.4, color: isDark ? Colors.white70 : Colors.grey[800])),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildHorizontalRentalCard(dynamic r, bool isDark, String name, String whatsapp, String phone, String address) {
    final rImages = _parseImagesList(r['images']);
    final currentImg = rImages.isNotEmpty ? rImages[0] : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80';
    final dailyRate = r['dailyRate'] ?? 0;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            child: SizedBox(
              height: 105,
              width: double.infinity,
              child: CachedNetworkImage(
                imageUrl: currentImg,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => Container(color: Colors.amber.withOpacity(0.2)),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(9),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  r['title'] ?? 'Rental Tool',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const Gap(2),
                Text(
                  'GH₵ $dailyRate / day',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFFD97706)),
                ),
                const Gap(6),
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
                    onPressed: () => StorefrontRentalModal.show(
                      context: context,
                      rental: r is Map ? Map<String, dynamic>.from(r) : {},
                      businessName: name,
                      businessSlug: widget.slug,
                      businessPhone: phone,
                      businessWhatsApp: whatsapp,
                      businessAddress: address,
                    ),
                    child: const Text('Reserve ➔', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHorizontalServiceCard(dynamic s, bool isDark, String name, String whatsapp, String phone) {
    final sPhotos = _parseImagesList(s['portfolioPhotos'] ?? s['images']);
    final currentImg = sPhotos.isNotEmpty ? sPhotos[0] : 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80';

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            child: SizedBox(
              height: 105,
              width: double.infinity,
              child: CachedNetworkImage(
                imageUrl: currentImg,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => Container(color: ServoraColors.emerald600.withOpacity(0.2)),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(9),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  s['name'] ?? s['serviceName'] ?? 'Artisan Service',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const Gap(2),
                Text(
                  s['startingPrice'] != null ? 'From GH₵ ${s['startingPrice']}' : 'Custom Estimate',
                  style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
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
                      elevation: 0,
                    ),
                    onPressed: () => StorefrontBookingModal.show(
                      context: context,
                      service: s is Map ? Map<String, dynamic>.from(s) : {},
                      businessName: name,
                      businessSlug: widget.slug,
                      businessPhone: phone,
                      businessWhatsApp: whatsapp,
                    ),
                    child: const Text('Book / Quote ➔', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRentalCard(dynamic r, bool isDark, String name, String whatsapp, String phone, String address) {
    final rImages = _parseImagesList(r['images']);
    final currentImg = rImages.isNotEmpty ? rImages[0] : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
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
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.handyman_rounded, size: 14),
                      label: const Text('Reserve Now', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      onPressed: () => StorefrontRentalModal.show(
                        context: context,
                        rental: r is Map ? Map<String, dynamic>.from(r) : {},
                        businessName: name,
                        businessSlug: widget.slug,
                        businessPhone: phone,
                        businessWhatsApp: whatsapp,
                        businessAddress: address,
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

  Widget _buildServiceCard(dynamic s, bool isDark, String name, String whatsapp, String phone) {
    final sPhotos = _parseImagesList(s['portfolioPhotos'] ?? s['images']);
    final currentImg = sPhotos.isNotEmpty ? sPhotos[0] : '';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (currentImg.isNotEmpty)
            GestureDetector(
              onTap: () => ServoraImageLightbox.show(
                context,
                title: s['name'] ?? s['serviceName'] ?? 'Service Portfolio',
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
                Text(s['name'] ?? s['serviceName'] ?? 'Artisan Service', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
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
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.send_rounded, size: 13),
                      label: const Text('Book / Quote', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      onPressed: () => StorefrontBookingModal.show(
                        context: context,
                        service: s is Map ? Map<String, dynamic>.from(s) : {},
                        businessName: name,
                        businessSlug: widget.slug,
                        businessPhone: phone,
                        businessWhatsApp: whatsapp,
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
          color: isDark ? const Color(0xFF0F172A) : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.25 : 0.04),
              blurRadius: 10,
              offset: const Offset(0, 3),
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
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
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
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444),
                        borderRadius: BorderRadius.circular(7),
                        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                      ),
                      child: Text(
                        '$discountPct% OFF',
                        style: const TextStyle(fontSize: 8.5, color: Colors.white, fontWeight: FontWeight.w900),
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
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.75),
                        borderRadius: BorderRadius.circular(7),
                      ),
                      child: Text(
                        pImages.length > 1 ? '📸 ${pImages.length}' : '🔍 Zoom',
                        style: const TextStyle(fontSize: 8.5, color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // Product Details Body
            Padding(
              padding: const EdgeInsets.all(9),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (p['category'] != null && p['category'].toString().isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(bottom: 3),
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                      decoration: BoxDecoration(
                        color: ServoraColors.emerald600.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        p['category'].toString().toUpperCase(),
                        style: const TextStyle(
                          fontSize: 7.5,
                          fontWeight: FontWeight.w900,
                          color: ServoraColors.emerald600,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ),

                  Text(
                    p['title'] ?? 'Product Listing',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, height: 1.2),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Gap(4),

                  // Price Row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        'GH₵ ${price.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
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
                  const Gap(8),

                  // Action Buttons: + Add to Bag & Buy on WhatsApp
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ServoraColors.emerald600,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 6),
                            minimumSize: Size.zero,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            elevation: 0,
                          ),
                          onPressed: () => _addToCart(p),
                          child: const Text('+ Add to Bag', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const Gap(4),
                      GestureDetector(
                        onTap: () => WhatsAppHelper.openWhatsApp(
                          phone: whatsapp,
                          message: "Hello $name, I want to buy '${p['title']}' listed on your Servora storefront.",
                        ),
                        child: Container(
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF25D366).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFF25D366).withOpacity(0.3)),
                          ),
                          child: const Icon(Icons.chat_bubble_rounded, size: 14, color: Color(0xFF25D366)),
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
  }
}
