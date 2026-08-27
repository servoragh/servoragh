import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme/servora_colors.dart';

class ServoraShimmerSkeleton extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const ServoraShimmerSkeleton({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 14.0,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = isDark ? const Color(0xFF1F2937) : const Color(0xFFE2E8F0);
    final highlightColor = isDark ? const Color(0xFF374151) : const Color(0xFFF1F5F9);

    return Shimmer.fromColors(
      baseColor: baseColor,
      highlightColor: highlightColor,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: baseColor,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }

  /// Grid Skeleton Item Loader matching Product / Business card layout
  static Widget productCardSkeleton(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Theme.of(context).brightness == Brightness.dark
              ? ServoraColors.darkCardBorder
              : ServoraColors.lightBorder,
        ),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ServoraShimmerSkeleton(width: 80, height: 16, borderRadius: 6),
          SizedBox(height: 12),
          ServoraShimmerSkeleton(width: double.infinity, height: 14),
          SizedBox(height: 6),
          ServoraShimmerSkeleton(width: 120, height: 14),
          SizedBox(height: 16),
          ServoraShimmerSkeleton(width: 90, height: 20),
          Spacer(),
          ServoraShimmerSkeleton(width: double.infinity, height: 36, borderRadius: 12),
        ],
      ),
    );
  }
}
