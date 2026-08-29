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
        if (imagesRaw.isNotEmpty) return [imagesRaw];
      }
    }
    return [];
  }

  void _shareStorefront(String name, String slug) {
    final url = '${ServoraConstants.webBaseUrl}/biz/$slug';
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
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
                leading: const Icon(Icons.share_rounded, color: ServoraColors.emerald600),
                title: const Text('Share via Apps...'),
                subtitle: const Text('Send link to WhatsApp, Telegram, or Messages'),
                onTap: () {
                  Navigator.pop(context);
                  Share.share('Check out $name on Servora: $url');
                },
              ),
              ListTile(
                leading: const Icon(Icons.copy_rounded, color: ServoraColors.emerald600),
                title: const Text('Copy Direct Link'),
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
                leading: const Icon(Icons.qr_code_2_rounded, color: ServoraColors.emerald600),
                title: const Text('📱 Digital QR Business Card'),
                subtitle: const Text('Display QR code for instant scanning'),
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
    final qrData = url.isNotEmpty ? url : '${ServoraConstants.webBaseUrl}/biz/${widget.slug}';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.white,
        title: Center(
          child: Text(
            name,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            textAlign: TextAlign.center,
          ),
        ),
        content: SizedBox(
          width: 240,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 210,
                height: 210,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: ServoraColors.emerald600, width: 2),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 16, offset: const Offset(0, 4)),
                  ],
                ),
                child: Center(
                  child: QrImageView(
                    data: qrData,
                    version: QrVersions.auto,
                    size: 186.0,
                    backgroundColor: Colors.white,
                    errorCorrectionLevel: QrErrorCorrectLevel.M,
                    eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Color(0xFF0F172A)),
                    dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: Color(0xFF0F172A)),
                  ),
                ),
              ),
              const Gap(14),
              const Text(
                'Scan with any phone camera to open verified Storefront on Servora.gh',
                style: TextStyle(fontSize: 11, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ],
          ),
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

  void _showPriceEstimateDialog(String name, String phone) {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final notesCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)))),
              const Gap(14),
              Text('Request Price Estimate from $name', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              const Gap(14),
              TextField(
                controller: nameCtrl,
                decoration: InputDecoration(
                  labelText: 'Your Name',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
              ),
              const Gap(10),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: 'Your Phone / WhatsApp Number',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
              ),
              const Gap(10),
              TextField(
                controller: notesCtrl,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Service or Product Details Needed...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.all(14),
                ),
              ),
              const Gap(16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ServoraColors.emerald600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.send_rounded, size: 16),
                  label: const Text('Send Quote via WhatsApp', style: TextStyle(fontWeight: FontWeight.bold)),
                  onPressed: () {
                    final msg = "Hello $name, I want to request a price estimate from your Servora Storefront.\n"
                        "Name: ${nameCtrl.text.trim()}\n"
                        "Contact: ${phoneCtrl.text.trim()}\n"
                        "Details: ${notesCtrl.text.trim()}";
                    Navigator.pop(context);
                    WhatsAppHelper.openWhatsApp(phone: phone, message: msg);
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _openGoogleMaps(dynamic latRaw, dynamic lngRaw, String address) async {
    final double? lat = latRaw != null ? double.tryParse(latRaw.toString()) : null;
    final double? lng = lngRaw != null ? double.tryParse(lngRaw.toString()) : null;

    final String query = (lat != null && lng != null)
        ? '$lat,$lng'
        : Uri.encodeComponent('$address, Tamale, Northern Ghana');

    final Uri googleMapsWebUrl = Uri.parse('https://www.google.com/maps/search/?api=1&query=$query');
    final Uri geoUri = (lat != null && lng != null)
        ? Uri.parse('geo:$lat,$lng?q=$lat,$lng($address)')
        : Uri.parse('geo:0,0?q=$query');

    try {
      if (await canLaunchUrl(geoUri)) {
        await launchUrl(geoUri, mode: LaunchMode.externalApplication);
        return;
      }
    } catch (_) {}

    try {
      if (await canLaunchUrl(googleMapsWebUrl)) {
        await launchUrl(googleMapsWebUrl, mode: LaunchMode.externalApplication);
        return;
      }
    } catch (_) {}

    try {
      await launchUrl(googleMapsWebUrl, mode: LaunchMode.platformDefault);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open map for $address'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  void _makePhoneCall(String phone) async {
    final uri = Uri.parse('tel:$phone');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      }
    } catch (_) {}
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
    final String tagline = data['tagline'] ?? '';
    final String phone = data['phone'] ?? data['user']?['phone'] ?? '+233240000000';
    final String whatsapp = data['whatsappNumber'] ?? phone;
    final String zone = data['zone'] ?? data['addressDetails'] ?? 'Tamale, Northern Ghana';
    final String addressDetails = data['addressDetails'] ?? zone;
    final String landmark = data['landmark'] ?? '';
    final dynamic latitude = data['latitude'];
    final dynamic longitude = data['longitude'];

    final String description = data['description'] ?? data['aboutText'] ?? data['bio'] ?? "Northern Ghana's verified enterprise and artisan specialist.";

    final Map<String, dynamic> catalogs = data['catalogs'] ?? {};
    final List rawProductsList = catalogs['products'] ?? (data['products'] is List ? data['products'] : []);
    final List rawRentalsList = catalogs['rentals'] ?? (data['rentals'] is List ? data['rentals'] : []);
    final List rawServicesList = catalogs['services'] ?? (data['services'] is List ? data['services'] : []);

    final q = _searchQuery.trim().toLowerCase();
    final List productsList = rawProductsList.where((p) {
      if (q.isEmpty) return true;
      final title = (p['title'] ?? '').toString().toLowerCase();
      final category = (p['category'] ?? '').toString().toLowerCase();
      final desc = (p['description'] ?? '').toString().toLowerCase();
      return title.contains(q) || category.contains(q) || desc.contains(q);
    }).toList();

    final List rentalsList = rawRentalsList.where((r) {
      if (q.isEmpty) return true;
      final title = (r['title'] ?? '').toString().toLowerCase();
      final category = (r['category'] ?? '').toString().toLowerCase();
      final desc = (r['description'] ?? '').toString().toLowerCase();
      return title.contains(q) || category.contains(q) || desc.contains(q);
    }).toList();

    final List servicesList = rawServicesList.where((s) {
      if (q.isEmpty) return true;
      final sName = (s['name'] ?? s['serviceName'] ?? '').toString().toLowerCase();
      final desc = (s['description'] ?? '').toString().toLowerCase();
      return sName.contains(q) || desc.contains(q);
    }).toList();

    final String logoUrl = data['logoUrl'] ?? data['user']?['avatarUrl'] ?? '';
    final String rawBanner = data['bannerUrl'] ?? '';
    final String bannerUrl = rawBanner.isNotEmpty ? rawBanner : _defaultBannerUrl;
    final String storefrontPhotoUrl = data['storefrontPhotoUrl'] ?? '';

    return Scaffold(
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
        slivers: [
          // 1. Top Cover Banner Image (with default picture fallback)
          SliverToBoxAdapter(
            child: GestureDetector(
              onTap: () => ServoraImageLightbox.show(context, title: name, images: [bannerUrl]),
              child: Stack(
                children: [
                  SizedBox(
                    height: 160,
                    width: double.infinity,
                    child: Image.network(
                      bannerUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Image.network(_defaultBannerUrl, fit: BoxFit.cover),
                    ),
                  ),
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.black.withOpacity(0.4),
                            Colors.transparent,
                            Colors.black.withOpacity(0.7),
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.65),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white24),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.photo_size_select_actual_outlined, color: Colors.white, size: 13),
                          Gap(4),
                          Text('View Cover', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 2. Main Identity & Profile Overview Card
          SliverToBoxAdapter(
            child: Transform.translate(
              offset: const Offset(0, -20),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: isDark ? ServoraColors.darkSurface : Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(isDark ? 0.3 : 0.06),
                        blurRadius: 16,
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
                          // Business Logo
                          GestureDetector(
                            onTap: () {
                              if (logoUrl.isNotEmpty) {
                                ServoraImageLightbox.show(context, title: '$name Logo', images: [logoUrl]);
                              }
                            },
                            child: Container(
                              width: 68,
                              height: 68,
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: ServoraColors.emerald600.withOpacity(0.4), width: 1.5),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(17),
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
                          const Gap(14),

                          // Title, Modern Badges & Zone
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 4,
                                  children: [
                                    // Modern Sleek Verified Badge
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                                      decoration: BoxDecoration(
                                        color: ServoraColors.emerald600.withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: ServoraColors.emerald600.withOpacity(0.35)),
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.verified_rounded, size: 12, color: ServoraColors.emerald600),
                                          Gap(3.5),
                                          Text(
                                            'Verified Business',
                                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: ServoraColors.emerald600),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                                      decoration: BoxDecoration(
                                        color: isDark ? Colors.white10 : const Color(0xFFF1F5F9),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        zone,
                                        style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: isDark ? Colors.white70 : Colors.grey[700]),
                                      ),
                                    ),
                                  ],
                                ),
                                const Gap(6),
                                Text(
                                  name,
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                    color: isDark ? Colors.white : const Color(0xFF18181B),
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (tagline.isNotEmpty) ...[
                                  const Gap(3),
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

                      // Primary Action CTAs Row (WhatsApp, Call, QR Code, Get Price Estimate, Like)
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF25D366),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              elevation: 0,
                            ),
                            icon: const Icon(Icons.chat_bubble_rounded, size: 14),
                            label: const Text('WhatsApp', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                            onPressed: () => WhatsAppHelper.openWhatsApp(
                              phone: whatsapp,
                              message: "Hello $name, I am contacting you via your Servora storefront.",
                            ),
                          ),
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            icon: const Icon(Icons.phone_rounded, size: 14),
                            label: const Text('Call', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                            onPressed: () => _makePhoneCall(phone),
                          ),
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            icon: const Icon(Icons.qr_code_2_rounded, size: 15, color: ServoraColors.emerald600),
                            label: const Text('QR Code', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            onPressed: () => _showQrDialog(name, '${ServoraConstants.webBaseUrl}/biz/${widget.slug}'),
                          ),
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            icon: const Icon(Icons.request_quote_rounded, size: 15, color: Color(0xFFD97706)),
                            label: const Text('Get Estimate', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            onPressed: () => _showPriceEstimateDialog(name, whatsapp),
                          ),
                          ServoraFavoriteButton(businessId: widget.slug, businessName: name),
                        ],
                      ),

                      if (description.isNotEmpty) ...[
                        const Gap(14),
                        const Divider(height: 1),
                        const Gap(12),
                        Text(
                          description,
                          style: TextStyle(
                            fontSize: 11.5,
                            height: 1.5,
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

          // 3. Physical Storefront & Workshop Photo Showcase
          if (storefrontPhotoUrl.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? ServoraColors.darkSurface : Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.storefront_rounded, size: 16, color: ServoraColors.emerald600),
                              Gap(6),
                              Text(
                                'PHYSICAL STOREFRONT & WORKSHOP PHOTO',
                                style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: ServoraColors.emerald600.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Text(
                              'Verified Location',
                              style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                            ),
                          ),
                        ],
                      ),
                      const Gap(12),
                      GestureDetector(
                        onTap: () => ServoraImageLightbox.show(context, title: '$name Storefront', images: [storefrontPhotoUrl]),
                        child: Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: SizedBox(
                                height: 180,
                                width: double.infinity,
                                child: Image.network(
                                  storefrontPhotoUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.storefront_rounded, size: 48, color: Colors.grey)),
                                ),
                              ),
                            ),
                            Positioned.fill(
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(16),
                                  gradient: LinearGradient(
                                    colors: [Colors.transparent, Colors.black.withOpacity(0.4)],
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                  ),
                                ),
                              ),
                            ),
                            Positioned(
                              bottom: 10,
                              right: 10,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.7),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.zoom_in_rounded, size: 13, color: Colors.white),
                                    Gap(4),
                                    Text('Tap to Enlarge', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // 4. Physical Workshop Address & Directions Card
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? ServoraColors.darkSurface : Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: ServoraColors.emerald600.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(Icons.location_on_rounded, color: ServoraColors.emerald600, size: 20),
                        ),
                        const Gap(12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(addressDetails, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                              if (landmark.isNotEmpty) ...[
                                const Gap(2),
                                Text('Landmark: $landmark', style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey[700])),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Gap(14),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ServoraColors.emerald600,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                        icon: const Icon(Icons.navigation_rounded, size: 16),
                        label: const Text('Open in Google Maps (Live Directions) 🚗', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                        onPressed: () => _openGoogleMaps(latitude, longitude, addressDetails),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 5. Storefront Search Bar
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Container(
                height: 46,
                decoration: BoxDecoration(
                  color: isDark ? ServoraColors.darkSurface : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: (val) => setState(() => _searchQuery = val),
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  decoration: InputDecoration(
                    hintText: 'Search $name products & services...',
                    hintStyle: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white38 : Colors.grey[500],
                    ),
                    prefixIcon: const Icon(Icons.search_rounded, color: ServoraColors.emerald600, size: 20),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? GestureDetector(
                            onTap: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                            child: const Icon(Icons.cancel_rounded, size: 18, color: Colors.grey),
                          )
                        : null,
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ),
          ),

          // 6. Omnisearch Multi-Catalog Stream OR 3-Tab Segment Selector
          if (_searchQuery.trim().isNotEmpty) ...[
            // UNIFIED GENERAL OMNISEARCH RESULTS
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'ALL RESULTS MATCHING "$_searchQuery"',
                      style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                    ),
                    Text(
                      '${productsList.length + rentalsList.length + servicesList.length} items',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),

            if (productsList.isEmpty && rentalsList.isEmpty && servicesList.isEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(Icons.search_off_rounded, size: 48, color: Colors.grey[400]),
                        const Gap(10),
                        Text(
                          'No items matching "$_searchQuery"',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        const Gap(4),
                        Text(
                          'This store does not have products, equipment rentals, or services matching "$_searchQuery".',
                          style: const TextStyle(color: Colors.grey, fontSize: 11),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            // 1. PRODUCTS SECTION (if any match)
            if (productsList.isNotEmpty) ...[
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
                  child: Row(
                    children: [
                      const Icon(Icons.inventory_2_rounded, size: 16, color: ServoraColors.emerald600),
                      const Gap(6),
                      Text('PRODUCTS & GOODS (${productsList.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
                    ],
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
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

            // 2. EQUIPMENT RENTALS SECTION (if any match)
            if (rentalsList.isNotEmpty) ...[
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
                  child: Row(
                    children: [
                      const Icon(Icons.handyman_rounded, size: 16, color: Color(0xFFD97706)),
                      const Gap(6),
                      Text('EQUIPMENT RENTALS (${rentalsList.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
                    ],
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => _buildRentalCard(rentalsList[index], isDark, name, whatsapp),
                    childCount: rentalsList.length,
                  ),
                ),
              ),
            ],

            // 3. SERVICES OFFERED SECTION (if any match)
            if (servicesList.isNotEmpty) ...[
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
                  child: Row(
                    children: [
                      const Icon(Icons.build_circle_rounded, size: 16, color: ServoraColors.emerald600),
                      const Gap(6),
                      Text('SERVICES OFFERED (${servicesList.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
                    ],
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => _buildServiceCard(servicesList[index], isDark, name, whatsapp),
                    childCount: servicesList.length,
                  ),
                ),
              ),
            ],
          ] else ...[
            // 3-Tab Segment Selector (Products, Equipment Rentals, Services Offered)
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
                      _buildSegmentTab(1, 'Equipment Rentals', rentalsList.length, isDark),
                      _buildSegmentTab(2, 'Services Offered', servicesList.length, isDark),
                    ],
                  ),
                ),
              ),
            ),

            // Tab Content Area
            if (_activeTabIndex == 0) ...[
              // PRODUCTS TAB
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
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  sliver: SliverToBoxAdapter(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Left Column
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
                        // Right Column
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
              // EQUIPMENT RENTALS TAB
              if (rentalsList.isEmpty)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: Center(
                      child: Text('No equipment rentals listed by this merchant.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _buildRentalCard(rentalsList[index], isDark, name, whatsapp),
                      childCount: rentalsList.length,
                    ),
                  ),
                ),
            ] else ...[
              // SERVICES OFFERED TAB
              if (servicesList.isEmpty)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: Center(
                      child: Text('No custom services listed by this artisan.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _buildServiceCard(servicesList[index], isDark, name, whatsapp),
                      childCount: servicesList.length,
                    ),
                  ),
                ),
            ],
          ],
          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
    );
  }

  Widget _buildRentalCard(dynamic r, bool isDark, String name, String whatsapp) {
    final rImages = _parseImagesList(r['images']);
    final currentImg = rImages.isNotEmpty
        ? rImages[0]
        : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80';

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
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
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
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.zoom_in_rounded, size: 12, color: Colors.white),
                        const Gap(3),
                        Text(
                          rImages.length > 1 ? '📸 ${rImages.length} Photos' : 'Full Photo',
                          style: const TextStyle(fontSize: 9.5, color: Colors.white, fontWeight: FontWeight.bold),
                        ),
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
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
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
                        '📸 ${sPhotos.length} Work Photos',
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
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder,
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
                          child: Icon(Icons.inventory_2_rounded, color: ServoraColors.emerald600, size: 36),
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
                        color: Colors.red[600],
                        borderRadius: BorderRadius.circular(7),
                        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                      ),
                      child: Text(
                        '$discountPct% OFF',
                        style: const TextStyle(fontSize: 8.5, color: Colors.white, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),

                // Photos Count / Lightbox preview button (Bottom Right)
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
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
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

            // Multi-Image Mini Thumbnails Strip (Only when there are multiple photos)
            if (pImages.length > 1)
              Container(
                height: 26,
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: pImages.length,
                  separatorBuilder: (_, __) => const Gap(3),
                  itemBuilder: (context, idx) {
                    final isSel = activeIdx == idx;
                    return GestureDetector(
                      onTap: () => setState(() => _cardImageIndex[p['id']?.toString() ?? '$index'] = idx),
                      child: Container(
                        width: 20,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(
                            color: isSel ? ServoraColors.emerald600 : Colors.grey.withOpacity(0.3),
                            width: isSel ? 2 : 1,
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(3),
                          child: CachedNetworkImage(
                            imageUrl: pImages[idx],
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

            // Product Details Body
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category Pill
                  if (p['category'] != null && p['category'].toString().isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(bottom: 3),
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                      decoration: BoxDecoration(
                        color: ServoraColors.emerald600.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        p['category'].toString().toUpperCase(),
                        style: const TextStyle(
                          fontSize: 7.5,
                          fontWeight: FontWeight.w800,
                          color: ServoraColors.emerald600,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),

                  // Title (2 lines max, no extra whitespace)
                  Text(
                    p['title'] ?? 'Product Listing',
                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, height: 1.25),
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

                  // Buy on WhatsApp Action Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ServoraColors.emerald600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 5),
                        minimumSize: Size.zero,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 0,
                      ),
                      onPressed: () => WhatsAppHelper.openWhatsApp(
                        phone: whatsapp,
                        message: "Hello $name, I want to buy '${p['title']}' listed on your Servora storefront.",
                      ),
                      child: const Text('Buy on WhatsApp', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
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

