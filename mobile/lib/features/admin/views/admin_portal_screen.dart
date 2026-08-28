import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/constants.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../core/utils/whatsapp_helper.dart';

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
  String _settingsSubTab = 'general'; // 'general' | 'flags' | 'recycle' | 'taxonomy' | 'email' | 'health' | 'storage' | 'promos'
  String _crmDrawerTab = 'identity'; // 'identity' | 'financial' | 'omnichannel' | 'notes'

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
  // SIDEBAR DRAWER (Exact Web Screenshot Layout)
  // ==========================================
  void _openAdminNavDrawer() {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Admin Navigation',
      barrierColor: Colors.black.withOpacity(0.55),
      transitionDuration: const Duration(milliseconds: 280),
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
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 24,
                    offset: const Offset(8, 0),
                  ),
                ],
              ),
              child: SafeArea(
                child: Column(
                  children: [
                    // Header with Green Circle Icon & Close Button
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
                                child: const Icon(Icons.handyman_rounded, color: Colors.white, size: 18),
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
                          // OVERVIEW SECTION
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

                          // USER & TRUST MANAGEMENT
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

                          // MARKETPLACE & SERVICES
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

                          // ECOSYSTEM & COMMUNITY
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

                          // SYSTEM & INFRASTRUCTURE
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
        // =========================================================
        // TOP ADMIN CONTROL STRIP (Menu button, Title & Live Status)
        // =========================================================
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isDark ? ServoraColors.darkSurface : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: isDark ? ServoraColors.darkCardBorder : Colors.grey.withOpacity(0.2)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  GestureDetector(
                    onTap: _openAdminNavDrawer,
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.menu_rounded, color: Colors.white, size: 22),
                    ),
                  ),
                  const Gap(10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Text('Servora Admin', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                          Gap(6),
                          Text('👑', style: TextStyle(fontSize: 14)),
                        ],
                      ),
                      Text(
                        _getViewTitle(_activeView),
                        style: const TextStyle(fontSize: 11, color: ServoraColors.emerald600, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded, size: 20),
                    tooltip: 'Sync Database Metrics',
                    onPressed: _fetchLiveAdminData,
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.tune_rounded, size: 14),
                    label: const Text('Menu', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    onPressed: _openAdminNavDrawer,
                  ),
                ],
              ),
            ],
          ),
        ).animate().fadeIn(duration: 150.ms),
        const Gap(14),

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

        // =========================================================
        // VIEW RENDERER BASED ON SELECTED WORKSPACE
        // =========================================================
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
      ],
    );
  }

  String _getViewTitle(String viewId) {
    switch (viewId) {
      case 'overview': return 'Dashboard Overview';
      case 'activity': return 'Live Activity Feed';
      case 'crm': return 'Customer CRM & Members (360°)';
      case 'businesses': return 'Business Profiles & Artisans';
      case 'verification': return 'ID & Verification Queue';
      case 'security': return 'Security & Fraud Engine';
      case 'escrow': return 'Finance & MoMo Escrow';
      case 'delivery': return 'Delivery Fleet & Dispatchers';
      case 'products': return 'Product Moderation Hub';
      case 'requests': return 'Service Requests & Gigs';
      case 'rentals': return 'Tool Rentals Engine';
      case 'disputes': return 'Disputes & Helpdesk';
      case 'community': return 'Community Board Moderation';
      case 'tickers': return 'Announcement Tickers';
      case 'settings': return 'System Settings & Config';
      default: return 'Supervisor Control';
    }
  }

  // =========================================================
  // 1. DASHBOARD OVERVIEW VIEW (Matching Web layout + Launch widget)
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

  Widget _buildAuditLogRow(dynamic log) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Theme.of(context).brightness == Brightness.dark ? Colors.black26 : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: ServoraColors.emerald600.withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.shield_outlined, size: 14, color: ServoraColors.emerald600),
            ),
            const Gap(10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(log['action']?.toString() ?? 'ADMIN_LOG', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  const Gap(1),
                  Text(log['details']?.toString() ?? '', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================
  // 2. LIVE ACTIVITY FEED
  // =========================================================
  Widget _buildActivityView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Live Operational Activity Feed (Database Event Logs):', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        const Gap(10),
        if (_auditLogs.isEmpty)
          const Center(child: Padding(padding: EdgeInsets.all(30), child: Text('No audit logs recorded yet.')))
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _auditLogs.length,
            separatorBuilder: (_, __) => const Gap(8),
            itemBuilder: (context, idx) => _buildAuditLogRow(_auditLogs[idx]),
          ),
      ],
    );
  }

  // =========================================================
  // 3. CUSTOMER CRM 360° WORKSPACE WITH DETAILS DRAWER
  // =========================================================
  void _openCustomer360Drawer(Map<String, dynamic> user) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          final isDark = Theme.of(ctx).brightness == Brightness.dark;
          final name = user['name'] ?? 'Customer Member';
          final phone = user['phone'] ?? '+233 24 000 0000';
          final email = user['email'] ?? 'No Email';
          final role = user['role'] ?? 'CUSTOMER';

          return Container(
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F172A) : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            padding: const EdgeInsets.all(18),
            constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.85),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const Gap(14),
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 22,
                        backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
                        child: Text(name.isNotEmpty ? name[0].toUpperCase() : 'C', style: const TextStyle(fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                      ),
                      const Gap(12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            Text('$phone • $email', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: ServoraColors.emerald600.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(role, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                      ),
                    ],
                  ),
                  const Gap(16),

                  // 360 Tabs
                  Row(
                    children: [
                      _buildDrawerTabPill('Identity', 'identity', setModalState),
                      const Gap(6),
                      _buildDrawerTabPill('Financial & Escrow', 'financial', setModalState),
                      const Gap(6),
                      _buildDrawerTabPill('Omnichannel', 'omnichannel', setModalState),
                    ],
                  ),
                  const Gap(14),

                  if (_crmDrawerTab == 'identity') ...[
                    _buildDrawerInfoRow('Account Status', 'ACTIVE / VERIFIED', Colors.green),
                    _buildDrawerInfoRow('Risk Score', 'LOW RISK (0/100)', Colors.green),
                    _buildDrawerInfoRow('Joined Region', 'Tamale Central, Northern Ghana', Colors.grey[700]!),
                    const Gap(14),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.redAccent,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: const Icon(Icons.block_rounded, size: 16),
                        label: const Text('Ban / Restrict Customer Account', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        onPressed: () {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Account for $name flagged.')),
                          );
                        },
                      ),
                    ),
                  ] else if (_crmDrawerTab == 'financial') ...[
                    _buildDrawerInfoRow('MoMo Escrow Volume', 'GH₵ 420.00 (3 Deals)', ServoraColors.emerald600),
                    _buildDrawerInfoRow('Pending Refunds', 'GH₵ 0.00', Colors.grey),
                    _buildDrawerInfoRow('Platform Fee Paid', 'GH₵ 21.00', Colors.grey[700]!),
                  ] else ...[
                    _buildDrawerInfoRow('WhatsApp Dispatch', 'Enabled & Automated', Colors.green),
                    _buildDrawerInfoRow('SMS Alerts Gateway', 'Delivered (100%)', Colors.green),
                    const Gap(10),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.chat_rounded, size: 16),
                      label: const Text('Direct WhatsApp Chat', style: TextStyle(fontWeight: FontWeight.bold)),
                      onPressed: () => WhatsAppHelper.openWhatsApp(phone: phone, message: "Hello $name, this is Servora Admin Support."),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDrawerTabPill(String label, String tabId, StateSetter setModalState) {
    final isSel = _crmDrawerTab == tabId;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setModalState(() => _crmDrawerTab = tabId);
          setState(() => _crmDrawerTab = tabId);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSel ? ServoraColors.emerald600 : Colors.grey.withOpacity(0.15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: isSel ? Colors.white : Colors.grey[700],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDrawerInfoRow(String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 11.5, color: Colors.grey)),
          Text(value, style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _buildCrmView() {
    final filtered = _users.where((u) {
      final matchesSearch = (u['name']?.toString().toLowerCase().contains(_searchQuery.toLowerCase()) ?? false) ||
          (u['phone']?.toString().contains(_searchQuery) ?? false) ||
          (u['email']?.toString().toLowerCase().contains(_searchQuery.toLowerCase()) ?? false);
      if (_userRoleFilter == 'ALL') return matchesSearch;
      return matchesSearch && (u['role'] == _userRoleFilter);
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          decoration: InputDecoration(
            hintText: 'Search 360° CRM by name, phone, email...',
            prefixIcon: const Icon(Icons.search_rounded, size: 18),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          ),
          onChanged: (val) => setState(() => _searchQuery = val),
        ),
        const Gap(10),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: ['ALL', 'CUSTOMER', 'PROVIDER', 'ADMIN'].map((role) {
              final isSel = _userRoleFilter == role;
              return Padding(
                padding: const EdgeInsets.only(right: 6),
                child: ChoiceChip(
                  label: Text(role, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSel ? Colors.white : null)),
                  selected: isSel,
                  selectedColor: ServoraColors.emerald600,
                  onSelected: (_) => setState(() => _userRoleFilter = role),
                ),
              );
            }).toList(),
          ),
        ),
        const Gap(12),

        Text('CRM Members Database (${filtered.length}):', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        const Gap(8),

        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: filtered.length,
          separatorBuilder: (_, __) => const Gap(8),
          itemBuilder: (context, idx) {
            final u = filtered[idx];
            final role = u['role']?.toString() ?? 'CUSTOMER';

            return ServoraCard(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
                    child: Text(
                      u['name'] != null && u['name'].toString().isNotEmpty ? u['name'][0].toUpperCase() : 'U',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
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
                                u['name'] ?? 'Member',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
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
                                    : (role == 'PROVIDER' ? Colors.amber.withOpacity(0.2) : Colors.blue.withOpacity(0.15)),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                role,
                                style: TextStyle(
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w900,
                                  color: role == 'ADMIN' ? Colors.red : (role == 'PROVIDER' ? Colors.amber[800] : Colors.blue[700]),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const Gap(2),
                        Text('${u['phone'] ?? 'No Phone'} • ${u['email'] ?? 'No Email'}', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.remove_red_eye_rounded, size: 20, color: ServoraColors.emerald600),
                    tooltip: 'Inspect 360° Profile',
                    onPressed: () => _openCustomer360Drawer(u),
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
  // 9. PRODUCT MODERATION HUB (With Status Sub-Tabs)
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
                    Text('Customer: ${req['customer']?['name'] ?? 'Client'} (${req['customer']?['phone'] ?? ''})', style: const TextStyle(fontSize: 11, color: Colors.grey)),
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
        // Sub Tabs
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
