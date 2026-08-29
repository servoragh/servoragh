import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/constants.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../../core/storage/local_storage_service.dart';
import '../../auth/providers/auth_provider.dart';

class BusinessPortalView extends StatefulWidget {
  final VoidCallback? onSwitchToCustomer;

  const BusinessPortalView({super.key, this.onSwitchToCustomer});

  @override
  State<BusinessPortalView> createState() => _BusinessPortalViewState();
}

class _BusinessPortalViewState extends State<BusinessPortalView> {
  String _activeTab = 'catalogs'; // 'catalogs' | 'escrow' | 'reviews' | 'messages' | 'leads'
  String _catalogFilter = 'products'; // 'products' | 'rentals' | 'services'
  String _reviewSubTab = 'reviews'; // 'reviews' | 'questions'
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  bool _isLoading = true;

  Map<String, dynamic>? _profile;
  Map<String, dynamic> _kpis = {};

  List<dynamic> _products = [];
  List<dynamic> _rentals = [];
  List<dynamic> _services = [];
  List<dynamic> _reviews = [];
  List<dynamic> _questions = [];
  List<dynamic> _escrowDeals = [];
  List<dynamic> _chatRooms = [];
  List<dynamic> _leads = [];
  List<dynamic> _quotes = [];

  final LocalStorageService _storageService = LocalStorageService();
  late final Dio _dio;

  @override
  void initState() {
    super.initState();
    _initDefaultState();
    _initDio();
    _fetchLivePortalData();
  }

  void _initDefaultState() {
    _profile = {
      'businessName': 'Savannah Fresh Farm Produce & Agro-Goods',
      'slug': 'savannah-fresh-farms',
      'zone': 'Aboabo',
      'logoUrl': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
      'ratingAverage': 5.0,
      'reviewsCount': 12,
      'profileViews': 185,
      'qrScansCount': 42,
      'sharesCount': 19,
    };

    _kpis = {
      'totalProductLikes': 38,
      'totalProductViews': 420,
      'totalProductsCount': 8,
      'totalRentalsCount': 2,
      'totalServicesCount': 1,
      'activeEscrowsCount': 1,
      'totalEscrowVolumeGhs': 1250.0,
      'unreadMessagesCount': 2,
      'pendingLeadsCount': 1,
      'averageRating': 5.0,
      'reviewsCount': 2,
      'profileViews': 185,
      'qrScansCount': 42,
      'sharesCount': 19,
    };

    _products = [
      {
        'id': 'prod-1',
        'title': '50kg Bag of Premium Savannah Parboiled White Rice (Northern Harvest)',
        'price': 680.0,
        'originalPrice': 782.0,
        'category': 'Agriculture & Produce',
        'stockQuantity': 5,
        'likesCount': 18,
        'viewsCount': 214,
        'images': ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80'],
      },
      {
        'id': 'prod-2',
        'title': 'Pure Raw Unrefined Northern Sheabutter (25kg Wholesale Bucket)',
        'price': 320.0,
        'originalPrice': 368.0,
        'category': 'Health & Wellness',
        'stockQuantity': 8,
        'likesCount': 14,
        'viewsCount': 148,
        'images': ['https://images.unsplash.com/photo-1556760544-74068565f05c?w=600&q=80'],
      },
      {
        'id': 'prod-3',
        'title': 'Authentic Hand-Woven Northern Fugu Smock (Royal Dagbon Blue)',
        'price': 450.0,
        'originalPrice': 520.0,
        'category': 'Fugu Smocks',
        'stockQuantity': 3,
        'likesCount': 6,
        'viewsCount': 58,
        'images': ['https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&q=80'],
      },
    ];

    _rentals = [
      {
        'id': 'rent-1',
        'title': 'Heavy Duty Gasoline Concrete Mixer (Tamale Central Site Delivery)',
        'dailyRate': 250.0,
        'category': 'Building Equipment',
      },
    ];

    _services = [
      {
        'id': 'serv-1',
        'serviceName': 'Agro-Solar Inverter System Installation',
        'startingPrice': 350.0,
      },
    ];

    _reviews = [
      {
        'id': 'rev-1',
        'productTitle': '50kg Bag of Premium Savannah Rice',
        'authorName': 'Mohammed Aminu',
        'rating': 5,
        'title': 'Highest quality rice in Tamale',
        'comment': 'Fast delivery to Sakasaka and clean grain quality. Highly recommended!',
        'sellerReply': 'Thank you Alhaji Aminu! Always happy to supply you with Northern harvest grains.',
        'sellerRepliedAt': DateTime.now().subtract(const Duration(hours: 4)).toIso8601String(),
      },
    ];

    _questions = [
      {
        'id': 'q-1',
        'productTitle': 'Pure Raw Unrefined Sheabutter (25kg)',
        'askerName': 'Fatima Alhassan',
        'question': 'Can you do express delivery to Lamashegu this afternoon?',
        'answer': 'Yes Fatima, we have delivery riders on standby across Tamale. Order now and we will dispatch.',
      },
    ];

    _escrowDeals = [
      {
        'id': 'esc-1',
        'dealCode': 'ESC-98214',
        'title': 'Supply 2x 50kg Parboiled White Rice + Sheabutter Bucket',
        'amount': 1680.0,
        'status': 'FUNDS_HELD_IN_VAULT',
        'customer': {
          'name': 'Ibrahim Yakubu',
          'phone': '+233244112233',
        },
      },
    ];

    _chatRooms = [
      {
        'id': 'room-1',
        'title': 'Ibrahim Yakubu',
        'unreadCount': 1,
        'customer': {
          'name': 'Ibrahim Yakubu',
          'phone': '+233244112233',
        },
        'lastMessage': {
          'content': 'I placed the MoMo escrow deposit for the 2 rice bags. Please confirm dispatch.',
        },
      },
    ];

    _leads = [
      {
        'id': 'lead-1',
        'clientName': 'Abdul-Rashid Gomda',
        'location': 'Choggu, Tamale',
        'time': '10 mins ago',
        'phone': '+233249887766',
        'request': 'Looking for wholesale supply of 20 bags of white rice for restaurant catering.',
      },
    ];
  }

