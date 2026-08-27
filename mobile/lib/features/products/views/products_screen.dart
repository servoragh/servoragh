import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/status_badge.dart';
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
      'price': 'GH₵ 2,400.00',
      'location': 'Sakasaka, Tamale',
      'seller': 'Kwame Electrical',
      'rating': 4.9,
      'phone': '+233244889900',
      'escrow': true,
      'image': 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80',
    },
    {
      'id': 'p-2',
      'title': 'Handwoven Royal Dagbon Fugu (Heavy Thread Smock)',
      'category': 'Fugu Smocks',
      'price': 'GH₵ 850.00',
      'location': 'Nyohini, Tamale',
      'seller': 'Northern Authentic Fugu',
      'rating': 5.0,
      'phone': '+233501234567',
      'escrow': true,
      'image': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80',
    },
    {
      'id': 'p-3',
      'title': 'DeWalt Heavy Duty Rotary Hammer Power Drill',
      'category': 'Heavy Tools',
      'price': 'GH₵ 1,200.00',
      'location': 'Choggu, Tamale',
      'seller': 'Salifu Hardware',
      'rating': 4.8,
      'phone': '+233201122334',
      'escrow': true,
      'image': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
    },
    {
      'id': 'p-4',
      'title': 'Organic Hybrid Maize Seeds (50kg Bag)',
      'category': 'Agribusiness',
      'price': 'GH₵ 320.00',
      'location': 'Bolgatanga Central',
      'seller': 'Upper East Farmers Guild',
      'rating': 4.7,
      'phone': '+233240000000',
      'escrow': true,
      'image': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80',
    },
    {
      'id': 'p-5',
      'title': 'Toyota Hilux Pickup Heavy Duty Clutch Kit',
      'category': 'Auto Parts',
      'price': 'GH₵ 1,650.00',
      'location': 'Tamale Industrial',
      'seller': 'Alhassan Motors',
      'rating': 4.9,
      'phone': '+233244112233',
      'escrow': true,
      'image': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80',
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
          String? imgUrl;
          final rawImgs = p['images'];
          if (rawImgs != null) {
            if (rawImgs is List && rawImgs.isNotEmpty) {
              imgUrl = rawImgs[0].toString();
            } else if (rawImgs is String && rawImgs.startsWith('[')) {
              try {
                final parsed = jsonDecode(rawImgs) as List;
                if (parsed.isNotEmpty) imgUrl = parsed[0].toString();
              } catch (_) {}
            } else if (rawImgs is String && rawImgs.startsWith('http')) {
              imgUrl = rawImgs;
            }
          }

          return {
            'id': p['id'] ?? 'prod',
            'title': p['title'] ?? 'Product',
            'category': p['category'] ?? 'General',
            'price': 'GH₵ ${(p['price'] ?? 0).toString()}',
            'location': provider['serviceArea'] ?? 'Tamale',
            'seller': provider['businessName'] ?? 'Verified Seller',
            'rating': 5.0,
            'phone': provider['user']?['phone'] ?? '+233240000000',
            'escrow': true,
            'image': imgUrl,
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

  void _showProductDetailModal(BuildContext context, Map<String, dynamic> p) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalCtx) {
        final isDark = Theme.of(modalCtx).brightness == Brightness.dark;
        final imageUrl = p['image'] as String?;

        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(modalCtx).size.height * 0.85,
          ),
          decoration: BoxDecoration(
            color: isDark ? ServoraColors.darkBackground : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 5,
                    decoration: BoxDecoration(
                      color: Colors.grey[400],
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
                const Gap(16),
                if (imageUrl != null && imageUrl.isNotEmpty) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: CachedNetworkImage(
                      imageUrl: imageUrl,
                      height: 200,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => const ServoraShimmerSkeleton(
                          width: double.infinity, height: 200, borderRadius: 20),
                      errorWidget: (_, __, ___) => Container(
                        height: 160,
                        color: ServoraColors.emerald600.withOpacity(0.1),
                        child: const Icon(Icons.inventory_2_rounded,
                            size: 50, color: ServoraColors.emerald600),
                      ),
                    ),
                  ),
                  const Gap(16),
                ],
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: ServoraColors.emerald600.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        p['category'] ?? 'General',
                        style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: ServoraColors.emerald600),
                      ),
                    ),
                    const StatusBadge(
                      label: 'IN STOCK',
                      backgroundColor: Color(0xFFD1FAE5),
                      textColor: Color(0xFF047857),
                    ),
                  ],
                ),
                const Gap(12),
                Text(
                  p['title'] ?? 'Marketplace Item',
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.w900, height: 1.25),
                ),
                const Gap(8),
                Text(
                  p['price'] ?? 'GH₵ 0.00',
                  style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: ServoraColors.emerald600),
                ),
                const Divider(height: 30),
                ServoraCard(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
                        child: Text(
                          (p['seller'] ?? 'S')[0],
                          style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: ServoraColors.emerald600),
                        ),
                      ),
                      const Gap(12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p['seller'] ?? 'Verified Merchant',
                              style: const TextStyle(
                                  fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'Location: ${p['location']} • Verified Ghana Card',
                              style: TextStyle(
                                  fontSize: 11, color: Colors.grey[600]),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const Gap(24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF25D366),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25)),
                    ),
                    icon: const Icon(Icons.chat_rounded, size: 20),
                    label: const Text('Buy via WhatsApp Direct 💬',
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.bold)),
                    onPressed: () {
                      WhatsAppHelper.openWhatsApp(
                        phone: p['phone'] ?? '+233240000000',
                        message:
                            'Hello, I am interested in buying "${p['title']}" listed on Servora.gh app.',
                      );
                    },
                  ),
                ),
                const Gap(10),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: ServoraColors.amberDark,
                      side: const BorderSide(
                          color: ServoraColors.amberGold, width: 1.5),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25)),
                    ),
                    icon: const Icon(Icons.shield_rounded, size: 20),
                    label: const Text('Buy with Safe MoMo Escrow 🛡️',
                        style: TextStyle(
                            fontSize: 14, fontWeight: FontWeight.bold)),
                    onPressed: () {
                      Navigator.of(modalCtx).pop();
                      context.push('/escrow');
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
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
                : GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.60,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final p = filtered[index];
                      final imageUrl = p['image'] as String?;

                      return GestureDetector(
                        onTap: () => context.push('/products/detail', extra: p),
                        child: ServoraCard(
                          padding: EdgeInsets.zero,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              ClipRRect(
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                                child: imageUrl != null && imageUrl.isNotEmpty
                                    ? CachedNetworkImage(
                                        imageUrl: imageUrl,
                                        height: 110,
                                        width: double.infinity,
                                        fit: BoxFit.cover,
                                        placeholder: (_, __) => const ServoraShimmerSkeleton(
                                            width: double.infinity, height: 110, borderRadius: 0),
                                        errorWidget: (_, __, ___) => Container(
                                          height: 110,
                                          color: ServoraColors.emerald600.withOpacity(0.1),
                                          child: const Center(
                                            child: Icon(Icons.inventory_2_rounded,
                                                size: 32, color: ServoraColors.emerald600),
                                          ),
                                        ),
                                      )
                                    : Container(
                                        height: 110,
                                        color: ServoraColors.emerald600.withOpacity(0.1),
                                        child: const Center(
                                          child: Icon(Icons.inventory_2_rounded,
                                              size: 32, color: ServoraColors.emerald600),
                                        ),
                                      ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(10),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
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
                                    const Gap(6),
                                    Text(
                                      p['title'],
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, height: 1.2),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const Gap(4),
                                    Text(
                                      p['price'],
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w900,
                                        color: ServoraColors.emerald600,
                                      ),
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
                  ),
          ),
        ],
      ),
    );
  }
}
