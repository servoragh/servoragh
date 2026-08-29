import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_shimmer_skeleton.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../../shared/widgets/servora_image_lightbox.dart';
import '../../auth/providers/auth_provider.dart';

class ProductDetailScreen extends StatefulWidget {
  final Map<String, dynamic> product;
  final String? slug;

  const ProductDetailScreen({
    super.key,
    required this.product,
    this.slug,
  });

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late PageController _pageController;
  int _activeImageIndex = 0;

  // Live Data State
  Map<String, dynamic>? _liveProduct;
  bool _isLiked = false;
  int _likesCount = 0;
  List<dynamic> _questions = [];
  List<dynamic> _reviews = [];
  Map<String, dynamic>? _reviewsSummary;
  List<dynamic> _recommendations = [];

  // Question Form
  final TextEditingController _questionController = TextEditingController();
  bool _isSubmittingQuestion = false;

  // Review Form Controllers
  int _selectedRating = 5;
  final TextEditingController _reviewTitleController = TextEditingController();
  final TextEditingController _reviewCommentController = TextEditingController();
  final TextEditingController _reviewPhotoController = TextEditingController();
  final List<String> _reviewPhotos = [];
  bool _isSubmittingReview = false;

  // Report Form
  String _selectedReportReason = 'MISLEADING_PRICE';
  final TextEditingController _reportDetailsController = TextEditingController();
  bool _isSubmittingReport = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _liveProduct = widget.product;
    _fetchLiveProductData();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _questionController.dispose();
    _reviewTitleController.dispose();
    _reviewCommentController.dispose();
    _reviewPhotoController.dispose();
    _reportDetailsController.dispose();
    super.dispose();
  }

  String get _productSlug {
    if (widget.slug != null && widget.slug!.isNotEmpty) return widget.slug!;
    return _liveProduct?['slug'] ?? _liveProduct?['id'] ?? 'product';
  }

  Future<void> _fetchLiveProductData() async {
    final slug = _productSlug;
    if (slug.isEmpty || slug == 'product') return;

    try {
      final res = await authNotifier.apiClient.get('/products/$slug');
      if (res.statusCode == 200 && res.data != null) {
        final data = res.data;
        if (mounted) {
          setState(() {
            _liveProduct = data['product'] ?? _liveProduct;
            _isLiked = data['isLiked'] ?? false;
            _likesCount = data['likesCount'] ?? _liveProduct?['likesCount'] ?? 0;
            _questions = data['questions'] ?? [];
            _reviews = data['reviews'] ?? [];
            _reviewsSummary = data['reviewsSummary'];
            _recommendations = data['recommendations'] ?? [];
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _toggleLike() async {
    final nextState = !_isLiked;
    final nextCount = nextState ? _likesCount + 1 : (_likesCount > 0 ? _likesCount - 1 : 0);

    setState(() {
      _isLiked = nextState;
      _likesCount = nextCount;
    });

    try {
      final res = await authNotifier.apiClient.post('/products/$_productSlug/like');
      if (res.statusCode == 200 && res.data != null) {
        if (mounted) {
          setState(() {
            _isLiked = res.data['isLiked'] ?? nextState;
            _likesCount = res.data['likesCount'] ?? nextCount;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLiked = !nextState;
          _likesCount = _likesCount;
        });
      }
    }
  }

  Future<void> _submitQuestion() async {
    final text = _questionController.text.trim();
    if (text.isEmpty) return;

    setState(() => _isSubmittingQuestion = true);
    try {
      final res = await authNotifier.apiClient.post(
        '/products/$_productSlug/questions',
        data: {'question': text},
      );
      if (res.statusCode == 200 && res.data['question'] != null) {
        if (mounted) {
          setState(() {
            _questions.insert(0, res.data['question']);
            _questionController.clear();
            _isSubmittingQuestion = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Question submitted to seller!'), backgroundColor: ServoraColors.emerald600),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmittingQuestion = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please log in to ask a question.'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _submitReview() async {
    final comment = _reviewCommentController.text.trim();
    if (comment.isEmpty) return;

    setState(() => _isSubmittingReview = true);
    try {
      final res = await authNotifier.apiClient.post(
        '/products/$_productSlug/reviews',
        data: {
          'rating': _selectedRating,
          'title': _reviewTitleController.text.trim().isNotEmpty
              ? _reviewTitleController.text.trim()
              : 'Verified Purchase Review',
          'comment': comment,
          'photos': _reviewPhotos,
        },
      );

      if (res.statusCode == 200 && res.data['review'] != null) {
        if (mounted) {
          setState(() {
            _reviews.insert(0, res.data['review']);
            _reviewCommentController.clear();
            _reviewTitleController.clear();
            _reviewPhotos.clear();
            _isSubmittingReview = false;
          });
          Navigator.of(context).pop();
          _fetchLiveProductData();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Review published successfully!'), backgroundColor: ServoraColors.emerald600),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmittingReview = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit review. Please try again.'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _submitReport() async {
    setState(() => _isSubmittingReport = true);
    try {
      await authNotifier.apiClient.post(
        '/products/$_productSlug/report',
        data: {
          'reason': _selectedReportReason,
          'description': _reportDetailsController.text.trim(),
        },
      );
      if (mounted) {
        setState(() => _isSubmittingReport = false);
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Report submitted for admin review.'),
            backgroundColor: ServoraColors.emerald600,
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isSubmittingReport = false);
        Navigator.of(context).pop();
      }
    }
  }

  List<String> _extractImages() {
    final images = <String>[];
    final prod = _liveProduct ?? widget.product;

    final rawImages = prod['images'];
    if (rawImages is List) {
      for (final img in rawImages) {
        if (img != null && img.toString().isNotEmpty && !images.contains(img.toString())) {
          images.add(img.toString());
        }
      }
    } else if (rawImages is String && rawImages.isNotEmpty) {
      images.add(rawImages);
    }

    final mainImage = prod['image'] as String?;
    if (mainImage != null && mainImage.isNotEmpty && !images.contains(mainImage)) {
      images.insert(0, mainImage);
    }

    if (images.isEmpty) {
      images.add('https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80');
    }

    return images;
  }

  void _showShareSheet() {
    final title = _liveProduct?['title'] ?? 'Marketplace Item';
    final price = _liveProduct?['price'] ?? 0;
    final phone = _liveProduct?['seller']?['whatsapp'] ?? _liveProduct?['seller']?['phone'] ?? '+233240000000';

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Share this Listing', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                IconButton(onPressed: () => Navigator.of(ctx).pop(), icon: const Icon(Icons.close)),
              ],
            ),
            const Gap(12),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF25D366),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              icon: const Icon(Icons.share_rounded),
              label: const Text('Share to WhatsApp Chats & Status', style: TextStyle(fontWeight: FontWeight.bold)),
              onPressed: () {
                Navigator.of(ctx).pop();
                WhatsAppHelper.openWhatsApp(
                  phone: phone,
                  message: 'Check out this verified listing on Servora.gh: "$title" (GH₵ $price).',
                );
              },
            ),
            const Gap(8),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              icon: const Icon(Icons.copy_rounded),
              label: const Text('Copy Listing Details & Link', style: TextStyle(fontWeight: FontWeight.bold)),
              onPressed: () {
                Clipboard.setData(ClipboardData(text: '$title - GH₵ $price on Servora.gh Tamale Marketplace'));
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Copied to clipboard!'), duration: Duration(seconds: 2)),
                );
              },
            ),
            const Gap(12),
          ],
        ),
      ),
    );
  }

  void _showReportSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.flag_rounded, color: Colors.red, size: 20),
                      Gap(8),
                      Text('Report this Listing', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  IconButton(onPressed: () => Navigator.of(ctx).pop(), icon: const Icon(Icons.close)),
                ],
              ),
              const Gap(12),
              const Text('Select reason for reporting:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              const Gap(6),
              DropdownButtonFormField<String>(
                value: _selectedReportReason,
                decoration: InputDecoration(
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: const [
                  DropdownMenuItem(value: 'MISLEADING_PRICE', child: Text('Misleading Price or Fake Discount')),
                  DropdownMenuItem(value: 'SUSPICIOUS_ITEM', child: Text('Counterfeit or Prohibited Item')),
                  DropdownMenuItem(value: 'UNRESPONSIVE_SELLER', child: Text('Unresponsive / Fake Contact')),
                  DropdownMenuItem(value: 'SCAM_ATTEMPT', child: Text('Suspected Advance Fee Scam')),
                ],
                onChanged: (val) => setSheetState(() => _selectedReportReason = val ?? 'MISLEADING_PRICE'),
              ),
              const Gap(12),
              TextField(
                controller: _reportDetailsController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Provide additional details for admin moderation...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
              const Gap(16),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: _isSubmittingReport ? null : _submitReport,
                child: _isSubmittingReport
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Submit Report to Admin', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showWriteReviewSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Write a Verified Review', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    IconButton(onPressed: () => Navigator.of(ctx).pop(), icon: const Icon(Icons.close)),
                  ],
                ),
                const Gap(10),
                const Text('Rate your experience (1 to 5 Stars):', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const Gap(6),
                Row(
                  children: List.generate(5, (index) {
                    final star = index + 1;
                    return IconButton(
                      icon: Icon(
                        Icons.star_rounded,
                        size: 32,
                        color: star <= _selectedRating ? Colors.amber[600] : Colors.grey[400],
                      ),
                      onPressed: () => setSheetState(() => _selectedRating = star),
                    );
                  }),
                ),
                const Gap(10),
                TextField(
                  controller: _reviewTitleController,
                  decoration: InputDecoration(
                    hintText: 'Review Title (e.g. Excellent service, arrived in 30 mins!)',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
                const Gap(10),
                TextField(
                  controller: _reviewCommentController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'Describe item quality, packaging, delivery speed, or communication...',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const Gap(10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _reviewPhotoController,
                        decoration: InputDecoration(
                          hintText: 'Photo URL (optional)...',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                    ),
                    const Gap(8),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ServoraColors.emerald600,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        final p = _reviewPhotoController.text.trim();
                        if (p.isNotEmpty) {
                          setSheetState(() {
                            _reviewPhotos.add(p);
                            _reviewPhotoController.clear();
                          });
                        }
                      },
                      child: const Text('+ Add'),
                    ),
                  ],
                ),
                if (_reviewPhotos.isNotEmpty) ...[
                  const Gap(8),
                  Wrap(
                    spacing: 6,
                    children: _reviewPhotos
                        .map((p) => Chip(
                              label: const Text('Photo Attached', style: TextStyle(fontSize: 10)),
                              onDeleted: () => setSheetState(() => _reviewPhotos.remove(p)),
                            ))
                        .toList(),
                  ),
                ],
                const Gap(16),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ServoraColors.emerald600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: _isSubmittingReview ? null : _submitReview,
                  child: _isSubmittingReview
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Submit Verified Review', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final prod = _liveProduct ?? widget.product;
    final images = _extractImages();

    final title = prod['title'] ?? 'Marketplace Product Listing';
    final category = prod['category'] ?? 'General Marketplace';
    final area = prod['area'] ?? prod['location'] ?? 'Lamashegu, Tamale';
    final condition = prod['condition'] ?? 'USED_GOOD';
    final stock = prod['stockQuantity'] ?? 1;

    final double price = (prod['price'] is num) ? (prod['price'] as num).toDouble() : 0.0;
    final double? originalPrice = (prod['originalPrice'] is num) ? (prod['originalPrice'] as num).toDouble() : null;
    final hasDiscount = originalPrice != null && originalPrice > price;
    final discountPct = prod['discountPercent'] ?? (hasDiscount ? (((originalPrice - price) / originalPrice) * 100).round() : 0);

    final sellerData = prod['seller'] is Map ? prod['seller'] : {};
    final sellerName = sellerData['businessName'] ?? sellerData['name'] ?? prod['seller'] ?? 'Verified Local Business';
    final sellerSlug = sellerData['slug'] ?? prod['providerSlug'] ?? 'royals-motors';
    final sellerLogo = sellerData['logoUrl'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80';
    final sellerRating = sellerData['ratingAverage'] ?? sellerData['rating'] ?? 5.0;
    final sellerReviewCount = sellerData['reviewsCount'] ?? sellerData['reviewCount'] ?? 18;
    final phone = sellerData['whatsapp'] ?? sellerData['phone'] ?? prod['phone'] ?? '+233240000000';

    final description = prod['description'] ??
        'High quality genuine product verified and sourced directly in Northern Ghana.\n\n• Condition: Brand New / Tested Working\n• Warranty: 6 Months Local Guarantee\n• Delivery: Same-Day Express Haulage Available across Tamale.';

    return Scaffold(
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              // =========================================================================
              // SECTION A: TOP BAR & HERO GALLERY
              // =========================================================================
              SliverAppBar(
                expandedHeight: 340,
                pinned: true,
                backgroundColor: isDark ? ServoraColors.darkSurface : Colors.white,
                leading: IconButton(
                  icon: const CircleAvatar(
                    backgroundColor: Colors.black54,
                    child: Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                  ),
                  onPressed: () {
                    if (Navigator.of(context).canPop()) {
                      context.pop();
                    } else {
                      context.go('/products');
                    }
                  },
                ),
                actions: [
                  // Like Button
                  IconButton(
                    icon: CircleAvatar(
                      backgroundColor: Colors.black54,
                      child: Icon(
                        _isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                        color: _isLiked ? Colors.redAccent : Colors.white,
                        size: 20,
                      ),
                    ),
                    onPressed: _toggleLike,
                  ),
                  // Share Button
                  IconButton(
                    icon: const CircleAvatar(
                      backgroundColor: Colors.black54,
                      child: Icon(Icons.share_rounded, color: Colors.white, size: 20),
                    ),
                    onPressed: _showShareSheet,
                  ),
                  // Report Button
                  IconButton(
                    icon: const CircleAvatar(
                      backgroundColor: Colors.black54,
                      child: Icon(Icons.flag_rounded, color: Colors.white, size: 18),
                    ),
                    onPressed: _showReportSheet,
                  ),
                  const Gap(6),
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
                          return GestureDetector(
                            onTap: () => ServoraImageLightbox.show(
                              context,
                              title: title,
                              images: images,
                              initialIndex: index,
                            ),
                            child: CachedNetworkImage(
                              imageUrl: images[index],
                              fit: BoxFit.cover,
                              width: double.infinity,
                              placeholder: (_, __) => const ServoraShimmerSkeleton(
                                width: double.infinity,
                                height: 340,
                                borderRadius: 0,
                              ),
                              errorWidget: (_, __, ___) => Container(
                                color: ServoraColors.emerald600.withOpacity(0.12),
                                child: const Center(
                                  child: Icon(Icons.inventory_2_rounded, size: 80, color: ServoraColors.emerald600),
                                ),
                              ),
                            ),
                          );
                        },
                      ),

                      // Overlay Badges (Top Left)
                      Positioned(
                        top: 80,
                        left: 16,
                        child: Wrap(
                          direction: Axis.vertical,
                          spacing: 6,
                          children: [
                            if (hasDiscount)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.red[600],
                                  borderRadius: BorderRadius.circular(10),
                                  boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                                ),
                                child: Text(
                                  '🏷️ $discountPct% OFF',
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.white),
                                ),
                              ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black87,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: Colors.white24),
                              ),
                              child: Text(
                                condition == 'BRAND_NEW'
                                    ? '✨ Brand New'
                                    : condition == 'REFURBISHED'
                                        ? '🔧 Refurbished'
                                        : '✓ Tested Working',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF059669),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                '✓ In Stock: $stock available',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ),
                          ],
                        ),
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

              // =========================================================================
              // PRODUCT INFO & CHECKOUT DETAILS
              // =========================================================================
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Category Tag
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
                          Row(
                            children: [
                              const Icon(Icons.favorite_rounded, size: 14, color: Colors.redAccent),
                              const Gap(4),
                              Text('$_likesCount likes', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                            ],
                          ),
                        ],
                      ),
                      const Gap(10),

                      // Title
                      Text(
                        title,
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, height: 1.25),
                      ),
                      const Gap(12),

                      // Price Block with Strikethrough & Savings
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isDark ? ServoraColors.darkSurface : Colors.grey[100],
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.baseline,
                                  textBaseline: TextBaseline.alphabetic,
                                  children: [
                                    Text(
                                      'GH₵ ${price.toStringAsFixed(2)}',
                                      style: const TextStyle(
                                        fontSize: 24,
                                        fontWeight: FontWeight.w900,
                                        color: ServoraColors.emerald600,
                                      ),
                                    ),
                                    if (hasDiscount) ...[
                                      const Gap(8),
                                      Text(
                                        'GH₵ ${originalPrice.toStringAsFixed(2)}',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.grey[500],
                                          decoration: TextDecoration.lineThrough,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                if (hasDiscount)
                                  Text(
                                    'Save GH₵ ${(originalPrice - price).toStringAsFixed(2)} ($discountPct%)',
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.redAccent),
                                  ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF3C7),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.shield_rounded, size: 14, color: Color(0xFFD97706)),
                                  Gap(4),
                                  Text(
                                    'MoMo Escrow',
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD97706)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Gap(16),

                      // Attributes 4-Grid
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisSpacing: 8,
                        mainAxisSpacing: 8,
                        childAspectRatio: 3.2,
                        children: [
                          _buildAttributeTile(Icons.location_on_rounded, area, ServoraColors.emerald600),
                          _buildAttributeTile(Icons.local_shipping_rounded, 'Express Delivery', Colors.blue),
                          _buildAttributeTile(Icons.verified_user_rounded, 'Buyer Protected', Colors.teal),
                          _buildAttributeTile(Icons.check_circle_rounded, 'Verified Condition', Colors.amber),
                        ],
                      ),
                      const Gap(20),

                      // Seller Trust Card
                      GestureDetector(
                        onTap: () => context.push('/biz/$sellerSlug'),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: isDark
                                  ? [ServoraColors.darkSurface, ServoraColors.darkBackground]
                                  : [const Color(0xFFECFDF5), Colors.white],
                            ),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: ServoraColors.emerald600.withOpacity(0.3)),
                          ),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(14),
                                child: CachedNetworkImage(
                                  imageUrl: sellerLogo,
                                  width: 48,
                                  height: 48,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              const Gap(12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'SOLD BY VERIFIED LOCAL BUSINESS',
                                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: ServoraColors.emerald600, letterSpacing: 0.5),
                                    ),
                                    Text(
                                      sellerName,
                                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                    ),
                                    Row(
                                      children: [
                                        const Icon(Icons.star_rounded, size: 14, color: Colors.amber),
                                        const Gap(2),
                                        Text(
                                          '$sellerRating ($sellerReviewCount reviews)',
                                          style: const TextStyle(fontSize: 11, color: Colors.grey),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.chevron_right_rounded, color: ServoraColors.emerald600),
                            ],
                          ),
                        ),
                      ),
                      const Gap(24),

                      // Description
                      const Text(
                        'Specifications & Scope',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const Gap(8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isDark ? ServoraColors.darkSurface : Colors.grey[50],
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: isDark ? Colors.grey[800]! : Colors.grey[200]!),
                        ),
                        child: Text(
                          description,
                          style: TextStyle(fontSize: 13, height: 1.6, color: isDark ? Colors.grey[300] : Colors.grey[800]),
                        ),
                      ),
                      const Gap(32),

                      // =========================================================================
                      // SECTION B: CUSTOMER QUESTIONS & ANSWERS (Q&A)
                      // =========================================================================
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '❓ Questions & Answers (${_questions.length})',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const Gap(8),
                      Text(
                        'Ask $sellerName or past buyers in Tamale',
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                      const Gap(12),

                      // Question Input Box
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _questionController,
                              decoration: InputDecoration(
                                hintText: 'Ask about specs, warranty, delivery...',
                                hintStyle: const TextStyle(fontSize: 12),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ),
                          const Gap(8),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ServoraColors.emerald600,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            onPressed: _isSubmittingQuestion ? null : _submitQuestion,
                            child: _isSubmittingQuestion
                                ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Text('Ask', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const Gap(16),

                      // Questions List
                      if (_questions.isEmpty)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 16),
                            child: Text('No questions yet. Be the first to ask!', style: TextStyle(fontSize: 12, color: Colors.grey)),
                          ),
                        )
                      else
                        ..._questions.map((q) => Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isDark ? ServoraColors.darkSurface : Colors.grey[50],
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: isDark ? Colors.grey[800]! : Colors.grey[200]!),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        q['asker']?['name'] ?? 'Customer Member',
                                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                      ),
                                      Text(
                                        q['createdAt'] != null
                                            ? q['createdAt'].toString().substring(0, 10)
                                            : 'Recent',
                                        style: const TextStyle(fontSize: 10, color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                  const Gap(4),
                                  Text(
                                    'Q: ${q['question']}',
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                  ),
                                  if (q['answer'] != null) ...[
                                    const Gap(8),
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: ServoraColors.emerald600.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: ServoraColors.emerald600.withOpacity(0.2)),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Row(
                                            children: [
                                              Icon(Icons.check_circle_rounded, size: 12, color: ServoraColors.emerald600),
                                              Gap(4),
                                              Text('Verified Seller', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                                            ],
                                          ),
                                          const Gap(2),
                                          Text(
                                            'A: ${q['answer']}',
                                            style: const TextStyle(fontSize: 12),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            )),
                      const Gap(32),

                      // =========================================================================
                      // SECTION C: VERIFIED CUSTOMER REVIEWS & STAR RATINGS
                      // =========================================================================
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '⭐ Verified Customer Reviews (${_reviews.length})',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          TextButton(
                            onPressed: _showWriteReviewSheet,
                            child: const Text('Write Review', style: TextStyle(color: ServoraColors.emerald600, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const Gap(8),

                      // Review Summary Score
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isDark ? ServoraColors.darkSurface : Colors.grey[100],
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Row(
                          children: [
                            Column(
                              children: [
                                Text(
                                  (_reviewsSummary?['averageRating'] ?? 5.0).toString(),
                                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900),
                                ),
                                Row(
                                  children: List.generate(5, (_) => const Icon(Icons.star_rounded, size: 16, color: Colors.amber)),
                                ),
                                const Gap(4),
                                Text('${_reviews.length} reviews', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                              ],
                            ),
                            const Gap(20),
                            Expanded(
                              child: Column(
                                children: [5, 4, 3, 2, 1].map((star) {
                                  final pct = _reviewsSummary?['ratingPercentages']?[star.toString()] ?? (star == 5 ? 100 : 0);
                                  return Row(
                                    children: [
                                      Text('$star★', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                      const Gap(6),
                                      Expanded(
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(4),
                                          child: LinearProgressIndicator(
                                            value: (pct as num).toDouble() / 100.0,
                                            backgroundColor: Colors.grey[300],
                                            valueColor: const AlwaysStoppedAnimation<Color>(Colors.amber),
                                            minHeight: 6,
                                          ),
                                        ),
                                      ),
                                    ],
                                  );
                                }).toList(),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Gap(16),

                      // Reviews Feed
                      if (_reviews.isEmpty)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 16),
                            child: Text('No reviews yet. Share your experience with this seller!', style: TextStyle(fontSize: 12, color: Colors.grey)),
                          ),
                        )
                      else
                        ..._reviews.map((rev) => Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: isDark ? ServoraColors.darkSurface : Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: isDark ? Colors.grey[800]! : Colors.grey[200]!),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          CircleAvatar(
                                            radius: 14,
                                            backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
                                            child: Text(
                                              rev['author']?['name'] != null ? rev['author']['name'][0].toUpperCase() : 'C',
                                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                                            ),
                                          ),
                                          const Gap(8),
                                          Text(
                                            rev['author']?['name'] ?? 'Verified Buyer',
                                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                          ),
                                        ],
                                      ),
                                      Row(
                                        children: List.generate(
                                          (rev['rating'] is num ? (rev['rating'] as num).toInt() : 5),
                                          (_) => const Icon(Icons.star_rounded, size: 14, color: Colors.amber),
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (rev['title'] != null && rev['title'].toString().isNotEmpty) ...[
                                    const Gap(6),
                                    Text(rev['title'], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                  ],
                                  const Gap(4),
                                  Text(
                                    rev['comment'] ?? '',
                                    style: TextStyle(fontSize: 12, height: 1.5, color: isDark ? Colors.grey[300] : Colors.grey[800]),
                                  ),
                                  if (rev['photos'] is List && (rev['photos'] as List).isNotEmpty) ...[
                                    const Gap(8),
                                    Wrap(
                                      spacing: 8,
                                      children: (rev['photos'] as List)
                                          .map((p) => ClipRRect(
                                                borderRadius: BorderRadius.circular(8),
                                                child: CachedNetworkImage(
                                                  imageUrl: p.toString(),
                                                  width: 54,
                                                  height: 54,
                                                  fit: BoxFit.cover,
                                                ),
                                              ))
                                          .toList(),
                                    ),
                                  ],
                                ],
                              ),
                            )),
                      const Gap(32),

                      // =========================================================================
                      // SECTION D: DYNAMIC RECOMMENDATIONS ("YOU MAY ALSO LIKE")
                      // =========================================================================
                      if (_recommendations.isNotEmpty) ...[
                        const Text(
                          '✨ You May Also Like',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const Gap(12),
                        SizedBox(
                          height: 220,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: _recommendations.length,
                            itemBuilder: (context, index) {
                              final rec = _recommendations[index];
                              final recPrice = (rec['price'] is num) ? (rec['price'] as num).toDouble() : 0.0;
                              return Container(
                                width: 160,
                                margin: const EdgeInsets.only(right: 12),
                                child: GestureDetector(
                                  onTap: () => context.push('/products/${rec['slug']}'),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: isDark ? ServoraColors.darkSurface : Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: isDark ? Colors.grey[800]! : Colors.grey[200]!),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        ClipRRect(
                                          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                          child: CachedNetworkImage(
                                            imageUrl: rec['image'] ?? 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80',
                                            height: 110,
                                            width: 160,
                                            fit: BoxFit.cover,
                                          ),
                                        ),
                                        Padding(
                                          padding: const EdgeInsets.all(8),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                rec['title'] ?? '',
                                                maxLines: 2,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                              ),
                                              const Gap(4),
                                              Text(
                                                'GH₵ ${recPrice.toStringAsFixed(0)}',
                                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                      const Gap(100), // Spacing for sticky bottom bar
                    ],
                  ),
                ),
              ),
            ],
          ),

          // =========================================================================
          // STICKY BOTTOM ACTION BAR (WHATSAPP & ESCROW CTA)
          // =========================================================================
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('TOTAL PRICE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.grey)),
                      Text(
                        'GH₵ ${price.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                      ),
                    ],
                  ),
                  const Gap(16),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: () {
                        WhatsAppHelper.openWhatsApp(
                          phone: phone,
                          message: 'Hello $sellerName, I would like to order "$title" (GH₵ $price) on Servora.gh app.',
                        );
                      },
                      child: const Text('Order WhatsApp ✈️', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const Gap(8),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber[700],
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: () => context.push('/escrow'),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.shield_rounded, size: 16),
                        Gap(4),
                        Text('Escrow', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
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

  Widget _buildAttributeTile(IconData icon, String label, Color color) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? ServoraColors.darkSurface : Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? Colors.grey[800]! : Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const Gap(6),
          Expanded(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