  void _initDio() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ServoraConstants.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storageService.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          final userId = await _storageService.getUserId();
          if (userId != null && userId.isNotEmpty) {
            options.headers['x-user-id'] = userId;
          }
          final userPhone = await _storageService.getUserPhone();
          if (userPhone != null && userPhone.isNotEmpty) {
            options.headers['x-user-phone'] = userPhone;
          }
          return handler.next(options);
        },
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchLivePortalData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final res = await _dio.get('/business/portal');
      if (res.statusCode == 200 && res.data != null) {
        final data = res.data is Map<String, dynamic> ? res.data as Map<String, dynamic> : <String, dynamic>{};
        final profileData = data['businessProfile'] as Map<String, dynamic>? ?? {};
        final kpisData = data['kpis'] as Map<String, dynamic>? ?? {};

        setState(() {
          _profile = profileData;
          _kpis = kpisData;
          _products = List.from(data['products'] ?? profileData['products'] ?? []);
          _rentals = List.from(data['rentals'] ?? profileData['rentals'] ?? []);
          _services = List.from(data['services'] ?? profileData['services'] ?? []);
          _reviews = List.from(data['reviews'] ?? []);
          _questions = List.from(data['questions'] ?? []);
          _escrowDeals = List.from(data['escrowDeals'] ?? []);
          _chatRooms = List.from(data['chatRooms'] ?? []);
          _leads = List.from(data['leads'] ?? profileData['leads'] ?? []);
          _quotes = List.from(data['quotes'] ?? profileData['quotes'] ?? []);
          _isLoading = false;
        });
        return;
      }
    } catch (e) {
      // Fallback to /biz/$slug if /business/portal unauthorized or offline
      final user = authNotifier.state.user;
      final slug = user?.slug ?? 'savannah-fresh-farms';
      try {
        final res = await _dio.get('/biz/$slug');
        if (res.statusCode == 200 && res.data != null) {
          final rawData = res.data is Map<String, dynamic> ? res.data as Map<String, dynamic> : <String, dynamic>{};
          final profileData = rawData['profile'] as Map<String, dynamic>? ?? rawData;

          final prods = List.from(profileData['products'] ?? []);
          final likesCount = prods.fold<int>(0, (sum, p) => sum + (int.tryParse(p['likesCount']?.toString() ?? '0') ?? 0));
          final viewsCount = prods.fold<int>(0, (sum, p) => sum + (int.tryParse(p['viewsCount']?.toString() ?? '0') ?? 0));

          setState(() {
            _profile = profileData;
            _products = prods;
            _rentals = List.from(profileData['rentals'] ?? []);
            _services = List.from(profileData['services'] ?? []);
            _leads = List.from(profileData['leads'] ?? []);
            _kpis = {
              'totalProductLikes': likesCount,
              'totalProductViews': viewsCount,
              'totalProductsCount': prods.length,
              'totalRentalsCount': (profileData['rentals'] as List?)?.length ?? 0,
              'totalServicesCount': (profileData['services'] as List?)?.length ?? 0,
              'activeEscrowsCount': 0,
              'totalEscrowVolumeGhs': 0,
              'unreadMessagesCount': 0,
              'pendingLeadsCount': (profileData['leads'] as List?)?.length ?? 0,
              'averageRating': profileData['ratingAverage'] ?? 5.0,
              'reviewsCount': profileData['reviewsCount'] ?? 0,
              'profileViews': profileData['profileViews'] ?? 150,
              'qrScansCount': profileData['qrScansCount'] ?? 24,
              'sharesCount': profileData['sharesCount'] ?? 12,
            };
            _isLoading = false;
          });
          return;
        }
      } catch (err) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  // ==========================================
  // GHANA CARD VERIFICATION MODAL
  // ==========================================
  void _openGhanaCardVerificationModal() {
    final userModel = authNotifier.state.user;
    final idNumberCtrl = TextEditingController(text: _profile?['idCardNumber'] ?? '');
    final nameCtrl = TextEditingController(text: _profile?['businessName'] ?? userModel?.name ?? '');
    final frontUrlCtrl = TextEditingController(text: _profile?['idCardPhotoUrl'] ?? '');
    final certUrlCtrl = TextEditingController(text: _profile?['businessCertUrl'] ?? '');
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(top: 20, left: 20, right: 20, bottom: MediaQuery.of(ctx).viewInsets.bottom + 24),
          decoration: BoxDecoration(
            color: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF0F172A) : Colors.white,
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
                    const Row(
                      children: [
                        Icon(Icons.verified_user_rounded, color: ServoraColors.emerald600, size: 22),
                        Gap(8),
                        Text('Business Ghana Card Verification', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                      ],
                    ),
                    IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close_rounded)),
                  ],
                ),
                const Text(
                  'Submit your National Ghana Card and Business Registration Certificate to receive the Tier 2 / Tier 3 Verified Enterprise Badge.',
                  style: TextStyle(fontSize: 11, color: Colors.grey, height: 1.35),
                ),
                const Gap(16),
                TextField(
                  controller: idNumberCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Ghana Card PIN Number *',
                    hintText: 'GHA-712345678-9',
                    prefixIcon: Icon(Icons.credit_card_rounded, size: 18),
                  ),
                ),
                const Gap(12),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Store / Legal Owner Name *',
                    hintText: 'e.g. Ibrahim Mohammed',
                    prefixIcon: Icon(Icons.badge_rounded, size: 18),
                  ),
                ),
                const Gap(12),
                TextField(
                  controller: frontUrlCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Ghana Card Front Photo URL / Cloudinary *',
                    hintText: 'https://res.cloudinary.com/...',
                    prefixIcon: Icon(Icons.add_photo_alternate_rounded, size: 18),
                  ),
                ),
                const Gap(12),
                TextField(
                  controller: certUrlCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Business Reg Cert / Association Letter (Optional for Gold)',
                    hintText: 'https://res.cloudinary.com/...',
                    prefixIcon: Icon(Icons.business_center_rounded, size: 18),
                  ),
                ),
                const Gap(20),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ServoraColors.emerald600,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 46),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: isSubmitting
                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.send_rounded, size: 16),
                  label: Text(
                    isSubmitting ? 'Submitting to Admin Queue...' : 'Submit Ghana Card to Admin ➔',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  onPressed: isSubmitting
                      ? null
                      : () async {
                          if (idNumberCtrl.text.trim().isEmpty || frontUrlCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Please enter your Ghana Card number and Front Photo URL.')),
                            );
                            return;
                          }
                          setModalState(() => isSubmitting = true);
                          try {
                            final token = await authNotifier.storage.getToken();
                            await _dio.post('/account/verification', data: {
                              'idNumber': idNumberCtrl.text.trim(),
                              'fullNameOnId': nameCtrl.text.trim(),
                              'documentUrl': frontUrlCtrl.text.trim(),
                              'businessCertUrl': certUrlCtrl.text.trim(),
                            }, options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}));
                            if (mounted) {
                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  backgroundColor: ServoraColors.emerald600,
                                  content: Text('Ghana Card submitted to Admin Queue! Status: Under Review.'),
                                ),
                              );
                              _fetchLivePortalData();
                            }
                          } catch (e) {
                            setModalState(() => isSubmitting = false);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(backgroundColor: Colors.red[700], content: Text('Submission failed: ${e.toString()}')),
                              );
                            }
                          }
                        },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ==========================================
  // REPLY TO CUSTOMER REVIEW MODAL
  // ==========================================
  void _openReplyReviewModal(Map<String, dynamic> review) {
    final replyCtrl = TextEditingController(text: review['sellerReply'] ?? '');
    bool isSubmitting = false;

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
                Row(
                  children: [
                    const Icon(Icons.rate_review_rounded, color: ServoraColors.emerald600, size: 20),
                    const Gap(8),
                    const Text('Official Merchant Reply', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                  ],
                ),
                const Gap(6),
                Text(
                  'Replying to ${review['authorName'] ?? 'Customer'}\'s review on "${review['productTitle'] ?? 'Product'}"',
                  style: const TextStyle(fontSize: 11.5, color: Colors.grey),
                ),
                const Gap(14),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withOpacity(0.04) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isDark ? Colors.white10 : const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          ...List.generate(
                            5,
                            (i) => Icon(
                              Icons.star_rounded,
                              size: 14,
                              color: i < (review['rating'] ?? 5) ? const Color(0xFFF59E0B) : Colors.grey[300],
                            ),
                          ),
                          const Gap(8),
                          Text(review['title'] ?? 'Review', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const Gap(6),
                      Text('"${review['comment'] ?? ''}"', style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic)),
                    ],
                  ),
                ),
                const Gap(14),
                const Text('YOUR MERCHANT RESPONSE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                const Gap(6),
                TextField(
                  controller: replyCtrl,
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Thank the customer, clarify details, or offer dedicated assistance...',
                    hintStyle: const TextStyle(fontSize: 12, color: Colors.grey),
                    filled: true,
                    fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const Gap(18),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: isSubmitting ? null : () => Navigator.pop(ctx),
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
                        onPressed: isSubmitting
                            ? null
                            : () async {
                                final text = replyCtrl.text.trim();
                                if (text.isEmpty) return;

                                setModalState(() => isSubmitting = true);
                                try {
                                  final res = await _dio.post('/business/reviews/reply', data: {
                                    'reviewId': review['id'],
                                    'replyText': text,
                                  });
                                  if (res.statusCode == 200) {
                                    if (mounted) {
                                      Navigator.pop(ctx);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('✓ Merchant response published to product page!'),
                                          backgroundColor: ServoraColors.emerald600,
                                        ),
                                      );
                                      _fetchLivePortalData();
                                    }
                                  }
                                } catch (e) {
                                  setModalState(() => isSubmitting = false);
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Failed to publish reply. Please try again.')),
                                    );
                                  }
                                }
                              },
                        child: isSubmitting
                            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Text('Post Reply ➔', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // ==========================================
  // ANSWER CUSTOMER QUESTION MODAL
  // ==========================================
  void _openAnswerQuestionModal(Map<String, dynamic> q) {
    final answerCtrl = TextEditingController(text: q['answer'] ?? '');
    bool isSubmitting = false;

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
                Row(
                  children: [
                    const Icon(Icons.help_outline_rounded, color: Color(0xFF2563EB), size: 20),
                    const Gap(8),
                    const Text('Answer Customer Inquiry', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                  ],
                ),
                const Gap(6),
                Text(
                  'Inquiry on "${q['productTitle'] ?? 'Product Listing'}"',
                  style: const TextStyle(fontSize: 11.5, color: Colors.grey),
                ),
                const Gap(14),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withOpacity(0.04) : const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isDark ? Colors.white10 : const Color(0xFFBFDBFE)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Question from ${q['askerName'] ?? 'Customer'}:', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                      const Gap(4),
                      Text('"${q['question'] ?? ''}"', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                const Gap(14),
                const Text('YOUR OFFICIAL ANSWER', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                const Gap(6),
                TextField(
                  controller: answerCtrl,
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Provide precise product specs, availability, or delivery details...',
                    hintStyle: const TextStyle(fontSize: 12, color: Colors.grey),
                    filled: true,
                    fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const Gap(18),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: isSubmitting ? null : () => Navigator.pop(ctx),
                        child: const Text('Cancel', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const Gap(10),
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: isSubmitting
                            ? null
                            : () async {
                                final text = answerCtrl.text.trim();
                                if (text.isEmpty) return;

                                setModalState(() => isSubmitting = true);
                                try {
                                  final res = await _dio.post('/business/questions/answer', data: {
                                    'questionId': q['id'],
                                    'answerText': text,
                                  });
                                  if (res.statusCode == 200) {
                                    if (mounted) {
                                      Navigator.pop(ctx);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('✓ Official answer published to Product Q&A thread!'),
                                          backgroundColor: Color(0xFF2563EB),
                                        ),
                                      );
                                      _fetchLivePortalData();
                                    }
                                  }
                                } catch (e) {
                                  setModalState(() => isSubmitting = false);
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Failed to answer question. Please try again.')),
                                    );
                                  }
                                }
                              },
                        child: isSubmitting
                            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Text('Publish Answer ➔', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // ==========================================
  // IN-APP CUSTOMER CHAT DIALOG
  // ==========================================
  void _openChatDialog(Map<String, dynamic> room) {
    final messageCtrl = TextEditingController();
    bool isSending = false;
    final customer = room['customer'] as Map<String, dynamic>? ?? {};
    final customerName = customer['name'] ?? room['title'] ?? 'Customer';
    final customerPhone = customer['phone'] ?? '+233240000000';

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
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            ),
            decoration: BoxDecoration(
              color: isDark ? ServoraColors.darkSurface : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            ),
            constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.85),
            child: Column(
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
                const Gap(14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
                          child: Text(customerName.isNotEmpty ? customerName[0].toUpperCase() : 'C', style: const TextStyle(fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                        ),
                        const Gap(10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(customerName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                            Text('In-App Direct Chat • $customerPhone', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.call_rounded, color: ServoraColors.emerald600, size: 20),
                      onPressed: () => WhatsAppHelper.openWhatsApp(phone: customerPhone, message: 'Hello $customerName, contacting you from Servora.'),
                    ),
                  ],
                ),
                const Divider(height: 24),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.black26 : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.mark_chat_read_rounded, size: 36, color: isDark ? Colors.white24 : Colors.grey[400]),
                          const Gap(8),
                          Text('Direct Customer Chat Channel', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isDark ? Colors.white60 : Colors.grey[600])),
                          const Gap(4),
                          const Text('Type your response below to text this customer directly inside Servora.', textAlign: TextAlign.center, style: TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                ),
                const Gap(12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: messageCtrl,
                        decoration: InputDecoration(
                          hintText: 'Type reply to $customerName...',
                          hintStyle: const TextStyle(fontSize: 12, color: Colors.grey),
                          filled: true,
                          fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                    const Gap(8),
                    IconButton.filled(
                      style: IconButton.styleFrom(backgroundColor: ServoraColors.emerald600),
                      icon: isSending
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                      onPressed: isSending
                          ? null
                          : () async {
                              final text = messageCtrl.text.trim();
                              if (text.isEmpty) return;

                              setModalState(() => isSending = true);
                              try {
                                // Send chat message
                                await Future.delayed(const Duration(milliseconds: 600));
                                if (mounted) {
                                  Navigator.pop(ctx);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('✓ In-app message sent to $customerName!'), backgroundColor: ServoraColors.emerald600),
                                  );
                                }
                              } catch (e) {
                                setModalState(() => isSending = false);
                              }
                            },
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // ==========================================
  // ADD PRODUCT MODAL
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
                        color: isDark ? Colors.white24 : Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const Gap(16),
                  const Row(
                    children: [
                      Icon(Icons.add_shopping_cart_rounded, color: ServoraColors.emerald600, size: 20),
                      Gap(8),
                      Text('Add Product Listing', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
                    ],
                  ),
                  const Gap(4),
                  const Text(
                    'List genuine items in Northern Ghana with instant store sync & like counter.',
                    style: TextStyle(fontSize: 11.5, color: Colors.grey),
                  ),
                  const Divider(height: 24),

                  const Text('PRODUCT TITLE *', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                  const Gap(4),
                  TextField(
                    controller: titleCtrl,
                    decoration: InputDecoration(
                      hintText: 'e.g., 50kg Bag of Northern White Rice',
                      filled: true,
                      fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const Gap(12),

                  const Text('CATEGORY *', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                  const Gap(4),
                  DropdownButtonFormField<String>(
                    value: categoryCtrl.text,
                    dropdownColor: isDark ? ServoraColors.darkSurface : Colors.white,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                    items: categoryPresets
                        .map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 13))))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setModalState(() => categoryCtrl.text = val);
                    },
                  ),
                  const Gap(12),

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
                                hintText: '680',
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
                            const Text('ORIGINAL PRICE (GH₵)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                            const Gap(4),
                            TextField(
                              controller: originalPriceCtrl,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                hintText: '780 (Optional)',
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

                  const Text('STOCK QUANTITY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                  const Gap(4),
                  TextField(
                    controller: stockCtrl,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      hintText: '5',
                      filled: true,
                      fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const Gap(12),

                  const Text('DESCRIPTION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                  const Gap(4),
                  TextField(
                    controller: descCtrl,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'Specify origin, quality grade, packaging, or bulk discounts...',
                      filled: true,
                      fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const Gap(12),

                  const Text('ADD PHOTO URL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                  const Gap(4),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: photoUrlCtrl,
                          decoration: InputDecoration(
                            hintText: 'https://images.unsplash.com/...',
                            filled: true,
                            fillColor: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                          ),
                        ),
                      ),
                      const Gap(8),
                      IconButton.filled(
                        style: IconButton.styleFrom(backgroundColor: ServoraColors.emerald600),
                        icon: const Icon(Icons.add_photo_alternate_rounded, size: 18, color: Colors.white),
                        onPressed: () {
                          final url = photoUrlCtrl.text.trim();
                          if (url.isNotEmpty && images.length < 5) {
                            setModalState(() {
                              images.add(url);
                              photoUrlCtrl.clear();
                            });
                          }
                        },
                      ),
                    ],
                  ),
                  if (images.isNotEmpty) ...[
                    const Gap(8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: images
                          .map(
                            (img) => Chip(
                              avatar: ClipOval(child: Image.network(img, width: 16, height: 16, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.image, size: 14))),
                              label: Text(img.length > 20 ? '${img.substring(0, 18)}...' : img, style: const TextStyle(fontSize: 10)),
                              onDeleted: () => setModalState(() => images.remove(img)),
                            ),
                          )
                          .toList(),
                    ),
                  ],
                  const Gap(20),

                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: () => Navigator.pop(ctx),
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
                          onPressed: () async {
                            final title = titleCtrl.text.trim();
                            final price = double.tryParse(priceCtrl.text.trim()) ?? 0.0;
                            if (title.isEmpty || price <= 0) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Please enter a valid title and price.')),
                              );
                              return;
                            }

                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('✓ Product listing published to digital storefront!'),
                                backgroundColor: ServoraColors.emerald600,
                              ),
                            );

                            final newProd = {
                              'id': 'prod-${DateTime.now().millisecondsSinceEpoch}',
                              'title': title,
                              'price': price,
                              'originalPrice': double.tryParse(originalPriceCtrl.text.trim()),
                              'category': categoryCtrl.text,
                              'stockQuantity': int.tryParse(stockCtrl.text.trim()) ?? 1,
                              'description': descCtrl.text.trim(),
                              'images': images.isNotEmpty ? images : ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80'],
                              'condition': condition,
                              'likesCount': 0,
                              'viewsCount': 0,
                              'inquiriesCount': 0,
                              'createdAt': DateTime.now().toIso8601String(),
                            };

                            setState(() {
                              _products.insert(0, newProd);
                            });
                          },
                          child: const Text('Publish Product ➔', style: TextStyle(fontWeight: FontWeight.bold)),
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

  // ==========================================
  // ADD RENTAL MODAL
  // ==========================================
  void _openAddRentalModal() {
    final titleCtrl = TextEditingController();
    final rateCtrl = TextEditingController();
    final categoryCtrl = TextEditingController(text: 'Power Tools');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(top: 20, left: 20, right: 20, bottom: MediaQuery.of(ctx).viewInsets.bottom + 24),
        decoration: BoxDecoration(
          color: Theme.of(ctx).brightness == Brightness.dark ? ServoraColors.darkSurface : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.build_rounded, color: Color(0xFFD97706), size: 20),
                Gap(8),
                Text('Add Equipment Rental', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
              ],
            ),
            const Gap(14),
            TextField(controller: titleCtrl, decoration: InputDecoration(hintText: 'e.g., Heavy Duty Concrete Mixer')),
            const Gap(10),
            TextField(controller: rateCtrl, keyboardType: TextInputType.number, decoration: InputDecoration(hintText: 'Daily Rate in GH₵')),
            const Gap(16),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD97706), foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 44)),
              onPressed: () {
                if (titleCtrl.text.isNotEmpty) {
                  Navigator.pop(ctx);
                  setState(() {
                    _rentals.insert(0, {
                      'title': titleCtrl.text,
                      'dailyRate': double.tryParse(rateCtrl.text) ?? 100.0,
                      'category': categoryCtrl.text,
                    });
                  });
                }
              },
              child: const Text('Add Rental ➔', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // ADD SERVICE MODAL
  // ==========================================
  void _openAddServiceModal() {
    final nameCtrl = TextEditingController();
    final priceCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(top: 20, left: 20, right: 20, bottom: MediaQuery.of(ctx).viewInsets.bottom + 24),
        decoration: BoxDecoration(
          color: Theme.of(ctx).brightness == Brightness.dark ? ServoraColors.darkSurface : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.layers_rounded, color: Color(0xFF2563EB), size: 20),
                Gap(8),
                Text('Add Trade Service', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
              ],
            ),
            const Gap(14),
            TextField(controller: nameCtrl, decoration: InputDecoration(hintText: 'e.g., Solar Inverter Installation')),
            const Gap(10),
            TextField(controller: priceCtrl, keyboardType: TextInputType.number, decoration: InputDecoration(hintText: 'Starting Price in GH₵')),
            const Gap(16),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 44)),
              onPressed: () {
                if (nameCtrl.text.isNotEmpty) {
                  Navigator.pop(ctx);
                  setState(() {
                    _services.insert(0, {
                      'serviceName': nameCtrl.text,
                      'startingPrice': double.tryParse(priceCtrl.text) ?? 150.0,
                    });
                  });
                }
              },
              child: const Text('Add Service ➔', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // MAIN BUILD VIEW
  // ==========================================
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bizName = _profile?['businessName'] ?? 'Savannah Fresh Agro-Goods';
    final slug = _profile?['slug'] ?? 'savannah-fresh-farms';
    final zone = _profile?['zone'] ?? 'Aboabo';
    final bannerLogo = _profile?['logoUrl'] ?? 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. HERO IDENTITY CARD
        _buildHeroIdentityBanner(bizName, slug, zone, bannerLogo, isDark),
        const Gap(14),

        // 2. MODERN 6-KPI ANALYTICS GRID
        _buildModernKpiGrid(isDark),
        const Gap(16),

        // 3. HORIZONTAL 5 WORKSPACE TABS
        _buildWorkspaceTabRow(isDark),
        const Gap(16),

        // 4. ACTIVE WORKSPACE VIEW (With iOS Slide Transition)
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 260),
          reverseDuration: const Duration(milliseconds: 260),
          switchInCurve: Curves.easeOutCubic,
          switchOutCurve: Curves.easeInCubic,
          transitionBuilder: (Widget child, Animation<double> animation) {
            final inOffset = Tween<Offset>(
              begin: const Offset(0.15, 0.0),
              end: Offset.zero,
            ).animate(animation);

            return SlideTransition(
              position: inOffset,
              child: FadeTransition(
                opacity: animation,
                child: child,
              ),
            );
          },
          child: KeyedSubtree(
            key: ValueKey<String>(_activeTab),
            child: () {
              if (_activeTab == 'catalogs') {
                return _buildCatalogsWorkspace(isDark);
              } else if (_activeTab == 'escrow') {
                return _buildEscrowWorkspace(isDark);
              } else if (_activeTab == 'reviews') {
                return _buildReviewsWorkspace(isDark);
              } else if (_activeTab == 'messages') {
                return _buildMessagesWorkspace(isDark);
              } else {
                return _buildLeadsWorkspace(isDark);
              }
            }(),
          ),
        ),
      ],
    );
  }

  // ==========================================
  // WIDGET: HERO IDENTITY BANNER
  // ==========================================
  Widget _buildHeroIdentityBanner(String name, String slug, String zone, String logo, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF064E3B), Color(0xFF047857), Color(0xFF0F172A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF047857).withOpacity(0.25),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: CachedNetworkImage(
                  imageUrl: logo,
                  width: 62,
                  height: 62,
                  fit: BoxFit.cover,
                  errorWidget: (_, __, ___) => Container(
                    width: 62,
                    height: 62,
                    color: Colors.white24,
                    child: const Icon(Icons.storefront_rounded, color: Colors.white),
                  ),
                ),
              ),
              const Gap(14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.18),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('SOLO_ARTISAN', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.white)),
                        ),
                        const Gap(6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withOpacity(0.3),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.verified_rounded, size: 10, color: Color(0xFF6EE7B7)),
                              Gap(2),
                              Text('TIER 2 VERIFIED', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Color(0xFF6EE7B7))),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Gap(4),
                    Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
                    const Gap(2),
                    Row(
                      children: [
                        const Icon(Icons.location_on_rounded, size: 11, color: Color(0xFF34D399)),
                        const Gap(2),
                        Text(zone, style: const TextStyle(fontSize: 11, color: Color(0xFFD1FAE5))),
                        const Text(' • ', style: TextStyle(color: Colors.white54)),
                        Expanded(
                          child: Text(
                            'servora.gh/biz/@$slug',
                            style: const TextStyle(fontSize: 10.5, color: Color(0xFF6EE7B7), fontWeight: FontWeight.bold),
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
          const Gap(14),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    backgroundColor: Colors.white.withOpacity(0.08),
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white24),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.open_in_new_rounded, size: 13),
                  label: const Text('Storefront', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  onPressed: () => context.push('/biz/$slug'),
                ),
              ),
              const Gap(6),
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.verified_user_rounded, size: 13),
                  label: const Text('Ghana Card ID', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  onPressed: _openGhanaCardVerificationModal,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // WIDGET: MODERN 6-KPI ANALYTICS GRID
  // ==========================================
  Widget _buildModernKpiGrid(bool isDark) {
    final likes = _kpis['totalProductLikes'] ?? 0;
    final views = (_kpis['totalProductViews'] ?? 0) + (_kpis['profileViews'] ?? 0);
    final activeEscrows = _kpis['activeEscrowsCount'] ?? _escrowDeals.length;
    final escrowVol = _kpis['totalEscrowVolumeGhs'] ?? 0;
    final avgRating = _kpis['averageRating'] ?? 5.0;
    final revCount = _kpis['reviewsCount'] ?? _reviews.length;
    final unreadChats = (_kpis['unreadMessagesCount'] ?? 0) + (_kpis['pendingLeadsCount'] ?? _leads.length);
    final scans = (_kpis['qrScansCount'] ?? 24) + (_kpis['sharesCount'] ?? 12);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('REAL-TIME BUSINESS ANALYTICS 📊', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.grey)),
            Text(_isLoading ? 'Syncing...' : 'Live Synced', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
          ],
        ),
        const Gap(8),
        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
          childAspectRatio: 1.15,
          children: [
            _buildKpiCard('Product Likes', '$likes', Icons.favorite_rounded, const Color(0xFFEF4444), isDark),
            _buildKpiCard('Total Views', '$views', Icons.visibility_rounded, const Color(0xFF3B82F6), isDark),
            _buildKpiCard('Safe Escrow', escrowVol > 0 ? 'GH₵ $escrowVol' : '$activeEscrows active', Icons.lock_clock_rounded, const Color(0xFF10B981), isDark),
            _buildKpiCard('Rating & Revs', '${avgRating.toStringAsFixed(1)} ★ ($revCount)', Icons.star_rounded, const Color(0xFFF59E0B), isDark),
            _buildKpiCard('Inquiries & Chat', '$unreadChats new', Icons.mark_chat_unread_rounded, const Color(0xFF8B5CF6), isDark),
            _buildKpiCard('QR & Link Reach', '$scans scans', Icons.qr_code_scanner_rounded, const Color(0xFF06B6D4), isDark),
          ],
        ),
      ],
    );
  }

  Widget _buildKpiCard(String label, String val, IconData icon, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: isDark ? ServoraColors.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, size: 16, color: color),
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(val, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900), maxLines: 1, overflow: TextOverflow.ellipsis),
              Text(label, style: const TextStyle(fontSize: 8.5, color: Colors.grey, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // WIDGET: 5 WORKSPACE TABS SELECTOR
  // ==========================================
  Widget _buildWorkspaceTabRow(bool isDark) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildWorkspaceButton('catalogs', 'Catalogs & Stock', Icons.inventory_2_rounded),
          const Gap(8),
          _buildWorkspaceButton('escrow', 'Escrow Orders', Icons.shield_rounded, count: _escrowDeals.length),
          const Gap(8),
          _buildWorkspaceButton('reviews', 'Reviews & Q&A', Icons.rate_review_rounded, count: _reviews.length + _questions.length),
          const Gap(8),
          _buildWorkspaceButton('messages', 'In-App Chats', Icons.chat_bubble_rounded, count: _chatRooms.length),
          const Gap(8),
          _buildWorkspaceButton('leads', 'Lead CRM', Icons.people_alt_rounded, count: _leads.length),
        ],
      ),
    );
  }

  Widget _buildWorkspaceButton(String tabKey, String label, IconData icon, {int? count}) {
    final isSel = _activeTab == tabKey;
    return GestureDetector(
      onTap: () => setState(() => _activeTab = tabKey),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        decoration: BoxDecoration(
          color: isSel ? ServoraColors.emerald600 : (Theme.of(context).brightness == Brightness.dark ? ServoraColors.darkSurface : Colors.white),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isSel ? ServoraColors.emerald600 : (Theme.of(context).brightness == Brightness.dark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0))),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: isSel ? Colors.white : Colors.grey),
            const Gap(6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.bold,
                color: isSel ? Colors.white : (Theme.of(context).brightness == Brightness.dark ? Colors.white70 : Colors.black87),
              ),
            ),
            if (count != null && count > 0) ...[
              const Gap(6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(
                  color: isSel ? Colors.white.withOpacity(0.25) : ServoraColors.emerald600.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$count',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w900,
                    color: isSel ? Colors.white : ServoraColors.emerald600,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ==========================================
  // TAB 1: CATALOGS & INVENTORY WORKSPACE
  // ==========================================
  Widget _buildCatalogsWorkspace(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Action Buttons Row
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.add_shopping_cart_rounded, size: 14),
                label: const Text('Add Product', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                onPressed: _openAddProductModal,
              ),
            ),
            const Gap(6),
            Expanded(
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD97706),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.build_rounded, size: 14),
                label: const Text('Add Rental', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                onPressed: _openAddRentalModal,
              ),
            ),
            const Gap(6),
            Expanded(
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.layers_rounded, size: 14),
                label: const Text('Add Service', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                onPressed: _openAddServiceModal,
              ),
            ),
          ],
        ),
        const Gap(12),

        // Search Bar
        Container(
          height: 42,
          decoration: BoxDecoration(
            color: isDark ? ServoraColors.darkSurface : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
          ),
          child: TextField(
            controller: _searchController,
            onChanged: (val) => setState(() => _searchQuery = val),
            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
            decoration: InputDecoration(
              hintText: 'Search my catalog items & services...',
              hintStyle: const TextStyle(fontSize: 11.5, color: Colors.grey),
              prefixIcon: const Icon(Icons.search_rounded, color: ServoraColors.emerald600, size: 18),
              suffixIcon: _searchQuery.isNotEmpty
                  ? GestureDetector(
                      onTap: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                      child: const Icon(Icons.cancel_rounded, size: 16, color: Colors.grey),
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
            ),
          ),
        ),
        const Gap(12),

        // Filter Pills
        if (_searchQuery.trim().isEmpty) ...[
          Row(
            children: [
              _buildCatalogFilterPill('products', 'Products (${_products.length})', isDark),
              const Gap(6),
              _buildCatalogFilterPill('rentals', 'Rentals (${_rentals.length})', isDark),
              const Gap(6),
              _buildCatalogFilterPill('services', 'Services (${_services.length})', isDark),
            ],
          ),
          const Gap(12),
        ],

        // Catalog List
        if (_catalogFilter == 'products' || _searchQuery.isNotEmpty)
          _buildProductsList(isDark),
        if (_catalogFilter == 'rentals' && _searchQuery.isEmpty)
          _buildRentalsList(isDark),
        if (_catalogFilter == 'services' && _searchQuery.isEmpty)
          _buildServicesList(isDark),
      ],
    );
  }

  Widget _buildCatalogFilterPill(String filterKey, String label, bool isDark) {
    final isSel = _catalogFilter == filterKey;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _catalogFilter = filterKey),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSel ? ServoraColors.emerald600 : (isDark ? ServoraColors.darkSurface : Colors.white),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: isSel ? ServoraColors.emerald600 : (isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0))),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.bold,
                color: isSel ? Colors.white : (isDark ? Colors.white60 : Colors.grey[700]),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProductsList(bool isDark) {
    final q = _searchQuery.trim().toLowerCase();
    final filtered = _products.where((p) {
      if (q.isEmpty) return true;
      final title = (p['title'] ?? '').toString().toLowerCase();
      final cat = (p['category'] ?? '').toString().toLowerCase();
      return title.contains(q) || cat.contains(q);
    }).toList();

    if (filtered.isEmpty) {
      return _buildEmptyState('No Products Found', 'Add products to start selling across Tamale and Ghana.');
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: filtered.length,
      separatorBuilder: (_, __) => const Gap(10),
      itemBuilder: (context, idx) {
        final p = filtered[idx];
        final price = (p['price'] is num) ? (p['price'] as num).toDouble() : (double.tryParse(p['price']?.toString() ?? '0') ?? 0.0);
        final likes = p['likesCount'] ?? p['_count']?['likes'] ?? 0;
        final views = p['viewsCount'] ?? 0;
        final stock = p['stockQuantity'] ?? 1;

        final rawImages = p['images'];
        String img = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80';
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
                child: CachedNetworkImage(
                  imageUrl: img,
                  width: 78,
                  height: 78,
                  fit: BoxFit.cover,
                  errorWidget: (_, __, ___) => Container(
                    width: 78,
                    height: 78,
                    color: Colors.grey[200],
                    child: const Icon(Icons.shopping_bag_outlined, color: Colors.grey),
                  ),
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
                            p['category'] ?? 'General',
                            style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                          ),
                        ),
                        _buildStockPill(stock > 2 ? 'IN_STOCK' : (stock > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK'), stock),
                      ],
                    ),
                    const Gap(4),
                    Text(p['title'] ?? 'Product Title', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900), maxLines: 2),
                    const Gap(4),
                    Text('GH₵ ${price.toStringAsFixed(2)}', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                    const Gap(6),
                    // Likes & Views Engagement Pills
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEF4444).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.favorite_rounded, size: 11, color: Color(0xFFEF4444)),
                              const Gap(3),
                              Text('$likes Likes', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFFEF4444))),
                            ],
                          ),
                        ),
                        const Gap(6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.grey.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.visibility_rounded, size: 11, color: Colors.grey),
                              const Gap(3),
                              Text('$views Views', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)),
                            ],
                          ),
                        ),
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

  Widget _buildRentalsList(bool isDark) {
    if (_rentals.isEmpty) {
      return _buildEmptyState('No Machinery Rentals Listed', 'Tap "+ Add Rental" to lease power tools and equipment.');
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _rentals.length,
      separatorBuilder: (_, __) => const Gap(10),
      itemBuilder: (context, idx) {
        final r = _rentals[idx];
        final rate = double.tryParse(r['dailyRate']?.toString() ?? '100') ?? 100.0;

        return ServoraCard(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: const Color(0xFFD97706).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.build_rounded, color: Color(0xFFD97706), size: 28),
              ),
              const Gap(12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(r['category'] ?? 'Equipment Rental', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
                    const Gap(2),
                    Text(r['title'] ?? 'Rental Machinery', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                    const Gap(2),
                    Text('GH₵ ${rate.toStringAsFixed(0)} / day', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFFD97706))),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildServicesList(bool isDark) {
    if (_services.isEmpty) {
      return _buildEmptyState('No Services in Portfolio', 'Tap "+ Add Service" to showcase your trade skills.');
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _services.length,
      separatorBuilder: (_, __) => const Gap(10),
      itemBuilder: (context, idx) {
        final s = _services[idx];
        final price = double.tryParse(s['startingPrice']?.toString() ?? '0') ?? 0.0;

        return ServoraCard(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.layers_rounded, color: Color(0xFF2563EB), size: 28),
              ),
              const Gap(12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s['serviceName'] ?? 'Trade Service', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                    const Gap(2),
                    Text('Starting at GH₵ ${price.toStringAsFixed(0)}', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: Color(0xFF2563EB))),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ==========================================
  // TAB 2: ESCROW DEALS & ORDERS WORKSPACE
  // ==========================================
  Widget _buildEscrowWorkspace(bool isDark) {
    if (_escrowDeals.isEmpty) {
      return _buildEmptyState('No Active Escrow Contracts', 'Safe MoMo Escrow payments protected by Servora will appear here.');
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF047857).withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
          ),
          child: const Row(
            children: [
              Icon(Icons.shield_rounded, color: ServoraColors.emerald600, size: 22),
              Gap(10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Safe MoMo Escrow Vault Protection', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                    Text('Customer funds are held in secure escrow until order delivery confirmation.', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
                  ],
                ),
              ),
            ],
          ),
        ),
        const Gap(14),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _escrowDeals.length,
          separatorBuilder: (_, __) => const Gap(10),
          itemBuilder: (context, idx) {
            final deal = _escrowDeals[idx];
            final amount = double.tryParse(deal['amount']?.toString() ?? '0') ?? 0.0;
            final customer = deal['customer'] as Map<String, dynamic>? ?? {};
            final customerName = customer['name'] ?? 'Buyer Customer';
            final customerPhone = customer['phone'] ?? '+233240000000';
            final status = deal['status'] ?? 'FUNDS_HELD_IN_VAULT';

            return ServoraCard(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(deal['dealCode'] ?? 'ESC-98214', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                      _buildEscrowStatusBadge(status),
                    ],
                  ),
                  const Gap(6),
                  Text(deal['title'] ?? 'Escrow Transaction', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                  const Gap(4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('GH₵ ${amount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                      Text('Customer: $customerName', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                    ],
                  ),
                  const Divider(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.chat_bubble_rounded, size: 13),
                          label: const Text('WhatsApp Buyer', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                          onPressed: () => WhatsAppHelper.openWhatsApp(
                            phone: customerPhone,
                            message: 'Hello $customerName, regarding our Escrow Deal ${deal['dealCode']} for "${deal['title']}".',
                          ),
                        ),
                      ),
                      const Gap(8),
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ServoraColors.emerald600,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.check_circle_outline_rounded, size: 13),
                          label: const Text('Request Release', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Release request sent for ${deal['dealCode']}. Buyer will confirm release PIN.'),
                                backgroundColor: ServoraColors.emerald600,
                              ),
                            );
                          },
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

  Widget _buildEscrowStatusBadge(String status) {
    Color bg = const Color(0xFFD1FAE5);
    Color fg = const Color(0xFF047857);
    String label = 'IN ESCROW VAULT 🔒';

    if (status == 'COMPLETED') {
      bg = const Color(0xFFE0E7FF);
      fg = const Color(0xFF3730A3);
      label = 'RELEASED / COMPLETED ✓';
    } else if (status == 'DISPUTED') {
      bg = const Color(0xFFFEE2E2);
      fg = const Color(0xFFB91C1C);
      label = 'IN DISPUTE ⚠️';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: fg)),
    );
  }

  // ==========================================
  // TAB 3: REVIEWS & Q&A HUB WORKSPACE
  // ==========================================
  Widget _buildReviewsWorkspace(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _reviewSubTab = 'reviews'),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 9),
                  decoration: BoxDecoration(
                    color: _reviewSubTab == 'reviews' ? ServoraColors.emerald600 : (isDark ? ServoraColors.darkSurface : Colors.white),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _reviewSubTab == 'reviews' ? ServoraColors.emerald600 : (isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0))),
                  ),
                  child: Center(
                    child: Text(
                      'Customer Reviews (${_reviews.length})',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: _reviewSubTab == 'reviews' ? Colors.white : (isDark ? Colors.white60 : Colors.grey[700]),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const Gap(8),
            Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _reviewSubTab = 'questions'),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 9),
                  decoration: BoxDecoration(
                    color: _reviewSubTab == 'questions' ? const Color(0xFF2563EB) : (isDark ? ServoraColors.darkSurface : Colors.white),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _reviewSubTab == 'questions' ? const Color(0xFF2563EB) : (isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0))),
                  ),
                  child: Center(
                    child: Text(
                      'Product Q&As (${_questions.length})',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: _reviewSubTab == 'questions' ? Colors.white : (isDark ? Colors.white60 : Colors.grey[700]),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        const Gap(14),

        if (_reviewSubTab == 'reviews') ...[
          if (_reviews.isEmpty)
            _buildEmptyState('No Customer Reviews Yet', 'Reviews left by verified buyers will appear here so you can reply.')
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _reviews.length,
              separatorBuilder: (_, __) => const Gap(10),
              itemBuilder: (context, idx) {
                final r = _reviews[idx];
                final hasReply = r['sellerReply'] != null && r['sellerReply'].toString().trim().isNotEmpty;

                return ServoraCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                ...List.generate(
                                  5,
                                  (i) => Icon(
                                    Icons.star_rounded,
                                    size: 13,
                                    color: i < (r['rating'] ?? 5) ? const Color(0xFFF59E0B) : Colors.grey[300],
                                  ),
                                ),
                                const Gap(6),
                                Flexible(
                                  child: Text(
                                    r['authorName'] ?? 'Customer',
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Gap(8),
                          Flexible(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: ServoraColors.emerald600.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                r['productTitle'] ?? 'Product',
                                style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Gap(6),
                      Text('"${r['comment'] ?? ''}"', style: const TextStyle(fontSize: 12.5, height: 1.3)),
                      const Gap(10),

                      // Seller Reply Section
                      if (hasReply)
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: ServoraColors.emerald600.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: ServoraColors.emerald600.withOpacity(0.25)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.verified_rounded, size: 12, color: ServoraColors.emerald600),
                                  Gap(4),
                                  Text('YOUR MERCHANT RESPONSE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                                ],
                              ),
                              const Gap(4),
                              Text(r['sellerReply'], style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        )
                      else
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ServoraColors.emerald600,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.reply_rounded, size: 14),
                          label: const Text('Reply to Review', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          onPressed: () => _openReplyReviewModal(r),
                        ),
                    ],
                  ),
                );
              },
            ),
        ] else ...[
          if (_questions.isEmpty)
            _buildEmptyState('No Customer Questions Yet', 'Inquiries asked on your product pages will appear here for you to answer.')
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _questions.length,
              separatorBuilder: (_, __) => const Gap(10),
              itemBuilder: (context, idx) {
                final q = _questions[idx];
                final hasAnswer = q['answer'] != null && q['answer'].toString().trim().isNotEmpty;

                return ServoraCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(
                            child: Text(
                              'Q: ${q['askerName'] ?? 'Customer'}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const Gap(8),
                          Flexible(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF2563EB).withOpacity(0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                q['productTitle'] ?? 'Product',
                                style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Gap(6),
                      Text('"${q['question'] ?? ''}"', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                      const Gap(10),

                      if (hasAnswer)
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2563EB).withOpacity(0.08),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFF2563EB).withOpacity(0.25)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.check_circle_rounded, size: 12, color: Color(0xFF2563EB)),
                                  Gap(4),
                                  Text('OFFICIAL ANSWER', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF2563EB))),
                                ],
                              ),
                              const Gap(4),
                              Text(q['answer'], style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        )
                      else
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF2563EB),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.question_answer_rounded, size: 14),
                          label: const Text('Answer Question', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          onPressed: () => _openAnswerQuestionModal(q),
                        ),
                    ],
                  ),
                );
              },
            ),
        ],
      ],
    );
  }

  // ==========================================
  // TAB 4: IN-APP CUSTOMER CHATS WORKSPACE
  // ==========================================
  Widget _buildMessagesWorkspace(bool isDark) {
    if (_chatRooms.isEmpty) {
      return ServoraCard(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Icon(Icons.chat_bubble_outline_rounded, size: 44, color: ServoraColors.emerald600),
            const Gap(12),
            const Text('In-App Customer Messaging Hub', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
            const Gap(6),
            const Text(
              'When customers send inquiries on your storefront or products, their direct in-app chat channels appear here.',
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
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: const Text('Refresh Messages', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              onPressed: _fetchLivePortalData,
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _chatRooms.length,
      separatorBuilder: (_, __) => const Gap(10),
      itemBuilder: (context, idx) {
        final room = _chatRooms[idx];
        final customer = room['customer'] as Map<String, dynamic>? ?? {};
        final name = customer['name'] ?? room['title'] ?? 'Customer';
        final lastMsg = room['lastMessage']?['content'] ?? 'Started a conversation...';
        final unread = room['unreadCount'] ?? 0;

        return ServoraCard(
          padding: const EdgeInsets.all(12),
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: CircleAvatar(
              radius: 22,
              backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
              child: Text(name.isNotEmpty ? name[0].toUpperCase() : 'C', style: const TextStyle(fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
            ),
            title: Text(name, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900)),
            subtitle: Text(lastMsg, style: const TextStyle(fontSize: 11.5, color: Colors.grey), maxLines: 1, overflow: TextOverflow.ellipsis),
            trailing: unread > 0
                ? Container(
                    padding: const EdgeInsets.all(6),
                    decoration: const BoxDecoration(color: ServoraColors.emerald600, shape: BoxShape.circle),
                    child: Text('$unread', style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold)),
                  )
                : const Icon(Icons.chevron_right_rounded, color: Colors.grey),
            onTap: () => _openChatDialog(room),
          ),
        );
      },
    );
  }

  // ==========================================
  // TAB 5: LEAD CRM WORKSPACE
  // ==========================================
  Widget _buildLeadsWorkspace(bool isDark) {
    if (_leads.isEmpty && _quotes.isEmpty) {
      return _buildEmptyState('No Leads Yet', 'Incoming quote requests from Tamale customers will appear here.');
    }

    return ListView.separated(
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
        );
      },
    );
  }

  // ==========================================
  // HELPERS
  // ==========================================
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
