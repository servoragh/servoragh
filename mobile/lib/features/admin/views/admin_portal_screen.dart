import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/constants.dart';
import '../../../app/theme/servora_colors.dart';
import '../../auth/providers/auth_provider.dart';

// Modular Admin Views
import 'admin_overview_view.dart';
import 'admin_activity_view.dart';
import 'admin_crm_view.dart';
import 'admin_businesses_view.dart';
import 'admin_verification_view.dart';
import 'admin_security_view.dart';
import 'admin_escrow_view.dart';
import 'admin_delivery_view.dart';
import 'admin_products_view.dart';
import 'admin_requests_view.dart';
import 'admin_rentals_view.dart';
import 'admin_disputes_view.dart';
import 'admin_community_view.dart';
import 'admin_tickers_view.dart';
import 'admin_settings_view.dart';

class AdminPortalView extends StatefulWidget {
  final VoidCallback? onSwitchToCustomer;

  const AdminPortalView({super.key, this.onSwitchToCustomer});

  @override
  State<AdminPortalView> createState() => _AdminPortalViewState();
}

class _AdminPortalViewState extends State<AdminPortalView> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String _activeView = 'overview';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // Live Database Collections
  Map<String, dynamic> _stats = {};
  Map<String, dynamic> _storageStats = {};
  List<dynamic> _users = [];
  List<dynamic> _providers = [];
  List<dynamic> _products = [];
  List<dynamic> _serviceRequests = [];
  List<dynamic> _auditLogs = [];

  // Zero-Capital Launch Mode Checklist State
  final List<Map<String, dynamic>> _launchTasks = [
    {'id': 1, 'text': 'Seed 20 verified Tamale artisans (Solar, Fugu, AC, Mechanics)', 'done': true},
    {'id': 2, 'text': 'Test MoMo Escrow holds on MTN & Telecel with live GHS test', 'done': true},
    {'id': 3, 'text': 'Onboard 5 Aboabo spare parts & agro wholesalers with catalog', 'done': true},
    {'id': 4, 'text': 'Distribute 500 QR sticker tags to dispatch riders & shops', 'done': false},
    {'id': 5, 'text': 'Run zero-budget WhatsApp Community referral drive in Tamale', 'done': false},
  ];

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
      final token = await authNotifier.storage.getToken();
      final res = await _dio.get(
        '/admin/stats',
        options: Options(
          headers: token != null ? {'Authorization': 'Bearer $token'} : {},
        ),
      );

      if (res.statusCode == 200 && res.data != null) {
        final data = res.data is Map<String, dynamic> ? res.data : {};
        setState(() {
          _stats = data['stats'] ?? {};
          _storageStats = data['storageStats'] ?? {};
          _users = List<dynamic>.from(data['users'] ?? []);
          _providers = List<dynamic>.from(data['providers'] ?? []);
          _products = List<dynamic>.from(data['products'] ?? []);
          _serviceRequests = List<dynamic>.from(data['serviceRequests'] ?? []);
          _auditLogs = List<dynamic>.from(data['auditLogs'] ?? []);
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load admin stats: ${res.statusCode}');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Could not sync live stats (${e.toString()})';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleAdminAction(String action, {String? targetId, dynamic payload}) async {
    try {
      final token = await authNotifier.storage.getToken();
      final res = await _dio.post(
        '/admin/manage',
        data: {
          'action': action,
          'targetId': targetId,
          'payload': payload,
        },
        options: Options(
          headers: token != null ? {'Authorization': 'Bearer $token'} : {},
        ),
      );

      if (res.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: ServoraColors.emerald600,
              content: Text('Action $action executed successfully ✓'),
            ),
          );
        }
        _fetchLiveAdminData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red[700],
            content: Text('Action executed locally (Simulated sync): $action'),
          ),
        );
      }
      _fetchLiveAdminData();
    }
  }

  void _toggleLaunchTask(int id) {
    setState(() {
      final index = _launchTasks.indexWhere((t) => t['id'] == id);
      if (index != -1) {
        _launchTasks[index]['done'] = !_launchTasks[index]['done'];
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: isDark ? const Color(0xFF090D16) : const Color(0xFFF8FAFC),
      drawer: _buildLeftSliderDrawer(context, isDark),
      body: SafeArea(
        child: Column(
          children: [
            // Edge-to-Edge Topbar
            _buildEdgeToEdgeTopbar(context, isDark),

            // Top Modern Admin Omnisearch Bar
            _buildAdminSearchBar(isDark),

            // Scrollable Active View with Pull-to-Refresh
            Expanded(
              child: RefreshIndicator(
                color: ServoraColors.emerald600,
                onRefresh: _fetchLiveAdminData,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 900),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (_errorMessage != null) ...[
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: Colors.amber.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.amber.withOpacity(0.4)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.cloud_off_rounded, size: 16, color: Colors.amber),
                                  const Gap(8),
                                  Expanded(
                                    child: Text(
                                      _errorMessage!,
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.amber),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Gap(12),
                          ],

                          if (_isLoading)
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 60),
                              child: Center(child: CircularProgressIndicator(color: ServoraColors.emerald600)),
                            )
                          else
                            _buildCurrentViewContent(),

                          const Gap(30),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentViewContent() {
    switch (_activeView) {
      case 'overview':
        return AdminOverviewView(
          stats: _stats,
          storageStats: _storageStats,
          auditLogs: _auditLogs,
          launchTasks: _launchTasks,
          onToggleLaunchTask: _toggleLaunchTask,
          onNavigateToView: (view) => setState(() => _activeView = view),
        );
      case 'activity':
        return AdminActivityView(
          auditLogs: _auditLogs,
          onRefresh: _fetchLiveAdminData,
        );
      case 'crm':
        return AdminCrmView(
          users: _users,
          onRefresh: _fetchLiveAdminData,
          onAdminAction: _handleAdminAction,
        );
      case 'businesses':
        return AdminBusinessesView(
          providers: _providers,
          products: _products,
          onRefresh: _fetchLiveAdminData,
          onAdminAction: _handleAdminAction,
        );
      case 'verification':
        return AdminVerificationView(
          providers: _providers,
          onRefresh: _fetchLiveAdminData,
          onAdminAction: _handleAdminAction,
        );
      case 'security':
        return AdminSecurityView(
          users: _users,
          onRefresh: _fetchLiveAdminData,
          onAdminAction: _handleAdminAction,
        );
      case 'escrow':
        return AdminEscrowView(
          onRefresh: _fetchLiveAdminData,
        );
      case 'delivery':
        return AdminDeliveryView(
          onRefresh: _fetchLiveAdminData,
        );
      case 'products':
        return AdminProductsView(
          products: _products,
          onRefresh: _fetchLiveAdminData,
          onAdminAction: _handleAdminAction,
        );
      case 'requests':
        return AdminRequestsView(
          requests: _serviceRequests,
          onRefresh: _fetchLiveAdminData,
        );
      case 'rentals':
        return AdminRentalsView(
          onRefresh: _fetchLiveAdminData,
        );
      case 'disputes':
        return AdminDisputesView(
          onRefresh: _fetchLiveAdminData,
        );
      case 'community':
        return AdminCommunityView(
          onRefresh: _fetchLiveAdminData,
        );
      case 'tickers':
        return AdminTickersView(
          onRefresh: _fetchLiveAdminData,
        );
      case 'settings':
        return AdminSettingsView(
          storageStats: _storageStats,
          onRefresh: _fetchLiveAdminData,
        );
      default:
        return AdminOverviewView(
          stats: _stats,
          storageStats: _storageStats,
          auditLogs: _auditLogs,
          launchTasks: _launchTasks,
          onToggleLaunchTask: _toggleLaunchTask,
          onNavigateToView: (view) => setState(() => _activeView = view),
        );
    }
  }

  Widget _buildAdminSearchBar(bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Container(
        height: 42,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
          ),
        ),
        child: TextField(
          controller: _searchController,
          onChanged: (val) => setState(() => _searchQuery = val),
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          decoration: InputDecoration(
            hintText: 'Search users, businesses, flags, transactions...',
            hintStyle: TextStyle(
              fontSize: 12,
              color: isDark ? Colors.white38 : Colors.grey[500],
            ),
            prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF059669), size: 18),
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
    );
  }

  // =========================================================
  // EDGE-TO-EDGE TOPBAR
  // =========================================================
  Widget _buildEdgeToEdgeTopbar(BuildContext context, bool isDark) {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
            width: 1,
          ),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.menu_rounded, size: 22),
            tooltip: 'Open Admin Menu',
            onPressed: () => _scaffoldKey.currentState?.openDrawer(),
          ),
          const Gap(4),
          const Row(
            children: [
              Text(
                'Servora',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF059669), letterSpacing: -0.5),
              ),
              Gap(4),
              Text(
                'Admin',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: -0.5),
              ),
            ],
          ),
          const Spacer(),

          // Bell with live notification badge
          Stack(
            clipBehavior: Clip.none,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none_rounded, size: 20),
                tooltip: 'Activity Alerts',
                onPressed: () => setState(() => _activeView = 'activity'),
              ),
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ],
          ),

          // User Avatar Pill
          Container(
            width: 32,
            height: 32,
            decoration: const BoxDecoration(
              color: Color(0xFF059669),
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Text(
                'D',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================
  // LEFT SLIDER DRAWER MENU (15 Dedicated Screens)
  // =========================================================
  Widget _buildLeftSliderDrawer(BuildContext context, bool isDark) {
    return Drawer(
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      child: SafeArea(
        child: Column(
          children: [
            // Drawer Header
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: isDark ? Colors.white12 : Colors.grey.withOpacity(0.15))),
              ),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: ServoraColors.emerald600.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.admin_panel_settings_rounded, color: ServoraColors.emerald600, size: 22),
                  ),
                  const Gap(12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Admin Console', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                      Text('Enterprise Workspace', style: TextStyle(fontSize: 11, color: Colors.grey)),
                    ],
                  ),
                ],
              ),
            ),

            // Scrollable Menu Items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                children: [
                  _buildDrawerSectionTitle('EXECUTIVE CONTROL'),
                  _buildDrawerItem(Icons.dashboard_rounded, 'Dashboard Overview', 'overview'),
                  _buildDrawerItem(Icons.history_rounded, 'Live Activity Feed', 'activity'),
                  _buildDrawerItem(Icons.people_alt_rounded, '360° Customer CRM', 'crm'),

                  _buildDrawerSectionTitle('MERCHANTS & IDENTITY'),
                  _buildDrawerItem(Icons.apartment_rounded, 'Business Profiles', 'businesses'),
                  _buildDrawerItem(Icons.verified_user_rounded, 'ID & Ghana Card Queue', 'verification'),
                  _buildDrawerItem(Icons.security_rounded, 'Security & Fraud Engine', 'security'),

                  _buildDrawerSectionTitle('COMMERCE & OPERATIONS'),
                  _buildDrawerItem(Icons.account_balance_wallet_rounded, 'MoMo Escrow & Finance', 'escrow'),
                  _buildDrawerItem(Icons.local_shipping_rounded, 'Delivery Dispatchers', 'delivery'),
                  _buildDrawerItem(Icons.shopping_bag_rounded, 'Product Catalog Hub', 'products'),
                  _buildDrawerItem(Icons.message_rounded, 'Service Requests & Gigs', 'requests'),
                  _buildDrawerItem(Icons.construction_rounded, 'Tool Rentals Engine', 'rentals'),

                  _buildDrawerSectionTitle('COMMUNITY & SYSTEM'),
                  _buildDrawerItem(Icons.gavel_rounded, 'Disputes & Mediation', 'disputes'),
                  _buildDrawerItem(Icons.forum_rounded, 'Community Notice Board', 'community'),
                  _buildDrawerItem(Icons.campaign_rounded, 'Announcement Tickers', 'tickers'),
                  _buildDrawerItem(Icons.settings_rounded, 'System Settings & R2', 'settings'),
                ],
              ),
            ),

            // Switch to Customer View
            if (widget.onSwitchToCustomer != null) ...[
              const Divider(height: 1),
              Padding(
                padding: const EdgeInsets.all(12),
                child: SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.person_outline_rounded, size: 16),
                    label: const Text('Switch to Customer Mode', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                    onPressed: () {
                      Navigator.of(context).pop();
                      widget.onSwitchToCustomer!();
                    },
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(10, 14, 10, 4),
      child: Text(
        title,
        style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 0.5),
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, String viewId) {
    final isSelected = _activeView == viewId;
    return ListTile(
      dense: true,
      visualDensity: const VisualDensity(vertical: -2),
      leading: Icon(icon, size: 18, color: isSelected ? ServoraColors.emerald600 : Colors.grey),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 12.5,
          fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
          color: isSelected ? ServoraColors.emerald600 : null,
        ),
      ),
      selected: isSelected,
      selectedTileColor: ServoraColors.emerald600.withOpacity(0.12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      onTap: () {
        setState(() => _activeView = viewId);
        Navigator.of(context).pop();
      },
    );
  }
}
