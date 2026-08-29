import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';

class AdminOverviewView extends StatelessWidget {
  final Map<String, dynamic> stats;
  final Map<String, dynamic> storageStats;
  final List<dynamic> auditLogs;
  final List<Map<String, dynamic>> launchTasks;
  final Function(int) onToggleLaunchTask;
  final Function(String) onNavigateToView;

  const AdminOverviewView({
    super.key,
    required this.stats,
    required this.storageStats,
    required this.auditLogs,
    required this.launchTasks,
    required this.onToggleLaunchTask,
    required this.onNavigateToView,
  });

  @override
  Widget build(BuildContext context) {
    final connections = stats['northStarWeeklyConnections'] ?? 83;
    final totalMerchants = stats['totalProviders'] ?? 11;
    final verifiedMerchants = stats['verifiedProviders'] ?? 7;
    final pendingVerifications = stats['pendingVerifications'] ?? 4;
    final totalProducts = stats['totalProducts'] ?? 46;
    final activeRequests = stats['totalRequests'] ?? 2;
    final storageMB = storageStats['totalStorageUsedMB'] ?? 4.55;

    final completedTasks = launchTasks.where((t) => t['done'] == true).length;
    final progressPercent = ((completedTasks / (launchTasks.isEmpty ? 1 : launchTasks.length)) * 100).round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 4 KPI Cards Grid
        Row(
          children: [
            Expanded(
              child: _buildKpiCard(
                context,
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
                context,
                title: 'Registered Merchants',
                value: '$totalMerchants',
                subtitle: '$verifiedMerchants Verified • $pendingVerifications Pending',
                icon: Icons.apartment_rounded,
                accentColor: const Color(0xFFD97706),
              ),
            ),
          ],
        ).animate().fadeIn(duration: 250.ms).slideY(begin: 0.05, end: 0),
        const Gap(10),
        Row(
          children: [
            Expanded(
              child: _buildKpiCard(
                context,
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
                context,
                title: 'Storage & Infrastructure',
                value: '$storageMB MB',
                subtitle: '100 GB Free Cap (Cloudflare R2)',
                icon: Icons.cloud_done_rounded,
                accentColor: const Color(0xFF0891B2),
              ),
            ),
          ],
        ).animate().fadeIn(delay: 50.ms, duration: 250.ms).slideY(begin: 0.05, end: 0),
        const Gap(16),

        // Zero-Capital Launch Mode Widget
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

              ...launchTasks.map((t) {
                final isDone = t['done'] == true;
                final id = t['id'] as int;
                return GestureDetector(
                  onTap: () => onToggleLaunchTask(id),
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

        // Urgent Action Queue
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
                context,
                title: 'Pending ID Approvals',
                subtitle: '$pendingVerifications Ghana Cards awaiting check',
                buttonLabel: 'Review',
                onTap: () => onNavigateToView('verification'),
              ),
              const Gap(8),
              _buildActionQueueRow(
                context,
                title: 'Product Moderation Queue',
                subtitle: '$totalProducts Guest & merchant items',
                buttonLabel: 'Open Queue',
                onTap: () => onNavigateToView('products'),
              ),
              const Gap(8),
              _buildActionQueueRow(
                context,
                title: 'Unresolved Disputes',
                subtitle: '0 Active disputes • System Healthy',
                buttonLabel: 'Inspect',
                onTap: () => onNavigateToView('disputes'),
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
                    onPressed: () => onNavigateToView('activity'),
                    child: const Text('View All ➔', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                  ),
                ],
              ),
              const Gap(8),
              ...auditLogs.take(5).map((log) => _buildSimpleAuditRow(context, log)),
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

  Widget _buildKpiCard(
    BuildContext context, {
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

  Widget _buildActionQueueRow(
    BuildContext context, {
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

  Widget _buildSimpleAuditRow(BuildContext context, dynamic log) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isDark ? Colors.black26 : const Color(0xFFF8FAFC),
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
}
