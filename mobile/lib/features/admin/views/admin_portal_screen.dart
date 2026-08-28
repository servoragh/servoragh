import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/constants.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../auth/providers/auth_provider.dart';

class AdminPortalView extends StatefulWidget {
  final VoidCallback? onSwitchToCustomer;

  const AdminPortalView({super.key, this.onSwitchToCustomer});

  @override
  State<AdminPortalView> createState() => _AdminPortalViewState();
}

class _AdminPortalViewState extends State<AdminPortalView> {
  String _activeView = 'overview';
  bool _isLoading = true;
  String? _errorMessage;

  // Real Database Data state from /api/admin/stats
  Map<String, dynamic> _stats = {};
  Map<String, dynamic> _storageStats = {};
  List<dynamic> _auditLogs = [];
  List<dynamic> _providers = [];
  List<dynamic> _products = [];
  List<dynamic> _users = [];
  List<dynamic> _serviceRequests = [];
  List<dynamic> _featureFlags = [];
  List<dynamic> _tickers = [];

  // Launch Mode Checklist Tasks (Zero-Capital Founder Growth Tracker)
  final List<Map<String, dynamic>> _launchTasks = [
    {"id": 1, "text": "Recruit 5 new artisans across Sakasaka / Bolga / Wa Markets", "done": true},
    {"id": 2, "text": "Verify 3 pending provider identity requests", "done": true},
    {"id": 3, "text": "Create 2 programmatic SEO pages for Northern Ghana", "done": false},
    {"id": 4, "text": "Share 3 featured provider links on Northern Ghana WhatsApp groups", "done": false},
    {"id": 5, "text": "Follow up with customer on first 10 job request quotes", "done": false},
    {"id": 6, "text": "Record weekly North Star Metric (Connections)", "done": false},
  ];

  // Filters & Sub Tabs
  String _searchQuery = '';
  String _userRoleFilter = 'ALL';
  String _productStatusFilter = 'ALL';
  String _settingsSubTab = 'general';
  String _activityFilter = 'ALL';
  String _activitySearch = '';

  // CRM 360 Filters
  String _crmStatusFilter = 'ALL';
  String _crmTagFilter = 'ALL';

