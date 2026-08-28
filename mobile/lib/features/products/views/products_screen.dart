import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/servora_dropdown_sheet.dart';
import '../../../shared/widgets/servora_shimmer_skeleton.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../../core/services/marketplace_api_service.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  String _selectedCategory = 'All';
  String _selectedZone = 'All Northern Ghana';
  bool _isLoading = false;
  List<Map<String, dynamic>> _apiProducts = [];

  final List<String> _categories = [
    'All',
    'Solar & Tech',
    'Fugu Smocks',
    'Heavy Tools',
    'Agribusiness',
    'Auto Parts',
  ];

  final List<Map<String, dynamic>> _productsList = [
    {
      'id': 'p-1',
      'title': '300W Monocrystalline Solar Panel & Inverter Bundle',
      'category': 'Solar & Tech',
      'price': 2400.0,
      'originalPrice': 3000.0,
      'location': 'Sakasaka, Tamale',
      'seller': 'Kwame Electrical',
      'sellerSlug': 'kwame-electrical-tamale',
      'providerSlug': 'kwame-electrical-tamale',
      'rating': 4.9,
      'phone': '+233244889900',
      'escrow': true,
      'image': 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80',
      'description':
          'Complete 300W Monocrystalline Solar System kit including pure sine wave inverter, MPPT charge controller, heavy-duty mounting rails, and MC4 cabling. Ideal for homes and shops across Tamale and Northern Region to beat power cuts.\n\n• Warranty: 2 Years Manufacturers Guarantee\n• Delivery: Same-Day Installation Available in Sakasaka, Choggu, and Nyohini.',
    },
    {
      'id': 'p-2',
      'title': 'Handwoven Royal Dagbon Fugu (Heavy Thread Smock)',
      'category': 'Fugu Smocks',
      'price': 850.0,
      'originalPrice': 1000.0,
      'location': 'Nyohini, Tamale',
      'seller': 'Northern Authentic Fugu',
      'sellerSlug': 'northern-grace-fugu-tamale',
      'providerSlug': 'northern-grace-fugu-tamale',
      'rating': 5.0,
      'phone': '+233501234567',
      'escrow': true,
      'image': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80',
      'description':
          'Authentic 100% handwoven Northern Ghana Dagbon Royal Fugu smock crafted with heavy traditional cotton thread. Tailored for chieftaincy ceremonies, weddings, and formal occasions.\n\n• Size: XL (Custom sizing on request)\n• Origin: Handwoven in Nyohini, Tamale',
    },
    {
      'id': 'p-3',
      'title': 'DeWalt Heavy Duty Rotary Hammer Power Drill',
      'category': 'Heavy Tools',
      'price': 1200.0,
      'originalPrice': 1500.0,
      'location': 'Choggu, Tamale',
      'seller': 'Salifu Hardware',
      'sellerSlug': 'fuseini-phone-repair-sakasaka',
      'providerSlug': 'fuseini-phone-repair-sakasaka',
      'rating': 4.8,
      'phone': '+233201122334',
      'escrow': true,
      'image': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
      'description':
          'DeWalt 800W corded SDS-Plus Rotary Hammer drill for concrete, stone, and masonry work. Comes with SDS drill bits set, depth gauge, and heavy carrying case.\n\n• Condition: Brand New in Box\n• Warranty: 6 Months Local Repair Warranty',
    },
    {
      'id': 'p-4',
      'title': 'Organic Hybrid Maize Seeds (50kg Bag)',
      'category': 'Agribusiness',
      'price': 320.0,
      'originalPrice': 400.0,
      'location': 'Bolgatanga Central',
      'seller': 'Upper East Farmers Guild',
      'sellerSlug': 'savannah-fresh-farms',
      'providerSlug': 'savannah-fresh-farms',
      'rating': 4.7,
      'phone': '+233240000000',
      'escrow': true,
      'image': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80',
      'description': 'High yield certified organic hybrid maize seeds packaged for Northern Ghana soil and climate conditions.',
    },
  ];

  @override
  void initState() {
    super.initState();
    _fetchLiveProducts();
  }

  Future<void> _fetchLiveProducts() async {
    setState(() => _isLoading = true);
    final results = await MarketplaceApiService.fetchProducts();
    if (mounted && results.isNotEmpty) {
      setState(() {
        _apiProducts = results.map((p) {
          final provider = p['provider'] ?? {};

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
            'title': p['title'] ?? 'Product',
            'category': p['category'] ?? 'General',
            'price': priceNum,
            'originalPrice': originalPriceNum,
            'description': p['description'] ?? 'No detailed description provided by seller.',
            'location': provider['serviceArea'] ?? 'Tamale',
            'seller': provider['businessName'] ?? 'Verified Seller',
            'sellerSlug': providerSlug,
            'providerSlug': providerSlug,
            'rating': 5.0,
            'phone': provider['user']?['phone'] ?? '+233240000000',
            'escrow': true,
            'image': mainImage,
            'images': imageList,
          };
        }).toList();
      });
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _openZonePicker() async {
    final zones = ['All Northern Ghana', 'Sakasaka', 'Nyohini', 'Choggu', 'Bolgatanga', 'Wa'];
    final result = await ServoraBottomSheetPicker.show(
      context: context,
      title: 'Filter Products Zone 📍',
      items: zones,
      selectedValue: _selectedZone,
      searchHint: 'Filter by location...',
      titleIcon: Icons.location_on_rounded,
    );

    if (result != null && mounted) {
      setState(() => _selectedZone = result);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final dataset = _apiProducts.isNotEmpty ? _apiProducts : _productsList;
    final filtered = dataset.where((p) {
      final matchesCategory = _selectedCategory == 'All' || p['category'] == _selectedCategory;
      final matchesZone = _selectedZone == 'All Northern Ghana' || p['location'].contains(_selectedZone);
      return matchesCategory && matchesZone;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Products & Supplies Marketplace 🛒'),
        actions: [
          IconButton(
            icon: const Icon(Icons.location_on_outlined, color: ServoraColors.emerald600),
            onPressed: _openZonePicker,
          ),
          IconButton(
            icon: const Icon(Icons.shield_outlined, color: ServoraColors.emerald600),
            onPressed: () => context.push('/escrow'),
          ),
        ],
      ),
      body: Column(
        children: [
          if (_isLoading)
            const LinearProgressIndicator(
              backgroundColor: Colors.transparent,
              color: ServoraColors.emerald600,
              minHeight: 2,
            ),
          // Category Filter Pills
          SizedBox(
            height: 48,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = cat == _selectedCategory;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(cat),
                    selected: isSelected,
                    selectedColor: ServoraColors.emerald600,
                    backgroundColor: isDark ? ServoraColors.darkSurface : const Color(0xFFF1F5F9),
                    labelStyle: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : (isDark ? Colors.grey[300] : Colors.black87),
                    ),
                    onSelected: (_) => setState(() => _selectedCategory = cat),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1),

          // Products Feed Grid
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('🛒', style: TextStyle(fontSize: 48)),
                        const Gap(12),
                        Text(
                          'No products found in $_selectedCategory',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  )
                : LayoutBuilder(
                    builder: (context, constraints) {
                      final double itemWidth = (constraints.maxWidth - 44) / 2;
                      final double dynamicAspectRatio = (itemWidth / 268.0).clamp(0.60, 0.68);
                      final double imgHeight = (itemWidth * 0.55).clamp(86.0, 102.0);

                      return GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: dynamicAspectRatio,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                        itemCount: filtered.length,
                        itemBuilder: (context, index) {
                          final p = filtered[index];
                          final imageUrl = p['image'] as String?;

                          final double price = (p['price'] is num) ? (p['price'] as num).toDouble() : 0.0;
                          final double? originalPrice = (p['originalPrice'] is num) ? (p['originalPrice'] as num).toDouble() : null;

                          final hasDiscount = originalPrice != null && originalPrice > price;
                          final discountPct = hasDiscount ? (((originalPrice - price) / originalPrice) * 100).round() : 0;

                          return GestureDetector(
                            onTap: () => context.push('/products/detail', extra: p),
                            child: ServoraCard(
                              padding: EdgeInsets.zero,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Stack(
                                    children: [
                                      ClipRRect(
                                        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                                        child: imageUrl != null && imageUrl.isNotEmpty
                                            ? CachedNetworkImage(
                                                imageUrl: imageUrl,
                                                height: imgHeight,
                                                width: double.infinity,
                                                fit: BoxFit.cover,
                                                placeholder: (_, __) => ServoraShimmerSkeleton(
                                                    width: double.infinity, height: imgHeight, borderRadius: 0),
                                                errorWidget: (_, __, ___) => Container(
                                                  height: imgHeight,
                                                  color: ServoraColors.emerald600.withOpacity(0.1),
                                                  child: const Center(
                                                    child: Icon(Icons.inventory_2_rounded,
                                                        size: 32, color: ServoraColors.emerald600),
                                                  ),
                                                ),
                                              )
                                            : Container(
                                                height: imgHeight,
                                                color: ServoraColors.emerald600.withOpacity(0.1),
                                                child: const Center(
                                                  child: Icon(Icons.inventory_2_rounded,
                                                      size: 32, color: ServoraColors.emerald600),
                                                ),
                                              ),
                                      ),

                                  if (hasDiscount)
                                    Positioned(
                                      top: 6,
                                      right: 6,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: ServoraColors.amberGold,
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          '$discountPct% OFF',
                                          style: const TextStyle(
                                            fontSize: 9,
                                            fontWeight: FontWeight.w900,
                                            color: Colors.black,
                                          ),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 7),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: ServoraColors.emerald600.withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        p['category'],
                                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const Gap(4),
                                    Text(
                                      p['title'],
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, height: 1.15),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const Gap(4),

                                    Wrap(
                                      crossAxisAlignment: WrapCrossAlignment.center,
                                      spacing: 6,
                                      children: [
                                        Text(
                                          'GH₵ ${price.toStringAsFixed(0)}',
                                          style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w900,
                                            color: ServoraColors.emerald600,
                                          ),
                                        ),
                                        if (hasDiscount)
                                          Text(
                                            'GH₵ ${originalPrice.toStringAsFixed(0)}',
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w600,
                                              color: Colors.grey[500],
                                              decoration: TextDecoration.lineThrough,
                                            ),
                                          ),
                                      ],
                                    ),
                                    const Gap(2),
                                    Text(
                                      '${p['seller']} • ${p['location']}',
                                      style: TextStyle(fontSize: 9, color: Colors.grey[600]),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const Gap(8),

                                    Row(
                                      children: [
                                        Expanded(
                                          child: ElevatedButton.icon(
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: ServoraColors.emerald600,
                                              foregroundColor: Colors.white,
                                              padding: const EdgeInsets.symmetric(vertical: 6),
                                              minimumSize: Size.zero,
                                            ),
                                            icon: const Icon(Icons.shopping_cart_rounded, size: 12),
                                            label: const Text('Buy', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                            onPressed: () {
                                              WhatsAppHelper.openWhatsApp(
                                                phone: p['phone'],
                                                message: 'Hello, I want to purchase "${p['title']}" listed on Servora.gh app.',
                                              );
                                            },
                                          ),
                                        ),
                                        const Gap(4),
                                        GestureDetector(
                                          onTap: () => context.push('/escrow'),
                                          child: Container(
                                            padding: const EdgeInsets.all(6),
                                            decoration: BoxDecoration(
                                              color: ServoraColors.amberLight,
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: const Icon(Icons.shield_rounded, size: 16, color: ServoraColors.amberDark),
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
                    },
                  );
                },
              ),
          ),
        ],
      ),
    );
  }
}
