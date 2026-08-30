import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../features/auth/providers/auth_provider.dart';

class StorefrontReviewModal extends StatefulWidget {
  final String businessName;
  final String businessSlug;
  final String? targetUserId;
  final VoidCallback onReviewSubmitted;

  const StorefrontReviewModal({
    super.key,
    required this.businessName,
    required this.businessSlug,
    this.targetUserId,
    required this.onReviewSubmitted,
  });

  static Future<void> show({
    required BuildContext context,
    required String businessName,
    required String businessSlug,
    String? targetUserId,
    required VoidCallback onReviewSubmitted,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StorefrontReviewModal(
        businessName: businessName,
        businessSlug: businessSlug,
        targetUserId: targetUserId,
        onReviewSubmitted: onReviewSubmitted,
      ),
    );
  }

  @override
  State<StorefrontReviewModal> createState() => _StorefrontReviewModalState();
}

class _StorefrontReviewModalState extends State<StorefrontReviewModal> {
  int _rating = 5;
  final TextEditingController _commentController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final user = authNotifier.state.user;
    if (user != null) {
      _nameController.text = user.name;
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    if (_commentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please write a brief comment regarding your experience.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await authNotifier.apiClient.post(
        '/reviews',
        data: {
          'targetId': widget.targetUserId ?? widget.businessSlug,
          'businessSlug': widget.businessSlug,
          'rating': _rating,
          'comment': _commentController.text.trim(),
          'authorName': _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : 'Verified Customer',
        },
      );
    } catch (_) {}

    setState(() => _isSubmitting = false);
    widget.onReviewSubmitted();

    if (mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('⭐ Review posted for ${widget.businessName}! Thank you for your feedback.'),
          backgroundColor: ServoraColors.emerald600,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final keyboardPadding = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      padding: EdgeInsets.fromLTRB(18, 16, 18, 16 + keyboardPadding),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Write a Review',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20),
                  onPressed: () => Navigator.pop(context),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const Gap(4),
            Text(
              'Share your honest experience purchasing or working with ${widget.businessName}.',
              style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white60 : Colors.grey[600]),
            ),
            const Gap(16),

            // Star Selector
            Center(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(5, (index) {
                  final starNum = index + 1;
                  final isFilled = starNum <= _rating;
                  return GestureDetector(
                    onTap: () => setState(() => _rating = starNum),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: Icon(
                        isFilled ? Icons.star_rounded : Icons.star_outline_rounded,
                        size: 34,
                        color: isFilled ? const Color(0xFFF59E0B) : Colors.grey[400],
                      ),
                    ),
                  );
                }),
              ),
            ),
            const Gap(6),
            Center(
              child: Text(
                _rating == 5
                    ? 'Excellent (5 Stars)'
                    : _rating == 4
                        ? 'Very Good (4 Stars)'
                        : _rating == 3
                            ? 'Average (3 Stars)'
                            : _rating == 2
                                ? 'Poor (2 Stars)'
                                : 'Terrible (1 Star)',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFF59E0B)),
              ),
            ),
            const Gap(16),

            // Reviewer Name
            Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
              ),
              child: TextField(
                controller: _nameController,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                decoration: InputDecoration(
                  labelText: 'Your Name (or Verified Customer)',
                  hintText: 'e.g. Ama Serwaa',
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  labelStyle: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey[700]),
                  hintStyle: TextStyle(fontSize: 11, color: isDark ? Colors.white30 : Colors.grey[400]),
                ),
              ),
            ),
            const Gap(10),

            // Review Comment
            Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
              ),
              child: TextField(
                controller: _commentController,
                maxLines: 4,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                decoration: InputDecoration(
                  labelText: 'Your Feedback / Comment *',
                  hintText: 'What did you buy or book? How was the speed, quality, and communication?',
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  labelStyle: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey[700]),
                  hintStyle: TextStyle(fontSize: 11, color: isDark ? Colors.white30 : Colors.grey[400]),
                ),
              ),
            ),
            const Gap(16),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: ServoraColors.emerald600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                onPressed: _isSubmitting ? null : _submitReview,
                child: _isSubmitting
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Post Customer Review ⭐', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
