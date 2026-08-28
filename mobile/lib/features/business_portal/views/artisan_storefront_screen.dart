import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
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
      'tagline': 'Verified Northern Ghana Enterprise',
      'category': 'Verified Enterprise',
      'verificationStatus': 'TIER_2_VERIFIED_ARTISAN',
      'verificationTier': 'TIER_2_VERIFIED_ARTISAN',
      'isVerified': true,
      'logoUrl': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      'bannerUrl': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80',
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
    final url = 'https://servora.vercel.app/biz/$slug';
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
                leading: const Icon(Icons.qr_code_2_rounded, color: Colors.amber),
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
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Center(child: Text(name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold), textAlign: TextAlign.center)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: ServoraColors.emerald600, width: 2),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 16, offset: const Offset(0, 4)),
                ],
              ),
              child: QrImageView(
                data: url,
                version: QrVersions.auto,
                size: 190.0,
                eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Color(0xFF0F172A)),
                dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: Color(0xFF0F172A)),
              ),
            ),
            const Gap(14),
            const Text('Scan to open verified Storefront on Servora.gh', style: TextStyle(fontSize: 11, color: Colors.grey), textAlign: TextAlign.center),
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

  void _showPromoFlyerDialog(String name, String tagline, String phone, String zone, String? logoUrl) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: const LinearGradient(
              colors: [Color(0xFF064E3B), Color(0xFF047857), Color(0xFF059669)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Image.asset('assets/images/logo.png', height: 26, fit: BoxFit.contain),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: Colors.amber, borderRadius: BorderRadius.circular(10)),
                    child: const Text('⭐ VERIFIED MERCHANT', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.black)),
                  ),
                ],
              ),
              const Gap(20),
              if (logoUrl != null && logoUrl.isNotEmpty)
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: ClipOval(
                    child: Image.network(logoUrl, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.storefront_rounded, color: ServoraColors.emerald600, size: 32)),
                  ),
                ),
              const Gap(10),
              Text(
                name,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
                textAlign: TextAlign.center,
              ),
              if (tagline.isNotEmpty) ...[
                const Gap(4),
                Text(tagline, style: const TextStyle(fontSize: 11, color: Colors.white70), textAlign: TextAlign.center),
              ],
              const Gap(16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white24),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.location_on_rounded, size: 14, color: Colors.amber),
                        const Gap(6),
                        Expanded(child: Text(zone, style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold))),
                      ],
                    ),
                    const Gap(6),
                    Row(
                      children: [
                        const Icon(Icons.phone_rounded, size: 14, color: Colors.amber),
                        const Gap(6),
                        Expanded(child: Text(phone, style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold))),
                      ],
                    ),
                  ],
                ),
              ),
              const Gap(20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF064E3B),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Close Flyer', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
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

  void _openGoogleMaps(dynamic latRaw, dynamic lngRaw, String address) async {
    final double? lat = latRaw != null ? double.tryParse(latRaw.toString()) : null;
    final double? lng = lngRaw != null ? double.tryParse(lngRaw.toString()) : null;

    final Uri url;
    if (lat != null && lng != null) {
      url = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
    } else {
      url = Uri.parse('https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent('$address Ghana')}');
    }

    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  void _makePhoneCall(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
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
    final String verificationStatus = data['verificationStatus'] ?? data['verificationTier'] ?? 'TIER_2_VERIFIED_ARTISAN';
    final String phone = data['phone'] ?? data['user']?['phone'] ?? '+233240000000';
    final String whatsapp = data['whatsappNumber'] ?? phone;
    final String zone = data['zone'] ?? data['addressDetails'] ?? 'Tamale, Northern Ghana';
    final String addressDetails = data['addressDetails'] ?? zone;
    final String landmark = data['landmark'] ?? '';
    final dynamic latitude = data['latitude'];
    final dynamic longitude = data['longitude'];

    final String description = data['description'] ?? data['aboutText'] ?? data['bio'] ?? "Verified business offering high quality products, equipment rentals, and artisan services in Northern Ghana.";

    final Map<String, dynamic> catalogs = data['catalogs'] ?? {};
    final List productsList = catalogs['products'] ?? (data['products'] is List ? data['products'] : []);
    final List rentalsList = catalogs['rentals'] ?? (data['rentals'] is List ? data['rentals'] : []);
    final List servicesList = catalogs['services'] ?? (data['services'] is List ? data['services'] : []);

    final String logoUrl = data['logoUrl'] ?? data['user']?['avatarUrl'] ?? '';
    final String bannerUrl = data['bannerUrl'] ?? '';
    final String storefrontPhotoUrl = data['storefrontPhotoUrl'] ?? '';

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF090D16) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
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
          // 1. Top Cover Banner Image
          if (bannerUrl.isNotEmpty)
            SliverToBoxAdapter(
              child: GestureDetector(
                onTap: () => ServoraImageLightbox.show(context, title: name, images: [bannerUrl]),
                child: SizedBox(
                  height: 150,
                  width: double.infinity,
                  child: Image.network(
                    bannerUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                  ),
                ),
              ),
            ),

          // 2. Identity Header Card (Logo, Name, Tagline, Badges & Action Buttons)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: isDark ? ServoraColors.darkSurface : Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
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
                    // Top Avatar & Title Stack
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Avatar / Profile Logo Image (Tap to open high-res zoom lightbox)
                        GestureDetector(
                          onTap: logoUrl.isNotEmpty
                              ? () => ServoraImageLightbox.show(context, title: name, images: [logoUrl])
                              : null,
                          child: Container(
                            width: 72,
                            height: 72,
                            decoration: BoxDecoration(
                              color: ServoraColors.emerald600.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: ServoraColors.emerald600.withOpacity(0.3), width: 1.5),
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

                        // Title, Badges & Zone
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Wrap(
                                spacing: 6,
                                runSpacing: 4,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFEF3C7),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.4)),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Text('🛡️', style: TextStyle(fontSize: 10)),
                                        const Gap(3),
                                        Text(
                                          'Verified $verificationStatus',
                                          style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFFD97706)),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
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

                    // Primary Action CTAs Row (WhatsApp, Call, QR Code, Flyer, Quote)
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
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
                          onPressed: () => _showQrDialog(name, 'https://servora.vercel.app/biz/${widget.slug}'),
                        ),
                        OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(Icons.image_rounded, size: 15, color: ServoraColors.emerald600),
                          label: const Text('Promo Flyer', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          onPressed: () => _showPromoFlyerDialog(name, tagline, phone, zone, logoUrl),
                        ),
                        OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(Icons.request_quote_rounded, size: 15, color: Color(0xFFD97706)),
                          label: const Text('Get Price Estimate', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          onPressed: () => _showPriceEstimateDialog(name, whatsapp),
                        ),
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

          // 3. Physical Storefront & Workshop Photo Showcase (Exactly like Web)
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
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [Colors.transparent, Colors.black.withOpacity(0.75)],
                                  ),
                                ),
                              ),
                            ),
                            Positioned(
                              left: 12,
                              bottom: 12,
                              right: 90,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on_rounded, size: 12, color: ServoraColors.emerald500),
                                      const Gap(3),
                                      Expanded(
                                        child: Text(
                                          addressDetails,
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (landmark.isNotEmpty) ...[
                                    const Gap(2),
                                    Text('Landmark: $landmark', style: const TextStyle(fontSize: 9.5, color: Colors.white70), maxLines: 1, overflow: TextOverflow.ellipsis),
                                  ],
                                ],
                              ),
                            ),
                            Positioned(
                              right: 12,
                              bottom: 12,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.9),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.zoom_in_rounded, size: 13, color: Colors.black),
                                    Gap(3),
                                    Text('Full Photo', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black)),
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

          // 4. Location & Live Google Maps Directions Section (Exactly like Web)
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
                          padding: const EdgeInsets.symmetric(vertical: 11),
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

          // 5. 3-Tab Segment Selector (Products, Equipment Rentals, Services Offered)
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

          // 6. Tab Content Area
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
                    childAspectRatio: 0.60,
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

                      final double price = (p['price'] is num) ? (p['price'] as num).toDouble() : (double.tryParse(p['price']?.toString() ?? '0') ?? 0.0);
                      final double? originalPrice = (p['originalPrice'] != null) ? double.tryParse(p['originalPrice'].toString()) : null;
                      final hasDiscount = originalPrice != null && originalPrice > price;
                      final discountPct = hasDiscount ? (((originalPrice - price) / originalPrice) * 100).round() : 0;

                      return Container(
                        decoration: BoxDecoration(
                          color: isDark ? ServoraColors.darkSurface : Colors.white,
                          borderRadius: BorderRadius.circular(18),
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
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                                    child: AspectRatio(
                                      aspectRatio: 1.15,
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
                                  if (hasDiscount)
                                    Positioned(
                                      top: 6,
                                      left: 6,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.redAccent,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text('$discountPct% OFF', style: const TextStyle(fontSize: 8.5, color: Colors.white, fontWeight: FontWeight.w900)),
                                      ),
                                    ),
                                  Positioned(
                                    bottom: 6,
                                    right: 6,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.black.withOpacity(0.7),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        pImages.length > 1 ? '📸 ${pImages.length} Photos' : '🔍 Zoom',
                                        style: const TextStyle(fontSize: 8.5, color: Colors.white, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Multi-Image Mini Thumbnails Strip
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
                                  Row(
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
                                            fontSize: 9.5,
                                            decoration: TextDecoration.lineThrough,
                                            color: isDark ? Colors.white38 : Colors.grey[500],
                                          ),
                                        ),
                                      ],
                                    ],
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
                      );
                    },
                    childCount: productsList.length,
                  ),
                ),
              ),
          ] else if (_activeTabIndex == 1) ...[
            // EQUIPMENT RENTALS TAB
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
                    },
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
}
