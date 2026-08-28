import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/constants.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../../core/utils/location_helper.dart';
import '../../auth/providers/auth_provider.dart';

class CustomerPortalView extends StatefulWidget {
  final VoidCallback? onSwitchToMerchant;

  const CustomerPortalView({super.key, this.onSwitchToMerchant});

  @override
  State<CustomerPortalView> createState() => _CustomerPortalViewState();
}

class _CustomerPortalViewState extends State<CustomerPortalView> {
  String _activeTab = 'overview';
  bool _isLoading = true;

  // Live Database Collections
  Map<String, dynamic>? _user;
  Map<String, dynamic>? _profile;
  Map<String, dynamic> _metrics = {
    'activeGigsCount': 0,
    'savedItemsCount': 0,
    'openDisputesCount': 0,
    'escrowVaultBalance': 0.0,
    'totalOrdersCount': 0,
  };

  List<dynamic> _serviceRequests = [];
  List<dynamic> _escrowDeals = [];
  List<dynamic> _disputes = [];
  List<dynamic> _favorites = [];
  List<dynamic> _reviews = [];
  List<dynamic> _communityPosts = [];
  List<dynamic> _activityLogs = [];
  List<dynamic> _savedAddresses = [];

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
    _fetchLiveCustomerData();
  }

  Future<void> _fetchLiveCustomerData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final token = await authNotifier.storage.getToken();
      final currentUser = authNotifier.state.user;
      final res = await _dio.get(
        '/account/profile',
        options: Options(
          headers: {
            if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
            if (currentUser?.phone != null && currentUser!.phone.isNotEmpty) 'x-user-phone': currentUser.phone,
            if (currentUser?.id != null && currentUser!.id.isNotEmpty) 'x-user-id': currentUser.id,
          },
        ),
      );

      if (res.statusCode == 200 && res.data != null) {
        final data = res.data is Map<String, dynamic> ? res.data : {};
        setState(() {
          _user = data['user'];
          _profile = data['profile'];
          _metrics = data['metrics'] ?? _metrics;
          _serviceRequests = List<dynamic>.from(data['serviceRequests'] ?? []);
          _escrowDeals = List<dynamic>.from(data['escrowDeals'] ?? []);
          _disputes = List<dynamic>.from(data['disputes'] ?? []);
          _favorites = List<dynamic>.from(data['favorites'] ?? []);
          _reviews = List<dynamic>.from(data['reviews'] ?? []);
          _communityPosts = List<dynamic>.from(data['communityPosts'] ?? []);
          _activityLogs = List<dynamic>.from(data['activityLogs'] ?? []);
          _savedAddresses = List<dynamic>.from(data['profile']?['savedAddresses'] ?? []);
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load profile');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleReleaseEscrow(String dealId, String pin) async {
    try {
      final token = await authNotifier.storage.getToken();
      final res = await _dio.post(
        '/account/escrow',
        data: {
          'action': 'RELEASE_FUNDS',
          'dealId': dealId,
          'releasePin': pin,
        },
        options: Options(
          headers: token != null ? {'Authorization': 'Bearer $token'} : {},
        ),
      );

      if (res.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: ServoraColors.emerald600,
              content: Text('Escrow funds released successfully to the artisan! ✓'),
            ),
          );
        }
        _fetchLiveCustomerData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red[700],
            content: Text('Error releasing escrow: ${e.toString()}'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final userModel = authNotifier.state.user;
    final userName = _user?['name'] ?? userModel?.name ?? 'Customer Member';
    final userPhone = _user?['phone'] ?? userModel?.phone ?? '+233240000000';
    final tier = _profile?['verificationTier'] ?? 'TIER_1_BASIC';
    final zone = _profile?['defaultZone'] ?? userModel?.serviceArea ?? 'Tamale Central';

    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40),
        child: Center(
          child: CircularProgressIndicator(color: ServoraColors.emerald600),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Header Identity Card
        ServoraCard(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: ServoraColors.emerald600,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Center(
                      child: Text(
                        userName.isNotEmpty ? userName[0].toUpperCase() : 'C',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20),
                      ),
                    ),
                  ),
                  const Gap(12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                userName,
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const Gap(6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                              decoration: BoxDecoration(
                                color: const Color(0xFFECFDF5),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'CUSTOMER',
                                style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: Color(0xFF047857)),
                              ),
                            ),
                          ],
                        ),
                        const Gap(2),
                        Text('$userPhone • 📍 $zone', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        const Gap(4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '🛡️ $tier Phone Verified',
                            style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const Gap(12),

              // Switch to Merchant Mode Action
              if (widget.onSwitchToMerchant != null)
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.storefront_rounded, size: 16, color: ServoraColors.emerald600),
                    label: const Text('Switch to Merchant Mode / Storefront ➔', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                    onPressed: widget.onSwitchToMerchant,
                  ),
                ),
            ],
          ),
        ),
        const Gap(12),

        // 2. Horizontal Scrollable Navigation Tabs
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildTabChip('📊 Overview & Stream', 'overview'),
              const Gap(6),
              _buildTabChip('📋 My Requests (${_serviceRequests.length})', 'requests'),
              const Gap(6),
              _buildTabChip('🛡️ MoMo Escrow (${_escrowDeals.length})', 'escrow'),
              const Gap(6),
              _buildTabChip('💬 Messages', 'messages'),
              const Gap(6),
              _buildTabChip('❤️ Saved (${_favorites.length})', 'favorites'),
              const Gap(6),
              _buildTabChip('⭐ Reviews & Forum', 'reviews'),
              const Gap(6),
              _buildTabChip('⚖️ Disputes (${_disputes.length})', 'disputes'),
              const Gap(6),
              _buildTabChip('⚙️ Settings & Addresses', 'settings'),
            ],
          ),
        ),
        const Gap(14),

        // 3. Tab Body
        _buildActiveTabContent(isDark),
      ],
    );
  }

  Widget _buildTabChip(String label, String tabId) {
    final isSel = _activeTab == tabId;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: isSel ? Colors.white : null)),
      selected: isSel,
      selectedColor: ServoraColors.emerald600,
      onSelected: (_) => setState(() => _activeTab = tabId),
    );
  }

  Widget _buildActiveTabContent(bool isDark) {
    switch (_activeTab) {
      case 'overview':
        return _buildOverviewTab(isDark);
      case 'requests':
        return _buildRequestsTab(isDark);
      case 'escrow':
        return _buildEscrowTab(isDark);
      case 'messages':
        return _buildMessagesTab(isDark);
      case 'favorites':
        return _buildFavoritesTab(isDark);
      case 'reviews':
        return _buildReviewsTab(isDark);
      case 'disputes':
        return _buildDisputesTab(isDark);
      case 'settings':
        return _buildSettingsTab(isDark);
      default:
        return _buildOverviewTab(isDark);
    }
  }

  // ==========================================
  // TAB 1: OVERVIEW & LIVE ACTIVITY STREAM
  // ==========================================
  Widget _buildOverviewTab(bool isDark) {
    final activeGigs = _metrics['activeGigsCount'] ?? 0;
    final escrowBal = (_metrics['escrowVaultBalance'] is num) ? (_metrics['escrowVaultBalance'] as num).toDouble() : 0.0;
    final savedCount = _metrics['savedItemsCount'] ?? 0;
    final openDisputes = _metrics['openDisputesCount'] ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 4 KPI Cards
        Row(
          children: [
            _buildKpiCard('ACTIVE JOBS & GIGS', '$activeGigs', 'In progress & open', Icons.assignment_outlined, const Color(0xFF059669), isDark),
            const Gap(8),
            _buildKpiCard('MOMO ESCROW VAULT', 'GH₵ ${escrowBal.toStringAsFixed(2)}', '100% Protected funds', Icons.shield_rounded, const Color(0xFF059669), isDark),
          ],
        ),
        const Gap(8),
        Row(
          children: [
            _buildKpiCard('SAVED STORES', '$savedCount', 'Bookmarked shops', Icons.favorite_rounded, const Color(0xFFF43F5E), isDark),
            const Gap(8),
            _buildKpiCard('OPEN DISPUTES', '$openDisputes', openDisputes == 0 ? 'Good standing ✓' : 'Requires mediation', Icons.gavel_rounded, Colors.amber[800]!, isDark),
          ],
        ),
        const Gap(14),

        // Quick Shortcuts
        ServoraCard(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Quick Customer Actions:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
              const Gap(8),
              _buildActionTile(Icons.post_add_rounded, 'Post New Job Request', 'Broadcast quote call to Tamale artisans', () => context.push('/services/request')),
              const Gap(6),
              _buildActionTile(Icons.shield_outlined, 'MoMo Escrow Protection Vault', 'Inspect held deposits & release funds', () => setState(() => _activeTab = 'escrow')),
              const Gap(6),
              _buildActionTile(Icons.forum_rounded, 'Tamale Community Notice Board', 'View tool rental calls & trade notices', () => context.go('/community')),
            ],
          ),
        ),
        const Gap(14),

        // Real-Time Activity Stream
        ServoraCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.history_rounded, size: 16, color: ServoraColors.emerald600),
                  Gap(6),
                  Text('Real-Time Activity Stream', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
              const Gap(10),
              if (_activityLogs.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Center(child: Text('No actions logged yet. Start by requesting a quote or saving a store!', style: TextStyle(color: Colors.grey, fontSize: 11.5))),
                )
              else
                ..._activityLogs.map((log) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.black26 : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle_outline_rounded, size: 14, color: ServoraColors.emerald600),
                            const Gap(8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(log['description'] ?? '', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                                  const Gap(1),
                                  Text(log['actionType'] ?? '', style: const TextStyle(fontSize: 9.5, color: Colors.grey)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    )),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================
  // TAB 2: MY JOB REQUESTS
  // ==========================================
  Widget _buildRequestsTab(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('SERVICE REQUESTS & GIGS (${_serviceRequests.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: ServoraColors.emerald600,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: const Icon(Icons.add, size: 14),
              label: const Text('Post Request', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
              onPressed: () => context.push('/services/request'),
            ),
          ],
        ),
        const Gap(10),

        if (_serviceRequests.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Center(child: Text('No service requests found. Broadcast a job to local Tamale artisans!', style: TextStyle(color: Colors.grey, fontSize: 12))),
          )
        else
          ..._serviceRequests.map((req) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: ServoraCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(req['title'] ?? 'Job Request', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(req['status'] ?? 'OPEN', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF047857))),
                          ),
                        ],
                      ),
                      const Gap(4),
                      Text(req['description'] ?? '', style: const TextStyle(fontSize: 11, color: Colors.grey), maxLines: 2, overflow: TextOverflow.ellipsis),
                      const Gap(8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${req['quotes']?.length ?? 0} Quotes Received', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                          OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            ),
                            onPressed: () => context.push('/requests/${req['id']}'),
                            child: const Text('View Quotes ➔', style: TextStyle(fontSize: 10)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              )),
      ],
    );
  }

  // ==========================================
  // TAB 3: MOMO ESCROW VAULT
  // ==========================================
  Widget _buildEscrowTab(bool isDark) {
    final escrowBal = (_metrics['escrowVaultBalance'] is num) ? (_metrics['escrowVaultBalance'] as num).toDouble() : 0.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Vault Banner
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFA7F3D0)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.shield_rounded, size: 16, color: Color(0xFF047857)),
                      Gap(6),
                      Text('Servora MoMo Escrow Vault', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: Color(0xFF047857))),
                    ],
                  ),
                  Gap(2),
                  Text('100% Protected buyer deposits', style: TextStyle(fontSize: 10, color: Color(0xFF065F46))),
                ],
              ),
              Text(
                'GH₵ ${escrowBal.toStringAsFixed(2)}',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF047857)),
              ),
            ],
          ),
        ),
        const Gap(14),

        Text('ACTIVE ESCROW CONTRACTS (${_escrowDeals.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
        const Gap(8),

        if (_escrowDeals.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 30),
            child: Center(child: Text('No active escrow deals. Funds for new orders and hires will be secured here.', style: TextStyle(color: Colors.grey, fontSize: 11.5))),
          )
        else
          ..._escrowDeals.map((deal) {
            final isCompleted = deal['status'] == 'COMPLETED';
            final isDisputed = deal['status'] == 'DISPUTED';

            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: ServoraCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: ServoraColors.emerald600.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(deal['dealCode'] ?? 'ESC', style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                            ),
                            const Gap(6),
                            Text(deal['title'] ?? 'Service Contract', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Text('GH₵ ${deal['amount'] ?? 0}', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900)),
                      ],
                    ),
                    const Gap(4),
                    Text('Artisan: ${deal['provider']?['name'] ?? "Artisan"} • Phone: ${deal['provider']?['phone'] ?? "N/A"}', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                    const Gap(8),

                    if (!isCompleted && !isDisputed)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ServoraColors.emerald600,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.check_circle_outline_rounded, size: 14),
                            label: const Text('Release Funds 💳', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                            onPressed: () => _openEscrowReleaseModal(deal),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }

  void _openEscrowReleaseModal(dynamic deal) {
    final pinCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Release Escrow Funds', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('You are releasing GH₵ ${deal['amount']} from the secure vault to ${deal['provider']?['name'] ?? "Artisan"}.', style: const TextStyle(fontSize: 12)),
            const Gap(10),
            TextField(
              controller: pinCtrl,
              decoration: InputDecoration(
                hintText: 'Enter 4-Digit Release PIN',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: ServoraColors.emerald600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              _handleReleaseEscrow(deal['id'], pinCtrl.text);
            },
            child: const Text('Authorize Payout ✓'),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 4: MESSAGES & WHATSAPP
  // ==========================================
  Widget _buildMessagesTab(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('ARTISAN CHATS & WHATSAPP CONTACTS', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
        const Gap(8),

        if (_favorites.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 30),
            child: Center(child: Text('No saved artisan conversations yet. Save stores or post a job to begin messaging!', style: TextStyle(color: Colors.grey, fontSize: 11.5))),
          )
        else
          ..._favorites.map((fav) {
            final biz = fav['business'] ?? {};
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: ServoraCard(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: const BoxDecoration(color: ServoraColors.emerald600, shape: BoxShape.circle),
                      child: Center(
                        child: Text(biz['businessName']?.isNotEmpty == true ? biz['businessName'][0].toUpperCase() : 'B', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const Gap(10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(biz['businessName'] ?? 'Business', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                          Text('📱 ${biz['whatsappNumber'] ?? biz['phone'] ?? ""}', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                        ],
                      ),
                    ),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      icon: const Icon(Icons.chat_rounded, size: 12),
                      label: const Text('WhatsApp ↗', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      onPressed: () => WhatsAppHelper.openWhatsApp(phone: biz['whatsappNumber'] ?? biz['phone'] ?? "+233240000000", message: "Hello ${biz['businessName']}, I am contacting you from my Servora account."),
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }

  // ==========================================
  // TAB 5: SAVED STORES & FAVORITES
  // ==========================================
  Widget _buildFavoritesTab(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('BOOKMARKED BUSINESSES & WORKSHOPS (${_favorites.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
        const Gap(8),

        if (_favorites.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 30),
            child: Center(child: Text('No saved stores. Bookmark verified artisans in Tamale to reach them quickly!', style: TextStyle(color: Colors.grey, fontSize: 11.5))),
          )
        else
          ..._favorites.map((fav) {
            final biz = fav['business'] ?? {};
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: ServoraCard(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    const Icon(Icons.storefront_rounded, color: ServoraColors.emerald600, size: 24),
                    const Gap(10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(biz['businessName'] ?? 'Storefront', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                          Text('📍 ${biz['zone'] ?? "Tamale"}', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                        ],
                      ),
                    ),
                    OutlinedButton(
                      style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2)),
                      onPressed: () => context.push('/biz/${biz['slug'] ?? biz['id']}'),
                      child: const Text('View Store ➔', style: TextStyle(fontSize: 10)),
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }

  // ==========================================
  // TAB 6: REVIEWS & COMMUNITY FORUM
  // ==========================================
  Widget _buildReviewsTab(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('MY REVIEWS GIVEN (${_reviews.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
        const Gap(8),

        if (_reviews.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Text('No reviews written yet.', style: TextStyle(color: Colors.grey, fontSize: 11.5)),
          )
        else
          ..._reviews.map((r) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: ServoraCard(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Reviewed: ${r['targetUser']?['name'] ?? "Artisan"}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      const Gap(2),
                      Text(r['comment'] ?? '', style: const TextStyle(fontSize: 11)),
                    ],
                  ),
                ),
              )),

        const Gap(14),
        Text('COMMUNITY BOARD NOTICES (${_communityPosts.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
        const Gap(8),

        if (_communityPosts.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Text('No community notices posted yet.', style: TextStyle(color: Colors.grey, fontSize: 11.5)),
          )
        else
          ..._communityPosts.map((p) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: ServoraCard(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(p['title'] ?? 'Community Notice', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      const Gap(2),
                      Text(p['content'] ?? '', style: const TextStyle(fontSize: 11), maxLines: 2, overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
              )),
      ],
    );
  }

  // ==========================================
  // TAB 7: DISPUTES & MEDIATION
  // ==========================================
  Widget _buildDisputesTab(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('DISPUTES & MEDIATION TICKETS (${_disputes.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
        const Gap(8),

        if (_disputes.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 30),
            child: Center(child: Text('Zero active disputes. All transactions in good standing ✓', style: TextStyle(color: Colors.grey, fontSize: 11.5))),
          )
        else
          ..._disputes.map((d) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: ServoraCard(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(d['caseNumber'] ?? 'DSP', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Colors.red)),
                          Text('GH₵ ${d['amount'] ?? 0}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Text(d['reason'] ?? '', style: const TextStyle(fontSize: 11)),
                    ],
                  ),
                ),
              )),
      ],
    );
  }

  // ==========================================
  // TAB 8: SETTINGS & SAVED ADDRESSES
  // ==========================================
  Widget _buildSettingsTab(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Saved GPS Addresses
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('SAVED DELIVERY ADDRESSES (${_savedAddresses.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
            TextButton.icon(
              icon: const Icon(Icons.add_location_alt_rounded, size: 14, color: ServoraColors.emerald600),
              label: const Text('+ Add GPS Address', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
              onPressed: _openAddAddressDialog,
            ),
          ],
        ),
        const Gap(8),

        if (_savedAddresses.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 10),
            child: Text('No saved addresses yet.', style: TextStyle(color: Colors.grey, fontSize: 11)),
          )
        else
          ..._savedAddresses.map((addr) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.black26 : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.location_on_rounded, size: 16, color: ServoraColors.emerald600),
                      const Gap(8),
                      Expanded(
                        child: Text('${addr['label']} (${addr['zone']}) - ${addr['landmark'] ?? ""}', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                ),
              )),
        const Gap(16),

        // Notification Preferences
        ServoraCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Notification Preferences', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
              const Gap(8),
              _buildSettingSwitch('WhatsApp Alerts (Quotes & Orders)', true),
              _buildSettingSwitch('In-App Live Alerts', true),
              _buildSettingSwitch('SMS Security PINs', true),
            ],
          ),
        ),
      ],
    );
  }

  void _openAddAddressDialog() {
    final labelCtrl = TextEditingController(text: 'Home');
    final zoneCtrl = TextEditingController(text: 'Sakasaka');
    final landmarkCtrl = TextEditingController();
    final latCtrl = TextEditingController();
    final lngCtrl = TextEditingController();
    bool fetchingGps = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Add Saved Address & GPS Pin', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: labelCtrl, decoration: const InputDecoration(labelText: 'Label (e.g. Home, Workshop)')),
                TextField(controller: zoneCtrl, decoration: const InputDecoration(labelText: 'Zone (e.g. Sakasaka, Nyohini)')),
                TextField(controller: landmarkCtrl, decoration: const InputDecoration(labelText: 'Prominent Landmark')),
                const Gap(10),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  icon: fetchingGps
                      ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.my_location_rounded, size: 14, color: ServoraColors.emerald600),
                  label: Text(fetchingGps ? 'Detecting...' : 'Use Current Device GPS 📍', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                  onPressed: () async {
                    setModalState(() => fetchingGps = true);
                    try {
                      final pos = await LocationHelper.getCurrentPosition();
                      if (pos != null) {
                        setModalState(() {
                          latCtrl.text = pos.latitude.toStringAsFixed(6);
                          lngCtrl.text = pos.longitude.toStringAsFixed(6);
                          fetchingGps = false;
                        });
                      }
                    } catch (_) {
                      setModalState(() => fetchingGps = false);
                    }
                  },
                ),
                const Gap(8),
                Row(
                  children: [
                    Expanded(child: TextField(controller: latCtrl, decoration: const InputDecoration(labelText: 'Latitude', hintText: '9.4072'))),
                    const Gap(8),
                    Expanded(child: TextField(controller: lngCtrl, decoration: const InputDecoration(labelText: 'Longitude', hintText: '-0.8351'))),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: ServoraColors.emerald600, foregroundColor: Colors.white),
              onPressed: () async {
                Navigator.of(ctx).pop();
                try {
                  final token = await authNotifier.storage.getToken();
                  await _dio.post('/account/address', data: {
                    'label': labelCtrl.text,
                    'zone': zoneCtrl.text,
                    'landmark': landmarkCtrl.text,
                    'latitude': latCtrl.text.isNotEmpty ? double.tryParse(latCtrl.text) : null,
                    'longitude': lngCtrl.text.isNotEmpty ? double.tryParse(lngCtrl.text) : null,
                    'isDefault': true,
                  }, options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}));
                  _fetchLiveCustomerData();
                } catch (_) {}
              },
              child: const Text('Save Address'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingSwitch(String label, bool initialVal) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 11)),
          Switch(value: initialVal, activeColor: ServoraColors.emerald600, onChanged: (_) {}),
        ],
      ),
    );
  }

  Widget _buildKpiCard(String label, String value, String sub, IconData icon, Color color, bool isDark) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? ServoraColors.darkSurface : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isDark ? ServoraColors.darkCardBorder : Colors.grey.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Flexible(
                  child: Text(label, style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: Colors.grey), maxLines: 1, overflow: TextOverflow.ellipsis),
                ),
                Icon(icon, size: 14, color: color),
              ],
            ),
            const Gap(4),
            Text(value, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: color)),
            const Gap(1),
            Text(sub, style: const TextStyle(fontSize: 8.5, color: Colors.grey), maxLines: 1, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }

  Widget _buildActionTile(IconData icon, String title, String sub, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        child: Row(
          children: [
            Icon(icon, size: 16, color: ServoraColors.emerald600),
            const Gap(8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                  Text(sub, style: const TextStyle(fontSize: 9.5, color: Colors.grey)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, size: 16, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
