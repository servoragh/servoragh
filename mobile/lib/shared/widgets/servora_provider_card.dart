import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/servora_colors.dart';
import '../../core/utils/whatsapp_helper.dart';

class ServoraProviderCard extends StatelessWidget {
  final Map<String, dynamic> provider;
  final double? width;

  const ServoraProviderCard({
    super.key,
    required this.provider,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? ServoraColors.darkSurface : Colors.white;

    final String name = provider['businessName'] ?? provider['name'] ?? 'Artisan Merchant';
    final String ownerName = provider['ownerName'] ?? provider['user']?['name'] ?? 'Verified Owner';
    final int yearsExp = (provider['yearsExperience'] ?? provider['yearsExp'] ?? 5) as int;
    final String bio = provider['bio'] ?? provider['description'] ?? 'Certified local business and service specialist in Northern Ghana.';
    final String location = provider['serviceArea'] ?? provider['location'] ?? 'Tamale';
    final double rating = (provider['ratingAverage'] ?? provider['rating'] ?? 4.9) as double;
    final int reviews = (provider['reviewCount'] ?? provider['reviews'] ?? 28) as int;
    final int jobs = (provider['completedJobsCount'] ?? provider['jobsDone'] ?? 42) as int;
    final double? startingPrice = (provider['pricingFixedStart'] != null)
        ? double.tryParse(provider['pricingFixedStart'].toString())
        : null;
    final String phone = provider['phone'] ?? provider['user']?['phone'] ?? '+233240000000';
    final String slug = provider['slug'] ?? 'biz';
    final int trustScore = (provider['trustScore'] ?? 99) as int;

    final List<String> badges = (provider['badges'] is List)
        ? (provider['badges'] as List).map((b) => b.toString()).toList()
        : ['ID_VERIFIED', 'TOP_RATED', 'PHONE_VERIFIED', 'BUSINESS_VERIFIED'];

    return GestureDetector(
      onTap: () => context.push('/biz/$slug'),
      child: Container(
        width: width ?? 310,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.25 : 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // 1. Header: Avatar, Name, Owner & Trust Score Pill
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: ServoraColors.emerald600.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: ServoraColors.emerald600.withOpacity(0.3),
                      width: 1,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      name.isNotEmpty ? name[0].toUpperCase() : 'S',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: ServoraColors.emerald600,
                      ),
                    ),
                  ),
                ),
                const Gap(10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : const Color(0xFF18181B),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const Gap(2),
                      Text(
                        '$ownerName • $yearsExp yrs exp',
                        style: TextStyle(
                          fontSize: 10.5,
                          color: isDark ? Colors.white60 : Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const Gap(6),

                // 100% Trust Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: ServoraColors.emerald600.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: ServoraColors.emerald600.withOpacity(0.3),
                      width: 0.8,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.shield_outlined, size: 12, color: ServoraColors.emerald600),
                      const Gap(4),
                      Text(
                        '$trustScore% Trust',
                        style: const TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w900,
                          color: ServoraColors.emerald600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const Gap(12),

            // 2. Verification Badges Row
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                _buildBadgeChip('🛡️ ID Verified', const Color(0xFFFEF3C7), const Color(0xFFD97706)),
                _buildBadgeChip('⭐ Top Rated Seller', const Color(0xFFFEF3C7), const Color(0xFFD97706)),
                _buildBadgeChip('💬 Phone Verified', const Color(0xFFECFDF5), ServoraColors.emerald600),
                if (badges.contains('BUSINESS_VERIFIED') || badges.contains('BUSINESS'))
                  _buildBadgeChip('🏢 Business Verified', const Color(0xFFEFF6FF), const Color(0xFF2563EB)),
                if (badges.contains('FAST_RESPONDER'))
                  _buildBadgeChip('⚡ Fast Responder', const Color(0xFFF3E8FF), const Color(0xFF9333EA)),
              ],
            ),
            const Gap(10),

            // 3. Bio Description Snippet
            Text(
              bio,
              style: TextStyle(
                fontSize: 11,
                color: isDark ? Colors.white70 : Colors.grey[700],
                height: 1.35,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const Gap(12),

            // 4. Stats & Location Grid Box
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0),
                  width: 0.8,
                ),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_on_rounded, size: 13, color: ServoraColors.emerald600),
                      const Gap(4),
                      Expanded(
                        child: Text(
                          location,
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white70 : Colors.grey[800],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Icon(Icons.star_rounded, size: 13, color: Colors.amber),
                      const Gap(3),
                      Text(
                        '$rating ($reviews)',
                        style: const TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const Gap(6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.work_outline_rounded, size: 13, color: Color(0xFF2563EB)),
                          const Gap(4),
                          Text(
                            '$jobs jobs done',
                            style: TextStyle(
                              fontSize: 10.5,
                              color: isDark ? Colors.white70 : Colors.grey[700],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        startingPrice != null ? 'From GH₵ ${startingPrice.toStringAsFixed(2)}' : 'Price Offer',
                        style: const TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w900,
                          color: ServoraColors.emerald600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Gap(12),

            // 5. Action Buttons Row (View Business, WhatsApp, Safe MoMo Escrow)
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      side: BorderSide(
                        color: isDark ? Colors.white30 : Colors.grey[300]!,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () => context.push('/biz/$slug'),
                    child: Text(
                      'View Business',
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF18181B),
                      ),
                    ),
                  ),
                ),
                const Gap(6),

                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ServoraColors.emerald600,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () {
                      WhatsAppHelper.openWhatsApp(
                        phone: phone,
                        message: 'Hello $name, I found your business on Servora.gh app.',
                      );
                    },
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.chat_bubble_outline_rounded, size: 12),
                        Gap(4),
                        Text(
                          'WhatsApp',
                          style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
                const Gap(6),

                GestureDetector(
                  onTap: () => context.push('/escrow'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.5)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.shield_outlined, size: 12, color: Color(0xFFD97706)),
                        Gap(3),
                        Text(
                          'Safe MoMo',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFB45309),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadgeChip(String label, Color bg, Color text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 9.5,
          fontWeight: FontWeight.bold,
          color: text,
        ),
      ),
    );
  }
}
