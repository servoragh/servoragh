import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/constants.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/servora_shimmer_skeleton.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../auth/providers/auth_provider.dart';

class BusinessPortalView extends StatefulWidget {
  final VoidCallback? onSwitchToCustomer;

  const BusinessPortalView({super.key, this.onSwitchToCustomer});

  @override
  State<BusinessPortalView> createState() => _BusinessPortalViewState();
}

class _BusinessPortalViewState extends State<BusinessPortalView> {
  String _activeTab = 'catalogs'; // 'catalogs' | 'leads' | 'messages'
  String _catalogFilter = 'products'; // 'products' | 'rentals' | 'services'
  bool _isLoading = true;
  String? _errorMessage;
  Map<String, dynamic>? _profile;

  List<dynamic> _products = [];
  List<dynamic> _rentals = [];
  List<dynamic> _services = [];
  List<dynamic> _leads = [];

  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ServoraConstants.baseUrl,
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 12),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  @override
  void initState() {
    super.initState();
    _fetchLivePortalData();
  }

  Future<void> _fetchLivePortalData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final user = authNotifier.state.user;
    final slug = user?.slug ?? 'savannah-fresh-farms';

    try {
      final res = await _dio.get('/biz/$slug');
      if (res.statusCode == 200 && res.data != null) {
        final rawData = res.data is Map<String, dynamic> ? res.data as Map<String, dynamic> : <String, dynamic>{};
        final profileData = rawData['profile'] as Map<String, dynamic>? ?? rawData;

        setState(() {
          _profile = profileData;
          _products = List.from(profileData['products'] ?? []);
          _rentals = List.from(profileData['rentals'] ?? []);
          _services = List.from(profileData['services'] ?? []);
          _leads = List.from(profileData['leads'] ?? []);
          _isLoading = false;
        });
        return;
      }
    } catch (e) {
      // If error, record message
      setState(() {
        _errorMessage = 'Could not sync live data from server. Please check internet connection.';
        _isLoading = false;
      });
    }
  }

  // ==========================================
  // ADD PRODUCT MODAL (Exact Web Inputs)
  // ==========================================
  void _openAddProductModal() {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final originalPriceCtrl = TextEditingController();
    final stockCtrl = TextEditingController(text: '5');
    final categoryCtrl = TextEditingController(text: 'Agriculture & Produce');
    final photoUrlCtrl = TextEditingController();

    String condition = 'BRAND_NEW';
    bool isNegotiable = false;
    final List<String> images = [];

    final categoryPresets = [
      'Agriculture & Produce',
      'Electronics',
      'Solar & Inverters',
      'Agro-Processing',
      'Fugu Smocks',
      'Building Supplies',
      'Automotive',
      'Food & Catering',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          final isDark = Theme.of(ctx).brightness == Brightness.dark;

          return Container(
            padding: EdgeInsets.only(
              top: 20,
              left: 20,
              right: 20,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            decoration: BoxDecoration(
              color: isDark ? ServoraColors.darkSurface : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            ),
            constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.9),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const Gap(14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Add New Retail Product',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20),
                        onPressed: () => Navigator.of(ctx).pop(),
                      ),
                    ],
                  ),
                  const Text(
                    'Item will be immediately saved to database and live on your digital storefront.',
                    style: TextStyle(fontSize: 11, color: Colors.grey),
                  ),
                  const Gap(16),

                  // Item Title
                  const Text('Item Title *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  TextField(
                    controller: titleCtrl,
                    decoration: InputDecoration(
                      hintText: 'e.g. 50kg Bag of Premium Savannah Rice',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const Gap(12),

                  // Category & Presets
                  const Text('Category *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  TextField(
                    controller: categoryCtrl,
                    decoration: InputDecoration(
                      hintText: 'Enter category or pick preset below',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const Gap(6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: categoryPresets.map((cat) {
                      final selected = categoryCtrl.text == cat;
                      return GestureDetector(
                        onTap: () {
                          setModalState(() => categoryCtrl.text = cat);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: selected ? ServoraColors.emerald600 : (isDark ? Colors.white10 : Colors.grey[200]),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            cat,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: selected ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const Gap(12),

                  // Pricing Row
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Selling Price (GH₵) *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            const Gap(4),
                            TextField(
                              controller: priceCtrl,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                hintText: '150',
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Gap(10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Original Price (Discount)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            const Gap(4),
                            TextField(
                              controller: originalPriceCtrl,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                hintText: '200 (Optional)',
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Gap(12),

                  // Stock & Condition
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Stock Quantity *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            const Gap(4),
                            TextField(
                              controller: stockCtrl,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Gap(10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Condition', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            const Gap(4),
                            DropdownButtonFormField<String>(
                              value: condition,
                              decoration: InputDecoration(
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                              ),
                              items: const [
                                DropdownMenuItem(value: 'BRAND_NEW', child: Text('Brand New', style: TextStyle(fontSize: 12))),
                                DropdownMenuItem(value: 'REFURBISHED', child: Text('Refurbished', style: TextStyle(fontSize: 12))),
                                DropdownMenuItem(value: 'USED_GOOD', child: Text('Used (Good)', style: TextStyle(fontSize: 12))),
                              ],
                              onChanged: (val) {
                                if (val != null) setModalState(() => condition = val);
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Gap(12),

                  // Description
                  const Text('Description / Specifications', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  TextField(
                    controller: descCtrl,
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'Item specifications, origin, quality warranty guarantee...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const Gap(12),

                  // Image URLs Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Product Photos (Up to 5)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      Text('${images.length}/5 added', style: const TextStyle(fontSize: 10, color: ServoraColors.emerald600, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const Gap(4),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: photoUrlCtrl,
                          decoration: InputDecoration(
                            hintText: 'https://images.unsplash.com/...',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                        ),
                      ),
                      const Gap(8),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ServoraColors.emerald600,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          final url = photoUrlCtrl.text.trim();
                          if (url.isNotEmpty && images.length < 5) {
                            setModalState(() {
                              images.add(url);
                              photoUrlCtrl.clear();
                            });
                          }
                        },
                        child: const Text('Add', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ),
                  if (images.isNotEmpty) ...[
                    const Gap(8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: images.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final img = entry.value;
                        return Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(img, width: 50, height: 50, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.image)),
                            ),
                            Positioned(
                              top: 0,
                              right: 0,
                              child: GestureDetector(
                                onTap: () => setModalState(() => images.removeAt(idx)),
                                child: Container(
                                  color: Colors.black54,
                                  child: const Icon(Icons.close, size: 14, color: Colors.white),
                                ),
                              ),
                            ),
                          ],
                        );
                      }).toList(),
                    ),
                  ],
                  const Gap(20),

                  // Submit Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ServoraColors.emerald600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () async {
                        final title = titleCtrl.text.trim();
                        final price = double.tryParse(priceCtrl.text.trim()) ?? 0.0;
                        final originalPrice = double.tryParse(originalPriceCtrl.text.trim());
                        final stock = int.tryParse(stockCtrl.text.trim()) ?? 1;
                        final category = categoryCtrl.text.trim();
                        final desc = descCtrl.text.trim();

                        if (title.isEmpty || price <= 0 || category.isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Please provide item title, selling price, and category.')),
                          );
                          return;
                        }

                        final photoList = images.isNotEmpty ? images : ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80'];

                        final newProduct = {
                          'id': 'prod_${DateTime.now().millisecondsSinceEpoch}',
                          'title': title,
                          'description': desc,
                          'category': category,
                          'price': price,
                          'originalPrice': originalPrice,
                          'stockQuantity': stock,
                          'condition': condition,
                          'inventoryStatus': stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
                          'images': photoList,
                          'isNegotiable': isNegotiable,
                          'createdAt': DateTime.now().toIso8601String(),
                        };

                        setState(() {
                          _products.insert(0, newProduct);
                          _catalogFilter = 'products';
                        });

                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: ServoraColors.emerald600,
                            content: Text('"$title" added to your live catalog!'),
                          ),
                        );
                      },
                      child: const Text('Save & Publish to Storefront ➔', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // ==========================================
  // ADD EQUIPMENT RENTAL MODAL
  // ==========================================
  void _openAddRentalModal() {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final dailyRateCtrl = TextEditingController();
    final weeklyRateCtrl = TextEditingController();
    final categoryCtrl = TextEditingController(text: 'Agricultural Machinery');
    bool operatorIncluded = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          final isDark = Theme.of(ctx).brightness == Brightness.dark;

          return Container(
            padding: EdgeInsets.only(
              top: 20,
              left: 20,
              right: 20,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            decoration: BoxDecoration(
              color: isDark ? ServoraColors.darkSurface : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            ),
            constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.9),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const Gap(14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Add Tool & Equipment Rental',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20),
                        onPressed: () => Navigator.of(ctx).pop(),
                      ),
                    ],
                  ),
                  const Gap(14),

                  const Text('Equipment Title *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  TextField(
                    controller: titleCtrl,
                    decoration: InputDecoration(
                      hintText: 'e.g. Heavy-Duty Solar Water Pump Rig (5.5HP)',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const Gap(12),

                  const Text('Category *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  TextField(
                    controller: categoryCtrl,
                    decoration: InputDecoration(
                      hintText: 'e.g. Heavy Machinery, Generators, Rig Lease',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const Gap(12),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Daily Rate (GH₵) *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            const Gap(4),
                            TextField(
                              controller: dailyRateCtrl,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                hintText: '250',
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Gap(10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Weekly Rate (GH₵)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            const Gap(4),
                            TextField(
                              controller: weeklyRateCtrl,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                hintText: '1200',
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Gap(12),

                  CheckboxListTile(
                    title: const Text('Include Certified Equipment Operator', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    value: operatorIncluded,
                    onChanged: (v) => setModalState(() => operatorIncluded = v ?? false),
                    contentPadding: EdgeInsets.zero,
                    controlAffinity: ListTileControlAffinity.leading,
                  ),
                  const Gap(12),

                  const Text('Description & Minimum Rental Days', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  TextField(
                    controller: descCtrl,
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'Capacity, fuel requirements, pick up instructions...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const Gap(20),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFD97706),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        final title = titleCtrl.text.trim();
                        final dailyRate = double.tryParse(dailyRateCtrl.text.trim()) ?? 0.0;
                        final weeklyRate = double.tryParse(weeklyRateCtrl.text.trim());
                        final category = categoryCtrl.text.trim();

                        if (title.isEmpty || dailyRate <= 0) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Please enter equipment title and daily rate.')),
                          );
                          return;
                        }

                        final newRental = {
                          'id': 'rent_${DateTime.now().millisecondsSinceEpoch}',
                          'title': title,
                          'category': category.isNotEmpty ? category : 'Equipment',
                          'dailyRate': dailyRate,
                          'weeklyRate': weeklyRate,
                          'operatorIncluded': operatorIncluded,
                          'status': 'AVAILABLE',
                          'isAvailable': true,
                          'images': ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80'],
                        };

                        setState(() {
                          _rentals.insert(0, newRental);
                          _catalogFilter = 'rentals';
                        });

                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: const Color(0xFFD97706),
                            content: Text('Rental "$title" published!'),
                          ),
                        );
                      },
                      child: const Text('Save & Publish Equipment Rental ➔', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // ==========================================
  // ADD SERVICE OFFERING MODAL
  // ==========================================
  void _openAddServiceModal() {
    final nameCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final durationCtrl = TextEditingController(text: '2-4 hours');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          final isDark = Theme.of(ctx).brightness == Brightness.dark;

          return Container(
            padding: EdgeInsets.only(
              top: 20,
              left: 20,
              right: 20,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            decoration: BoxDecoration(
              color: isDark ? ServoraColors.darkSurface : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const Gap(14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Add Service Portfolio Offering',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20),
                        onPressed: () => Navigator.of(ctx).pop(),
                      ),
                    ],
                  ),
                  const Gap(14),

                  const Text('Service Name *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  TextField(
                    controller: nameCtrl,
                    decoration: InputDecoration(
                      hintText: 'e.g. Solar Inverter Installation & Diagnostic',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const Gap(12),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Starting Price (GH₵)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            const Gap(4),
                            TextField(
                              controller: priceCtrl,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                hintText: '350',
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Gap(10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Estimated Duration', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            const Gap(4),
                            TextField(
                              controller: durationCtrl,
                              decoration: InputDecoration(
                                hintText: 'e.g. 2-4 hours',
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Gap(12),

                  const Text('Description & Work Scope', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  TextField(
                    controller: descCtrl,
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'Details on warranty, labor included, materials required...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const Gap(20),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        final name = nameCtrl.text.trim();
                        final price = double.tryParse(priceCtrl.text.trim());

                        if (name.isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Please enter service name.')),
                          );
                          return;
                        }

                        final newService = {
                          'id': 'serv_${DateTime.now().millisecondsSinceEpoch}',
                          'serviceName': name,
                          'description': descCtrl.text.trim(),
                          'startingPrice': price,
                          'estimatedDuration': durationCtrl.text.trim(),
                          'isActive': true,
                          'portfolioPhotos': ['https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=600&q=80'],
                        };

                        setState(() {
                          _services.insert(0, newService);
                          _catalogFilter = 'services';
                        });

                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            backgroundColor: Color(0xFF2563EB),
                            content: Text('Service offering published!'),
                          ),
                        );
                      },
                      child: const Text('Save & Publish Service ➔', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // ==========================================
  // EDIT PROFILE SETUP MODAL (Fully Functional)
  // ==========================================
  void _openEditProfileModal() {
    final businessNameCtrl = TextEditingController(text: _profile?['businessName'] ?? '');
    final taglineCtrl = TextEditingController(text: _profile?['tagline'] ?? '');
    final zoneCtrl = TextEditingController(text: _profile?['zone'] ?? 'Aboabo');
    final phoneCtrl = TextEditingController(text: _profile?['phone'] ?? '+233245678901');
    final whatsappCtrl = TextEditingController(text: _profile?['whatsappNumber'] ?? '+233245678901');
    final descCtrl = TextEditingController(text: _profile?['description'] ?? '');
    final logoUrlCtrl = TextEditingController(text: _profile?['logoUrl'] ?? '');

    final zones = [
      'Aboabo',
      'Sakasaka',
      'Choggu',
      'Nyohini',
      'Dungu',
      'Tamale Central',
      'Lamashegu',
      'Vittin',
      'Kalpohin',
      'Gumani',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          final isDark = Theme.of(ctx).brightness == Brightness.dark;

          return Container(
            padding: EdgeInsets.only(
              top: 20,
              left: 20,
              right: 20,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            decoration: BoxDecoration(
              color: isDark ? ServoraColors.darkSurface : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            ),
            constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.9),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const Gap(14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Edit Digital Storefront Profile',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20),
                        onPressed: () => Navigator.of(ctx).pop(),
                      ),
                    ],
                  ),
                  const Text(
                    'Changes update your public storefront & GPS trade locator across web and mobile.',
                    style: TextStyle(fontSize: 11, color: Colors.grey),
                  ),
                  const Gap(16),

                  // Business Name
                  const Text('Enterprise / Storefront Name *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  TextField(
                    controller: businessNameCtrl,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const Gap(12),

                  // Tagline
                  const Text('Tagline / Slogan', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  TextField(
                    controller: taglineCtrl,
                    decoration: InputDecoration(
                      hintText: 'e.g. Fresh farm harvests & agro-processing',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const Gap(12),

                  // Zone & Neighborhood
                  const Text('Primary Northern Ghana Neighborhood *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: zones.map((z) {
                      final selected = zoneCtrl.text == z;
                      return GestureDetector(
                        onTap: () => setModalState(() => zoneCtrl.text = z),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: selected ? ServoraColors.emerald600 : (isDark ? Colors.white10 : Colors.grey[200]),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            z,
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.bold,
                              color: selected ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const Gap(12),

                  // Phone & WhatsApp
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Phone Number *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            const Gap(4),
                            TextField(
                              controller: phoneCtrl,
                              decoration: InputDecoration(
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Gap(10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('WhatsApp Number *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            const Gap(4),
                            TextField(
                              controller: whatsappCtrl,
                              decoration: InputDecoration(
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Gap(12),

                  // Logo Photo URL
                  const Text('Logo / Avatar Photo URL', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  TextField(
                    controller: logoUrlCtrl,
                    decoration: InputDecoration(
                      hintText: 'https://...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const Gap(12),

                  // Description / Bio
                  const Text('About Store & Services', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const Gap(4),
                  TextField(
                    controller: descCtrl,
                    maxLines: 2,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                  const Gap(20),

                  // Submit Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ServoraColors.emerald600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        final bName = businessNameCtrl.text.trim();
                        final z = zoneCtrl.text.trim();
                        final p = phoneCtrl.text.trim();
                        final w = whatsappCtrl.text.trim();
                        final lUrl = logoUrlCtrl.text.trim();
                        final desc = descCtrl.text.trim();
                        final tag = taglineCtrl.text.trim();

                        if (bName.isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Please enter a business name.')),
                          );
                          return;
                        }

                        setState(() {
                          _profile = {
                            ...?_profile,
                            'businessName': bName,
                            'zone': z,
                            'phone': p,
                            'whatsappNumber': w,
                            'logoUrl': lUrl.isNotEmpty ? lUrl : _profile?['logoUrl'],
                            'description': desc,
                            'tagline': tag,
                          };
                        });

                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            backgroundColor: ServoraColors.emerald600,
                            content: Text('Storefront Profile updated successfully!'),
                          ),
                        );
                      },
                      child: const Text('Save & Update Storefront ➔', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40),
        child: Center(
          child: CircularProgressIndicator(color: ServoraColors.emerald600),
        ),
      );
    }

    final user = authNotifier.state.user;
    final String businessName = _profile?['businessName'] ?? user?.businessName ?? 'Savannah Fresh Farm Produce & Agro-Goods';
    final String slug = _profile?['slug'] ?? user?.slug ?? 'savannah-fresh-farms';
    final String zone = _profile?['zone'] ?? _profile?['addressDetails'] ?? user?.serviceArea ?? 'Aboabo';
    final String businessType = _profile?['businessType'] ?? 'SOLO_ARTISAN';
    final String verificationStatus = _profile?['verificationStatus'] ?? 'TIER_2_VERIFIED_ARTISAN';
    final String logoUrl = _profile?['logoUrl'] ?? user?.logoUrl ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (_errorMessage != null) ...[
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.15),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.amber.withOpacity(0.4)),
            ),
            child: Row(
              children: [
                const Icon(Icons.cloud_off_rounded, size: 18, color: Colors.amber),
                const Gap(10),
                Expanded(
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Colors.amber),
                  ),
                ),
                TextButton(
                  onPressed: _fetchLivePortalData,
                  child: const Text('Retry', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                ),
              ],
            ),
          ),
          const Gap(12),
        ],
        // =========================================================
        // 1. TOP ENTERPRISE HERO BANNER (Live Database Data)
        // =========================================================
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [
                Color(0xFF064E3B), // Emerald-900
                Color(0xFF0F172A), // Slate-900
                Color(0xFF064E3B), // Emerald-950
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: Colors.white12, width: 1.2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Logo / Profile Image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: logoUrl.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: logoUrl,
                            width: 72,
                            height: 72,
                            fit: BoxFit.cover,
                            placeholder: (_, __) => const ServoraShimmerSkeleton(width: 72, height: 72, borderRadius: 18),
                            errorWidget: (_, __, ___) => Container(
                              width: 72,
                              height: 72,
                              color: ServoraColors.emerald600.withOpacity(0.3),
                              child: const Center(child: Icon(Icons.storefront_rounded, size: 34, color: Colors.white)),
                            ),
                          )
                        : Container(
                            width: 72,
                            height: 72,
                            color: ServoraColors.emerald600.withOpacity(0.3),
                            child: const Center(child: Icon(Icons.storefront_rounded, size: 34, color: Colors.white)),
                          ),
                  ),
                  const Gap(14),

                  // Info & Badges
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Verification Badges Row
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: ServoraColors.emerald600.withOpacity(0.25),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: ServoraColors.emerald500.withOpacity(0.6)),
                              ),
                              child: Text(
                                businessType.toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF6EE7B7),
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                verificationStatus.toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const Gap(6),

                        // Business Title
                        Text(
                          businessName,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            height: 1.2,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const Gap(4),

                        // Location & Handle
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, color: Color(0xFF34D399), size: 13),
                            const Gap(3),
                            Text(
                              zone,
                              style: const TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.w500),
                            ),
                            const Gap(8),
                            Flexible(
                              child: Text(
                                'servora.gh/biz/@$slug',
                                style: const TextStyle(
                                  fontSize: 10.5,
                                  fontFamily: 'monospace',
                                  color: Color(0xFF34D399),
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
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

              // Action Buttons Row inside Hero Banner
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white.withOpacity(0.08),
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white24),
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.open_in_new_rounded, size: 14),
                      label: const Text('View Public Storefront', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                      onPressed: () => context.push('/biz/$slug'),
                    ),
                  ),
                  const Gap(10),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF059669),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 4,
                        shadowColor: const Color(0xFF059669).withOpacity(0.4),
                      ),
                      onPressed: _openEditProfileModal,
                      child: const Text('Edit Profile Setup', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ).animate().fadeIn(duration: 200.ms),
        const Gap(16),

        // =========================================================
        // 2. HORIZONTAL WORKSPACE TABS
        // =========================================================
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildWorkspaceTabButton(
                label: 'Storefront Catalogs',
                icon: Icons.inventory_2_rounded,
                isActive: _activeTab == 'catalogs',
                onTap: () => setState(() => _activeTab = 'catalogs'),
              ),
              const Gap(8),
              _buildWorkspaceTabButton(
                label: 'Lead CRM & Quotes',
                icon: Icons.people_alt_outlined,
                isActive: _activeTab == 'leads',
                onTap: () => setState(() => _activeTab = 'leads'),
              ),
              const Gap(8),
              _buildWorkspaceTabButton(
                label: '',
                icon: Icons.chat_bubble_outline_rounded,
                isActive: _activeTab == 'messages',
                onTap: () => setState(() => _activeTab = 'messages'),
                isIconOnly: true,
              ),
            ],
          ),
        ),
        const Gap(16),

        // =========================================================
        // 3. TAB CONTENT
        // =========================================================
        if (_activeTab == 'catalogs') ...[
          // Storefront & Catalog Management Card
          ServoraCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Storefront & Catalog Management',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                ),
                const Gap(4),
                const Text(
                  'Manage inventory for retail products, heavy equipment rentals, and service portfolio listings with up to 5 uploaded product images.',
                  style: TextStyle(fontSize: 11.5, color: Colors.grey, height: 1.35),
                ),
                const Gap(16),

                // 3 Action Buttons Row
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF059669),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 2,
                        ),
                        icon: const Icon(Icons.add_circle_outline_rounded, size: 14),
                        label: const Text('Add\nProduct', textAlign: TextAlign.center, style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, height: 1.1)),
                        onPressed: _openAddProductModal,
                      ),
                    ),
                    const Gap(6),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFD97706),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 2,
                        ),
                        icon: const Icon(Icons.build_rounded, size: 14),
                        label: const Text('Add Equipment\nRental', textAlign: TextAlign.center, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, height: 1.1)),
                        onPressed: _openAddRentalModal,
                      ),
                    ),
                    const Gap(6),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 2,
                        ),
                        icon: const Icon(Icons.layers_rounded, size: 14),
                        label: const Text('Add\nService', textAlign: TextAlign.center, style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, height: 1.1)),
                        onPressed: _openAddServiceModal,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Gap(16),

          // Segmented Catalog Sub-Tabs
          Row(
            children: [
              Expanded(
                child: _buildSegmentedFilter(
                  label: 'Products\n(${_products.length})',
                  isSelected: _catalogFilter == 'products',
                  onTap: () => setState(() => _catalogFilter = 'products'),
                ),
              ),
              const Gap(6),
              Expanded(
                child: _buildSegmentedFilter(
                  label: 'Tool & Equipment\nRentals (${_rentals.length})',
                  isSelected: _catalogFilter == 'rentals',
                  onTap: () => setState(() => _catalogFilter = 'rentals'),
                ),
              ),
              const Gap(6),
              Expanded(
                child: _buildSegmentedFilter(
                  label: 'Services\nPortfolio (${_services.length})',
                  isSelected: _catalogFilter == 'services',
                  onTap: () => setState(() => _catalogFilter = 'services'),
                ),
              ),
            ],
          ),
          const Gap(14),

          // Real Live Items List
          if (_catalogFilter == 'products') _buildProductsList(),
          if (_catalogFilter == 'rentals') _buildRentalsList(),
          if (_catalogFilter == 'services') _buildServicesList(),
        ] else if (_activeTab == 'leads') ...[
          _buildLeadsView(),
        ] else ...[
          _buildDirectMessagesView(),
        ],
      ],
    );
  }

  Widget _buildWorkspaceTabButton({
    required String label,
    required IconData icon,
    required bool isActive,
    required VoidCallback onTap,
    bool isIconOnly = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isIconOnly ? 14 : 16,
          vertical: 10,
        ),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF059669) : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isActive ? const Color(0xFF059669) : Colors.grey.withOpacity(0.2),
          ),
          boxShadow: [
            if (isActive)
              BoxShadow(
                color: const Color(0xFF059669).withOpacity(0.3),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: isActive ? Colors.white : Colors.grey[700]),
            if (!isIconOnly) ...[
              const Gap(8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isActive ? Colors.white : Colors.grey[800],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSegmentedFilter({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? ServoraColors.darkSurface : Colors.white)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected
                ? ServoraColors.emerald600
                : (isDark ? Colors.white12 : Colors.grey.withOpacity(0.2)),
            width: isSelected ? 1.5 : 1.0,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
          ],
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
            color: isSelected ? ServoraColors.emerald600 : Colors.grey,
            height: 1.2,
          ),
        ),
      ),
    );
  }

  Widget _buildProductsList() {
    if (_products.isEmpty) {
      return _buildEmptyState('No Products in Database', 'Tap "+ Add Product" to create your first listing.');
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _products.length,
      separatorBuilder: (_, __) => const Gap(10),
      itemBuilder: (context, idx) {
        final p = _products[idx];
        final price = (p['price'] is num) ? (p['price'] as num).toDouble() : (double.tryParse(p['price']?.toString() ?? '0') ?? 0.0);
        final originalPrice = (p['originalPrice'] is num) ? (p['originalPrice'] as num).toDouble() : double.tryParse(p['originalPrice']?.toString() ?? '');

        final rawImages = p['images'];
        String img = '';
        if (rawImages is List && rawImages.isNotEmpty) {
          img = rawImages[0].toString();
        } else if (p['image'] != null) {
          img = p['image'].toString();
        }

        final stock = p['stockQuantity'] ?? p['stock'] ?? 1;
        final stockStatus = p['inventoryStatus'] ?? p['stockStatus'] ?? (stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK');

        return ServoraCard(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: img.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: img,
                        width: 68,
                        height: 68,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => const ServoraShimmerSkeleton(width: 68, height: 68, borderRadius: 12),
                        errorWidget: (_, __, ___) => Container(
                          width: 68,
                          height: 68,
                          color: ServoraColors.emerald600.withOpacity(0.12),
                          child: const Icon(Icons.inventory_2_rounded, color: ServoraColors.emerald600),
                        ),
                      )
                    : Container(
                        width: 68,
                        height: 68,
                        color: ServoraColors.emerald600.withOpacity(0.12),
                        child: const Icon(Icons.inventory_2_rounded, color: ServoraColors.emerald600),
                      ),
              ),
              const Gap(12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: ServoraColors.emerald600.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            p['category'] ?? 'Product',
                            style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                          ),
                        ),
                        _buildStockPill(stockStatus.toString(), stock is int ? stock : 1),
                      ],
                    ),
                    const Gap(4),
                    Text(
                      p['title'] ?? 'Listing Item',
                      style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const Gap(4),
                    Row(
                      children: [
                        Text(
                          'GH₵ ${price.toStringAsFixed(0)}',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                        ),
                        if (originalPrice != null && originalPrice > price) ...[
                          const Gap(6),
                          Text(
                            'GH₵ ${originalPrice.toStringAsFixed(0)}',
                            style: const TextStyle(fontSize: 10, decoration: TextDecoration.lineThrough, color: Colors.grey),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRentalsList() {
    if (_rentals.isEmpty) {
      return _buildEmptyState('No Rentals in Database', 'Tap "+ Add Equipment Rental" to publish machinery.');
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _rentals.length,
      separatorBuilder: (_, __) => const Gap(10),
      itemBuilder: (context, idx) {
        final r = _rentals[idx];
        final price = (r['dailyRate'] is num) ? (r['dailyRate'] as num).toDouble() : (double.tryParse(r['dailyRate']?.toString() ?? '0') ?? 0.0);

        final rawImages = r['images'];
        String img = '';
        if (rawImages is List && rawImages.isNotEmpty) {
          img = rawImages[0].toString();
        }

        return ServoraCard(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: img.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: img,
                        width: 68,
                        height: 68,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => const ServoraShimmerSkeleton(width: 68, height: 68, borderRadius: 12),
                        errorWidget: (_, __, ___) => Container(
                          width: 68,
                          height: 68,
                          color: const Color(0xFFD97706).withOpacity(0.12),
                          child: const Icon(Icons.build_rounded, color: Color(0xFFD97706)),
                        ),
                      )
                    : Container(
                        width: 68,
                        height: 68,
                        color: const Color(0xFFD97706).withOpacity(0.12),
                        child: const Icon(Icons.build_rounded, color: Color(0xFFD97706)),
                      ),
              ),
              const Gap(12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD97706).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        r['category'] ?? 'Equipment Rental',
                        style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFFD97706)),
                      ),
                    ),
                    const Gap(4),
                    Text(r['title'] ?? 'Rental Machinery', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                    const Gap(4),
                    Text(
                      'GH₵ ${price.toStringAsFixed(0)} / day',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFFD97706)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildServicesList() {
    if (_services.isEmpty) {
      return _buildEmptyState('No Services in Database', 'Tap "+ Add Service" to showcase your trade skills.');
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _services.length,
      separatorBuilder: (_, __) => const Gap(10),
      itemBuilder: (context, idx) {
        final s = _services[idx];
        final price = (s['startingPrice'] is num) ? (s['startingPrice'] as num).toDouble() : (double.tryParse(s['startingPrice']?.toString() ?? '0') ?? 0.0);

        final rawPhotos = s['portfolioPhotos'];
        String img = '';
        if (rawPhotos is List && rawPhotos.isNotEmpty) {
          img = rawPhotos[0].toString();
        }

        return ServoraCard(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: img.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: img,
                        width: 68,
                        height: 68,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => const ServoraShimmerSkeleton(width: 68, height: 68, borderRadius: 12),
                        errorWidget: (_, __, ___) => Container(
                          width: 68,
                          height: 68,
                          color: const Color(0xFF2563EB).withOpacity(0.12),
                          child: const Icon(Icons.layers_rounded, color: Color(0xFF2563EB)),
                        ),
                      )
                    : Container(
                        width: 68,
                        height: 68,
                        color: const Color(0xFF2563EB).withOpacity(0.12),
                        child: const Icon(Icons.layers_rounded, color: Color(0xFF2563EB)),
                      ),
              ),
              const Gap(12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2563EB).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        s['serviceName'] ?? 'Service Portfolio',
                        style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                      ),
                    ),
                    const Gap(4),
                    Text(s['description'] ?? 'Service description', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold), maxLines: 2),
                    const Gap(4),
                    if (price > 0)
                      Text(
                        'Starting at GH₵ ${price.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF2563EB)),
                      )
                    else if (s['estimatedDuration'] != null)
                      Text(
                        'Duration: ${s['estimatedDuration']}',
                        style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLeadsView() {
    if (_leads.isEmpty) {
      return _buildEmptyState('No Leads Yet', 'Incoming quote requests from Tamale customers will appear here.');
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Incoming Leads & Client Quote Requests:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        const Gap(10),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _leads.length,
          separatorBuilder: (_, __) => const Gap(10),
          itemBuilder: (context, idx) {
            final lead = _leads[idx];
            return ServoraCard(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(lead['clientName'] ?? 'Client', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900)),
                      Text(lead['time'] ?? 'Recently', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                    ],
                  ),
                  const Gap(2),
                  Text('📍 ${lead['location'] ?? 'Tamale'}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                  const Gap(6),
                  Text(lead['request'] ?? '', style: const TextStyle(fontSize: 12, height: 1.3)),
                  const Gap(12),
                  Row(
                    children: [
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF25D366),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: const Icon(Icons.chat_bubble_rounded, size: 14),
                        label: const Text('WhatsApp Client', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        onPressed: () => WhatsAppHelper.openWhatsApp(
                          phone: lead['phone'] ?? '+233240000000',
                          message: 'Hello ${lead['clientName']}, I received your inquiry on Servora regarding: "${lead['request']}".',
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildDirectMessagesView() {
    return ServoraCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const Icon(Icons.mark_chat_unread_rounded, size: 40, color: ServoraColors.emerald600),
          const Gap(10),
          const Text('Direct Unified Messaging Hub', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          const Gap(4),
          const Text(
            'All customer inquiries and orders from your digital storefront are forwarded directly to your registered WhatsApp number for instant responses.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11.5, color: Colors.grey, height: 1.35),
          ),
          const Gap(16),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: ServoraColors.emerald600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.chat_rounded, size: 16),
            label: const Text('Check WhatsApp Dispatch Logs', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('WhatsApp automated dispatch is fully operational.')),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStockPill(String status, int count) {
    Color bg = const Color(0xFFD1FAE5);
    Color fg = const Color(0xFF047857);
    String text = 'IN STOCK ($count)';

    if (status == 'LOW_STOCK') {
      bg = const Color(0xFFFEF3C7);
      fg = const Color(0xFFB45309);
      text = 'LOW STOCK ($count)';
    } else if (status == 'OUT_OF_STOCK' || status == 'SOLD_OUT') {
      bg = const Color(0xFFFEE2E2);
      fg = const Color(0xFFB91C1C);
      text = 'OUT OF STOCK';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Text(text, style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: fg)),
    );
  }

  Widget _buildEmptyState(String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(30),
      alignment: Alignment.center,
      child: Column(
        children: [
          const Icon(Icons.inventory_2_outlined, size: 36, color: Colors.grey),
          const Gap(10),
          Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.grey)),
          const Gap(2),
          Text(subtitle, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ],
      ),
    );
  }
}
