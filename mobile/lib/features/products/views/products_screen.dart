import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/servora_dropdown_sheet.dart';
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
          };
        }).toList();
      });
    }
    if (mounted) setState(() => _isLoading = false);
  }

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
    },
  ];

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
            icon: const Icon(Icons.location_on_outlined, color: Color(0xFF059669)),
            onPressed: _openZonePicker,
          ),
          IconButton(
            icon: const Icon(Icons.shield_outlined, color: Color(0xFF059669)),
            onPressed: () => context.push('/escrow'),
          ),
        ],
      ),
      body: Column(
        children: [
          if (_isLoading)
            const LinearProgressIndicator(
              backgroundColor: Colors.transparent,
              color: Color(0xFF059669),
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
                    selectedColor: const Color(0xFF059669),
                    backgroundColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF1F5F9),
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
                        const SizedBox(height: 12),
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
                      childAspectRatio: 0.53,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final p = filtered[index];
                      return ServoraCard(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFF059669).withOpacity(0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                p['category'],
                                style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF059669)),
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
                            const SizedBox(height: 4),
                            Text(
                              '${p['seller']} • ${p['location']}',
                              style: TextStyle(fontSize: 9, color: Colors.grey[600]),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 10),
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
                                const SizedBox(width: 4),
                                GestureDetector(
                                  onTap: () => context.push('/escrow'),
                                  child: Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFEF3C7),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Icon(Icons.shield_rounded, size: 16, color: Color(0xFFB45309)),
                                  ),
                                ),
                              ],
                            ),
                          ],
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
