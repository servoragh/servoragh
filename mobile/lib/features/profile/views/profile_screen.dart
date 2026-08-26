import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/status_badge.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: authNotifier,
      builder: (context, _) {
        final authState = authNotifier.state;
        final user = authState.user;
        final isMerchantMode = user?.activeRole == 'PROVIDER';
        final isDark = Theme.of(context).brightness == Brightness.dark;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Account & Mode Switcher 👤'),
            actions: [
              IconButton(
                icon: const Icon(Icons.settings_outlined),
                onPressed: () {},
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // User Header Card
                ServoraCard(
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 30,
                        backgroundColor: const Color(0xFF059669).withOpacity(0.15),
                        child: Text(
                          (user?.name ?? 'User')[0].toUpperCase(),
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF059669)),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user?.name ?? 'Alhassan Ibrahim',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              user?.phone ?? '+233 24 000 0000',
                              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                            ),
                            const SizedBox(height: 6),
                            StatusBadge.verifiedGhanaCard(),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // 1-TAP MULTI-ROLE MODE SWITCHER CARD
                ServoraCard(
                  backgroundColor: isMerchantMode
                      ? const Color(0xFF059669).withOpacity(0.12)
                      : (isDark ? const Color(0xFF111827) : Colors.white),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isMerchantMode ? 'MERCHANT & ARTISAN MODE 🛠️' : 'CUSTOMER BUYER MODE 🛍️',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                isMerchantMode
                                    ? 'Managing listings, customer leads & quotes'
                                    : 'Browsing products, hiring artisans & ordering',
                                style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                              ),
                            ],
                          ),
                          Switch(
                            value: isMerchantMode,
                            activeColor: const Color(0xFF059669),
                            onChanged: (val) {
                              authNotifier.switchRole(val ? 'PROVIDER' : 'CUSTOMER');
                            },
                          ),
                        ],
                      ),
                      if (isMerchantMode) ...[
                        const Divider(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildMerchantStat('Lead Calls', '12'),
                            _buildMerchantStat('Pending Quotes', '5'),
                            _buildMerchantStat('Catalog Items', '8'),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Profile Action Options List
                _buildProfileOption(
                  icon: Icons.favorite_outline_rounded,
                  title: 'Saved Businesses & Products',
                  onTap: () {},
                ),
                _buildProfileOption(
                  icon: Icons.shield_outlined,
                  title: 'Ghana Card & Verification Status',
                  subtitle: 'VERIFIED ✓',
                  onTap: () {},
                ),
                _buildProfileOption(
                  icon: Icons.account_balance_wallet_outlined,
                  title: 'Mobile Money Escrow Wallet',
                  onTap: () => context.push('/escrow'),
                ),
                _buildProfileOption(
                  icon: Icons.support_agent_rounded,
                  title: 'Support & Help Desk',
                  onTap: () {},
                ),
                const SizedBox(height: 20),

                // Logout / Sign In Button
                if (authState.isAuthenticated)
                  ListTile(
                    leading: const Icon(Icons.logout_rounded, color: Colors.red),
                    title: const Text('Log Out', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                    onTap: () => authNotifier.logout(),
                  )
                else
                  ListTile(
                    leading: const Icon(Icons.login_rounded, color: Color(0xFF059669)),
                    title: const Text('Sign In / Register', style: TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold)),
                    onTap: () => context.push('/auth/login'),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildMerchantStat(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF059669))),
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
      ],
    );
  }

  Widget _buildProfileOption({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(14),
      ),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF059669)),
        title: Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        subtitle: subtitle != null ? Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF059669), fontWeight: FontWeight.bold)) : null,
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14),
        onTap: onTap,
      ),
    );
  }
}
