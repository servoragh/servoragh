import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_shimmer_skeleton.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../../core/utils/time_formatter.dart';
import '../../../shared/widgets/presence_badge.dart';
import '../../../shared/widgets/servora_image_lightbox.dart';
import '../../../shared/widgets/servora_image_upload_widget.dart';
import '../../../shared/widgets/category_picker_sheet.dart';
import '../../../shared/widgets/servora_location_picker_sheet.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/services/marketplace_api_service.dart';

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
    _reviewCommentController.dispose();
    _reviewPhotoController.dispose();
    _reportDetailsController.dispose();
    super.dispose();
  }

  String get _productSlug {
    if (widget.slug != null && widget.slug!.isNotEmpty) {
      return widget.slug!.replaceFirst(RegExp(r'^(leg-prod-|prod-|rent-)'), '');
    }
    final raw = widget.product['slug']?.toString() ??
        widget.product['id']?.toString() ??
        _liveProduct?['slug']?.toString() ??
        _liveProduct?['id']?.toString() ??
        '';
    return raw.replaceFirst(RegExp(r'^(leg-prod-|prod-|rent-)'), '');
  }

  Future<void> _fetchLiveProductData() async {
    final slug = _productSlug;
    if (slug.isEmpty || slug == 'product') return;

    try {
      final res = await authNotifier.apiClient.get('/products/$slug');
      if (res.statusCode == 200 && res.data != null && res.data['product'] != null) {
        final data = res.data;
        if (mounted) {
          setState(() {
            _liveProduct = Map<String, dynamic>.from(data['product'] as Map);
            _isLiked = data['isLiked'] ?? false;
            _likesCount = data['likesCount'] ?? _liveProduct?['likesCount'] ?? 0;
            _questions = (data['questions'] is List) ? data['questions'] as List : [];
            _reviews = (data['reviews'] is List) ? data['reviews'] as List : [];
            _reviewsSummary = data['reviewsSummary'] is Map ? Map<String, dynamic>.from(data['reviewsSummary'] as Map) : null;
            _recommendations = (data['recommendations'] is List) ? data['recommendations'] as List : [];
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

    final dynamic rawMainImage = prod['image'];
    if (rawMainImage is String && rawMainImage.isNotEmpty && !images.contains(rawMainImage)) {
      images.insert(0, rawMainImage);
    } else if (rawMainImage is List) {
      for (final img in rawMainImage) {
        if (img != null && img.toString().isNotEmpty && !images.contains(img.toString())) {
          images.add(img.toString());
        }
      }
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
                  controller: _reviewCommentController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'Describe item quality, packaging, delivery speed, or communication...',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const Gap(12),
                ServoraImageUploadWidget(
                  initialImages: _reviewPhotos,
                  onImagesChanged: (imgs) {
                    setSheetState(() {
                      _reviewPhotos.clear();
                      _reviewPhotos.addAll(imgs);
                    });
                  },
                  label: 'ATTACH REVIEW PHOTOS (OPTIONAL)',
                  helperText: 'Upload clear photos taken from your phone camera or gallery.',
                  maxImages: 4,
                ),
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

  bool get _isOwner {
    final user = authNotifier.state.user;
    if (user == null) return false;
    final prod = _liveProduct ?? widget.product;
    final sellerId = prod['sellerId']?.toString() ?? prod['seller']?['id']?.toString();
    final sellerPhone = prod['seller']?['phone']?.toString() ?? prod['phone']?.toString();
    return (sellerId != null && sellerId == user.id) ||
        (sellerPhone != null && sellerPhone == user.phone) ||
        user.role == 'ADMIN' ||
        user.role == 'SUPER_ADMIN';
  }

  void _openFullProductEditSheet() {
    final prod = _liveProduct ?? widget.product;
    final pId = prod['id']?.toString() ?? '';

    final titleCtrl = TextEditingController(text: prod['title'] ?? '');
    final descCtrl = TextEditingController(text: prod['description'] ?? '');
    final priceCtrl = TextEditingController(text: prod['price']?.toString() ?? '');
    final originalPriceCtrl = TextEditingController(text: prod['originalPrice']?.toString() ?? '');
    final stockCtrl = TextEditingController(text: (prod['stockQuantity'] ?? 1).toString());
    final categoryCtrl = TextEditingController(text: prod['category'] ?? 'Electronics');
    String? subCategoryVal = prod['subCategory']?.toString();
    String conditionVal = prod['condition']?.toString() ?? 'BRAND_NEW';
    String inventoryStatusVal = prod['inventoryStatus']?.toString() ?? 'IN_STOCK';
    String areaVal = prod['area']?.toString() ?? prod['location']?.toString() ?? 'Tamale Central';
    bool isNegotiableVal = prod['isNegotiable'] == true;

    List<String> deliveryOptions = [];
    final rawDeliv = prod['deliveryOptions'];
    if (rawDeliv is List) {
      deliveryOptions = rawDeliv.map((e) => e.toString()).toList();
    } else if (rawDeliv is String) {
      try {
        final decoded = jsonDecode(rawDeliv);
        if (decoded is List) deliveryOptions = decoded.map((e) => e.toString()).toList();
      } catch (_) {
        deliveryOptions = ['PICKUP', 'LOCAL_DELIVERY'];
      }
    }
    if (deliveryOptions.isEmpty) {
      deliveryOptions = ['PICKUP', 'LOCAL_DELIVERY'];
    }

    List<String> currentImages = [];
    final rawImgs = prod['images'];
    if (rawImgs is List) {
      currentImages = rawImgs.map((e) => e.toString()).toList();
    } else if (rawImgs is String && rawImgs.startsWith('http')) {
      currentImages = [rawImgs];
    }
    if (currentImages.isEmpty && prod['image'] != null) {
      currentImages = [prod['image'].toString()];
    }

    bool isSaving = false;

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
            constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.92),
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
                        color: isDark ? Colors.white24 : Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const Gap(16),
                  const Row(
                    children: [
                      Icon(Icons.edit_note_rounded, color: ServoraColors.emerald600, size: 24),
                      Gap(8),
                      Text('Edit Product Setup', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
                    ],
                  ),
                  const Gap(4),
                  const Text(
                    'Update full listing information, pricing, condition, location, delivery & photos.',
                    style: TextStyle(fontSize: 11.5, color: Colors.grey),
                  ),
                  const Divider(height: 24),

                  // Title
                  const Text('PRODUCT TITLE *', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                  const Gap(4),
                  TextField(
                    controller: titleCtrl,
                    decoration: InputDecoration(
                      hintText: 'e.g. 50kg Savannah Parboiled Rice',
                      filled: true,
                      fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const Gap(12),

                  // Category & Subcategory Picker
                  const Text('INDUSTRY CATEGORY & SUBCATEGORY *', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                  const Gap(4),
                  InkWell(
                    onTap: () {
                      CategoryPickerSheet.show(
                        ctx,
                        selectedCategory: categoryCtrl.text,
                        selectedSubCategory: subCategoryVal,
                        onSelect: (cat, sub) {
                          setModalState(() {
                            categoryCtrl.text = cat;
                            subCategoryVal = sub;
                          });
                        },
                      );
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: ServoraColors.emerald600.withOpacity(0.4)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.layers_rounded, color: ServoraColors.emerald600, size: 20),
                          const Gap(10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  categoryCtrl.text.isNotEmpty ? categoryCtrl.text : 'Select Category',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: isDark ? Colors.white : const Color(0xFF1C1917)),
                                ),
                                Text(
                                  subCategoryVal != null && subCategoryVal!.isNotEmpty
                                      ? 'Subcategory: $subCategoryVal'
                                      : 'Tap to pick subcategory',
                                  style: const TextStyle(fontSize: 10, color: ServoraColors.emerald600, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: ServoraColors.emerald600,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('Change', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Gap(12),

                  // Pricing Row
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('SELLING PRICE (GH₵) *', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                            const Gap(4),
                            TextField(
                              controller: priceCtrl,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
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
                            const Text('COMPARE-AT PRICE (GH₵)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                            const Gap(4),
                            TextField(
                              controller: originalPriceCtrl,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                hintText: 'Optional',
                                filled: true,
                                fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Gap(12),

                  // Stock & Inventory Status
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('STOCK QUANTITY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                            const Gap(4),
                            TextField(
                              controller: stockCtrl,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
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
                            const Text('INVENTORY STATUS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                            const Gap(4),
                            DropdownButtonFormField<String>(
                              value: inventoryStatusVal,
                              dropdownColor: isDark ? ServoraColors.darkSurface : Colors.white,
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                              ),
                              items: const [
                                DropdownMenuItem(value: 'IN_STOCK', child: Text('In Stock', style: TextStyle(fontSize: 12))),
                                DropdownMenuItem(value: 'LOW_STOCK', child: Text('Low Stock', style: TextStyle(fontSize: 12))),
                                DropdownMenuItem(value: 'SOLD_OUT', child: Text('Sold Out', style: TextStyle(fontSize: 12))),
                              ],
                              onChanged: (val) {
                                if (val != null) setModalState(() => inventoryStatusVal = val);
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Gap(12),

                  // Condition Selector
                  const Text('ITEM CONDITION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                  const Gap(4),
                  DropdownButtonFormField<String>(
                    value: conditionVal,
                    dropdownColor: isDark ? ServoraColors.darkSurface : Colors.white,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'BRAND_NEW', child: Text('✨ Brand New (Unopened)', style: TextStyle(fontSize: 13))),
                      DropdownMenuItem(value: 'USED_LIKE_NEW', child: Text('💎 Used - Like New', style: TextStyle(fontSize: 13))),
                      DropdownMenuItem(value: 'USED_GOOD', child: Text('👍 Used - Good Condition', style: TextStyle(fontSize: 13))),
                      DropdownMenuItem(value: 'USED_FAIR', child: Text('👌 Used - Fair / Working', style: TextStyle(fontSize: 13))),
                      DropdownMenuItem(value: 'REFURBISHED', child: Text('🔧 Refurbished', style: TextStyle(fontSize: 13))),
                    ],
                    onChanged: (val) {
                      if (val != null) setModalState(() => conditionVal = val);
                    },
                  ),
                  const Gap(12),

                  // Location / Area Picker
                  const Text('BUSINESS / PICKUP LOCATION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                  const Gap(4),
                  InkWell(
                    onTap: () async {
                      final picked = await ServoraLocationPickerSheet.show(context);
                      if (picked != null) {
                        setModalState(() {
                          areaVal = picked.name;
                        });
                      }
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.location_on_rounded, color: ServoraColors.emerald600, size: 18),
                          const Gap(8),
                          Expanded(
                            child: Text(
                              areaVal.isNotEmpty ? areaVal : 'Tap to select location',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                            ),
                          ),
                          const Icon(Icons.chevron_right_rounded, color: Colors.grey, size: 18),
                        ],
                      ),
                    ),
                  ),
                  const Gap(12),

                  // Delivery Options
                  const Text('AVAILABLE DELIVERY OPTIONS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                  const Gap(6),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      {'id': 'PICKUP', 'label': 'Self-Pickup'},
                      {'id': 'LOCAL_DELIVERY', 'label': 'Local Rider'},
                      {'id': 'NATIONWIDE_SHIPPING', 'label': 'Nationwide Shipping'},
                    ].map((opt) {
                      final selected = deliveryOptions.contains(opt['id']);
                      return FilterChip(
                        selected: selected,
                        label: Text(opt['label']!, style: TextStyle(fontSize: 11.5, fontWeight: selected ? FontWeight.bold : FontWeight.normal)),
                        selectedColor: ServoraColors.emerald600.withOpacity(0.18),
                        checkmarkColor: ServoraColors.emerald600,
                        backgroundColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        onSelected: (val) {
                          setModalState(() {
                            if (val) {
                              deliveryOptions.add(opt['id']!);
                            } else {
                              deliveryOptions.remove(opt['id']);
                            }
                          });
                        },
                      );
                    }).toList(),
                  ),
                  const Gap(12),

                  // Negotiable Switch
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Price is Negotiable', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    subtitle: const Text('Allows buyers to send counter-offers via chat', style: TextStyle(fontSize: 11, color: Colors.grey)),
                    value: isNegotiableVal,
                    activeColor: ServoraColors.emerald600,
                    onChanged: (val) => setModalState(() => isNegotiableVal = val),
                  ),
                  const Gap(6),

                  // Description
                  const Text('DESCRIPTION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                  const Gap(4),
                  TextField(
                    controller: descCtrl,
                    maxLines: 3,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const Gap(16),

                  // Native Photo Upload Component (Up to 10 photos)
                  ServoraImageUploadWidget(
                    initialImages: currentImages,
                    maxImages: 10,
                    label: 'MANAGE PHOTOS (UP TO 10)',
                    helperText: 'Add new photos or remove existing ones. 1st photo is cover photo.',
                    onImagesChanged: (imgs) {
                      setModalState(() {
                        currentImages = imgs;
                      });
                    },
                  ),
                  const Gap(20),

                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: isSaving ? null : () => Navigator.pop(ctx),
                          child: const Text('Cancel', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const Gap(10),
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ServoraColors.emerald600,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: isSaving
                              ? null
                              : () async {
                                  final title = titleCtrl.text.trim();
                                  final price = double.tryParse(priceCtrl.text.trim()) ?? 0.0;
                                  if (title.isEmpty || price <= 0) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Please enter a valid title and price.')),
                                    );
                                    return;
                                  }

                                  setModalState(() => isSaving = true);

                                  final payload = {
                                    'itemType': 'product',
                                    'title': title,
                                    'price': price,
                                    'originalPrice': double.tryParse(originalPriceCtrl.text.trim()),
                                    'category': categoryCtrl.text,
                                    'subCategory': subCategoryVal,
                                    'condition': conditionVal,
                                    'inventoryStatus': inventoryStatusVal,
                                    'stockQuantity': int.tryParse(stockCtrl.text.trim()) ?? 1,
                                    'area': areaVal,
                                    'deliveryOptions': deliveryOptions,
                                    'isNegotiable': isNegotiableVal,
                                    'description': descCtrl.text.trim(),
                                    'images': currentImages,
                                  };

                                  final slug = _productSlug;

                                  try {
                                    await authNotifier.apiClient.patch(
                                      '/products/$slug',
                                      data: payload,
                                    );
                                    MarketplaceApiService.clearCache();
                                  } catch (_) {
                                    try {
                                      await authNotifier.apiClient.patch(
                                        '/business/catalogs/$pId',
                                        data: payload,
                                      );
                                    } catch (_) {}
                                    MarketplaceApiService.clearCache();
                                  }

                                  if (mounted) {
                                    Navigator.pop(ctx);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('✓ Product updated successfully!'),
                                        backgroundColor: ServoraColors.emerald600,
                                      ),
                                    );
                                    _fetchLiveProductData();
                                  }
                                },
                          child: isSaving
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Text('Save Changes ➔', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
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
    final sellerRating = (sellerData['ratingAverage'] is num)
        ? (sellerData['ratingAverage'] as num).toDouble()
        : (sellerData['rating'] is num)
            ? (sellerData['rating'] as num).toDouble()
            : null;
    final sellerReviewCount = (sellerData['reviewsCount'] is num)
        ? (sellerData['reviewsCount'] as num).toInt()
        : (sellerData['reviewCount'] is num)
            ? (sellerData['reviewCount'] as num).toInt()
            : 0;
    final phone = sellerData['whatsapp'] ?? sellerData['phone'] ?? prod['phone'] ?? '+233240000000';

    final description = prod['description'] ??
        'High quality genuine product verified and sourced directly in Northern Ghana.\n\n• Condition: Brand New / Tested Working\n• Warranty: 6 Months Local Guarantee\n• Delivery: Same-Day Express Haulage Available across Tamale.';

    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (didPop) return;
        if (Navigator.of(context).canPop()) {
          context.pop();
        } else {
          context.go('/products');
        }
      },
      child: Scaffold(
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
                  // Owner Edit Button
                  if (_isOwner)
                    IconButton(
                      icon: const CircleAvatar(
                        backgroundColor: ServoraColors.emerald600,
                        child: Icon(Icons.edit_note_rounded, color: Colors.white, size: 20),
                      ),
                      tooltip: 'Edit Listing Setup',
                      onPressed: _openFullProductEditSheet,
                    ),
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

                      // Clean Multi-Image Dot Indicator (Frameless, uncorrupted photo view)
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
                      // Modern Status Badges & Category Header
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: ServoraColors.emerald600.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
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
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.grey[850] : Colors.grey[200],
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              condition == 'BRAND_NEW'
                                  ? '✨ Brand New'
                                  : condition == 'REFURBISHED'
                                      ? '🔧 Refurbished'
                                      : '✓ Tested Working',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.grey[200] : Colors.black87,
                              ),
                            ),
                          ),
                          if (hasDiscount)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                              decoration: BoxDecoration(
                                color: Colors.red[600],
                                borderRadius: BorderRadius.circular(9),
                              ),
                              child: Text(
                                '🏷️ $discountPct% OFF',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.white),
                              ),
                            ),
                          Text(
                            '• $stock in stock',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                          ),
                          if (_isOwner) ...[
                            InkWell(
                              onTap: _openFullProductEditSheet,
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                                decoration: BoxDecoration(
                                  color: ServoraColors.emerald600,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.edit_note_rounded, size: 14, color: Colors.white),
                                    Gap(3),
                                    Text('Edit Setup', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const Gap(10),

                      // Title & Exact Timestamp
                      Text(
                        title,
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, height: 1.25),
                      ),
                      Builder(builder: (context) {
                        final rawDate = prod['createdAt'] ?? prod['postedAt'] ?? prod['created_at'] ?? prod['date'] ?? prod['timestamp'];
                        if (rawDate == null) return const SizedBox.shrink();
                        return Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            '📅 ${TimeFormatter.formatExactDateTime(rawDate)}',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                            ),
                          ),
                        );
                      }),
                      const Gap(12),

                      // Price Block with Strikethrough & Savings (Clean Frameless Typography)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
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
                                        fontSize: 26,
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
                            if (MarketplaceApiService.isEscrowEnabled)
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
                      ).animate().fadeIn(duration: 250.ms).slideY(begin: 0.05, end: 0),
                      const Gap(16),

                      // Streamlined Minimalist Metadata Text Row (Replaced Baroque Grid Panels)
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          border: Border.symmetric(
                            horizontal: BorderSide(
                              color: isDark ? Colors.grey[850]! : Colors.grey[200]!,
                              width: 1,
                            ),
                          ),
                        ),
                        child: Wrap(
                          spacing: 10,
                          runSpacing: 6,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.location_on_outlined, size: 14, color: ServoraColors.emerald600),
                                const Gap(4),
                                Text(area, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.grey[300] : Colors.grey[800])),
                              ],
                            ),
                            Text('•', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.local_shipping_outlined, size: 14, color: Colors.blueAccent),
                                const Gap(4),
                                Text('Express Delivery', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.grey[300] : Colors.grey[800])),
                              ],
                            ),
                            Text('•', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.verified_user_outlined, size: 14, color: Colors.teal),
                                const Gap(4),
                                Text('100% Buyer Protection', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.grey[300] : Colors.grey[800])),
                              ],
                            ),
                            Text('•', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.check_circle_outline_rounded, size: 14, color: Colors.amber),
                                const Gap(4),
                                Text('Verified Condition', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.grey[300] : Colors.grey[800])),
                              ],
                            ),
                          ],
                        ),
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
                                    const Gap(2),
                                    PresenceBadge(
                                      isOnline: sellerData['isOnline'] == true,
                                      lastSeen: sellerData['lastSeen'],
                                    ),
                                    const Gap(4),
                                    Row(
                                      children: [
                                        if (sellerReviewCount > 0 && sellerRating != null) ...[
                                          const Icon(Icons.star_rounded, size: 14, color: Colors.amber),
                                          const Gap(2),
                                          Text(
                                            '${sellerRating.toStringAsFixed(1)} ($sellerReviewCount ${sellerReviewCount == 1 ? "review" : "reviews"})',
                                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.amber),
                                          ),
                                        ] else ...[
                                          Text(
                                            '✨ New Local Seller • No ratings yet',
                                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Colors.grey[500]),
                                          ),
                                        ],
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
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          description,
                          style: TextStyle(fontSize: 13, height: 1.6, color: isDark ? Colors.grey[300] : Colors.grey[700]),
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
                      if (_reviews.isEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                          decoration: BoxDecoration(
                            color: isDark ? ServoraColors.darkSurface : Colors.grey[50],
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: isDark ? Colors.grey[850]! : Colors.grey[200]!),
                          ),
                          child: Column(
                            children: [
                              const Icon(Icons.star_outline_rounded, size: 36, color: ServoraColors.emerald600),
                              const Gap(8),
                              const Text(
                                'No Customer Reviews Yet',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                              const Gap(4),
                              Text(
                                'Servora ratings are 100% genuine and verified from real customers. Be the first to share your experience with this seller!',
                                textAlign: TextAlign.center,
                                style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                              ),
                              const Gap(12),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: ServoraColors.emerald600,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                onPressed: _showWriteReviewSheet,
                                child: const Text('Write First Review', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        )
                      else
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
                                  Builder(builder: (context) {
                                    final double avgScore = (_reviewsSummary?['averageRating'] is num)
                                        ? (_reviewsSummary!['averageRating'] as num).toDouble()
                                        : 0.0;
                                    return Column(
                                      children: [
                                        Text(
                                          avgScore > 0 ? avgScore.toStringAsFixed(1) : '0.0',
                                          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900),
                                        ),
                                        Row(
                                          children: List.generate(5, (index) {
                                            return Icon(
                                              Icons.star_rounded,
                                              size: 16,
                                              color: (index + 1) <= avgScore.round() ? Colors.amber : Colors.grey[400],
                                            );
                                          }),
                                        ),
                                      ],
                                    );
                                  }),
                                  const Gap(4),
                                  Text(
                                    '${_reviews.length} ${_reviews.length == 1 ? "review" : "reviews"}',
                                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                                  ),
                                ],
                              ),
                              const Gap(20),
                              Expanded(
                                child: Column(
                                  children: [5, 4, 3, 2, 1].map((star) {
                                    final pct = _reviewsSummary?['ratingPercentages']?[star.toString()] ?? 0;
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
          // STICKY BOTTOM ACTION BAR (CHAT, WHATSAPP & ESCROW CTA)
          // =========================================================================
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
              decoration: BoxDecoration(
                color: isDark ? ServoraColors.darkSurface : Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.12),
                    blurRadius: 16,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Row 1: Full-Width Native Chat Button (Passes Seller & Product Context)
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1C1917),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      icon: const Icon(Icons.chat_bubble_outline_rounded, size: 16, color: ServoraColors.emerald600),
                      label: Text(
                        '💬 Chat on Servora (Ask $sellerName)',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      onPressed: () {
                        final recipientId = sellerData['id'] ?? sellerData['userId'] ?? '';
                        final productId = prod['id'] ?? prod['slug'] ?? '';
                        context.push(
                          '/messages?recipientId=$recipientId&productId=$productId&title=${Uri.encodeComponent(title)}',
                        );
                      },
                    ),
                  ),
                  const Gap(8),

                  // Row 2: Price + WhatsApp CTA + Escrow CTA
                  Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('TOTAL PRICE', style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: Colors.grey)),
                          Text(
                            'GH₵ ${price.toStringAsFixed(0)}',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                          ),
                        ],
                      ),
                      const Gap(12),
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF25D366),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 11),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: () {
                            WhatsAppHelper.openWhatsApp(
                              phone: phone,
                              message: 'Hello $sellerName, I would like to order "$title" (GH₵ $price) on Servora.gh app.',
                            );
                          },
                          child: const Text('WhatsApp ✈️', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      if (MarketplaceApiService.isEscrowEnabled) ...[
                        const Gap(8),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.amber[700],
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          icon: const Icon(Icons.shield_rounded, size: 15),
                          label: const Text('Escrow', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          onPressed: () => context.push('/escrow'),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ).animate().slideY(begin: 0.3, end: 0, duration: 300.ms, curve: Curves.easeOutCubic),
          ),
        ],
      ),
    ),
  );
}

}
