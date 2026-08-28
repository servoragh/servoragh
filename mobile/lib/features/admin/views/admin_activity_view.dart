import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../app/theme/servora_colors.dart';

class AdminActivityView extends StatefulWidget {
  final List<dynamic> auditLogs;
  final VoidCallback onRefresh;

  const AdminActivityView({
    super.key,
    required this.auditLogs,
    required this.onRefresh,
  });

  @override
  State<AdminActivityView> createState() => _AdminActivityViewState();
}

class _AdminActivityViewState extends State<AdminActivityView> {
  String _activityFilter = 'ALL';
  String _activitySearch = '';

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

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filteredLogs = widget.auditLogs.where((log) {
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
        // Live Activity Header & Sync Badge
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
                onPressed: widget.onRefresh,
              ),
            ],
          ),
        ),
        const Gap(12),

        // Search Bar
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

        // Category Filter Chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildActivityFilterChip('All Events (${widget.auditLogs.length})', 'ALL'),
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

        // Activity Stream List
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
            itemBuilder: (context, idx) => _buildAuditLogRow(context, filteredLogs[idx], isDark),
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

  Widget _buildAuditLogRow(BuildContext context, dynamic log, bool isDark) {
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
}
