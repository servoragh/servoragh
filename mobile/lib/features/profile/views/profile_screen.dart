import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../main.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isMerchantMode = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final user = authNotifier.state.user;
    final String userRole = user?.role ?? 'CUSTOMER';
    final bool isAdmin = userRole == 'ADMIN' || userRole == 'SUPER_ADMIN';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Account & Profile 👤'),
        actions: [
          IconButton(
            icon: Icon(isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded, color: ServoraColors.emerald600),
            onPressed: () {
              themeModeNotifier.value = isDark ? ThemeMode.light : ThemeMode.dark;
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // User Header Profile Card
            ServoraCard(
              padding: const EdgeInsets.all(18),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
                    child: Text(
                      (user?.name ?? 'Guest User')[0],
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                    ),
                  ),
                  const Gap(14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              user?.name ?? 'Alhassan Ibrahim',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            if (isAdmin) ...[
                              const Gap(6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.red.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'ADMIN',
                                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.red),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const Gap(2),
                        Text(
                          user?.phone ?? '+233 24 000 0000',
                          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                        const Gap(8),
                        StatusBadge.verifiedGhanaCard(),
                      ],
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 200.ms),
            const Gap(16),

            // Mode Switcher Banner (Customer Buyer ↔ Merchant Seller)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _isMerchantMode ? const Color(0xFFFEF3C7) : ServoraColors.emerald600.withOpacity(0.12),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: _isMerchantMode ? const Color(0xFFF59E0B) : ServoraColors.emerald600,
                  width: 1.5,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _isMerchantMode ? 'MERCHANT PROVIDER MODE 🏬' : 'CUSTOMER BUYER MODE 🛒',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: _isMerchantMode ? const Color(0xFFB45309) : ServoraColors.emerald700,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const Gap(2),
                      Text(
                        _isMerchantMode
                            ? 'Manage artisan services, products & quotes'
                            : 'Browse marketplace, hire artisans & buy products',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  Switch(
                    value: _isMerchantMode,
                    activeColor: const Color(0xFFF59E0B),
                    onChanged: (val) {
                      setState(() => _isMerchantMode = val);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(val ? 'Switched to Merchant Provider Mode' : 'Switched to Customer Buyer Mode'),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
            const Gap(20),

            // Account Quick Metrics Row
            Row(
              children: [
                _buildMetricCard(context, count: '12', label: 'Bookings'),
                const Gap(10),
                _buildMetricCard(context, count: 'GH₵ 450', label: 'Escrow Funds'),
                const Gap(10),
                _buildMetricCard(context, count: '5', label: 'Saved'),
              ],
            ),
            const Gap(24),

            // Admin Control Hub Section (Visible for Admin Users)
            if (isAdmin) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.red.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.admin_panel_settings_rounded, color: Colors.red, size: 20),
                        Gap(8),
                        Text(
                          'MASTER ADMIN CONTROL HUB',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.red),
                        ),
                      ],
                    ),
                    const Gap(6),
                    const Text(
                      'You have administrative privileges to moderate listings, approve business profiles, and inspect system audit logs.',
                      style: TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                  ],
                ),
              ),
              const Gap(16),
            ],

            // Account Actions Navigation List
            Column(
              children: [
                _buildActionTile(
                  icon: Icons.shield_outlined,
                  title: 'Safe MoMo Escrow Protection',
                  subtitle: 'Active escrow deals & payment release',
                  onTap: () => context.push('/escrow'),
                ),
                _buildActionTile(
                  icon: Icons.receipt_long_outlined,
                  title: 'Activity & Booking History',
                  subtitle: 'Past service requests & delivery orders',
                  onTap: () => context.push('/activity'),
                ),
                _buildActionTile(
                  icon: Icons.storefront_outlined,
                  title: 'Manage Artisan Business Profile',
                  subtitle: 'Update services, area & Ghana Card status',
                  onTap: () => context.push('/biz/kwame-electrical-tamale'),
                ),
                _buildActionTile(
                  icon: Icons.support_agent_rounded,
                  title: 'WhatsApp Help & Support Hub',
                  subtitle: 'Direct contact with Northern support team',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Opening WhatsApp Support...')),
                    );
                  },
                ),
                const Divider(height: 30),
                _buildActionTile(
                  icon: Icons.logout_rounded,
                  title: 'Log Out',
                  subtitle: 'Sign out of Servora.gh account',
                  textColor: Colors.red,
                  onTap: () {
                    authNotifier.logout();
                    context.go('/auth/login');
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(BuildContext context, {required String count, required String label}) {
    return Expanded(
      child: ServoraCard(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        child: Column(
          children: [
            Text(
              count,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
            ),
            const Gap(2),
            Text(
              label,
              style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color? textColor,
  }) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: (textColor ?? ServoraColors.emerald600).withOpacity(0.12),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: textColor ?? ServoraColors.emerald600, size: 20),
      ),
      title: Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: textColor)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: Colors.grey)),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.grey),
      onTap: onTap,
    );
  }
}
