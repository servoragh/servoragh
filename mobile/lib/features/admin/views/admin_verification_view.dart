import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../core/services/marketplace_api_service.dart';

class AdminVerificationView extends StatefulWidget {
  final List<dynamic> providers;
  final VoidCallback onRefresh;
  final Function(String action, {String? targetId, dynamic payload}) onAdminAction;

  const AdminVerificationView({
    super.key,
    required this.providers,
    required this.onRefresh,
    required this.onAdminAction,
  });

  @override
  State<AdminVerificationView> createState() => _AdminVerificationViewState();
}

class _AdminVerificationViewState extends State<AdminVerificationView> {
  // Tabs matching Web App: ALL, BUSINESS, PROVIDER, DELIVERY, REQUEST
  String _activeTab = 'ALL';
  String _statusFilter = 'ALL';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  List<Map<String, dynamic>> _queueItems = [];
  bool _isLoading = true;
  String? _loadError;

  @override
  void initState() {
    super.initState();
    _fetchQueue();
  }

  @override
  void didUpdateWidget(covariant AdminVerificationView oldWidget) {
    super.didUpdateWidget(oldWidget);
    // If widget.providers changed and our queue was empty, re-check
    if (_queueItems.isEmpty) {
      _fetchQueue();
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchQueue() async {
    setState(() {
      _isLoading = true;
      _loadError = null;
    });

    try {
      final items = await MarketplaceApiService.fetchVerificationQueue();
      if (mounted) {
        if (items.isNotEmpty) {
          setState(() {
            _queueItems = items;
            _isLoading = false;
          });
        } else if (widget.providers.isNotEmpty) {
          // Fallback mapping from widget.providers if /admin/verify returned empty
          final fallbackQueue = widget.providers.map<Map<String, dynamic>>((p) {
            final isVer = p['verificationStatus'] == 'VERIFIED';
            final isRej = p['verificationStatus'] == 'REJECTED';
            final status = isVer ? 'VERIFIED' : (isRej ? 'REJECTED' : 'PENDING');
            return {
              'id': p['id']?.toString() ?? '',
              'userId': p['userId']?.toString() ?? '',
              'targetType': 'PROVIDER',
              'name': p['businessName'] ?? p['user']?['name'] ?? 'Artisan Storefront',
              'phone': p['phone'] ?? p['user']?['phone'] ?? '',
              'idType': p['idCardNumber'] != null ? 'Ghana Card (National ID)' : 'Artisan Profile',
              'idNumber': p['idCardNumber'] ?? p['idNumber'] ?? 'Not Specified',
              'documentUrl': p['idCardPhotoUrl'] ?? p['documentUrl'],
              'selfieUrl': p['user']?['avatarUrl'] ?? p['selfieUrl'],
              'businessCertUrl': p['businessCertUrl'],
              'storefrontPhotoUrl': p['storefrontPhotoUrl'],
              'area': p['serviceArea'] ?? p['zone'] ?? 'Tamale',
              'status': status,
              'createdAt': p['createdAt']?.toString() ?? DateTime.now().toIso8601String(),
            };
          }).toList();

          setState(() {
            _queueItems = fallbackQueue;
            _isLoading = false;
          });
        } else {
          setState(() {
            _queueItems = [];
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loadError = 'Failed to load verification queue: $e';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleVerificationDecision({
    required Map<String, dynamic> item,
    required String newStatus,
    String? rejectionNotes,
  }) async {
    final targetId = item['id']?.toString() ?? '';
    final targetType = item['targetType']?.toString() ?? 'PROVIDER';

    // Optimistically update local state immediately
    setState(() {
      final index = _queueItems.indexWhere((q) => q['id']?.toString() == targetId);
      if (index != -1) {
        _queueItems[index]['status'] = newStatus;
      }
    });

    final res = await MarketplaceApiService.submitVerificationAction(
      targetId: targetId,
      targetType: targetType,
      status: newStatus,
      notes: rejectionNotes,
    );

    if (mounted) {
      if (res['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: newStatus == 'VERIFIED' ? ServoraColors.emerald600 : Colors.red[700],
            content: Text(
              newStatus == 'VERIFIED'
                  ? '🎉 ${item['name']} approved & awarded verified badge!'
                  : '❌ ${item['name']} verification disapproved & rejected.',
            ),
          ),
        );
        // Notify parent admin view to sync stats and tables
        widget.onAdminAction(
          'VERIFY_${targetType}_$newStatus',
          targetId: targetId,
          payload: {'status': newStatus, 'notes': rejectionNotes},
        );
        widget.onRefresh();
      } else {
        // Revert or show error
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.amber[900],
            content: Text('Notice: Action saved locally. (${res['error'] ?? 'Sync error'})'),
          ),
        );
        widget.onRefresh();
      }
    }
  }

  List<Map<String, dynamic>> _getFilteredItems() {
    return _queueItems.where((item) {
      final search = _searchQuery.trim().toLowerCase();
      final name = (item['name'] ?? '').toString().toLowerCase();
      final idNumber = (item['idNumber'] ?? '').toString().toLowerCase();
      final phone = (item['phone'] ?? '').toString().toLowerCase();
      final area = (item['area'] ?? '').toString().toLowerCase();

      final matchesSearch = search.isEmpty ||
          name.contains(search) ||
          idNumber.contains(search) ||
          phone.contains(search) ||
          area.contains(search);

      if (!matchesSearch) return false;

      // Category tab filter
      if (_activeTab != 'ALL' && item['targetType'] != _activeTab) {
        return false;
      }

      // Status chip filter
      if (_statusFilter == 'PENDING' && item['status'] != 'PENDING') {
        return false;
      }
      if (_statusFilter == 'VERIFIED' && item['status'] != 'VERIFIED') {
        return false;
      }
      if (_statusFilter == 'REJECTED' && item['status'] != 'REJECTED') {
        return false;
      }

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final filteredItems = _getFilteredItems();

    final pendingCount = _queueItems.where((i) => i['status'] == 'PENDING').length;
    final verifiedCount = _queueItems.where((i) => i['status'] == 'VERIFIED').length;
    final rejectedCount = _queueItems.where((i) => i['status'] == 'REJECTED').length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Header Banner
        _buildHeader(isDark, pendingCount),
        const Gap(12),

        // 2. Category Tabs (Web parity)
        _buildCategoryTabs(isDark),
        const Gap(10),

        // 3. Search and Status Filter Toolbar
        _buildSearchAndStatusToolbar(isDark, pendingCount, verifiedCount, rejectedCount),
        const Gap(14),

        // 4. Content List
        if (_isLoading)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Center(child: CircularProgressIndicator(color: ServoraColors.emerald600)),
          )
        else if (_loadError != null)
          _buildErrorState(isDark)
        else if (filteredItems.isEmpty)
          _buildEmptyState(isDark)
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filteredItems.length,
            separatorBuilder: (_, __) => const Gap(12),
            itemBuilder: (context, index) {
              final item = filteredItems[index];
              return _buildVerificationCard(item, isDark);
            },
          ),
      ],
    );
  }

  // =========================================================================
  // HEADER
  // =========================================================================
  Widget _buildHeader(bool isDark, int pendingCount) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.shield_rounded, color: Colors.amber, size: 24),
          ),
          const Gap(12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'ID & Ghana Card Command Center',
                  style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900),
                ),
                const Gap(2),
                Text(
                  'Audit national ID cards, driver licenses, selfies & business certificates across all user tiers.',
                  style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey[600]),
                ),
                const Gap(8),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.amber.withOpacity(0.4)),
                      ),
                      child: Text(
                        '$pendingCount Pending Review 🟡',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.amber),
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.refresh_rounded, size: 18, color: ServoraColors.emerald600),
                      tooltip: 'Refresh Queue',
                      onPressed: () {
                        _fetchQueue();
                        widget.onRefresh();
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // CATEGORY TABS (Matching Web App)
  // =========================================================================
  Widget _buildCategoryTabs(bool isDark) {
    final categories = [
      {'id': 'ALL', 'label': 'All Verifications 📋', 'count': _queueItems.length},
      {
        'id': 'BUSINESS',
        'label': 'Merchant Storefronts 🏬',
        'count': _queueItems.where((i) => i['targetType'] == 'BUSINESS').length,
      },
      {
        'id': 'PROVIDER',
        'label': 'Artisans & Technicians 🛠️',
        'count': _queueItems.where((i) => i['targetType'] == 'PROVIDER').length,
      },
      {
        'id': 'DELIVERY',
        'label': 'Delivery Fleet Riders 🛵',
        'count': _queueItems.where((i) => i['targetType'] == 'DELIVERY').length,
      },
      {
        'id': 'REQUEST',
        'label': 'General User Requests 👤',
        'count': _queueItems.where((i) => i['targetType'] == 'REQUEST').length,
      },
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: categories.map((cat) {
          final isSelected = _activeTab == cat['id'];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
              onTap: () => setState(() => _activeTab = cat['id'] as String),
              borderRadius: BorderRadius.circular(14),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                decoration: BoxDecoration(
                  color: isSelected
                      ? (isDark ? Colors.white : const Color(0xFF0F172A))
                      : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected
                        ? Colors.transparent
                        : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                  ),
                ),
                child: Row(
                  children: [
                    Text(
                      cat['label'] as String,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                        color: isSelected
                            ? (isDark ? const Color(0xFF0F172A) : Colors.white)
                            : (isDark ? Colors.white70 : const Color(0xFF475569)),
                      ),
                    ),
                    const Gap(6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? (isDark ? Colors.black12 : Colors.white24)
                            : (isDark ? Colors.white12 : Colors.black12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${cat['count']}',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: isSelected
                              ? (isDark ? const Color(0xFF0F172A) : Colors.white)
                              : (isDark ? Colors.white70 : const Color(0xFF475569)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // =========================================================================
  // SEARCH & STATUS TOOLBAR
  // =========================================================================
  Widget _buildSearchAndStatusToolbar(
    bool isDark,
    int pendingCount,
    int verifiedCount,
    int rejectedCount,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Search Input
          Container(
            height: 40,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF090D16) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, size: 16, color: Colors.grey),
                const Gap(8),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) => setState(() => _searchQuery = val),
                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600),
                    decoration: const InputDecoration(
                      hintText: 'Search applicant name, Ghana Card ID, phone, area...',
                      hintStyle: TextStyle(fontSize: 11, color: Colors.grey),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                ),
                if (_searchQuery.isNotEmpty)
                  GestureDetector(
                    onTap: () {
                      _searchController.clear();
                      setState(() => _searchQuery = '');
                    },
                    child: const Icon(Icons.close_rounded, size: 16, color: Colors.grey),
                  ),
              ],
            ),
          ),
          const Gap(10),

          // Status Filter Chips: All, Pending, Verified, Rejected
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildStatusChip('ALL', 'All (${_queueItems.length})', isDark, null),
                const Gap(6),
                _buildStatusChip('PENDING', '⏳ Pending ($pendingCount)', isDark, Colors.amber[800]),
                const Gap(6),
                _buildStatusChip('VERIFIED', '🛡️ Verified ($verifiedCount)', isDark, ServoraColors.emerald600),
                const Gap(6),
                _buildStatusChip('REJECTED', '❌ Rejected ($rejectedCount)', isDark, Colors.red[700]),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status, String label, bool isDark, Color? activeColor) {
    final isSelected = _statusFilter == status;
    return InkWell(
      onTap: () => setState(() => _statusFilter = status),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected
              ? (activeColor ?? (isDark ? Colors.white : const Color(0xFF0F172A)))
              : (isDark ? const Color(0xFF090D16) : const Color(0xFFF1F5F9)),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
            color: isSelected
                ? Colors.white
                : (isDark ? Colors.white70 : const Color(0xFF475569)),
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // VERIFICATION CARD (Always allows Inspection, whether Verified or not)
  // =========================================================================
  Widget _buildVerificationCard(Map<String, dynamic> item, bool isDark) {
    final isVerified = item['status'] == 'VERIFIED';
    final isRejected = item['status'] == 'REJECTED';
    final isPending = item['status'] == 'PENDING';

    final name = item['name'] ?? 'Applicant';
    final phone = item['phone'] ?? 'N/A';
    final area = item['area'] ?? 'Tamale';
    final idType = item['idType'] ?? 'Ghana Card';
    final idNumber = item['idNumber'] ?? 'Not Specified';
    final targetType = item['targetType'] ?? 'USER';
    final selfieUrl = item['selfieUrl']?.toString();
    final documentUrl = item['documentUrl']?.toString();

    return ServoraCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Top Row: Avatar + Name + Badges
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar / Selfie thumbnail
              GestureDetector(
                onTap: () => _openInspectionModal(item),
                child: Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isVerified
                          ? ServoraColors.emerald600
                          : (isPending ? Colors.amber : Colors.grey.withOpacity(0.3)),
                      width: 1.5,
                    ),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: selfieUrl != null && selfieUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: selfieUrl,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => const Center(
                            child: SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: ServoraColors.emerald600),
                            ),
                          ),
                          errorWidget: (_, __, ___) => _buildAvatarFallback(name),
                        )
                      : _buildAvatarFallback(name),
                ),
              ),
              const Gap(10),

              // Title and Meta
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            name,
                            style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        // Status Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: isVerified
                                ? const Color(0xFFECFDF5)
                                : (isPending ? const Color(0xFFFEF3C7) : const Color(0xFFFFE4E6)),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isVerified
                                  ? const Color(0xFFA7F3D0)
                                  : (isPending ? const Color(0xFFFDE68A) : const Color(0xFFFECDD3)),
                            ),
                          ),
                          child: Text(
                            isVerified ? 'VERIFIED' : (isPending ? 'PENDING' : 'REJECTED'),
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                              color: isVerified
                                  ? const Color(0xFF047857)
                                  : (isPending ? const Color(0xFFB45309) : const Color(0xFFBE123C)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Gap(2),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            targetType,
                            style: TextStyle(
                              fontSize: 8.5,
                              fontWeight: FontWeight.w800,
                              color: isDark ? Colors.white70 : const Color(0xFF475569),
                            ),
                          ),
                        ),
                        const Gap(6),
                        Expanded(
                          child: Text(
                            'Phone: $phone • 📍 $area',
                            style: TextStyle(fontSize: 10.5, color: isDark ? Colors.white60 : Colors.grey[700]),
                            maxLines: 1,
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
          const Gap(10),

          // ID Number & Type Container
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF090D16) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$idType NUMBER:'.toUpperCase(),
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey),
                      ),
                      const Gap(2),
                      Text(
                        idNumber,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.8,
                          color: isVerified ? ServoraColors.emerald600 : null,
                        ),
                      ),
                    ],
                  ),
                ),
                // Indicator for Document Upload
                if (documentUrl != null && documentUrl.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: ServoraColors.emerald600.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.attachment_rounded, size: 12, color: ServoraColors.emerald600),
                        Gap(3),
                        Text(
                          'File Attached',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                        ),
                      ],
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.grey.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'No File',
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey),
                    ),
                  ),
              ],
            ),
          ),
          const Gap(10),

          // Action Buttons: Inspect Document & Selfie is ALWAYS accessible at any time!
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber[500],
                    foregroundColor: const Color(0xFF1E293B),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.remove_red_eye_rounded, size: 15),
                  label: const Text(
                    'Inspect Document & Selfie 👁️',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
                  ),
                  onPressed: () => _openInspectionModal(item),
                ),
              ),
              const Gap(8),
              // Quick Toggle / Action
              if (isVerified)
                IconButton(
                  tooltip: 'Revoke Verification',
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.red.withOpacity(0.1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.close_rounded, size: 16, color: Colors.red),
                  onPressed: () => _promptRejectionDialog(item),
                )
              else
                IconButton(
                  tooltip: 'Quick Approve Ghana Card',
                  style: IconButton.styleFrom(
                    backgroundColor: ServoraColors.emerald600.withOpacity(0.1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.verified_user_rounded, size: 16, color: ServoraColors.emerald600),
                  onPressed: () => _handleVerificationDecision(item: item, newStatus: 'VERIFIED'),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarFallback(String name) {
    return Container(
      color: ServoraColors.emerald600.withOpacity(0.15),
      alignment: Alignment.center,
      child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : 'U',
        style: const TextStyle(fontWeight: FontWeight.w900, color: ServoraColors.emerald600, fontSize: 16),
      ),
    );
  }

  // =========================================================================
  // INTERACTIVE INSPECTION MODAL (Full inspection parity with Web App)
  // =========================================================================
  void _openInspectionModal(Map<String, dynamic> item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return _InspectionModalSheet(
          item: item,
          onDecision: (newStatus, notes) {
            Navigator.of(ctx).pop();
            _handleVerificationDecision(
              item: item,
              newStatus: newStatus,
              rejectionNotes: notes,
            );
          },
        );
      },
    );
  }

  void _promptRejectionDialog(Map<String, dynamic> item) {
    final noteCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: Text('Revoke / Reject ID for ${item['name']}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Mandatory Rejection Reason (Notified to User):',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
              ),
              const Gap(8),
              TextField(
                controller: noteCtrl,
                maxLines: 3,
                style: const TextStyle(fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'e.g. Ghana Card image is blurry or expired. Please upload a clear photo of your original card.',
                  hintStyle: const TextStyle(fontSize: 11, color: Colors.grey),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700], foregroundColor: Colors.white),
              onPressed: () {
                final notes = noteCtrl.text.trim();
                Navigator.of(ctx).pop();
                _handleVerificationDecision(
                  item: item,
                  newStatus: 'REJECTED',
                  rejectionNotes: notes.isNotEmpty ? notes : 'Document rejected upon admin inspection.',
                );
              },
              child: const Text('Confirm Rejection'),
            ),
          ],
        );
      },
    );
  }

  // =========================================================================
  // EMPTY & ERROR STATES
  // =========================================================================
  Widget _buildEmptyState(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          const Icon(Icons.check_circle_outline_rounded, size: 48, color: ServoraColors.emerald600),
          const Gap(10),
          const Text(
            'No matching verification records',
            style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
          ),
          const Gap(4),
          Text(
            _searchQuery.isNotEmpty
                ? 'Try adjusting your search criteria.'
                : 'All verifications for this filter have been addressed.',
            style: const TextStyle(fontSize: 11, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.red.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          const Icon(Icons.error_outline_rounded, size: 36, color: Colors.red),
          const Gap(8),
          Text(
            _loadError ?? 'Error loading verification records',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.red),
            textAlign: TextAlign.center,
          ),
          const Gap(10),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: ServoraColors.emerald600,
              foregroundColor: Colors.white,
            ),
            icon: const Icon(Icons.refresh_rounded, size: 14),
            label: const Text('Retry', style: TextStyle(fontSize: 11)),
            onPressed: _fetchQueue,
          ),
        ],
      ),
    );
  }
}

