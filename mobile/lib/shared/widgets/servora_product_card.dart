import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../app/theme/servora_colors.dart';
import '../../core/utils/whatsapp_helper.dart';
import '../../core/utils/time_formatter.dart';
import 'servora_image_lightbox.dart';
import 'servora_shimmer_skeleton.dart';

class ServoraProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  final VoidCallback? onTap;

  const ServoraProductCard({
    super.key,
    required this.product,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final p = product;

    String? imageUrl;
    if (p['image'] is String && (p['image'] as String).isNotEmpty) {
      imageUrl = p['image'] as String;
    } else if (p['image'] is List && (p['image'] as List).isNotEmpty) {
      imageUrl = (p['image'] as List)[0]?.toString();
    } else if (p['images'] is List && (p['images'] as List).isNotEmpty) {
      imageUrl = (p['images'] as List)[0]?.toString();
    } else if (p['images'] is String && (p['images'] as String).isNotEmpty) {
      imageUrl = p['images'] as String;
    }

    final List<String> pImages = [];
    if (p['images'] is List) {
      pImages.addAll((p['images'] as List).map((e) => e.toString()).where((s) => s.isNotEmpty));
    } else if (p['images'] is String && (p['images'] as String).isNotEmpty) {
      pImages.add(p['images'] as String);
    }
    if (p['image'] is List) {
      for (final img in (p['image'] as List)) {
        if (img != null && img.toString().isNotEmpty && !pImages.contains(img.toString())) {
          pImages.add(img.toString());
        }
      }
    } else if (p['image'] is String && (p['image'] as String).isNotEmpty) {
      if (!pImages.contains(p['image'])) {
        pImages.insert(0, p['image'] as String);
      }
    }
    if (pImages.isEmpty && imageUrl != null) {
      pImages.add(imageUrl);
    }

    final double price = (p['price'] is num)
        ? (p['price'] as num).toDouble()
        : (double.tryParse(p['price']?.toString() ?? '0') ?? 0.0);
    final double? originalPrice = (p['originalPrice'] is num)
        ? (p['originalPrice'] as num).toDouble()
        : (p['originalPrice'] != null ? double.tryParse(p['originalPrice'].toString()) : null);

    final bool hasDiscount = originalPrice != null && originalPrice > price;
    final int discountPct = hasDiscount
        ? (((originalPrice - price) / originalPrice) * 100).round()
        : (p['discountPercent'] is num ? (p['discountPercent'] as num).round() : 0);

    final String title = p['title']?.toString() ?? 'Product Item';
    final String category = (p['category']?.toString() ?? 'General').toUpperCase();
    final String sellerName = p['seller']?.toString() ?? p['businessName']?.toString() ?? 'Verified Merchant';
    final String location = p['location']?.toString() ?? p['area']?.toString() ?? 'Tamale';
    final String phone = p['phone']?.toString() ?? '+233240000000';
    final String slug = p['slug']?.toString() ?? p['id']?.toString() ?? '';

    final rawDate = p['createdAt'] ?? p['postedAt'] ?? p['created_at'] ?? p['date'] ?? p['timestamp'];

    return GestureDetector(
      onTap: onTap ??
          () {
            context.push(
              slug.isNotEmpty ? '/products/$slug' : '/products/detail',
              extra: Map<String, dynamic>.from(p),
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
            // Image Stack with Discount & Lightbox Trigger
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                  child: AspectRatio(
                    aspectRatio: 1.18,
                    child: (imageUrl != null && imageUrl.isNotEmpty)
                        ? CachedNetworkImage(
                            imageUrl: imageUrl,
                            fit: BoxFit.cover,
                            placeholder: (_, __) => const ServoraShimmerSkeleton(
                              width: double.infinity,
                              height: double.infinity,
                              borderRadius: 0,
                            ),
                            errorWidget: (_, __, ___) => Container(
                              color: ServoraColors.emerald600.withOpacity(0.1),
                              child: const Center(
                                child: Icon(Icons.inventory_2_rounded, size: 32, color: ServoraColors.emerald600),
                              ),
                            ),
                          )
                        : Container(
                            color: ServoraColors.emerald600.withOpacity(0.1),
                            child: const Center(
                              child: Icon(Icons.inventory_2_rounded, size: 32, color: ServoraColors.emerald600),
                            ),
                          ),
                  ),
                ),

                // Discount Badge (Top Left)
                if (hasDiscount && discountPct > 0)
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
                        style: const TextStyle(
                          fontSize: 8.5,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),

                // Posted Date & Zoom Overlay (Bottom Right of Product Image)
                Positioned(
                  bottom: 6,
                  right: 6,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (rawDate != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.8),
                            borderRadius: BorderRadius.circular(7),
                            border: Border.all(color: Colors.white12),
                          ),
                          child: Text(
                            TimeFormatter.formatRelativeTime(rawDate),
                            style: const TextStyle(
                              fontSize: 8.5,
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      if (pImages.length > 1) ...[
                        const SizedBox(width: 4),
                        GestureDetector(
                          onTap: () {
                            ServoraImageLightbox.show(
                              context,
                              title: title,
                              images: pImages.isNotEmpty ? pImages : (imageUrl != null ? [imageUrl] : []),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.75),
                              borderRadius: BorderRadius.circular(7),
                            ),
                            child: Text(
                              '📸 ${pImages.length}',
                              style: const TextStyle(fontSize: 8.5, color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),

            // Card Body (Intrinsically fits content with no extra whitespace)
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 7, 8, 8),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category Pill
                  Container(
                    margin: const EdgeInsets.only(bottom: 3),
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                    decoration: BoxDecoration(
                      color: ServoraColors.emerald600.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      category,
                      style: const TextStyle(
                        fontSize: 7.5,
                        fontWeight: FontWeight.w800,
                        color: ServoraColors.emerald600,
                        letterSpacing: 0.3,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),

                  // Title (2 lines max, tightly hugging text)
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.bold,
                      height: 1.2,
                    ),
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
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          color: ServoraColors.emerald600,
                        ),
                      ),
                      if (hasDiscount) ...[
                        const Gap(4),
                        Text(
                          'GH₵ ${originalPrice.toStringAsFixed(0)}',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white38 : Colors.grey[500],
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const Gap(2),

                  // Seller Subtitle & Posting Time
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          '$sellerName • $location',
                          style: TextStyle(
                            fontSize: 8.5,
                            color: isDark ? Colors.white54 : Colors.grey[600],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (p['createdAt'] != null) ...[
                        const Gap(4),
                        Text(
                          TimeFormatter.formatRelativeTime(p['createdAt']),
                          style: const TextStyle(
                            fontSize: 8.5,
                            fontWeight: FontWeight.w600,
                            color: ServoraColors.emerald600,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const Gap(6),

                  // Action Buttons Row
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ServoraColors.emerald600,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 5),
                            minimumSize: Size.zero,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            elevation: 0,
                          ),
                          icon: const Icon(Icons.send_rounded, size: 10),
                          label: const Text('Buy', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                          onPressed: () {
                            WhatsAppHelper.openWhatsApp(
                              phone: phone,
                              message: 'Hello, I want to buy "$title" listed on Servora.gh.',
                            );
                          },
                        ),
                      ),
                      const Gap(4),
                      GestureDetector(
                        onTap: () => context.push('/escrow'),
                        child: Container(
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            color: ServoraColors.amberLight,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.shield_rounded, size: 14, color: ServoraColors.amberDark),
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
