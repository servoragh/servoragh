import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/servora_shimmer_skeleton.dart';
import '../../../core/utils/whatsapp_helper.dart';

class ProductDetailScreen extends StatefulWidget {
  final Map<String, dynamic> product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _activeImageIndex = 0;
  late final PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  List<String> _extractImages() {
    final images = <String>[];
    final mainImage = widget.product['image'] as String?;
    if (mainImage != null && mainImage.isNotEmpty) {
      images.add(mainImage);
    }

    final rawImages = widget.product['images'];
    if (rawImages is List) {
      for (final img in rawImages) {
        if (img != null && img.toString().isNotEmpty && !images.contains(img.toString())) {
          images.add(img.toString());
        }
      }
    }

    if (images.isEmpty) {
      images.add('https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80');
      images.add('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80');
      images.add('https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80');
    }

    return images;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final images = _extractImages();

    final title = widget.product['title'] ?? 'Marketplace Product Listing';
    final category = widget.product['category'] ?? 'General Marketplace';
    final price = widget.product['price'] ?? 'GH₵ 0.00';
    final seller = widget.product['seller'] ?? 'Verified Enterprise';
    final location = widget.product['location'] ?? 'Sakasaka, Tamale';
    final phone = widget.product['phone'] ?? '+233240000000';
    final description = widget.product['description'] ??
        'High quality genuine product verified and sourced directly in Northern Ghana. Comes with quality warranty, local merchant inspection, and instant delivery options across Tamale, Bolgatanga, and Wa.\n\n• Condition: Brand New / Tested Working\n• Warranty: 6 Months Local Guarantee\n• Delivery: Same-Day Express Haulage Available';

    return Scaffold(
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              // Top Gallery App Bar
              SliverAppBar(
                expandedHeight: 320,
                pinned: true,
                leading: IconButton(
                  icon: const CircleAvatar(
                    backgroundColor: Colors.black54,
                    child: Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                  ),
                  onPressed: () => context.pop(),
                ),
                actions: [
                  IconButton(
                    icon: const CircleAvatar(
                      backgroundColor: Colors.black54,
                      child: Icon(Icons.share_rounded, color: Colors.white, size: 18),
                    ),
                    onPressed: () {},
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    alignment: Alignment.bottomCenter,
                    children: [
                      PageView.builder(
                        controller: _pageController,
                        itemCount: images.length,
                        onPageChanged: (index) => setState(() => _activeImageIndex = index),
                        itemBuilder: (context, index) {
                          return CachedNetworkImage(
                            imageUrl: images[index],
                            fit: BoxFit.cover,
                            width: double.infinity,
                            placeholder: (_, __) => const ServoraShimmerSkeleton(
                              width: double.infinity,
                              height: 320,
                              borderRadius: 0,
                            ),
                            errorWidget: (_, __, ___) => Container(
                              color: ServoraColors.emerald600.withOpacity(0.12),
                              child: const Center(
                                child: Icon(Icons.inventory_2_rounded, size: 80, color: ServoraColors.emerald600),
                              ),
                            ),
                          );
                        },
                      ),
                      // Multi-Image Dot Indicator
                      if (images.length > 1)
                        Positioned(
                          bottom: 16,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.6),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: List.generate(images.length, (idx) {
                                return Container(
                                  width: idx == _activeImageIndex ? 16 : 6,
                                  height: 6,
                                  margin: const EdgeInsets.symmetric(horizontal: 3),
                                  decoration: BoxDecoration(
                                    color: idx == _activeImageIndex ? ServoraColors.emerald500 : Colors.white54,
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                );
                              }),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),

              // Product Info & Description Content
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Category & Stock Status Row
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
                              category,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: ServoraColors.emerald600,
                              ),
                            ),
                          ),
                          const StatusBadge(
                            label: 'IN STOCK • VERIFIED',
                            backgroundColor: Color(0xFFD1FAE5),
                            textColor: Color(0xFF047857),
                          ),
                        ],
                      ),
                      const Gap(14),

                      // Title & Price Tag
                      Text(
                        title,
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, height: 1.25),
                      ),
                      const Gap(10),

                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            price,
                            style: const TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w900,
                              color: ServoraColors.emerald600,
                            ),
                          ),
                          const Gap(10),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: ServoraColors.amberLight,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.shield_rounded, size: 14, color: ServoraColors.amberDark),
                                Gap(4),
                                Text(
                                  'MoMo Escrow Protected',
                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: ServoraColors.amberDark),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 32),

                      // Merchant / Seller Card
                      ServoraCard(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 22,
                              backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
                              child: Text(
                                seller[0],
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                              ),
                            ),
                            const Gap(12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    seller,
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                  ),
                                  const Gap(2),
                                  Text(
                                    '📍 $location • Verified Ghana Card',
                                    style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                            ),
                            TextButton(
                              onPressed: () => context.push('/biz/kwame-electrical-tamale'),
                              child: const Text('Store ➔', style: TextStyle(color: ServoraColors.emerald600, fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          ],
                        ),
                      ),
                      const Gap(24),

                      // Full Product Description Section
                      const Text(
                        'Product Description & Details',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const Gap(10),
                      Text(
                        description,
                        style: TextStyle(
                          fontSize: 13,
                          height: 1.6,
                          color: isDark ? Colors.grey[300] : Colors.grey[800],
                        ),
                      ),
                      const Gap(120), // Bottom padding for sticky action bar
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Sticky Bottom Action Bar
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: isDark ? ServoraColors.darkSurface : Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 16,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      icon: const Icon(Icons.chat_rounded, size: 20),
                      label: const Text('WhatsApp Direct 💬', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      onPressed: () {
                        WhatsAppHelper.openWhatsApp(
                          phone: phone,
                          message: 'Hello, I want to purchase "$title" listed on Servora.gh app.',
                        );
                      },
                    ),
                  ),
                  const Gap(10),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ServoraColors.emerald600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      icon: const Icon(Icons.shield_rounded, size: 20),
                      label: const Text('Buy Escrow 🛡️', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      onPressed: () => context.push('/escrow'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