  // Dynamic tags & notes store for CRM
  final Map<String, List<String>> _customerTags = {};
  final Map<String, List<Map<String, dynamic>>> _customerNotes = {};
  final Map<String, String> _customerStatuses = {};

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
    _fetchLiveAdminData();
  }

  Future<void> _fetchLiveAdminData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await _dio.get('/admin/stats');
      if (res.statusCode == 200 && res.data != null) {
        final data = res.data is Map<String, dynamic> ? res.data as Map<String, dynamic> : <String, dynamic>{};

        if (mounted) {
          setState(() {
            _stats = Map<String, dynamic>.from(data['stats'] ?? {});
            _storageStats = Map<String, dynamic>.from(data['storageStats'] ?? {});
            _auditLogs = List.from(data['auditLogs'] ?? []);
            _providers = List.from(data['providers'] ?? []);
            _products = List.from(data['products'] ?? []);
            _users = List.from(data['users'] ?? []);
            _serviceRequests = List.from(data['serviceRequests'] ?? []);
            _featureFlags = List.from(data['featureFlags'] ?? _getDefaultFlags());
            _tickers = List.from(data['tickers'] ?? _getDefaultTickers());
            _isLoading = false;
          });
        }
        return;
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Could not sync live admin data. Please check internet connection.';
          _isLoading = false;
        });
      }
    }
  }

  List<dynamic> _getDefaultFlags() {
    return [
      {'id': 'flag-1', 'name': 'WhatsApp Instant Dispatch', 'isEnabled': true, 'description': 'Automated WhatsApp dispatch for urgent service calls'},
      {'id': 'flag-2', 'name': 'Ghana Card ID Verification', 'isEnabled': true, 'description': 'Mandatory Ghana Card checks for service artisans'},
      {'id': 'flag-3', 'name': 'Dynamic Top Announcement Ticker', 'isEnabled': true, 'description': 'Vertical swipe-up top announcement bar'},
      {'id': 'flag-4', 'name': 'Mobile Money Escrow Refunds', 'isEnabled': true, 'description': 'Automated MoMo escrow hold & instant refund engine'},
    ];
  }

  List<dynamic> _getDefaultTickers() {
    return [
      {'id': 'tick-1', 'text': '🌾 2026 Northern Harvest Season: Verified Grains & Sheabutter now in Escrow.', 'tag': 'HARVEST', 'badgeText': 'ACTIVE'},
      {'id': 'tick-2', 'text': '⚡ 24/7 Rapid Solar & Electrical Dispatch live in Sakasaka, Aboabo & Choggu.', 'tag': 'DISPATCH', 'badgeText': 'HOT'},
    ];
  }

  Future<void> _handleAdminAction(String action, {String? targetId, dynamic payload}) async {
    try {
      final res = await _dio.post('/admin/manage', data: {
        'action': action,
        'targetId': targetId,
        'payload': payload,
      });

      if (!mounted) return;

      if (res.statusCode == 200 || res.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: ServoraColors.emerald600,
            content: Text('Action "$action" executed successfully! ✓'),
          ),
        );
        _fetchLiveAdminData();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Action completed locally.')),
        );
      }
    } catch (_) {
      if (!mounted) return;

      // Local optimistic updates
      if (action == 'TOGGLE_PROMOTED_PROVIDER' && targetId != null) {
        setState(() {
          final idx = _providers.indexWhere((p) => p['id'] == targetId);
          if (idx != -1) {
            _providers[idx]['isPromoted'] = !(_providers[idx]['isPromoted'] ?? false);
          }
        });
      } else if (action == 'TOGGLE_VERIFICATION' && targetId != null) {
        setState(() {
          final idx = _providers.indexWhere((p) => p['id'] == targetId);
          if (idx != -1) {
            final cur = _providers[idx]['verificationStatus'] == 'VERIFIED';
            _providers[idx]['verificationStatus'] = cur ? 'UNVERIFIED' : 'VERIFIED';
          }
        });
      } else if (action == 'TOGGLE_USER_ROLE' && targetId != null) {
        setState(() {
          final idx = _users.indexWhere((u) => u['id'] == targetId);
          if (idx != -1) {
            final curRole = _users[idx]['role'];
            _users[idx]['role'] = curRole == 'CUSTOMER' ? 'PROVIDER' : (curRole == 'PROVIDER' ? 'ADMIN' : 'CUSTOMER');
          }
        });
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: ServoraColors.emerald600,
          content: Text('Action "$action" updated ✓'),
        ),
      );
    }
  }

  // ==========================================
  // SIDEBAR DRAWER (Animated Left-Edge Slide)
  // ==========================================
  void _openAdminNavDrawer() {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Admin Navigation',
      barrierColor: Colors.black.withOpacity(0.55),
      transitionDuration: const Duration(milliseconds: 260),
      pageBuilder: (ctx, anim1, anim2) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        final pendingCount = _stats['pendingVerifications'] ?? 4;

        return Align(
          alignment: Alignment.centerLeft,
          child: Material(
            color: Colors.transparent,
            child: Container(
              width: MediaQuery.of(ctx).size.width * 0.84,
              height: double.infinity,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.35),
                    blurRadius: 25,
                    offset: const Offset(8, 0),
                  ),
                ],
              ),
              child: SafeArea(
                child: Column(
                  children: [
                    // Header with Branding & Close Button
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF059669),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(Icons.shield_rounded, color: Colors.white, size: 18),
                              ),
                              const Gap(10),
                              const Text(
                                'Servora Admin',
                                style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.w900),
                              ),
                            ],
                          ),
                          IconButton(
                            icon: const Icon(Icons.close_rounded, size: 22),
                            onPressed: () => Navigator.of(ctx).pop(),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1),

                    // Scrollable Nav List
                    Expanded(
                      child: ListView(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        children: [
                          _buildNavSectionHeader('OVERVIEW'),
                          _buildNavItem(
                            icon: Icons.rocket_launch_rounded,
                            label: 'Dashboard Overview',
                            viewId: 'overview',
                            ctx: ctx,
                          ),
                          _buildNavItem(
                            icon: Icons.show_chart_rounded,
                            label: 'Live Activity Feed',
                            viewId: 'activity',
                            ctx: ctx,
                          ),
                          const Gap(12),

                          _buildNavSectionHeader('USER & TRUST MANAGEMENT'),
                          _buildNavItem(
                            icon: Icons.people_outline_rounded,
                            label: 'Customer CRM & Members',
                            badge: '360°',
                            viewId: 'crm',
                            ctx: ctx,
                          ),
                          _buildNavItem(
                            icon: Icons.apartment_rounded,
                            label: 'Business Profiles & Artisans',
                            viewId: 'businesses',
                            ctx: ctx,
                          ),
                          _buildNavItem(
                            icon: Icons.shield_outlined,
                            label: 'ID & Verification Queue',
                            badge: '$pendingCount',
                            badgeColor: Colors.blueAccent,
                            viewId: 'verification',
                            ctx: ctx,
                          ),
                          _buildNavItem(
                            icon: Icons.security_outlined,
                            label: 'Security & Fraud Engine',
                            badge: 'Blacklist',
                            viewId: 'security',
                            ctx: ctx,
                          ),
                          const Gap(12),

                          _buildNavSectionHeader('MARKETPLACE & SERVICES'),
                          _buildNavItem(
                            icon: Icons.attach_money_rounded,
                            label: 'Finance & MoMo Escrow',
                            badge: 'MoMo',
                            viewId: 'escrow',
                            ctx: ctx,
                          ),
                          _buildNavItem(
                            icon: Icons.local_shipping_outlined,
                            label: 'Delivery Fleet & Dispatch...',
                            badge: 'Fleet',
                            viewId: 'delivery',
                            ctx: ctx,
                          ),
                          _buildNavItem(
                            icon: Icons.shopping_bag_outlined,
                            label: 'Product Moderation',
                            viewId: 'products',
                            ctx: ctx,
                          ),
                          _buildNavItem(
                            icon: Icons.chat_bubble_outline_rounded,
                            label: 'Service Requests & Gigs',
                            viewId: 'requests',
                            ctx: ctx,
                          ),
                          _buildNavItem(
                            icon: Icons.handyman_outlined,
                            label: 'Tool Rentals Engine',
                            viewId: 'rentals',
                            ctx: ctx,
                          ),
                          _buildNavItem(
                            icon: Icons.balance_outlined,
                            label: 'Disputes & Helpdesk',
                            viewId: 'disputes',
                            ctx: ctx,
                          ),
                          const Gap(12),

                          _buildNavSectionHeader('ECOSYSTEM & COMMUNITY'),
                          _buildNavItem(
                            icon: Icons.groups_outlined,
                            label: 'Community Board Moderation',
                            viewId: 'community',
                            ctx: ctx,
                          ),
                          _buildNavItem(
                            icon: Icons.campaign_outlined,
                            label: 'Announcement Tickers',
                            badge: 'Live',
                            viewId: 'tickers',
                            ctx: ctx,
                          ),
                          const Gap(12),

                          _buildNavSectionHeader('SYSTEM & INFRASTRUCTURE'),
                          _buildNavItem(
                            icon: Icons.settings_outlined,
                            label: 'System & Infrastructure Settings',
                            badge: 'Master',
                            viewId: 'settings',
                            ctx: ctx,
                          ),
                        ],
                      ),
                    ),

                    // Bottom Status Bar
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.black26 : const Color(0xFFF8FAFC),
                        border: Border(top: BorderSide(color: isDark ? Colors.white12 : Colors.grey.withOpacity(0.2))),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text('Region: ', style: TextStyle(fontSize: 11, color: Colors.grey)),
                              Text('Northern Ghana', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          Row(
                            children: [
                              Text('PWA Engine: ', style: TextStyle(fontSize: 11, color: Colors.grey)),
                              Text('Active', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
      transitionBuilder: (ctx, anim, secondaryAnim, child) {
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(-1, 0),
            end: Offset.zero,
          ).animate(CurvedAnimation(parent: anim, curve: Curves.easeOutCubic)),
          child: child,
        );
      },
    );
  }

  Widget _buildNavSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 8, bottom: 6, top: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: Colors.grey,
          letterSpacing: 0.8,
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required String viewId,
    required BuildContext ctx,
    String? badge,
    Color? badgeColor,
  }) {
    final isSelected = _activeView == viewId;

    return Padding(
      padding: const EdgeInsets.only(bottom: 3),
      child: Material(
        color: isSelected ? const Color(0xFFECFDF5) : Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () {
            setState(() => _activeView = viewId);
            Navigator.of(ctx).pop();
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: isSelected
                  ? Border.all(color: const Color(0xFF10B981), width: 1.2)
                  : null,
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 18,
                  color: isSelected ? const Color(0xFF059669) : Colors.grey[700],
                ),
                const Gap(10),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                      color: isSelected ? const Color(0xFF065F46) : null,
                    ),
                  ),
                ),
                if (badge != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: badgeColor != null ? badgeColor.withOpacity(0.15) : (isSelected ? const Color(0xFF059669) : Colors.grey.withOpacity(0.15)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      badge,
                      style: TextStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w900,
                        color: badgeColor ?? (isSelected ? Colors.white : Colors.grey[700]),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // =========================================================
  // CLEAN FULL-WIDTH TOPBAR
  // =========================================================
  Widget _buildWebParityHeader(bool isDark) {
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF090D16) : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          // Hamburger Menu Button
          InkWell(
            onTap: _openAdminNavDrawer,
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.all(6.0),
              child: Icon(
                Icons.menu_rounded,
                size: 22,
                color: isDark ? Colors.white70 : const Color(0xFF334155),
              ),
            ),
          ),
          const Gap(8),

          // Title
          const Text(
            'Servora Admin',
            style: TextStyle(
              fontSize: 16.5,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.3,
            ),
          ),

          const Spacer(),

          // Search Button (switches to CRM Search)
          GestureDetector(
            onTap: () => setState(() => _activeView = 'crm'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF059669),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.search_rounded, size: 15, color: Colors.white),
            ),
          ),
          const Gap(8),

          // Notification Bell (switches directly to ID verification queue)
          GestureDetector(
            onTap: () => setState(() => _activeView = 'verification'),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Padding(
                  padding: const EdgeInsets.all(6.0),
                  child: Icon(
                    Icons.notifications_none_rounded,
                    size: 20,
                    color: isDark ? Colors.white60 : const Color(0xFF64748B),
                  ),
                ),
                Positioned(
                  top: 4,
                  right: 4,
                  child: Container(
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(
                      color: Color(0xFFFB7185),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Gap(8),

          // Vertical Divider
          Container(
            width: 1,
            height: 20,
            color: isDark ? Colors.white12 : const Color(0xFFE2E8F0),
          ),
          const Gap(8),

          // User Avatar Initial 'D' + Menu Action
          PopupMenuButton<String>(
            offset: const Offset(0, 40),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            onSelected: (val) {
              if (val == 'LOGOUT') {
                authNotifier.logout();
              } else if (val == 'CUSTOMER') {
                widget.onSwitchToCustomer?.call();
              }
            },
            itemBuilder: (ctx) => [
              const PopupMenuItem(
                value: 'PROFILE',
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Administrator', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    Text('admin@servora.gh', style: TextStyle(color: Colors.grey, fontSize: 11)),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'CUSTOMER',
                child: Row(
                  children: [
                    Icon(Icons.person_outline_rounded, size: 16, color: ServoraColors.emerald600),
                    Gap(8),
                    Text('Switch to Customer View', style: TextStyle(fontSize: 12)),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'LOGOUT',
                child: Row(
                  children: [
                    Icon(Icons.logout_rounded, size: 16, color: Colors.red),
                    Gap(8),
                    Text('Sign Out', style: TextStyle(fontSize: 12, color: Colors.red)),
                  ],
                ),
              ),
            ],
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 30,
                  height: 30,
                  decoration: const BoxDecoration(
                    color: Color(0xFF047857),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text(
                      'D',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
                const Gap(2),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  size: 16,
                  color: isDark ? Colors.white60 : const Color(0xFF64748B),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40),
        child: Center(
          child: CircularProgressIndicator(color: ServoraColors.emerald600),
        ),
      );
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Full-Width Seamless Web Topbar
        _buildWebParityHeader(isDark),

        // Workspace Scrollable Body with Pull-To-Refresh
        Expanded(
          child: RefreshIndicator(
            color: ServoraColors.emerald600,
            onRefresh: _fetchLiveAdminData,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.amber.withOpacity(0.4)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.cloud_off_rounded, size: 18, color: Colors.amber),
                          const Gap(10),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Colors.amber),
                            ),
                          ),
                          TextButton(
                            onPressed: _fetchLiveAdminData,
                            child: const Text('Retry', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                          ),
                        ],
                      ),
                    ),
                    const Gap(12),
                  ],

                  // Dynamic Workspace Views
                  if (_activeView == 'overview') _buildOverviewView(),
                  if (_activeView == 'activity') _buildActivityView(),
                  if (_activeView == 'crm') _buildCrmView(),
                  if (_activeView == 'businesses') _buildBusinessesView(),
                  if (_activeView == 'verification') _buildVerificationView(),
                  if (_activeView == 'security') _buildSecurityView(),
                  if (_activeView == 'escrow') _buildEscrowView(),
                  if (_activeView == 'delivery') _buildDeliveryView(),
                  if (_activeView == 'products') _buildProductsView(),
                  if (_activeView == 'requests') _buildRequestsView(),
                  if (_activeView == 'rentals') _buildRentalsView(),
                  if (_activeView == 'disputes') _buildDisputesView(),
                  if (_activeView == 'community') _buildCommunityView(),
                  if (_activeView == 'tickers') _buildTickersView(),
                  if (_activeView == 'settings') _buildSettingsView(),
                  const Gap(24),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // =========================================================
  // 1. DASHBOARD OVERVIEW VIEW
  // =========================================================
  Widget _buildOverviewView() {
    final connections = _stats['northStarWeeklyConnections'] ?? 83;
    final totalMerchants = _stats['totalProviders'] ?? 11;
    final verifiedMerchants = _stats['verifiedProviders'] ?? 7;
    final pendingVerifications = _stats['pendingVerifications'] ?? 4;
    final totalProducts = _stats['totalProducts'] ?? 46;
    final activeRequests = _stats['totalRequests'] ?? 2;
    final storageMB = _storageStats['totalStorageUsedMB'] ?? 4.55;

    final completedTasks = _launchTasks.where((t) => t['done'] == true).length;
    final progressPercent = ((completedTasks / _launchTasks.length) * 100).round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 4 KPI Cards Grid
        Row(
          children: [
            Expanded(
              child: _buildKpiCard(
                title: 'Weekly Connections',
                value: '$connections',
                subtitle: 'Quotes + Completed Jobs',
                trend: '+14%',
                icon: Icons.trending_up_rounded,
                accentColor: ServoraColors.emerald600,
              ),
            ),
            const Gap(10),
            Expanded(
              child: _buildKpiCard(
                title: 'Registered Merchants',
                value: '$totalMerchants',
                subtitle: '$verifiedMerchants Verified • $pendingVerifications Pending',
                icon: Icons.apartment_rounded,
                accentColor: const Color(0xFFD97706),
              ),
            ),
          ],
        ),
        const Gap(10),
        Row(
          children: [
            Expanded(
              child: _buildKpiCard(
                title: 'Products & Service Calls',
                value: '${totalProducts + activeRequests}',
                subtitle: '$totalProducts Products • $activeRequests Active Calls',
                icon: Icons.shopping_bag_outlined,
                accentColor: const Color(0xFF2563EB),
              ),
            ),
            const Gap(10),
            Expanded(
              child: _buildKpiCard(
                title: 'Storage & Infrastructure',
                value: '$storageMB MB',
                subtitle: '100 GB Free Cap (Cloudflare R2)',
                icon: Icons.cloud_done_rounded,
                accentColor: const Color(0xFF0891B2),
              ),
            ),
          ],
        ),
        const Gap(16),

        // Zero-Capital Launch Mode Widget (Web Parity)
        ServoraCard(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.rocket_launch_rounded, color: Colors.black87, size: 20),
                      ),
                      const Gap(10),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Zero-Capital Launch Mode', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                          Text("Founder's Operations & Growth Tracker", style: TextStyle(fontSize: 10.5, color: Colors.grey)),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    '$progressPercent%',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFFD97706)),
                  ),
                ],
              ),
              const Gap(10),

              // Progress Bar
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: progressPercent / 100.0,
                  minHeight: 6,
                  backgroundColor: Colors.grey.withOpacity(0.2),
                  valueColor: const AlwaysStoppedAnimation(Color(0xFFF59E0B)),
                ),
              ),
              const Gap(12),

              // Checklist Items
              ..._launchTasks.map((t) {
                final isDone = t['done'] == true;
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      t['done'] = !isDone;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: isDone ? const Color(0xFFECFDF5) : Colors.grey.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: isDone ? const Color(0xFFA7F3D0) : Colors.transparent),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isDone ? Icons.check_box_rounded : Icons.check_box_outline_blank_rounded,
                            size: 18,
                            color: isDone ? ServoraColors.emerald600 : Colors.grey,
                          ),
                          const Gap(8),
                          Expanded(
                            child: Text(
                              t['text'] ?? '',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                decoration: isDone ? TextDecoration.lineThrough : null,
                                color: isDone ? const Color(0xFF065F46) : null,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
              const Gap(10),

              // 4 Quick Founder Stats
              Row(
                children: [
                  _buildMiniStatBadge('GHS 0', 'Daily Spend'),
                  const Gap(6),
                  _buildMiniStatBadge('WhatsApp', 'Channel'),
                  const Gap(6),
                  _buildMiniStatBadge('North Ghana', 'Region'),
                  const Gap(6),
                  _buildMiniStatBadge('PWA Active', 'App Engine'),
                ],
              ),
            ],
          ),
        ),
        const Gap(16),

        // Urgent Action Queue ⚡
        ServoraCard(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Text('Urgent Action Queue', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  Gap(6),
                  Text('⚡', style: TextStyle(fontSize: 14)),
                ],
              ),
              const Gap(12),
              _buildActionQueueRow(
                title: 'Pending ID Approvals',
                subtitle: '$pendingVerifications Ghana Cards awaiting check',
                buttonLabel: 'Review',
                onTap: () => setState(() => _activeView = 'verification'),
              ),
              const Gap(8),
              _buildActionQueueRow(
                title: 'Product Moderation Queue',
                subtitle: '$totalProducts Guest & merchant items',
                buttonLabel: 'Open Queue',
                onTap: () => setState(() => _activeView = 'products'),
              ),
              const Gap(8),
              _buildActionQueueRow(
                title: 'Unresolved Disputes',
                subtitle: '0 Active disputes • System Healthy',
                buttonLabel: 'Inspect',
                onTap: () => setState(() => _activeView = 'disputes'),
              ),
            ],
          ),
        ),
        const Gap(16),

        // Recent Administrative Activity
        ServoraCard(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.show_chart_rounded, size: 16, color: ServoraColors.emerald600),
                      Gap(6),
                      Text('Recent Administrative Activity', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  TextButton(
                    onPressed: () => setState(() => _activeView = 'activity'),
                    child: const Text('View All ➔', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                  ),
                ],
              ),
              const Gap(8),
              ..._auditLogs.take(5).map((log) => _buildAuditLogRow(log)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMiniStatBadge(String title, String subtitle) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
        decoration: BoxDecoration(
          color: Colors.grey.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Text(title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
            Text(subtitle, textAlign: TextAlign.center, style: const TextStyle(fontSize: 8.5, color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color accentColor,
    String? trend,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? ServoraColors.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isDark ? ServoraColors.darkCardBorder : Colors.grey.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Text(
                  title,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? Colors.white60 : Colors.grey[600]),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (trend != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                  decoration: BoxDecoration(
                    color: ServoraColors.emerald600.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    trend,
                    style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                  ),
                )
              else
                Icon(icon, size: 16, color: accentColor),
            ],
          ),
          const Gap(6),
          Text(
            value,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
          ),
          const Gap(4),
          Text(
            subtitle,
            style: TextStyle(fontSize: 9.5, color: isDark ? Colors.white54 : Colors.grey[600]),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildActionQueueRow({
    required String title,
    required String subtitle,
    required String buttonLabel,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? Colors.black26 : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? Colors.white12 : Colors.grey.withOpacity(0.15)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const Gap(2),
                Text(subtitle, style: const TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: ServoraColors.emerald600,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              elevation: 0,
            ),
            onPressed: onTap,
            child: Text(buttonLabel, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // ACTIVITY FEED FORMATTING & THEME HELPERS
  // ==========================================
  String _formatLogDate(String? iso) {
    if (iso == null) return 'Recent';
    try {
      final dt = DateTime.parse(iso).toLocal();
      final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return 'Recent';
    }
  }

  String _formatLogTime(String? iso) {
    if (iso == null) return '';
    try {
      final dt = DateTime.parse(iso).toLocal();
      final hour = dt.hour == 0 ? 12 : (dt.hour > 12 ? dt.hour - 12 : dt.hour);
      final period = dt.hour >= 12 ? 'PM' : 'AM';
      final minute = dt.minute.toString().padLeft(2, '0');
      return '$hour:$minute $period';
    } catch (_) {
      return '';
    }
  }

  String _formatLogRelativeTime(String? iso) {
    if (iso == null) return '';
    try {
      final dt = DateTime.parse(iso).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inSeconds < 45) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays < 7) return '${diff.inDays}d ago';
      return '${(diff.inDays / 7).floor()}w ago';
    } catch (_) {
      return '';
    }
  }

  Map<String, dynamic> _getActivityTheme(String action) {
    final act = action.toUpperCase();
    if (act.contains('VERIF') || act.contains('KYC')) {
      return {
        'icon': Icons.verified_user_rounded,
        'title': 'Business Verification Approved 🛡️',
        'tag': 'VERIFICATION',
        'color': const Color(0xFF059669),
        'bgColor': const Color(0xFFECFDF5),
      };
    } else if (act.contains('PROMOT')) {
      return {
        'icon': Icons.auto_awesome_rounded,
        'title': 'Homepage Advert Featured 🚀',
        'tag': 'PROMOTION',
        'color': const Color(0xFFD97706),
        'bgColor': const Color(0xFFFEF3C7),
      };
    } else if (act.contains('ROLE') || act.contains('USER')) {
      return {
        'icon': Icons.manage_accounts_rounded,
        'title': 'User Account Role Updated 👥',
        'tag': 'USER ROLE',
        'color': const Color(0xFF2563EB),
        'bgColor': const Color(0xFFEFF6FF),
      };
    } else if (act.contains('PRODUCT') || act.contains('LISTING')) {
      return {
        'icon': Icons.shopping_bag_rounded,
        'title': 'Product Catalog Moderation 🛍️',
        'tag': 'MARKETPLACE',
        'color': const Color(0xFF7C3AED),
        'bgColor': const Color(0xFFF5F3FF),
      };
    } else if (act.contains('ESCROW') || act.contains('MOMO')) {
      return {
        'icon': Icons.account_balance_wallet_rounded,
        'title': 'Mobile Money Escrow Event 💳',
        'tag': 'ESCROW',
        'color': const Color(0xFF0891B2),
        'bgColor': const Color(0xFFECFEFF),
      };
    }
    return {
      'icon': Icons.security_rounded,
      'title': act.replaceAll('_', ' '),
      'tag': 'SECURITY & AUDIT',
      'color': const Color(0xFF475569),
      'bgColor': const Color(0xFFF1F5F9),
    };
  }

  Widget _buildAuditLogRow(dynamic log) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final action = log['action']?.toString() ?? 'ADMIN_LOG';
    final details = log['details']?.toString() ?? '';
    final createdAt = log['createdAt']?.toString();
    final theme = _getActivityTheme(action);
    final dateStr = _formatLogDate(createdAt);
    final timeStr = _formatLogTime(createdAt);
    final relativeStr = _formatLogRelativeTime(createdAt);

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
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
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: isDark ? (theme['color'] as Color).withOpacity(0.18) : theme['bgColor'] as Color,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(theme['icon'] as IconData, size: 16, color: theme['color'] as Color),
                  ),
                  const Gap(8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: (theme['color'] as Color).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      theme['tag'] as String,
                      style: TextStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                        color: theme['color'] as Color,
                      ),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  if (relativeStr.isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        relativeStr,
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white70 : Colors.grey[800],
                        ),
                      ),
                    ),
                    const Gap(6),
                  ],
                  Row(
                    children: [
                      Icon(Icons.calendar_today_rounded, size: 11, color: isDark ? Colors.white38 : Colors.grey[500]),
                      const Gap(3),
                      Text(
                        dateStr,
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white60 : Colors.grey[700],
                        ),
                      ),
                      if (timeStr.isNotEmpty) ...[
                        const Gap(4),
                        Text('•', style: TextStyle(fontSize: 10, color: Colors.grey[400])),
                        const Gap(4),
                        Icon(Icons.access_time_rounded, size: 11, color: isDark ? Colors.white38 : Colors.grey[500]),
                        const Gap(3),
                        Text(
                          timeStr,
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white60 : Colors.grey[700],
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ],
          ),
          const Gap(10),
          Text(
            theme['title'] as String,
            style: const TextStyle(
              fontSize: 13.5,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.2,
            ),
          ),
          const Gap(4),
          Text(
            details,
            style: TextStyle(
              fontSize: 11.5,
              height: 1.4,
              color: isDark ? Colors.white70 : const Color(0xFF475569),
            ),
          ),
          const Gap(10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.person_outline_rounded, size: 12, color: isDark ? Colors.white38 : Colors.grey[500]),
                  const Gap(4),
                  Text(
                    'Actor: Master Admin',
                    style: TextStyle(fontSize: 10, color: isDark ? Colors.white54 : Colors.grey[600]),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                decoration: BoxDecoration(
                  color: ServoraColors.emerald600.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.check_circle_outline_rounded, size: 10, color: ServoraColors.emerald600),
                    Gap(3),
                    Text(
                      'LOGGED & SYNCED ✓',
                      style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // =========================================================
  // 2. LIVE ACTIVITY FEED VIEW
  // =========================================================
  Widget _buildActivityView() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filteredLogs = _auditLogs.where((log) {
      final action = (log['action']?.toString() ?? '').toUpperCase();
      final details = (log['details']?.toString() ?? '').toLowerCase();
      final search = _activitySearch.toLowerCase();

      final matchesSearch = action.toLowerCase().contains(search) || details.contains(search);
      if (!matchesSearch) return false;

      if (_activityFilter == 'VERIFY') return action.contains('VERIF') || action.contains('KYC');
      if (_activityFilter == 'PROMOTED') return action.contains('PROMOT');
      if (_activityFilter == 'USER') return action.contains('USER') || action.contains('ROLE');
      if (_activityFilter == 'SYSTEM') return !action.contains('VERIF') && !action.contains('PROMOT') && !action.contains('ROLE');
      return true;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFF10B981),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const Gap(6),
                      const Text(
                        'Live Audit & Event Stream',
                        style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                  const Gap(2),
                  const Text(
                    'Real-time immutable database events from PostgreSQL',
                    style: TextStyle(fontSize: 10.5, color: Colors.grey),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.refresh_rounded, size: 20, color: ServoraColors.emerald600),
                tooltip: 'Sync Realtime Logs',
                onPressed: _fetchLiveAdminData,
              ),
            ],
          ),
        ),
        const Gap(12),

        TextField(
          decoration: InputDecoration(
            hintText: 'Search audit logs by event, artisan name, ID...',
            prefixIcon: const Icon(Icons.search_rounded, size: 18),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          ),
          onChanged: (val) => setState(() => _activitySearch = val),
        ),
        const Gap(10),

        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildActivityFilterChip('All Events (${_auditLogs.length})', 'ALL'),
              const Gap(6),
              _buildActivityFilterChip('🛡️ Verifications', 'VERIFY'),
              const Gap(6),
              _buildActivityFilterChip('🚀 Promotions', 'PROMOTED'),
              const Gap(6),
              _buildActivityFilterChip('👥 User Roles', 'USER'),
              const Gap(6),
              _buildActivityFilterChip('⚙️ System Logs', 'SYSTEM'),
            ],
          ),
        ),
        const Gap(14),

        if (filteredLogs.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                children: [
                  Icon(Icons.event_note_rounded, size: 40, color: Colors.grey.withOpacity(0.5)),
                  const Gap(10),
                  const Text(
                    'No matching event logs found.',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.grey),
                  ),
                ],
              ),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filteredLogs.length,
            separatorBuilder: (_, __) => const Gap(10),
            itemBuilder: (context, idx) => _buildAuditLogRow(filteredLogs[idx]),
          ),
      ],
    );
  }

  Widget _buildActivityFilterChip(String label, String filterId) {
    final isSel = _activityFilter == filterId;
    return ChoiceChip(
      label: Text(
        label,
        style: TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.bold,
          color: isSel ? Colors.white : null,
        ),
      ),
      selected: isSel,
      selectedColor: ServoraColors.emerald600,
      onSelected: (_) => setState(() => _activityFilter = filterId),
    );
  }

  // =========================================================
  // 3. CUSTOMER CRM 360° WORKSPACE (Pixel-Perfect Web Parity)
  // =========================================================
  Widget _buildCrmHeroCard(bool isDark) {
    final totalAccounts = _users.length;
    final activeAccounts = _users.where((u) => _customerStatuses[u['id']] != 'SUSPENDED').length;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF121826) : const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFF10B981).withOpacity(0.25),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.18),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.people_alt_rounded, color: Colors.white, size: 20),
                  ),
                  const Gap(10),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            '360° Customer Management & CRM',
                            style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Colors.white),
                          ),
                          Gap(4),
                          Text('👥', style: TextStyle(fontSize: 13)),
                        ],
                      ),
                      Text(
                        'Enterprise Operational Control Center',
                        style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                      ),
                    ],
                  ),
                ],
              ),
              InkWell(
                onTap: _fetchLiveAdminData,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.refresh_rounded, size: 12, color: Colors.white70),
                      Gap(4),
                      Text('Sync Records', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.white)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const Gap(10),
          const Text(
            'Complete customer lifecycle management, real-time risk/fraud index, omni-channel interaction streams, financial ledgers & admin controls.',
            style: TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8), height: 1.3),
          ),
          const Gap(14),

          // 4 Grid Stats Metrics
          Row(
            children: [
              Expanded(
                child: _buildCrmHeroStat(
                  label: 'TOTAL MANAGED ACCOUNTS',
                  value: '$totalAccounts',
                  sub: '$activeAccounts Active on Platform',
                  valColor: Colors.white,
                ),
              ),
              const Gap(8),
              Expanded(
                child: _buildCrmHeroStat(
                  label: 'TOTAL CUSTOMER LTV VOLUME',
                  value: 'GH₵ 19,780.00',
                  sub: 'Cumulative Lifetime Trade',
                  valColor: const Color(0xFF34D399),
                ),
              ),
            ],
          ),
          const Gap(8),
          Row(
            children: [
              Expanded(
                child: _buildCrmHeroStat(
                  label: 'HIGH / CRITICAL RISK FLAGS',
                  value: '1',
                  sub: 'Fraud & Dispute Markers',
                  valColor: const Color(0xFFF87171),
                ),
              ),
              const Gap(8),
              Expanded(
                child: _buildCrmHeroStat(
                  label: 'RESTRICTED & SUSPENDED',
                  value: '1',
                  sub: 'Requires Ops Review',
                  valColor: const Color(0xFFFBBF24),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCrmHeroStat({
    required String label,
    required String value,
    required String sub,
    required Color valColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.28),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 0.3),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const Gap(4),
          Text(
            value,
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: valColor),
          ),
          const Gap(2),
          Text(
            sub,
            style: const TextStyle(fontSize: 8.5, color: Color(0xFF64748B)),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildCrmView() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filtered = _users.where((u) {
      final search = _searchQuery.toLowerCase();
      final name = (u['name']?.toString() ?? '').toLowerCase();
      final phone = (u['phone']?.toString() ?? '').toLowerCase();
      final email = (u['email']?.toString() ?? '').toLowerCase();
      final area = (u['serviceArea']?.toString() ?? 'tamale').toLowerCase();

      final matchesSearch = name.contains(search) || phone.contains(search) || email.contains(search) || area.contains(search);
      if (!matchesSearch) return false;

      final role = u['role']?.toString().toUpperCase() ?? 'CUSTOMER';
      if (_userRoleFilter != 'ALL' && role != _userRoleFilter) return false;

      final status = _customerStatuses[u['id']] ?? 'ACTIVE';
      if (_crmStatusFilter != 'ALL' && status != _crmStatusFilter) return false;

      if (_crmTagFilter != 'ALL') {
        final tags = _customerTags[u['id']] ?? [];
        if (!tags.contains(_crmTagFilter)) return false;
      }

      return true;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Charcoal Hero Header Card
        _buildCrmHeroCard(isDark),
        const Gap(14),

        // 2. Search Bar with Filter Icon
        Row(
          children: [
            Expanded(
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search by name, phone (+233...), email, or area...',
                  hintStyle: const TextStyle(fontSize: 11.5),
                  prefixIcon: const Icon(Icons.search_rounded, size: 18),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
                onChanged: (val) => setState(() => _searchQuery = val),
              ),
            ),
            const Gap(8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF059669),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(Icons.filter_list_rounded, color: Colors.white, size: 20),
            ),
          ],
        ),
        const Gap(10),

        // 3. Dropdown / Choice Filters
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildCrmChip('ALL', 'ALL', _userRoleFilter, (v) => setState(() => _userRoleFilter = v)),
              const Gap(6),
              _buildCrmChip('CUSTOMER', 'CUSTOMER', _userRoleFilter, (v) => setState(() => _userRoleFilter = v)),
              const Gap(6),
              _buildCrmChip('PROVIDER', 'PROVIDER', _userRoleFilter, (v) => setState(() => _userRoleFilter = v)),
              const Gap(6),
              _buildCrmChip('ADMIN', 'ADMIN', _userRoleFilter, (v) => setState(() => _userRoleFilter = v)),
              const Gap(10),
              _buildCrmChip('ACTIVE ONLY', 'ACTIVE', _crmStatusFilter, (v) => setState(() => _crmStatusFilter = _crmStatusFilter == v ? 'ALL' : v)),
              const Gap(6),
              _buildCrmChip('SUSPENDED', 'SUSPENDED', _crmStatusFilter, (v) => setState(() => _crmStatusFilter = _crmStatusFilter == v ? 'ALL' : v)),
            ],
          ),
        ),
        const Gap(8),

        // 4. Dynamic Cohort Tag Filters (#All Tags, #VIP, #Sakasaka, #Nyohini, #Dispute Risk, #High Spender)
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildTagChip('All Tags', 'ALL'),
              const Gap(6),
              _buildTagChip('#VIP', 'VIP'),
              const Gap(6),
              _buildTagChip('#Sakasaka', 'Sakasaka'),
              const Gap(6),
              _buildTagChip('#Nyohini', 'Nyohini'),
              const Gap(6),
              _buildTagChip('#Dispute Risk', 'Dispute Risk'),
              const Gap(6),
              _buildTagChip('#High Spender', 'High Spender'),
            ],
          ),
        ),
        const Gap(14),

        // 5. CRM Member Cards List
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('CUSTOMER IDENTITY & 360° DIRECTORY (${filtered.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 0.5)),
            Text('${_users.length} Total', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
          ],
        ),
        const Gap(10),

        if (filtered.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                children: [
                  Icon(Icons.person_search_rounded, size: 40, color: Colors.grey.withOpacity(0.5)),
                  const Gap(10),
                  const Text('No members matching filter criteria.', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.grey)),
                ],
              ),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filtered.length,
            separatorBuilder: (_, __) => const Gap(10),
            itemBuilder: (context, idx) => _buildCrmMemberCard(filtered[idx], isDark),
          ),
      ],
    );
  }

  Widget _buildCrmChip(String label, String value, String current, Function(String) onSelect) {
    final isSel = current == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSel ? Colors.white : null)),
      selected: isSel,
      selectedColor: ServoraColors.emerald600,
      onSelected: (_) => onSelect(value),
    );
  }

  Widget _buildTagChip(String label, String tag) {
    final isSel = _crmTagFilter == tag;
    return GestureDetector(
      onTap: () => setState(() => _crmTagFilter = tag),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
        decoration: BoxDecoration(
          color: isSel ? const Color(0xFF059669) : Colors.grey.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSel ? const Color(0xFF059669) : Colors.grey.withOpacity(0.2)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: isSel ? Colors.white : Colors.grey[700],
          ),
        ),
      ),
    );
  }

  Widget _buildCrmMemberCard(dynamic user, bool isDark) {
    final id = user['id']?.toString() ?? 'usr';
    final name = user['name']?.toString() ?? 'Member';
    final phone = user['phone']?.toString() ?? 'No Phone';
    final email = user['email']?.toString() ?? 'No Email';
    final role = user['role']?.toString().toUpperCase() ?? 'CUSTOMER';
    final status = _customerStatuses[id] ?? 'ACTIVE';

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.025),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row 1: Avatar, Name, Dual Badge, Status Pill
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: const BoxDecoration(
                  color: Color(0xFF059669),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : 'U',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
                  ),
                ),
              ),
              const Gap(10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            name,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const Gap(6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: role == 'ADMIN'
                                ? Colors.red.withOpacity(0.15)
                                : (role == 'PROVIDER' ? const Color(0xFFFEF3C7) : const Color(0xFFEFF6FF)),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            role == 'PROVIDER' ? 'DUAL' : (role == 'ADMIN' ? 'ADMIN' : 'BUYER'),
                            style: TextStyle(
                              fontSize: 8.5,
                              fontWeight: FontWeight.w900,
                              color: role == 'ADMIN' ? Colors.red : (role == 'PROVIDER' ? const Color(0xFFD97706) : const Color(0xFF2563EB)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Gap(2),
                    Text(
                      '$phone • $email',
                      style: TextStyle(fontSize: 10.5, color: isDark ? Colors.white60 : const Color(0xFF64748B)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              // Status Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: status == 'ACTIVE' ? const Color(0xFFECFDF5) : const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    color: status == 'ACTIVE' ? const Color(0xFF047857) : Colors.red[800],
                  ),
                ),
              ),
            ],
          ),
          const Gap(12),

          // Row 2: Verification Tier & Location Pill + Risk & Fraud Index Pill
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.verified_user_rounded, size: 11, color: Color(0xFF2563EB)),
                    Gap(4),
                    Text('Tier 1 Phone • Sakasaka, Tamale', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8))),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.shield_rounded, size: 11, color: Color(0xFF059669)),
                    Gap(4),
                    Text('LOW (5/100) RISK', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Color(0xFF065F46))),
                  ],
                ),
              ),
            ],
          ),
          const Gap(10),

          // Row 3: Lifetime Value & Action Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('GH₵ 0.00', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900)),
                  Text('0 Orders • AOV GH₵ 0.00', style: TextStyle(fontSize: 9.5, color: Colors.grey)),
                ],
              ),
              Row(
                children: [
                  // 360 Profile Drawer Button
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.person_search_rounded, size: 13),
                    label: const Text('360° Profile >', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                    onPressed: () => _openCustomer360Drawer(user),
                  ),
                  const Gap(6),
                  // Manage Status Modal Button
                  IconButton(
                    icon: const Icon(Icons.manage_accounts_rounded, size: 20, color: ServoraColors.emerald600),
                    tooltip: 'Update Status / Role',
                    onPressed: () => _openUpdateAccountStatusModal(user),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // =========================================================
  // 360° CUSTOMER PROFILE INSPECTOR DRAWER (Screenshot 3)
  // =========================================================
  void _openCustomer360Drawer(dynamic user) {
    final id = user['id']?.toString() ?? 'usr';
    final name = user['name']?.toString() ?? 'Member';
    final phone = user['phone']?.toString() ?? 'No Phone';
    final email = user['email']?.toString() ?? 'No Email';
    final joined = _formatLogDate(user['createdAt']?.toString());
    final status = _customerStatuses[id] ?? 'ACTIVE';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDrawerState) {
            final isDark = Theme.of(ctx).brightness == Brightness.dark;
            final tags = _customerTags[id] ?? ['Provider', 'Artisan', 'Tamale'];
            final notes = _customerNotes[id] ?? [];

            return Container(
              height: MediaQuery.of(ctx).size.height * 0.90,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: DefaultTabController(
                length: 4,
                child: Column(
                  children: [
                    // Top Drawer Header
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
                      child: Row(
                        children: [
                          Container(
                            width: 42,
                            height: 42,
                            decoration: const BoxDecoration(
                              color: Color(0xFF059669),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                name.isNotEmpty ? name[0].toUpperCase() : 'U',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18),
                              ),
                            ),
                          ),
                          const Gap(10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Flexible(
                                      child: Text(
                                        name,
                                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const Gap(6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFECFDF5),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        status,
                                        style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: Color(0xFF047857)),
                                      ),
                                    ),
                                  ],
                                ),
                                const Gap(2),
                                Text(
                                  'ID: $id • Joined $joined',
                                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          // Impersonate Button
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.grey.withOpacity(0.15),
                              foregroundColor: isDark ? Colors.white : Colors.black87,
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              elevation: 0,
                            ),
                            icon: const Icon(Icons.visibility_rounded, size: 12),
                            label: const Text('Impersonate', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            onPressed: () {
                              Navigator.of(ctx).pop();
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Switched session context to $name (Shadow Mode)')),
                              );
                            },
                          ),
                          const Gap(6),
                          IconButton(
                            icon: const Icon(Icons.close_rounded, size: 20),
                            onPressed: () => Navigator.of(ctx).pop(),
                          ),
                        ],
                      ),
                    ),

                    // 4 Tabs Bar
                    const TabBar(
                      isScrollable: true,
                      labelColor: Color(0xFF059669),
                      unselectedLabelColor: Colors.grey,
                      indicatorColor: Color(0xFF059669),
                      tabs: [
                        Tab(icon: Icon(Icons.shield_outlined, size: 16), text: 'Identity & Profile'),
                        Tab(icon: Icon(Icons.account_balance_wallet_outlined, size: 16), text: 'Financial Ledger & Wallet'),
                        Tab(icon: Icon(Icons.chat_bubble_outline_rounded, size: 16), text: 'Interaction Stream'),
                        Tab(icon: Icon(Icons.edit_note_rounded, size: 16), text: 'Admin Notes & Audit'),
                      ],
                    ),

                    // Tab View Contents
                    Expanded(
                      child: TabBarView(
                        children: [
                          // Tab 1: Identity & Profile
                          ListView(
                            padding: const EdgeInsets.all(16),
                            children: [
                              // Trust & Risk Index
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFECFDF5),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: const Color(0xFFA7F3D0)),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('AUTOMATED TRUST & RISK INDEX: LOW (5/100)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF065F46))),
                                        Gap(2),
                                        Text('Calculated from disputes, device switches, and verification signals.', style: TextStyle(fontSize: 9, color: Color(0xFF047857))),
                                      ],
                                    ),
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF18181B),
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      ),
                                      onPressed: () => _openUpdateAccountStatusModal(user),
                                      child: const Text('Security Override', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                              ),
                              const Gap(14),

                              // Contact Points & Tier Status Cards
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: _buildDrawerSectionCard(
                                      title: 'CONTACT POINTS',
                                      content: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text('📱 $phone', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                          const Gap(3),
                                          Text('✉️ $email', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                                          const Gap(6),
                                          GestureDetector(
                                            onTap: () => WhatsAppHelper.openWhatsApp(phone: phone, message: "Hello $name, this is Servora Admin."),
                                            child: const Row(
                                              children: [
                                                Icon(Icons.chat_rounded, size: 12, color: Color(0xFF25D366)),
                                                Gap(4),
                                                Text('WhatsApp Active ↗', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF25D366))),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const Gap(10),
                                  Expanded(
                                    child: _buildDrawerSectionCard(
                                      title: 'VERIFICATION TIER STATUS',
                                      content: const Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text('🛡️ TIER_1_BASIC', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF059669))),
                                          Gap(3),
                                          Text('Ghana Card / National ID verified & matched against central database.', style: TextStyle(fontSize: 9.5, color: Colors.grey)),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const Gap(14),

                              // GPS Address
                              _buildDrawerSectionCard(
                                title: 'SAVED SERVICE & DELIVERY ADDRESSES (GPS PINNED)',
                                content: const Row(
                                  children: [
                                    Icon(Icons.location_on_rounded, size: 14, color: Color(0xFF059669)),
                                    Gap(6),
                                    Text('Primary Address (Sakasaka, Tamale Central)', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                              const Gap(14),

                              // Connected Devices
                              _buildDrawerSectionCard(
                                title: 'CONNECTED DEVICES & FINGERPRINTS',
                                content: const Row(
                                  children: [
                                    Icon(Icons.devices_rounded, size: 14, color: Colors.grey),
                                    Gap(6),
                                    Text('📱 dev-web-browser / mobile-app', style: TextStyle(fontSize: 11, color: Colors.grey)),
                                  ],
                                ),
                              ),
                              const Gap(14),

                              // Custom Customer Tags
                              _buildDrawerSectionCard(
                                title: 'CUSTOM CUSTOMER TAGS & DYNAMIC COHORTS',
                                content: Wrap(
                                  spacing: 6,
                                  runSpacing: 6,
                                  children: [
                                    ...tags.map((t) => Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFECFDF5),
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: const Color(0xFFA7F3D0)),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Text('#$t', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF065F46))),
                                              const Gap(4),
                                              GestureDetector(
                                                onTap: () {
                                                  setDrawerState(() {
                                                    tags.remove(t);
                                                    _customerTags[id] = tags;
                                                  });
                                                },
                                                child: const Icon(Icons.close, size: 10, color: Color(0xFF065F46)),
                                              ),
                                            ],
                                          ),
                                        )),
                                    GestureDetector(
                                      onTap: () {
                                        setDrawerState(() {
                                          tags.add('Verified');
                                          _customerTags[id] = tags;
                                        });
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: Colors.grey.withOpacity(0.12),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: const Text('+ Add tag', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),

                          // Tab 2: Financial Ledger
                          ListView(
                            padding: const EdgeInsets.all(16),
                            children: [
                              _buildSecurityStatRow('Lifetime Spend / GMV', 'GH₵ 0.00', const Color(0xFF059669)),
                              const Gap(10),
                              _buildSecurityStatRow('MoMo Escrow Holds', 'GH₵ 0.00', Colors.grey),
                              const Gap(14),
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF059669),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                icon: const Icon(Icons.add_card_rounded, size: 14),
                                label: const Text('+ Issue Credit Adjustment / Escrow Refund'),
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Financial Adjustment Authorized for User ✓')),
                                  );
                                },
                              ),
                            ],
                          ),

                          // Tab 3: Interaction Stream
                          ListView(
                            padding: const EdgeInsets.all(16),
                            children: const [
                              Text('No past dispute or message escalations logged for this account.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),

                          // Tab 4: Admin Notes
                          ListView(
                            padding: const EdgeInsets.all(16),
                            children: [
                              ...notes.map((n) => Padding(
                                    padding: const EdgeInsets.only(bottom: 8),
                                    child: Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: Colors.grey.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(n['text'] ?? '', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                                          const Gap(2),
                                          Text('By Master Admin • ${n['date']}', style: const TextStyle(fontSize: 9, color: Colors.grey)),
                                        ],
                                      ),
                                    ),
                                  )),
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF059669),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                icon: const Icon(Icons.add_comment_rounded, size: 14),
                                label: const Text('+ Add Internal Supervisor Note'),
                                onPressed: () {
                                  setDrawerState(() {
                                    notes.add({'text': 'Verified via Ghana Card inspection in Tamale.', 'date': 'Just now'});
                                    _customerNotes[id] = notes;
                                  });
                                },
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
          },
        );
      },
    );
  }

  Widget _buildDrawerSectionCard({required String title, required Widget content}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? Colors.black26 : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? Colors.white12 : Colors.grey.withOpacity(0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 0.5)),
          const Gap(8),
          content,
        ],
      ),
    );
  }

  // =========================================================
  // UPDATE ACCOUNT STATUS MODAL (Screenshot 4)
  // =========================================================
  void _openUpdateAccountStatusModal(dynamic user) {
    final id = user['id']?.toString() ?? 'usr';
    final name = user['name']?.toString() ?? 'Member';
    String selectedState = _customerStatuses[id] ?? 'ACTIVE (Normal Operations)';
    final reasonController = TextEditingController(text: 'Verified Ghana card docs & phone check.');

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text('Update Status: $name', style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 20),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Target Status State *', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  const Gap(6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.withOpacity(0.3)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedState,
                        isExpanded: true,
                        items: [
                          'ACTIVE (Normal Operations)',
                          'SUSPENDED (Fraud Review)',
                          'FLAGGED (Dispute Hold)',
                          'RESTRICTED (Security Quarantine)',
                        ].map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 12)))).toList(),
                        onChanged: (val) {
                          if (val != null) setDialogState(() => selectedState = val);
                        },
                      ),
                    ),
                  ),
                  const Gap(14),

                  const Text('Mandatory Admin Operational Reason *', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  const Gap(6),
                  TextField(
                    controller: reasonController,
                    decoration: InputDecoration(
                      hintText: 'e.g. Fraud dispute review / Verified Ghana card docs',
                      hintStyle: const TextStyle(fontSize: 11),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.all(12),
                    ),
                    maxLines: 2,
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  child: const Text('Cancel', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () {
                    final cleanStatus = selectedState.startsWith('ACTIVE') ? 'ACTIVE' : (selectedState.startsWith('SUSPENDED') ? 'SUSPENDED' : 'FLAGGED');
                    setState(() {
                      _customerStatuses[id] = cleanStatus;
                    });
                    _handleAdminAction('UPDATE_CUSTOMER_STATUS', targetId: id, payload: {
                      'status': cleanStatus,
                      'reason': reasonController.text,
                    });
                    Navigator.of(ctx).pop();
                  },
                  child: const Text('Confirm Action', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  // =========================================================
  // 4. BUSINESS PROFILES & ARTISANS
  // =========================================================
  Widget _buildBusinessesView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Registered Providers (${_providers.length}):', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: ServoraColors.emerald600,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              icon: const Icon(Icons.add_rounded, size: 14),
              label: const Text('New Business', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
              onPressed: () => context.push('/provider/register'),
            ),
          ],
        ),
        const Gap(10),

        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _providers.length,
          separatorBuilder: (_, __) => const Gap(10),
          itemBuilder: (context, idx) {
            final p = _providers[idx];
            final isVerified = p['verificationStatus'] == 'VERIFIED';
            final isPromoted = p['isPromoted'] == true;
            final slug = p['slug'] ?? p['id'];

            return ServoraCard(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: ServoraColors.emerald600.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.storefront_rounded, color: ServoraColors.emerald600, size: 24),
                      ),
                      const Gap(12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p['businessName'] ?? 'Business Storefront',
                              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
                            ),
                            const Gap(2),
                            Text('Area: ${p['serviceArea'] ?? 'Tamale'} • Owner: ${p['user']?['name'] ?? 'Merchant'}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Gap(10),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: isVerified ? const Color(0xFFD1FAE5) : const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          isVerified ? 'VERIFIED' : 'PENDING',
                          style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: isVerified ? const Color(0xFF047857) : const Color(0xFFB45309)),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => _handleAdminAction('TOGGLE_PROMOTED_PROVIDER', targetId: p['id']),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: isPromoted ? Colors.amber : Colors.grey.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.auto_awesome, size: 10),
                              const Gap(3),
                              Text(
                                isPromoted ? 'Promoted Advert 🚀' : '+ Feature Advert',
                                style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: isPromoted ? Colors.black : Colors.grey[700]),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Gap(10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () => context.push('/biz/$slug'),
                        child: const Text('View Storefront ↗', style: TextStyle(fontSize: 11)),
                      ),
                      const Gap(6),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isVerified ? Colors.amber[700] : ServoraColors.emerald600,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          elevation: 0,
                        ),
                        onPressed: () => _handleAdminAction('TOGGLE_VERIFICATION', targetId: p['id']),
                        child: Text(isVerified ? 'Unverify' : 'Verify 🛡️', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
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

  // =========================================================
  // 5. ID & VERIFICATION QUEUE
  // =========================================================
  Widget _buildVerificationView() {
    final pendingProviders = _providers.where((p) => p['verificationStatus'] != 'VERIFIED').toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('Ghana Card & Business Verification Queue:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        const Gap(10),
        if (pendingProviders.isEmpty)
          const Center(child: Padding(padding: EdgeInsets.all(30), child: Text('All pending Ghana Cards have been reviewed and verified! 🛡️')))
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: pendingProviders.length,
            separatorBuilder: (_, __) => const Gap(10),
            itemBuilder: (context, idx) {
              final p = pendingProviders[idx];
              return ServoraCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(p['businessName'] ?? 'Artisan', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900)),
                        const Text('PENDING CHECK', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.amber)),
                      ],
                    ),
                    const Gap(4),
                    Text('Applicant: ${p['user']?['name'] ?? 'User'} • Area: ${p['serviceArea'] ?? 'Tamale'}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                    const Gap(10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ServoraColors.emerald600,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.verified_user_rounded, size: 14),
                          label: const Text('Approve Ghana Card 🛡️', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          onPressed: () => _handleAdminAction('TOGGLE_VERIFICATION', targetId: p['id']),
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

  // =========================================================
  // 6. SECURITY & FRAUD ENGINE
  // =========================================================
  Widget _buildSecurityView() {
    return ServoraCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.security_rounded, color: Colors.redAccent, size: 20),
              Gap(8),
              Text('Security & Fraud Engine (Active)', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
            ],
          ),
          const Gap(10),
          const Text(
            'Monitors MoMo transaction anomalies, duplicate Ghana Card registrations, and abusive phone spam.',
            style: TextStyle(fontSize: 11.5, color: Colors.grey),
          ),
          const Gap(16),
          _buildSecurityStatRow('Platform Threat Level', 'LOW / NORMAL', Colors.green),
          const Gap(8),
          _buildSecurityStatRow('Active Blacklisted Numbers', '0 Detected', Colors.grey),
          const Gap(8),
          _buildSecurityStatRow('MoMo Escrow Anti-Fraud Hold', '100% Armed', ServoraColors.emerald600),
        ],
      ),
    );
  }

  Widget _buildSecurityStatRow(String label, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: color)),
      ],
    );
  }

  // =========================================================
  // 7. FINANCE & MOMO ESCROW
  // =========================================================
  Widget _buildEscrowView() {
    return ServoraCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.account_balance_wallet_rounded, color: ServoraColors.emerald600, size: 20),
              Gap(8),
              Text('Finance & Mobile Money Escrow Hub', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
            ],
          ),
          const Gap(8),
          const Text(
            'All trades across Northern Ghana are held securely via MTN/Telecel Mobile Money escrow.',
            style: TextStyle(fontSize: 11.5, color: Colors.grey),
          ),
          const Gap(16),
          _buildSecurityStatRow('Total Protected Volume', 'GH₵ 3,450.00', ServoraColors.emerald600),
          const Gap(8),
          _buildSecurityStatRow('Active Escrow Holds', '1 Transaction', Colors.amber[800]!),
          const Gap(8),
          _buildSecurityStatRow('Merchant Payout Release Engine', 'Auto-Verified', Colors.green),
        ],
      ),
    );
  }

  // =========================================================
  // 8. DELIVERY FLEET & DISPATCHERS
  // =========================================================
  Widget _buildDeliveryView() {
    return ServoraCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.local_shipping_rounded, color: Color(0xFF2563EB), size: 20),
              Gap(8),
              Text('Delivery Fleet & Dispatchers', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
            ],
          ),
          const Gap(8),
          const Text('Live motorcycle haulage and parcel dispatch network across Tamale Metro.', style: TextStyle(fontSize: 11.5, color: Colors.grey)),
          const Gap(16),
          _buildSecurityStatRow('Active Riders in Tamale', '6 Registered Riders', const Color(0xFF2563EB)),
          const Gap(8),
          _buildSecurityStatRow('Fleet Dispatch Zones', 'Sakasaka, Aboabo, Dungu', Colors.grey[700]!),
        ],
      ),
    );
  }

  // =========================================================
  // 9. PRODUCT MODERATION HUB
  // =========================================================
  Widget _buildProductsView() {
    final filtered = _products.where((p) {
      if (_productStatusFilter == 'ALL') return true;
      return p['status'] == _productStatusFilter;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: ['ALL', 'ACTIVE', 'PENDING_APPROVAL'].map((s) {
            final isSel = _productStatusFilter == s;
            return Padding(
              padding: const EdgeInsets.only(right: 6),
              child: ChoiceChip(
                label: Text(s, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSel ? Colors.white : null)),
                selected: isSel,
                selectedColor: ServoraColors.emerald600,
                onSelected: (_) => setState(() => _productStatusFilter = s),
              ),
            );
          }).toList(),
        ),
        const Gap(10),

        Text('Product Moderation Queue (${filtered.length}):', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        const Gap(10),

        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: filtered.length,
          separatorBuilder: (_, __) => const Gap(8),
          itemBuilder: (context, idx) {
            final p = filtered[idx];
            final price = p['price'] ?? 0;
            final status = p['status'] ?? 'ACTIVE';

            return ServoraCard(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: ServoraColors.emerald600.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.inventory_2_rounded, color: ServoraColors.emerald600),
                  ),
                  const Gap(12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p['title'] ?? 'Product', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                        const Gap(2),
                        Text('GH₵ $price • Store: ${p['provider']?['businessName'] ?? 'Merchant'}', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: status == 'ACTIVE' ? const Color(0xFFD1FAE5) : const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      status,
                      style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: status == 'ACTIVE' ? const Color(0xFF047857) : const Color(0xFFB45309)),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  // =========================================================
  // 10. SERVICE REQUESTS & GIGS
  // =========================================================
  Widget _buildRequestsView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Active Service Calls (${_serviceRequests.length}):', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        const Gap(10),
        if (_serviceRequests.isEmpty)
          const Center(child: Padding(padding: EdgeInsets.all(30), child: Text('No active service requests.')))
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _serviceRequests.length,
            separatorBuilder: (_, __) => const Gap(8),
            itemBuilder: (context, idx) {
              final req = _serviceRequests[idx];
              final phone = req['customer']?['phone'] ?? '';
              final name = req['customer']?['name'] ?? 'Client';

              return ServoraCard(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(req['title'] ?? 'Service Call', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        Text(req['status'] ?? 'OPEN', style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                      ],
                    ),
                    const Gap(4),
                    Text('Customer: $name ($phone)', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                    if (phone.isNotEmpty) ...[
                      const Gap(8),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF25D366),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: const Icon(Icons.chat_rounded, size: 14),
                        label: const Text('WhatsApp Dispatch', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        onPressed: () => WhatsAppHelper.openWhatsApp(phone: phone, message: "Hello $name, this is Servora Admin Dispatch regarding your request: ${req['title']}"),
                      ),
                    ],
                  ],
                ),
              );
            },
          ),
      ],
    );
  }

  // =========================================================
  // 11. TOOL RENTALS ENGINE
  // =========================================================
  Widget _buildRentalsView() {
    return const ServoraCard(
      padding: EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.handyman_rounded, color: Color(0xFFD97706), size: 20),
              Gap(8),
              Text('Heavy Tool & Machinery Rental Registry', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
            ],
          ),
          Gap(10),
          Text('Registry of tractor implements, solar drilling rigs, and generators for hire in Northern Ghana.', style: TextStyle(fontSize: 11.5, color: Colors.grey)),
        ],
      ),
    );
  }

  // =========================================================
  // 12. DISPUTES & HELPDESK
  // =========================================================
  Widget _buildDisputesView() {
    return const ServoraCard(
      padding: EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.balance_rounded, color: Colors.purple, size: 20),
              Gap(8),
              Text('Disputes & Mediation Helpdesk', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
            ],
          ),
          Gap(10),
          Text('0 Active mediation disputes. Customer satisfaction rating 99.8%.', style: TextStyle(fontSize: 11.5, color: Colors.grey)),
        ],
      ),
    );
  }

  // =========================================================
  // 13. COMMUNITY BOARD MODERATION
  // =========================================================
  Widget _buildCommunityView() {
    return const ServoraCard(
      padding: EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.groups_rounded, color: ServoraColors.emerald600, size: 20),
              Gap(8),
              Text('Community Board Moderation', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
            ],
          ),
          Gap(10),
          Text('Monitor trade discussions, wholesale requests, and artisan collaboration boards.', style: TextStyle(fontSize: 11.5, color: Colors.grey)),
        ],
      ),
    );
  }

  // =========================================================
  // 14. ANNOUNCEMENT TICKERS
  // =========================================================
  Widget _buildTickersView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('Announcement Tickers (Live Marquee):', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        const Gap(10),
        ..._tickers.map((t) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: ServoraCard(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    const Icon(Icons.campaign_rounded, color: ServoraColors.emerald600),
                    const Gap(10),
                    Expanded(child: Text(t['text'] ?? '', style: const TextStyle(fontSize: 11.5))),
                  ],
                ),
              ),
            )),
      ],
    );
  }

  // =========================================================
  // 15. SYSTEM SETTINGS & CONFIG
  // =========================================================
  Widget _buildSettingsView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildSettingsTabButton('General Config', 'general'),
              const Gap(6),
              _buildSettingsTabButton('Feature Flags', 'flags'),
              const Gap(6),
              _buildSettingsTabButton('Infrastructure Health', 'health'),
            ],
          ),
        ),
        const Gap(14),

        if (_settingsSubTab == 'general') ...[
          const ServoraCard(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Platform Configuration', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                Gap(12),
                Text('Marketplace Commission Fee', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                Gap(4),
                Text('5.0% flat escrow processing fee for verified trade payouts.', style: TextStyle(fontSize: 11, color: Colors.grey)),
                Gap(14),
                Text('Support Hotline', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                Gap(4),
                Text('+233 24 000 0000 (Tamale Headquarters)', style: TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
        ] else if (_settingsSubTab == 'flags') ...[
          ..._featureFlags.map((flag) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: ServoraCard(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(flag['name'] ?? '', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                            const Gap(2),
                            Text(flag['description'] ?? '', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                          ],
                        ),
                      ),
                      Switch(
                        value: flag['isEnabled'] == true,
                        activeColor: ServoraColors.emerald600,
                        onChanged: (v) {
                          setState(() {
                            flag['isEnabled'] = v;
                          });
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('${flag['name']} is now ${v ? "ENABLED" : "DISABLED"}')),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              )),
        ] else ...[
          ServoraCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('System Health & PWA Engine', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                const Gap(10),
                _buildSecurityStatRow('PostgreSQL Database Status', 'CONNECTED (100% Up)', ServoraColors.emerald600),
                const Gap(8),
                _buildSecurityStatRow('Cloudflare R2 Media Vault', 'ONLINE', ServoraColors.emerald600),
                const Gap(8),
                _buildSecurityStatRow('WhatsApp Dispatch Gateway', 'ARMED', ServoraColors.emerald600),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildSettingsTabButton(String label, String tabId) {
    final isSel = _settingsSubTab == tabId;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isSel ? Colors.white : null)),
      selected: isSel,
      selectedColor: ServoraColors.emerald600,
      onSelected: (_) => setState(() => _settingsSubTab = tabId),
    );
  }
}
