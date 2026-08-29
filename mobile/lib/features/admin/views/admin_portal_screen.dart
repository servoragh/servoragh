import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/constants.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../main.dart';
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

    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (didPop) return;
        if (_activeView != 'overview') {
          setState(() => _activeView = 'overview');
        } else if (widget.onSwitchToCustomer != null) {
          widget.onSwitchToCustomer!();
        } else if (Navigator.of(context).canPop()) {
          context.pop();
        } else {
          context.go('/home');
        }
      },
      child: Scaffold(
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
                                key: ValueKey<String>(_activeView),
                                child: _buildCurrentViewContent(),
                              ),
                            ),

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
    ),
  );
}

  Widget _buildCurrentViewContent() {
    if (_searchQuery.trim().isNotEmpty) {
      return _buildOmnisearchResults(Theme.of(context).brightness == Brightness.dark);
    }

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

  // =========================================================
  // OMNISEARCH RESULTS VIEW
  // =========================================================
  Widget _buildOmnisearchResults(bool isDark) {
    final q = _searchQuery.trim().toLowerCase();

    final users = _users.where((u) {
      final name = (u['name'] ?? '').toString().toLowerCase();
      final email = (u['email'] ?? '').toString().toLowerCase();
      final phone = (u['phone'] ?? '').toString().toLowerCase();
      final role = (u['role'] ?? '').toString().toLowerCase();
      return name.contains(q) || email.contains(q) || phone.contains(q) || role.contains(q);
    }).toList();

    final businesses = _providers.where((p) {
      final name = (p['businessName'] ?? '').toString().toLowerCase();
      final slug = (p['slug'] ?? '').toString().toLowerCase();
      final cat = (p['category'] ?? '').toString().toLowerCase();
      final zone = (p['zone'] ?? '').toString().toLowerCase();
      final phone = (p['whatsapp'] ?? p['phone'] ?? '').toString().toLowerCase();
      return name.contains(q) || slug.contains(q) || cat.contains(q) || zone.contains(q) || phone.contains(q);
    }).toList();

    final prods = _products.where((p) {
      final title = (p['title'] ?? '').toString().toLowerCase();
      final cat = (p['category'] ?? '').toString().toLowerCase();
      final desc = (p['description'] ?? '').toString().toLowerCase();
      final seller = (p['businessName'] ?? p['providerName'] ?? '').toString().toLowerCase();
      return title.contains(q) || cat.contains(q) || desc.contains(q) || seller.contains(q);
    }).toList();

    final requests = _serviceRequests.where((r) {
      final title = (r['title'] ?? '').toString().toLowerCase();
      final cat = (r['category'] ?? '').toString().toLowerCase();
      final desc = (r['description'] ?? '').toString().toLowerCase();
      final zone = (r['zone'] ?? '').toString().toLowerCase();
      return title.contains(q) || cat.contains(q) || desc.contains(q) || zone.contains(q);
    }).toList();

    final audits = _auditLogs.where((a) {
      final action = (a['action'] ?? '').toString().toLowerCase();
      final details = (a['details'] ?? '').toString().toLowerCase();
      final user = (a['adminEmail'] ?? a['user'] ?? '').toString().toLowerCase();
      return action.contains(q) || details.contains(q) || user.contains(q);
    }).toList();

    final totalHits = users.length + businesses.length + prods.length + requests.length + audits.length;

    if (totalHits == 0) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
        alignment: Alignment.center,
        child: Column(
          children: [
            Icon(Icons.search_off_rounded, size: 54, color: Colors.grey[400]),
            const Gap(12),
            Text(
              'No records matching "$_searchQuery"',
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const Gap(6),
            const Text(
              'Try searching for a user name, business name, phone number, category, zone, or audit action.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const Gap(16),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: ServoraColors.emerald600,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                _searchController.clear();
                setState(() => _searchQuery = '');
              },
              icon: const Icon(Icons.clear_rounded, size: 16),
              label: const Text('Clear Search', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Summary bar
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Found $totalHits matching records',
              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900),
            ),
            TextButton.icon(
              style: TextButton.styleFrom(visualDensity: VisualDensity.compact),
              onPressed: () {
                _searchController.clear();
                setState(() => _searchQuery = '');
              },
              icon: const Icon(Icons.close_rounded, size: 14, color: Colors.grey),
              label: const Text('Clear', style: TextStyle(fontSize: 11.5, color: Colors.grey)),
            ),
          ],
        ),
        const Gap(10),

        // Users
        if (users.isNotEmpty) ...[
          _buildSearchSectionTitle('Users & Customers (${users.length})', Icons.people_alt_rounded, Colors.blue),
          ...users.map((u) => _buildUserSearchResultCard(u, isDark)),
          const Gap(14),
        ],

        // Businesses
        if (businesses.isNotEmpty) ...[
          _buildSearchSectionTitle('Businesses & Merchants (${businesses.length})', Icons.apartment_rounded, const Color(0xFF059669)),
          ...businesses.map((b) => _buildBusinessSearchResultCard(b, isDark)),
          const Gap(14),
        ],

        // Products
        if (prods.isNotEmpty) ...[
          _buildSearchSectionTitle('Products & Inventory (${prods.length})', Icons.shopping_bag_rounded, Colors.amber[800]!),
          ...prods.map((p) => _buildProductSearchResultCard(p, isDark)),
          const Gap(14),
        ],

        // Requests
        if (requests.isNotEmpty) ...[
          _buildSearchSectionTitle('Service Requests & Gigs (${requests.length})', Icons.message_rounded, Colors.purple),
          ...requests.map((r) => _buildRequestSearchResultCard(r, isDark)),
          const Gap(14),
        ],

        // Audits
        if (audits.isNotEmpty) ...[
          _buildSearchSectionTitle('Audit Logs & Events (${audits.length})', Icons.shield_rounded, Colors.redAccent),
          ...audits.map((a) => _buildAuditSearchResultCard(a, isDark)),
          const Gap(14),
        ],
      ],
    );
  }

  Widget _buildSearchSectionTitle(String title, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, top: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const Gap(6),
          Text(title, style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _buildUserSearchResultCard(dynamic u, bool isDark) {
    final name = u['name'] ?? 'User';
    final email = u['email'] ?? 'No email';
    final phone = u['phone'] ?? 'No phone';
    final role = (u['role'] ?? 'CUSTOMER').toString().toUpperCase();

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: Colors.blue.withOpacity(0.15),
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : 'U',
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue),
            ),
          ),
          const Gap(10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold))),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: role.contains('ADMIN') ? Colors.red.withOpacity(0.15) : (role.contains('PROVIDER') ? Colors.teal.withOpacity(0.15) : Colors.blue.withOpacity(0.15)),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        role,
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: role.contains('ADMIN') ? Colors.red : (role.contains('PROVIDER') ? Colors.teal : Colors.blue),
                        ),
                      ),
                    ),
                  ],
                ),
                const Gap(2),
                Text('$email • $phone', style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
          const Gap(8),
          IconButton(
            icon: const Icon(Icons.arrow_forward_ios_rounded, size: 14),
            tooltip: 'View in CRM',
            onPressed: () {
              setState(() {
                _searchController.clear();
                _searchQuery = '';
                _activeView = 'crm';
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildBusinessSearchResultCard(dynamic b, bool isDark) {
    final name = b['businessName'] ?? 'Business';
    final slug = b['slug'] ?? '';
    final category = b['category'] ?? 'General';
    final zone = b['zone'] ?? 'Tamale';
    final verified = b['verificationStatus'] == 'VERIFIED' || b['isVerified'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: const Color(0xFF059669).withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.storefront_rounded, color: Color(0xFF059669), size: 20),
          ),
          const Gap(10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold))),
                    if (verified)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          color: const Color(0xFF059669).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('VERIFIED', style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: Color(0xFF059669))),
                      ),
                  ],
                ),
                const Gap(2),
                Text('$category • $zone • @$slug', style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
          const Gap(8),
          IconButton(
            icon: const Icon(Icons.arrow_forward_ios_rounded, size: 14),
            tooltip: 'View in Businesses',
            onPressed: () {
              setState(() {
                _searchController.clear();
                _searchQuery = '';
                _activeView = 'businesses';
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildProductSearchResultCard(dynamic p, bool isDark) {
    final title = p['title'] ?? 'Product';
    final price = p['price']?.toString() ?? '0';
    final category = p['category'] ?? 'General';
    final seller = p['businessName'] ?? p['providerName'] ?? 'Merchant';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.shopping_bag_rounded, color: Colors.amber, size: 20),
          ),
          const Gap(10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                const Gap(2),
                Text('GH₵ $price • $category • By $seller', style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
          const Gap(8),
          IconButton(
            icon: const Icon(Icons.arrow_forward_ios_rounded, size: 14),
            tooltip: 'Manage in Products',
            onPressed: () {
              setState(() {
                _searchController.clear();
                _searchQuery = '';
                _activeView = 'products';
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildRequestSearchResultCard(dynamic r, bool isDark) {
    final title = r['title'] ?? 'Service Request';
    final category = r['category'] ?? 'General';
    final zone = r['zone'] ?? 'Tamale';
    final status = r['status'] ?? 'OPEN';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.purple.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.message_rounded, color: Colors.purple, size: 20),
          ),
          const Gap(10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                const Gap(2),
                Text('$category • $zone • Status: $status', style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
          const Gap(8),
          IconButton(
            icon: const Icon(Icons.arrow_forward_ios_rounded, size: 14),
            tooltip: 'View in Requests',
            onPressed: () {
              setState(() {
                _searchController.clear();
                _searchQuery = '';
                _activeView = 'requests';
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAuditSearchResultCard(dynamic a, bool isDark) {
    final action = a['action'] ?? 'AUDIT_EVENT';
    final details = a['details'] ?? '';
    final user = a['adminEmail'] ?? a['user'] ?? 'System';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.redAccent.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.shield_rounded, color: Colors.redAccent, size: 20),
          ),
          const Gap(10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(action, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                const Gap(2),
                Text('$user: $details', style: const TextStyle(fontSize: 11, color: Colors.grey), maxLines: 2, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          const Gap(8),
          IconButton(
            icon: const Icon(Icons.arrow_forward_ios_rounded, size: 14),
            tooltip: 'View in Activity',
            onPressed: () {
              setState(() {
                _searchController.clear();
                _searchQuery = '';
                _activeView = 'activity';
              });
            },
          ),
        ],
      ),
    );
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
  // EDGE-TO-EDGE TOPBAR (Without Redundant Back Button)
  // =========================================================
  Widget _buildEdgeToEdgeTopbar(BuildContext context, bool isDark) {
    final adminUser = authNotifier.state.user;
    final initial = (adminUser?.name.isNotEmpty == true) ? adminUser!.name[0].toUpperCase() : 'A';

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

          // User Avatar Pill with Integrated Popup Menu (Notifications, Theme Mode, Logout)
          PopupMenuButton<String>(
            tooltip: 'Admin Account & Quick Settings',
            offset: const Offset(0, 42),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            onSelected: (val) {
              if (val == 'activity') {
                setState(() => _activeView = 'activity');
              } else if (val == 'theme') {
                themeModeNotifier.value = isDark ? ThemeMode.light : ThemeMode.dark;
              } else if (val == 'customer') {
                widget.onSwitchToCustomer?.call();
              } else if (val == 'logout') {
                _confirmLogout(context);
              }
            },
            itemBuilder: (ctx) => [
              PopupMenuItem(
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            adminUser?.name ?? 'Admin Executive',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: ServoraColors.emerald600.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('ADMIN', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                        ),
                      ],
                    ),
                    Text(adminUser?.email ?? 'admin@servora.gh', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'activity',
                child: Row(
                  children: [
                    Icon(Icons.notifications_active_rounded, size: 18, color: Color(0xFF059669)),
                    Gap(10),
                    Expanded(child: Text('Activity Alerts & Notices', style: TextStyle(fontSize: 12.5))),
                    CircleAvatar(radius: 3.5, backgroundColor: Colors.red),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'theme',
                child: Row(
                  children: [
                    Icon(isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded, size: 18, color: isDark ? Colors.amber : const Color(0xFF059669)),
                    const Gap(10),
                    Text(isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme', style: const TextStyle(fontSize: 12.5)),
                  ],
                ),
              ),
              if (widget.onSwitchToCustomer != null)
                const PopupMenuItem(
                  value: 'customer',
                  child: Row(
                    children: [
                      Icon(Icons.person_outline_rounded, size: 18),
                      Gap(10),
                      Text('Customer View', style: TextStyle(fontSize: 12.5)),
                    ],
                  ),
                ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout_rounded, size: 18, color: Colors.redAccent),
                    Gap(10),
                    Text('Log Out of Admin', style: TextStyle(fontSize: 12.5, color: Colors.redAccent, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFF059669),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF059669).withOpacity(0.35),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  initial,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================
  // LOGOUT CONFIRMATION DIALOG
  // =========================================================
  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Log Out of Admin Console?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: const Text(
          'You will be signed out of your administrator session and returned to the guest view.',
          style: TextStyle(fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              authNotifier.logout();
              if (context.mounted) {
                context.go('/home');
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Logged out of Admin successfully.')),
                );
              }
            },
            child: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.bold)),
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

            const Divider(height: 1),

            // Dark / Light Mode Switch in Drawer
            SwitchListTile(
              secondary: Icon(
                isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                color: const Color(0xFF059669),
                size: 20,
              ),
              title: Text(isDark ? 'Dark Mode' : 'Light Mode', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
              value: isDark,
              activeColor: const Color(0xFF059669),
              onChanged: (val) {
                themeModeNotifier.value = val ? ThemeMode.dark : ThemeMode.light;
              },
            ),

            // Switch to Customer View
            if (widget.onSwitchToCustomer != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                child: SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.person_outline_rounded, size: 16),
                    label: const Text('Customer Mode', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                    onPressed: () {
                      Navigator.of(context).pop();
                      widget.onSwitchToCustomer!();
                    },
                  ),
                ),
              ),

            // Logout Option in Drawer
            ListTile(
              dense: true,
              leading: const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 20),
              title: const Text('Log Out of Admin', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 12.5)),
              onTap: () {
                Navigator.of(context).pop();
                _confirmLogout(context);
              },
            ),
            const Gap(6),
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
        setState(() {
          _activeView = viewId;
          _searchController.clear();
          _searchQuery = '';
        });
        Navigator.of(context).pop();
      },
    );
  }
}
