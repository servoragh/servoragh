import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/constants.dart';
import '../../auth/providers/auth_provider.dart';

// ─────────────────────────────────────────────────────────────────
//  Servora · Request Detail Screen
//  Synced in real-time with the web via same REST API
// ─────────────────────────────────────────────────────────────────

class RequestDetailScreen extends StatefulWidget {
  final String requestId;
  const RequestDetailScreen({super.key, required this.requestId});

  @override
  State<RequestDetailScreen> createState() => _RequestDetailScreenState();
}

class _RequestDetailScreenState extends State<RequestDetailScreen>
    with SingleTickerProviderStateMixin {
  static final _dio = Dio(BaseOptions(
    baseUrl: ServoraConstants.baseUrl,
    connectTimeout: const Duration(seconds: 12),
    receiveTimeout: const Duration(seconds: 12),
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
  ));

  Map<String, dynamic>? _req;
  List<dynamic> _comments = [];
  int _likes = 0;
  bool _liked = false;
  bool _loading = true;
  String? _error;

  // Quote form
  final _priceCtrl = TextEditingController();
  final _completionCtrl = TextEditingController(text: 'Same day');
  final _msgCtrl = TextEditingController();
  bool _quoteLoading = false;
  bool _quoteSuccess = false;

  // Comment
  final _commentCtrl = TextEditingController();
  bool _commentLoading = false;

  // Image lightbox index
  int _lightboxIdx = 0;
  bool _showLightbox = false;

  // Auto-refresh
  Timer? _refreshTimer;
  late final TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    _fetchRequest();
    _fetchComments();
    // Poll every 15s for real-time updates (same as web)
    _refreshTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      _fetchRequest();
      _fetchComments();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _tabCtrl.dispose();
    _priceCtrl.dispose();
    _completionCtrl.dispose();
    _msgCtrl.dispose();
    _commentCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchRequest() async {
    try {
      final token = await authNotifier.storage.getToken();
      final res = await _dio.get(
        '/requests/${widget.requestId}',
        options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}),
      );
      if (mounted) setState(() { _req = res.data['request']; _loading = false; _error = null; });
    } catch (e) {
      if (mounted) setState(() { _loading = false; _error = e.toString(); });
    }
  }

  Future<void> _fetchComments() async {
    try {
      final token = await authNotifier.storage.getToken();
      final res = await _dio.get(
        '/requests/${widget.requestId}/comments',
        options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}),
      );
      if (mounted) setState(() {
        _comments = res.data['comments'] ?? [];
        _likes = res.data['likes'] ?? 0;
      });
    } catch (_) {}
  }

  Future<void> _toggleLike() async {
    HapticFeedback.lightImpact();
    try {
      final token = await authNotifier.storage.getToken();
      final res = await _dio.post(
        '/requests/${widget.requestId}/comments',
        data: {'action': 'LIKE'},
        options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}),
      );
      if (mounted) setState(() {
        _liked = res.data['liked'] ?? false;
        _likes += _liked ? 1 : -1;
      });
    } catch (_) {}
  }

  Future<void> _submitQuote() async {
    if (_priceCtrl.text.isEmpty || _msgCtrl.text.isEmpty) return;
    setState(() => _quoteLoading = true);
    try {
      final token = await authNotifier.storage.getToken();
      await _dio.post(
        '/quotes',
        data: {
          'requestId': widget.requestId,
          'price': double.tryParse(_priceCtrl.text) ?? 0,
          'completionTime': _completionCtrl.text,
          'message': _msgCtrl.text,
        },
        options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}),
      );
      if (mounted) setState(() { _quoteSuccess = true; _quoteLoading = false; });
      _fetchRequest();
    } catch (e) {
      if (mounted) {
        setState(() => _quoteLoading = false);
        _snack('Failed: ${e.toString()}', isError: true);
      }
    }
  }

  Future<void> _quoteAction(String quoteId, String action) async {
    HapticFeedback.mediumImpact();
    try {
      final token = await authNotifier.storage.getToken();
      final res = await _dio.patch(
        '/quotes/$quoteId',
        data: {'action': action},
        options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}),
      );
      if (mounted) {
        _fetchRequest();
        _snack(res.data['message'] ?? 'Done!');
        if (action == 'ACCEPT' || action == 'PROVIDER_CONFIRM') {
          HapticFeedback.heavyImpact();
        }
      }
    } catch (e) {
      if (mounted) _snack('Error: ${e.toString()}', isError: true);
    }
  }

  Future<void> _submitComment() async {
    if (_commentCtrl.text.trim().isEmpty) return;
    setState(() => _commentLoading = true);
    try {
      final token = await authNotifier.storage.getToken();
      await _dio.post(
        '/requests/${widget.requestId}/comments',
        data: {'action': 'COMMENT', 'content': _commentCtrl.text.trim()},
        options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}),
      );
      _commentCtrl.clear();
      _fetchComments();
    } catch (e) {
      _snack('Failed to post comment', isError: true);
    } finally {
      if (mounted) setState(() => _commentLoading = false);
    }
  }

  void _snack(String msg, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: const TextStyle(fontWeight: FontWeight.bold)),
      backgroundColor: isError ? const Color(0xFFDC2626) : const Color(0xFF059669),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.all(16),
    ));
  }

  String _formatDate(String? iso) {
    if (iso == null) return '';
    try {
      final d = DateTime.parse(iso).toLocal();
      final now = DateTime.now();
      final diff = now.difference(d);
      if (diff.inMinutes < 1) return 'Just now';
      if (diff.inHours < 1) return '${diff.inMinutes}m ago';
      if (diff.inDays < 1) return '${diff.inHours}h ago';
      if (diff.inDays < 7) return '${diff.inDays}d ago';
      return '${d.day}/${d.month}/${d.year}';
    } catch (_) { return iso; }
  }

  String _formatGHS(dynamic price) {
    if (price == null) return 'GH₵ --';
    return 'GH₵ ${double.tryParse(price.toString())?.toStringAsFixed(2) ?? price}';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0A0F1A) : const Color(0xFFF8FAFC);
    final surface = isDark ? const Color(0xFF111827) : Colors.white;
    final border = isDark ? const Color(0xFF1F2937) : const Color(0xFFE2E8F0);
    const green = Color(0xFF059669);

    if (_loading) {
      return Scaffold(
        backgroundColor: bg,
        body: const Center(child: CircularProgressIndicator(color: Color(0xFF059669))),
      );
    }

    if (_error != null || _req == null) {
      return Scaffold(
        backgroundColor: bg,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline_rounded, color: Color(0xFFDC2626), size: 48),
              const SizedBox(height: 16),
              const Text('Request not found', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
              const SizedBox(height: 8),
              TextButton(onPressed: () => context.pop(), child: const Text('Go Back')),
            ],
          ),
        ),
      );
    }

    final req = _req!;
    final userId = authNotifier.state.user?.id;
    final userRole = authNotifier.state.user?.role;
    final isOwner = userId == req['customerId'];
    final isProvider = userRole == 'PROVIDER' || userRole == 'ADMIN';
    final quotes = (req['quotes'] as List?) ?? [];
    final media = (req['media'] as List?) ?? [];
    final imageMedia = media.where((m) => m['mediaType'] == 'IMAGE').toList();
    final myQuote = quotes.firstWhere((q) => q['providerId'] == userId, orElse: () => null);
    final status = req['status'] ?? '';
    final isTaken = ['IN_PROGRESS', 'OFFER_ACCEPTED', 'COMPLETED'].contains(status);

    return Scaffold(
      backgroundColor: bg,

      // ── Lightbox overlay ──
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              // ── App Bar ──────────────────────────────────────────
              SliverAppBar(
                expandedHeight: imageMedia.isNotEmpty ? 260 : 120,
                pinned: true,
                backgroundColor: surface,
                elevation: 0,
                leading: IconButton(
                  icon: Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.arrow_back_ios_new_rounded, size: 16, color: Colors.white),
                  ),
                  onPressed: () => context.pop(),
                ),
                actions: [
                  // Like
                  IconButton(
                    onPressed: _toggleLike,
                    icon: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_liked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                          color: _liked ? Colors.red : Colors.white, size: 18),
                        if (_likes > 0) ...[
                          const SizedBox(width: 4),
                          Text('$_likes', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ],
                    ),
                  ),
                  // Share
                  IconButton(
                    onPressed: () => launchUrl(Uri.parse(
                      'https://wa.me/?text=${Uri.encodeComponent('Tamale Job: "${req['title']}" — ${ServoraConstants.webUrl}/requests/${widget.requestId}')}'
                    )),
                    icon: const Icon(Icons.share_rounded, color: Colors.white, size: 18),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: imageMedia.isNotEmpty
                      ? GestureDetector(
                          onTap: () => setState(() { _lightboxIdx = 0; _showLightbox = true; }),
                          child: Image.network(
                            imageMedia[0]['mediaUrl'],
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(color: const Color(0xFF1F2937)),
                          ),
                        )
                      : Container(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Color(0xFF064E3B), Color(0xFF059669)],
                              begin: Alignment.topLeft, end: Alignment.bottomRight,
                            ),
                          ),
                        ),
                ),
              ),

              // ── Status Banner ──────────────────────────────────
              if (isTaken)
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: status == 'COMPLETED'
                          ? const Color(0xFF059669).withOpacity(0.1)
                          : const Color(0xFFD97706).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: status == 'COMPLETED'
                            ? const Color(0xFF059669).withOpacity(0.4)
                            : const Color(0xFFD97706).withOpacity(0.4),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          status == 'COMPLETED' ? Icons.check_circle_rounded : Icons.lock_rounded,
                          color: status == 'COMPLETED' ? green : const Color(0xFFD97706),
                          size: 18,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                status == 'COMPLETED' ? 'Job Completed ✅' : '🔒 Job In Progress — Already Taken',
                                style: TextStyle(
                                  fontWeight: FontWeight.w900, fontSize: 12,
                                  color: status == 'COMPLETED' ? green : const Color(0xFFD97706),
                                ),
                              ),
                              if (status != 'COMPLETED')
                                const Text('This request has been accepted and is being handled.', style: TextStyle(fontSize: 10, color: Color(0xFF9CA3AF))),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

              // ── Header Info ─────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Badges
                      Wrap(
                        spacing: 6, runSpacing: 6,
                        children: [
                          _chip(req['service']?['name'] ?? req['customCategory'] ?? 'Custom', green),
                          _chip(_urgencyLabel(req['urgency']), _urgencyColor(req['urgency'])),
                          _chip(isTaken ? '🔒 Taken' : '🟢 Open', isTaken ? const Color(0xFFD97706) : green),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Title
                      Text(req['title'] ?? '', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
                      const SizedBox(height: 8),

                      // Location + meta
                      Row(
                        children: [
                          const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFF059669)),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              req['landmark'] ?? req['location']?['area'] ?? 'Tamale',
                              style: const TextStyle(fontSize: 12, color: Color(0xFF059669), fontWeight: FontWeight.w700),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Posted by ${req['customer']?['name'] ?? req['guestName'] ?? 'Unknown'} · ${_formatDate(req['createdAt'])}',
                        style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
                      ),

                      const SizedBox(height: 12),

                      // Budget
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: green.withOpacity(0.07),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: green.withOpacity(0.2)),
                        ),
                        child: Row(
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('BUDGET', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF9CA3AF), letterSpacing: 1)),
                                Text(
                                  req['budgetMin'] != null || req['budgetMax'] != null
                                      ? 'GH₵ ${req['budgetMin'] ?? 0} – ${req['budgetMax'] ?? 'Open'}'
                                      : 'Open to Quotes',
                                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: green),
                                ),
                              ],
                            ),
                            const Spacer(),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text('${quotes.length}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                                const Text('offers', style: TextStyle(fontSize: 10, color: Color(0xFF9CA3AF))),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Tabs ─────────────────────────────────────────────
              SliverPersistentHeader(
                pinned: true,
                delegate: _SliverTabBar(
                  tabCtrl: _tabCtrl,
                  tabs: ['Details', 'Offers (${quotes.length})', 'Comments (${_comments.length})'],
                  bg: surface,
                ),
              ),

              // ── Tab Content ───────────────────────────────────────
              SliverFillRemaining(
                hasScrollBody: false,
                child: _buildTabContent(req, quotes, imageMedia, isOwner, isProvider, myQuote, isTaken, surface, border, green),
              ),
            ],
          ),

          // ── Lightbox ──────────────────────────────────────────────
          if (_showLightbox && imageMedia.isNotEmpty)
            GestureDetector(
              onTap: () => setState(() => _showLightbox = false),
              child: Container(
                color: const Color(0xEA000000),
                child: SafeArea(
                  child: Column(
                    children: [
                      Align(
                        alignment: Alignment.topRight,
                        child: IconButton(
                          onPressed: () => setState(() => _showLightbox = false),
                          icon: const Icon(Icons.close_rounded, color: Colors.white),
                        ),
                      ),
                      Expanded(
                        child: PageView.builder(
                          controller: PageController(initialPage: _lightboxIdx),
                          itemCount: imageMedia.length,
                          itemBuilder: (_, i) => InteractiveViewer(
                            child: Image.network(imageMedia[i]['mediaUrl'], fit: BoxFit.contain),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),

      // ── Floating Submit Quote Button ────────────────────────
      bottomNavigationBar: isProvider && myQuote == null && !isTaken
          ? _buildQuoteBar(surface, border, green)
          : null,
    );
  }

  Widget _buildTabContent(
    Map req, List quotes, List imageMedia,
    bool isOwner, bool isProvider, dynamic myQuote, bool isTaken,
    Color surface, Color border, Color green,
  ) {
    return AnimatedBuilder(
      animation: _tabCtrl,
      builder: (_, __) {
        switch (_tabCtrl.index) {
          case 0: return _buildDetailsTab(req, imageMedia, surface, border, green);
          case 1: return _buildOffersTab(quotes, isOwner, isProvider, myQuote, isTaken, surface, border, green);
          case 2: return _buildCommentsTab(surface, border, green);
          default: return const SizedBox();
        }
      },
    );
  }

  Widget _buildDetailsTab(Map req, List imageMedia, Color surface, Color border, Color green) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Description
          const Text('Description', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: border)),
            child: Text(req['description'] ?? 'No description provided.', style: const TextStyle(fontSize: 13, height: 1.5, color: Color(0xFF9CA3AF))),
          ),
          const SizedBox(height: 16),

          // GPS link
          if (req['latitude'] != null)
            GestureDetector(
              onTap: () => launchUrl(Uri.parse('https://www.google.com/maps/search/?api=1&query=${req['latitude']},${req['longitude']}')),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: green.withOpacity(0.08), borderRadius: BorderRadius.circular(14), border: Border.all(color: green.withOpacity(0.2))),
                child: Row(
                  children: [
                    Icon(Icons.navigation_rounded, color: green, size: 16),
                    const SizedBox(width: 8),
                    Expanded(child: Text('GPS: ${(req['latitude'] as double).toStringAsFixed(4)}, ${(req['longitude'] as double).toStringAsFixed(4)}', style: TextStyle(fontSize: 11, color: green, fontWeight: FontWeight.w700, fontFamily: 'monospace'))),
                    Icon(Icons.open_in_new_rounded, color: green, size: 14),
                  ],
                ),
              ),
            ),

          // Image grid (thumbnails)
          if (imageMedia.length > 1) ...[
            const SizedBox(height: 16),
            const Text('Photos', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
            const SizedBox(height: 8),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, crossAxisSpacing: 6, mainAxisSpacing: 6),
              itemCount: imageMedia.length,
              itemBuilder: (_, i) => GestureDetector(
                onTap: () => setState(() { _lightboxIdx = i; _showLightbox = true; }),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(imageMedia[i]['mediaUrl'], fit: BoxFit.cover),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildOffersTab(List quotes, bool isOwner, bool isProvider, dynamic myQuote, bool isTaken, Color surface, Color border, Color green) {
    if (quotes.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.price_change_outlined, color: Colors.white24, size: 48),
              const SizedBox(height: 12),
              const Text('No offers yet', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(0xFF9CA3AF))),
              const Text('Artisans will send price offers shortly.', style: TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      padding: const EdgeInsets.all(16),
      physics: const NeverScrollableScrollPhysics(),
      itemCount: quotes.length,
      itemBuilder: (_, i) {
        final q = quotes[i];
        final qStatus = q['status'] ?? '';
        final isAccepted = qStatus == 'ACCEPTED';
        final isCustAccepted = qStatus == 'CUSTOMER_ACCEPTED';
        final isPending = qStatus == 'PENDING';
        final isMyQuote = q['providerId'] == authNotifier.state.user?.id;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isAccepted ? green : isCustAccepted ? const Color(0xFFD97706) : border,
              width: (isAccepted || isCustAccepted) ? 2 : 1,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Provider + price row
                Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: const Color(0xFF374151),
                      child: Text(
                        (q['provider']?['providerProfile']?['businessName'] ?? q['provider']?['name'] ?? 'A').substring(0, 1),
                        style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 14),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            q['provider']?['providerProfile']?['businessName'] ?? q['provider']?['name'] ?? 'Artisan',
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                          ),
                          Text('⏱ ${q['completionTime'] ?? 'TBD'}', style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(_formatGHS(q['price']), style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: green)),
                        if (isAccepted)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: green, borderRadius: BorderRadius.circular(6)),
                            child: const Text('CONFIRMED ✓', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900)),
                          ),
                        if (isCustAccepted)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: const Color(0xFFD97706), borderRadius: BorderRadius.circular(6)),
                            child: const Text('WAITING PROVIDER', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900)),
                          ),
                        if (isMyQuote && !isAccepted && !isCustAccepted)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: Colors.blue.withOpacity(0.2), borderRadius: BorderRadius.circular(6), border: Border.all(color: Colors.blue)),
                            child: const Text('YOUR OFFER', style: TextStyle(color: Colors.blue, fontSize: 9, fontWeight: FontWeight.w900)),
                          ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Message
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.04), borderRadius: BorderRadius.circular(12)),
                  child: Text(q['message'] ?? '', style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF), height: 1.5)),
                ),

                // Confirmed contact reveal
                if (isAccepted && q['provider']?['phone'] != null) ...[
                  const SizedBox(height: 10),
                  GestureDetector(
                    onTap: () => launchUrl(Uri.parse('tel:${q['provider']['phone']}')),
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: green.withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: green.withOpacity(0.3))),
                      child: Row(
                        children: [
                          Icon(Icons.phone_rounded, color: green, size: 16),
                          const SizedBox(width: 8),
                          Text('Call: ${q['provider']['phone']}', style: TextStyle(color: green, fontWeight: FontWeight.w900, fontSize: 13)),
                          const Spacer(),
                          Icon(Icons.chevron_right_rounded, color: green, size: 16),
                        ],
                      ),
                    ),
                  ),
                ],

                // Customer: accept/reject
                if (isOwner && isPending) ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _quoteAction(q['id'], 'ACCEPT'),
                          icon: const Icon(Icons.thumb_up_rounded, size: 14),
                          label: const Text('Accept Offer', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: green,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: () => _quoteAction(q['id'], 'REJECT'),
                        child: const Text('Decline', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 12)),
                      ),
                    ],
                  ),
                ],

                // Provider: confirm they're taking the job
                if (isCustAccepted && isMyQuote) ...[
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => _quoteAction(q['id'], 'PROVIDER_CONFIRM'),
                      icon: const Icon(Icons.check_circle_rounded, size: 16),
                      label: const Text('Yes, I\'ll Take This Job!', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCommentsTab(Color surface, Color border, Color green) {
    return Column(
      children: [
        // Comment list
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          itemCount: _comments.length,
          itemBuilder: (_, i) {
            final c = _comments[i];
            return Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: green.withOpacity(0.2),
                    child: Text(
                      ((c['author']?['name'] ?? c['guestName'] ?? 'A') as String).substring(0, 1).toUpperCase(),
                      style: TextStyle(color: green, fontWeight: FontWeight.w900, fontSize: 12),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(c['author']?['name'] ?? c['guestName'] ?? 'Anonymous', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
                            const SizedBox(width: 6),
                            Text(_formatDate(c['createdAt']), style: const TextStyle(fontSize: 10, color: Color(0xFF9CA3AF))),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: surface,
                            borderRadius: const BorderRadius.only(
                              topRight: Radius.circular(16),
                              bottomLeft: Radius.circular(16),
                              bottomRight: Radius.circular(16),
                            ),
                            border: Border.all(color: border),
                          ),
                          child: Text(c['content'] ?? '', style: const TextStyle(fontSize: 12, height: 1.4)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),

        if (_comments.isEmpty)
          const Padding(
            padding: EdgeInsets.all(32),
            child: Text('No comments yet. Be the first!', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 12), textAlign: TextAlign.center),
          ),

        // Comment input
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          child: Row(
            children: [
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: border),
                  ),
                  child: TextField(
                    controller: _commentCtrl,
                    style: const TextStyle(fontSize: 13),
                    decoration: const InputDecoration(
                      hintText: 'Add a comment...',
                      hintStyle: TextStyle(color: Color(0xFF9CA3AF), fontSize: 12),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    onSubmitted: (_) => _submitComment(),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: _commentLoading ? null : _submitComment,
                child: Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF059669), Color(0xFF0D9488)]),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: _commentLoading
                      ? const Center(child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)))
                      : const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuoteBar(Color surface, Color border, Color green) {
    return Container(
      decoration: BoxDecoration(color: surface, border: Border(top: BorderSide(color: border))),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (!_quoteSuccess) ...[
            Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(color: const Color(0xFF1F2937), borderRadius: BorderRadius.circular(12), border: Border.all(color: border)),
                    child: TextField(
                      controller: _priceCtrl,
                      keyboardType: TextInputType.number,
                      style: TextStyle(fontWeight: FontWeight.w900, color: green, fontSize: 16),
                      decoration: const InputDecoration(
                        hintText: 'Your price (GH₵)',
                        hintStyle: TextStyle(color: Color(0xFF6B7280), fontSize: 12),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        prefixText: 'GH₵ ',
                        prefixStyle: TextStyle(color: Color(0xFF9CA3AF), fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(color: const Color(0xFF1F2937), borderRadius: BorderRadius.circular(12), border: Border.all(color: border)),
              child: TextField(
                controller: _msgCtrl,
                maxLines: 2,
                style: const TextStyle(fontSize: 12),
                decoration: const InputDecoration(
                  hintText: 'Describe your approach, tools needed, availability...',
                  hintStyle: TextStyle(color: Color(0xFF6B7280), fontSize: 11),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
              ),
            ),
            const SizedBox(height: 10),
          ],
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _quoteLoading ? null : (_quoteSuccess ? () => setState(() => _quoteSuccess = false) : _submitQuote),
              icon: Icon(_quoteSuccess ? Icons.check_rounded : Icons.send_rounded, size: 16),
              label: Text(
                _quoteSuccess ? 'Offer sent! Send another?' : (_quoteLoading ? 'Sending...' : 'Send Price Offer to Customer'),
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _chip(String label, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    decoration: BoxDecoration(
      color: color.withOpacity(0.12),
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: color.withOpacity(0.3)),
    ),
    child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: color)),
  );

  String _urgencyLabel(String? u) {
    switch (u) {
      case 'EMERGENCY_ASAP': return '🚨 Emergency';
      case 'SAME_DAY': return '⚡ Same Day';
      case 'SCHEDULED': return '📅 Scheduled';
      case 'FLEXIBLE': return '🌱 Flexible';
      default: return u ?? 'Unknown';
    }
  }

  Color _urgencyColor(String? u) {
    switch (u) {
      case 'EMERGENCY_ASAP': return const Color(0xFFDC2626);
      case 'SAME_DAY': return const Color(0xFFD97706);
      case 'SCHEDULED': return const Color(0xFF7C3AED);
      case 'FLEXIBLE': return const Color(0xFF059669);
      default: return const Color(0xFF6B7280);
    }
  }
}

// ─────────────────────────────────────────────────────────────────
//  Sticky Tab Bar Delegate
// ─────────────────────────────────────────────────────────────────
class _SliverTabBar extends SliverPersistentHeaderDelegate {
  final TabController tabCtrl;
  final List<String> tabs;
  final Color bg;
  const _SliverTabBar({required this.tabCtrl, required this.tabs, required this.bg});

  @override double get minExtent => 48;
  @override double get maxExtent => 48;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: bg,
      child: TabBar(
        controller: tabCtrl,
        tabs: tabs.map((t) => Tab(text: t)).toList(),
        labelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 12),
        labelColor: const Color(0xFF059669),
        unselectedLabelColor: const Color(0xFF9CA3AF),
        indicatorColor: const Color(0xFF059669),
        indicatorSize: TabBarIndicatorSize.label,
        dividerColor: Colors.transparent,
        onTap: (_) {},
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _SliverTabBar old) => tabs != old.tabs;
}