// ===========================================================================
// INSPECTION MODAL BOTTOM SHEET
// ===========================================================================
class _InspectionModalSheet extends StatefulWidget {
  final Map<String, dynamic> item;
  final Function(String newStatus, String? notes) onDecision;

  const _InspectionModalSheet({
    required this.item,
    required this.onDecision,
  });

  @override
  State<_InspectionModalSheet> createState() => _InspectionModalSheetState();
}

class _InspectionModalSheetState extends State<_InspectionModalSheet> {
  bool _showRejectForm = false;
  final TextEditingController _rejectionNotesController = TextEditingController();

  @override
  void dispose() {
    _rejectionNotesController.dispose();
    super.dispose();
  }

  void _openImageZoom(BuildContext context, String imageUrl, String title) {
    showDialog(
      context: context,
      barrierColor: Colors.black87,
      builder: (ctx) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(12),
          child: Stack(
            alignment: Alignment.center,
            children: [
              InteractiveViewer(
                minScale: 0.8,
                maxScale: 4.5,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: CachedNetworkImage(
                    imageUrl: imageUrl,
                    fit: BoxFit.contain,
                    placeholder: (_, __) => const Center(
                      child: CircularProgressIndicator(color: ServoraColors.emerald600),
                    ),
                    errorWidget: (_, __, ___) => Container(
                      padding: const EdgeInsets.all(20),
                      color: Colors.black54,
                      child: const Text('Could not load image', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 8,
                right: 8,
                child: CircleAvatar(
                  backgroundColor: Colors.black54,
                  child: IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ),
              ),
              Positioned(
                bottom: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xBF000000),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    title,
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _launchExternal(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final item = widget.item;

    final targetType = item['targetType'] ?? 'PROVIDER';
    final name = item['name'] ?? 'Applicant';
    final idType = item['idType'] ?? 'Ghana Card';
    final idNumber = item['idNumber'] ?? 'Not Specified';
    final status = item['status'] ?? 'PENDING';
    final isVerified = status == 'VERIFIED';

    final documentUrl = item['documentUrl']?.toString();
    final selfieUrl = item['selfieUrl']?.toString();
    final businessCertUrl = item['businessCertUrl']?.toString();
    final storefrontPhotoUrl = item['storefrontPhotoUrl']?.toString();

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.amber.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.amber.withOpacity(0.3)),
                        ),
                        child: Text(
                          '$targetType VERIFICATION AUDIT',
                          style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.amber),
                        ),
                      ),
                      const Gap(4),
                      Text(
                        name,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        'ID Type: $idType • Number: $idNumber',
                        style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey[700]),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Scrollable Body
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Current Verification Status Notice
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isVerified
                          ? ServoraColors.emerald600.withOpacity(0.1)
                          : Colors.amber.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isVerified
                            ? ServoraColors.emerald600.withOpacity(0.3)
                            : Colors.amber.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isVerified ? Icons.verified_rounded : Icons.info_outline_rounded,
                          size: 16,
                          color: isVerified ? ServoraColors.emerald600 : Colors.amber,
                        ),
                        const Gap(8),
                        Expanded(
                          child: Text(
                            isVerified
                                ? 'This profile is currently VERIFIED on Servora. You can inspect documents or revoke at any time.'
                                : 'This profile is $status. Inspect the ID photo & selfie comparison below before making a decision.',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isVerified ? ServoraColors.emerald600 : Colors.amber[900],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Gap(16),

                  // Ghana Card / ID Document Photo
                  _buildPhotoSection(
                    title: 'Ghana Card / ID Document Photo:',
                    imageUrl: documentUrl,
                    isDark: isDark,
                    onZoom: () {
                      if (documentUrl != null) {
                        _openImageZoom(context, documentUrl, 'Ghana Card / ID Document');
                      }
                    },
                    emptyText: 'No Document File Uploaded',
                    emptySubtext: 'Applicant submitted ID number without a file attachment',
                    icon: Icons.badge_outlined,
                  ),
                  const Gap(16),

                  // Live Selfie / Facial Comparison Photo
                  _buildPhotoSection(
                    title: 'Live Selfie / Facial Comparison Photo:',
                    imageUrl: selfieUrl,
                    isDark: isDark,
                    onZoom: () {
                      if (selfieUrl != null) {
                        _openImageZoom(context, selfieUrl, 'Live Facial Selfie');
                      }
                    },
                    emptyText: 'No Selfie Photo Uploaded',
                    emptySubtext: 'No avatar or live selfie uploaded',
                    icon: Icons.face_rounded,
                  ),
                  const Gap(16),

                  // Business Registration Certificate (RGD/ORC) if available
                  if (businessCertUrl != null && businessCertUrl.isNotEmpty) ...[
                    _buildAttachmentCard(
                      title: 'Business Registration Certificate (RGD/ORC) Attached',
                      icon: Icons.business_center_rounded,
                      url: businessCertUrl,
                      isDark: isDark,
                    ),
                    const Gap(12),
                  ],

                  // Physical Storefront Photo with GPS if available
                  if (storefrontPhotoUrl != null && storefrontPhotoUrl.isNotEmpty) ...[
                    _buildAttachmentCard(
                      title: 'Physical Storefront Photo with GPS Attached',
                      icon: Icons.store_rounded,
                      url: storefrontPhotoUrl,
                      isDark: isDark,
                    ),
                    const Gap(12),
                  ],

                  const Gap(10),

                  // Rejection Form or Action Buttons
                  if (_showRejectForm)
                    _buildRejectionForm(isDark)
                  else
                    _buildActionButtons(isVerified),

                  const Gap(20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoSection({
    required String title,
    required String? imageUrl,
    required bool isDark,
    required VoidCallback onZoom,
    required String emptyText,
    required String emptySubtext,
    required IconData icon,
  }) {
    final hasImage = imageUrl != null && imageUrl.isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title.toUpperCase(),
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey),
        ),
        const Gap(6),
        Container(
          height: 180,
          width: double.infinity,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
          ),
          clipBehavior: Clip.antiAlias,
          child: hasImage
              ? Stack(
                  children: [
                    Positioned.fill(
                      child: CachedNetworkImage(
                        imageUrl: imageUrl,
                        fit: BoxFit.contain,
                        placeholder: (_, __) => const Center(
                          child: CircularProgressIndicator(color: ServoraColors.emerald600),
                        ),
                        errorWidget: (_, __, ___) => Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.broken_image_rounded, size: 36, color: Colors.grey),
                              const Gap(6),
                              Text('Image Preview Unavailable', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 8,
                      right: 8,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.black.withOpacity(0.75),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          elevation: 0,
                        ),
                        icon: const Icon(Icons.zoom_in_rounded, size: 14),
                        label: const Text('Zoom Preview ↗', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                        onPressed: onZoom,
                      ),
                    ),
                  ],
                )
              : Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(icon, size: 36, color: Colors.grey.withOpacity(0.4)),
                      const Gap(6),
                      Text(emptyText, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                      const Gap(2),
                      Text(emptySubtext, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                    ],
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildAttachmentCard({
    required String title,
    required IconData icon,
    required String url,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: ServoraColors.emerald600),
          const Gap(10),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: ServoraColors.emerald600,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              if (url.startsWith('http')) {
                _openImageZoom(context, url, title);
              } else {
                _launchExternal(url);
              }
            },
            child: const Text('View File', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildRejectionForm(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.red.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Mandatory Rejection Reason (Notified to User):',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.red),
          ),
          const Gap(8),
          TextField(
            controller: _rejectionNotesController,
            maxLines: 3,
            style: const TextStyle(fontSize: 11.5),
            decoration: InputDecoration(
              hintText: 'e.g. Ghana Card image is blurry or expired. Please upload a clear photo of your original card.',
              hintStyle: const TextStyle(fontSize: 11, color: Colors.grey),
              filled: true,
              fillColor: isDark ? const Color(0xFF0F172A) : Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: Colors.red.withOpacity(0.4)),
              ),
              contentPadding: const EdgeInsets.all(10),
            ),
          ),
          const Gap(12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => setState(() => _showRejectForm = false),
                child: const Text('Cancel', style: TextStyle(fontSize: 11)),
              ),
              const Gap(8),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red[700],
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () {
                  final notes = _rejectionNotesController.text.trim();
                  widget.onDecision('REJECTED', notes.isNotEmpty ? notes : 'Document rejected upon admin audit.');
                },
                child: const Text('Confirm Rejection', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(bool isVerified) {
    return Row(
      children: [
        // Reject / Disapprove Button
        Expanded(
          child: OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.red[700],
              side: BorderSide(color: Colors.red.withOpacity(0.5)),
              padding: const EdgeInsets.symmetric(vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.person_off_rounded, size: 16),
            label: Text(
              isVerified ? 'Revoke Verification' : 'Disapprove & Reject ID',
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
            ),
            onPressed: () => setState(() => _showRejectForm = true),
          ),
        ),
        const Gap(10),

        // Approve Button
        Expanded(
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: ServoraColors.emerald600,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            icon: const Icon(Icons.verified_user_rounded, size: 16),
            label: Text(
              isVerified ? 'Re-Approve Badge' : 'Approve & Award Badge 🎉',
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
            ),
            onPressed: () => widget.onDecision('VERIFIED', null),
          ),
        ),
      ],
    );
  }
}
