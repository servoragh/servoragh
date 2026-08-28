import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../../main.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isMerchantMode = false;

  void _handleLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Log Out of Servora.gh?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: const Text(
          'You will be logged out of your account. You can still explore all products, businesses, and notice boards as a guest.',
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
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Logged out. You are now browsing as a guest.'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            child: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListenableBuilder(
      listenable: authNotifier,
      builder: (context, _) {
        final authState = authNotifier.state;
        final user = authState.user;
        final bool isLoggedIn = authState.isAuthenticated && user != null;
        final String userRole = user?.role.toUpperCase() ?? 'CUSTOMER';
        final bool isAdmin = userRole == 'ADMIN' || userRole == 'SUPER_ADMIN';
        final bool isProvider = userRole == 'PROVIDER' || _isMerchantMode;

        // Dynamic Title based on auth state & role
        String titleText = 'Guest Portal 🌐';
        if (isLoggedIn) {
          if (isAdmin) {
            titleText = 'Master Admin Portal 👑';
          } else if (isProvider) {
            titleText = 'Business Merchant Portal 🏢';
          } else {
            titleText = 'Customer Dashboard 🛒';
          }
        }

        return Scaffold(
          appBar: AppBar(
            title: Text(titleText, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            actions: [
              IconButton(
                icon: Icon(
                  isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                  color: ServoraColors.emerald600,
                ),
                tooltip: 'Toggle Theme',
                onPressed: () {
                  themeModeNotifier.value = isDark ? ThemeMode.light : ThemeMode.dark;
                },
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 600),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (!isLoggedIn)
                      _buildGuestView(context, isDark)
                    else if (isAdmin)
                      _buildAdminPortalView(context, user, isDark)
                    else if (isProvider)
                      _buildProviderPortalView(context, user, isDark)
                    else
                      _buildCustomerPortalView(context, user, isDark),
                    const Gap(30),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  // ==========================================
  // 1. GUEST PORTAL VIEW (Explore without login)
  // ==========================================
  Widget _buildGuestView(BuildContext context, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Welcome Banner Card
        ServoraCard(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [ServoraColors.emerald600, Color(0xFF0D9488)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: ServoraColors.emerald600.withOpacity(0.35),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Center(
                  child: Icon(Icons.handyman_rounded, color: Colors.white, size: 32),
                ),
              ),
              const Gap(14),
              const Text(
                'Welcome to Servora.gh',
                style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900),
              ),
              const Gap(4),
              const Text(
                'Northern Ghana\'s verified marketplace & artisan trade directory. Browse products, hire verified pros, or list your business.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey, height: 1.35),
              ),
              const Gap(18),

              // Sign In & Register Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ServoraColors.emerald600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 2,
                      ),
                      onPressed: () => context.push('/auth/login'),
                      child: const Text(
                        'Sign In ➔',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  const Gap(10),
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: ServoraColors.emerald600,
                        side: const BorderSide(color: ServoraColors.emerald600, width: 1.5),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () => context.push('/register'),
                      child: const Text(
                        '100% Free Sign Up',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
              const Gap(12),
              GestureDetector(
                onTap: () => context.push('/register'),
                child: const Text(
                  'Are you a business owner? Register your Storefront 🏢',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD97706)),
                ),
              ),
            ],
          ),
        ).animate().fadeIn(duration: 250.ms),
        const Gap(18),

        // Quick Guest Navigation Links
        const Text('Explore Marketplace Features:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
        const Gap(8),
        _buildActionTile(
          icon: Icons.storefront_rounded,
          title: 'Browse Verified Businesses & Artisans',
          subtitle: 'Explore 11+ verified Northern enterprises & view digital storefronts',
          onTap: () => context.go('/businesses'),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.shopping_bag_rounded,
          title: 'Shop Northern Marketplace Products',
          subtitle: 'Fugu smocks, solar kits, shea butter, agro-produce with Escrow protection',
          onTap: () => context.go('/products'),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.post_add_rounded,
          title: 'Post a Free Price / Service Request',
          subtitle: 'Get quotes from verified Tamale artisans without upfront payment',
          onTap: () => context.push('/services/request'),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.shield_rounded,
          title: 'Escrow Buyer & Seller Protection',
          subtitle: 'Learn how Servora secures your mobile money and payments safely',
          onTap: () => context.push('/escrow'),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.chat_rounded,
          title: 'WhatsApp Support Team',
          subtitle: 'Chat directly with Servora Northern support',
          onTap: () => WhatsAppHelper.openWhatsApp(
            phone: '+233240000000',
            message: 'Hello Servora Team, I have a question about the marketplace app.',
          ),
        ),
      ],
    );
  }

  // ==========================================
  // 2. CUSTOMER PORTAL VIEW
  // ==========================================
  Widget _buildCustomerPortalView(BuildContext context, user, bool isDark) {
    final String name = user?.name ?? 'Customer';
    final String phone = user?.phone ?? '+233 24 000 0000';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // User Header Card
        ServoraCard(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: ServoraColors.emerald600.withOpacity(0.15),
                child: Text(
                  name.isNotEmpty ? name[0].toUpperCase() : 'C',
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                ),
              ),
              const Gap(14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            name,
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const Gap(6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: ServoraColors.emerald600.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'BUYER',
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
                          ),
                        ),
                      ],
                    ),
                    const Gap(2),
                    Text(phone, style: TextStyle(fontSize: 11.5, color: Colors.grey[600])),
                    const Gap(6),
                    StatusBadge.verifiedGhanaCard(),
                  ],
                ),
              ),
            ],
          ),
        ).animate().fadeIn(duration: 200.ms),
        const Gap(14),

        // Customer Metric Cards
        Row(
          children: [
            _buildMetricCard(context, count: '3 Active', label: 'My Requests', icon: Icons.assignment_outlined),
            const Gap(10),
            _buildMetricCard(context, count: '12 Saved', label: 'Favorites', icon: Icons.favorite_rounded),
            const Gap(10),
            _buildMetricCard(context, count: '100% Safe', label: 'Escrow Vault', icon: Icons.shield_rounded),
          ],
        ),
        const Gap(14),

        // Mode Switcher Banner
        _buildModeSwitcher(
          isMerchant: false,
          onToggle: () => setState(() => _isMerchantMode = true),
        ),
        const Gap(14),

        // Customer Quick Actions
        const Text('Customer Dashboard Features:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
        const Gap(8),
        _buildActionTile(
          icon: Icons.post_add_rounded,
          title: 'Post New Price Request',
          subtitle: 'Broadcast a job to local carpenters, electricians, mechanics',
          onTap: () => context.push('/services/request'),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.favorite_outline_rounded,
          title: 'Saved Businesses & Products',
          subtitle: 'View your liked stores and bookmarked items',
          onTap: () => context.go('/businesses'),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.shield_outlined,
          title: 'Active Escrow Protection Tracker',
          subtitle: 'View held funds and confirm received deliveries',
          onTap: () => context.push('/escrow'),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.storefront_rounded,
          title: 'Switch to Merchant / Register Business',
          subtitle: 'Create a business profile and list your goods and services',
          onTap: () => setState(() => _isMerchantMode = true),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.chat_rounded,
          title: 'WhatsApp Help & Support',
          subtitle: 'Chat directly with Servora Northern team',
          onTap: () => WhatsAppHelper.openWhatsApp(
            phone: '+233240000000',
            message: 'Hello Servora, I need customer support on my account ($name, $phone).',
          ),
        ),
        const Gap(16),

        // Log Out Button
        _buildActionTile(
          icon: Icons.logout_rounded,
          title: 'Log Out',
          subtitle: 'Sign out and continue browsing as guest',
          textColor: Colors.red,
          onTap: () => _handleLogout(context),
        ),
      ],
    );
  }

  // ==========================================
  // 3. BUSINESS / MERCHANT PORTAL VIEW
  // ==========================================
  Widget _buildProviderPortalView(BuildContext context, user, bool isDark) {
    final String name = user?.name ?? 'Kwame Mensah';
    final String businessName = user?.businessName ?? 'Kwame Electrical & Solar Solutions';
    final String phone = user?.phone ?? '+233 24 488 9900';
    final String slug = user?.slug ?? 'kwame-electrical-tamale';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Merchant Header Card
        ServoraCard(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFF59E0B), width: 1.5),
                    ),
                    child: const Center(
                      child: Icon(Icons.storefront_rounded, color: Color(0xFFD97706), size: 28),
                    ),
                  ),
                  const Gap(14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                businessName,
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const Gap(6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF3C7),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'MERCHANT',
                                style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFFD97706)),
                              ),
                            ),
                          ],
                        ),
                        const Gap(2),
                        Text('Owner: $name • $phone', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                        const Gap(4),
                        Row(
                          children: [
                            StatusBadge.verifiedGhanaCard(),
                            const Gap(6),
                            Text('★ 5.0 (36 Reviews)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.amber[800])),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const Gap(14),
              // Live Storefront Link Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ServoraColors.emerald600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.open_in_new_rounded, size: 15),
                  label: const Text('View My Public Digital Storefront 🌐', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  onPressed: () => context.push('/biz/$slug'),
                ),
              ),
            ],
          ),
        ).animate().fadeIn(duration: 200.ms),
        const Gap(14),

        // Merchant Metrics Row
        Row(
          children: [
            _buildMetricCard(context, count: '85 Done', label: 'Completed Jobs', icon: Icons.task_alt_rounded),
            const Gap(8),
            _buildMetricCard(context, count: '6 Items', label: 'Catalog Listed', icon: Icons.inventory_2_rounded),
            const Gap(8),
            _buildMetricCard(context, count: 'GH₵ 3.4k', label: 'Escrow Payouts', icon: Icons.account_balance_wallet_rounded),
          ],
        ),
        const Gap(14),

        // Mode Switcher Banner
        _buildModeSwitcher(
          isMerchant: true,
          onToggle: () => setState(() => _isMerchantMode = false),
        ),
        const Gap(14),

        // Merchant Management Actions
        const Text('Merchant Management Tools:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
        const Gap(8),
        _buildActionTile(
          icon: Icons.inventory_rounded,
          title: 'Manage Store Catalog & Stock',
          subtitle: 'Add/edit products, service rates, and rental machinery',
          onTap: () => context.push('/biz/$slug'),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.phone_in_talk_rounded,
          title: 'WhatsApp Lead Dispatch Settings',
          subtitle: 'Configure automated phone number for direct customer orders',
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('WhatsApp dispatch configured for $phone')),
            );
          },
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.account_balance_wallet_outlined,
          title: 'Merchant Escrow Payouts & Earnings',
          subtitle: 'Track fulfilled orders and release Mobile Money funds',
          onTap: () => context.push('/escrow'),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.verified_user_outlined,
          title: 'Ghana Card & Trust Verification',
          subtitle: 'Tier-1 Verified Merchant with Northern Trust Badge',
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Your business is 100% verified with Ghana Card & GPS address.')),
            );
          },
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.support_agent_rounded,
          title: 'Merchant Priority Support',
          subtitle: 'Direct support line for business sellers',
          onTap: () => WhatsAppHelper.openWhatsApp(
            phone: '+233240000000',
            message: 'Hello Servora, I need Merchant assistance for $businessName.',
          ),
        ),
        const Gap(16),

        // Log Out Button
        _buildActionTile(
          icon: Icons.logout_rounded,
          title: 'Log Out of Merchant Account',
          subtitle: 'Sign out and continue browsing as guest',
          textColor: Colors.red,
          onTap: () => _handleLogout(context),
        ),
      ],
    );
  }

  // ==========================================
  // 4. MASTER ADMIN PORTAL VIEW
  // ==========================================
  Widget _buildAdminPortalView(BuildContext context, user, bool isDark) {
    final String name = user?.name ?? 'Master Admin';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Admin Header Card
        ServoraCard(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.redAccent, width: 1.5),
                ),
                child: const Center(
                  child: Text('👑', style: TextStyle(fontSize: 28)),
                ),
              ),
              const Gap(14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            name,
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const Gap(6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.red.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'MASTER ADMIN',
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.red),
                          ),
                        ),
                      ],
                    ),
                    const Gap(2),
                    Text('admin@servora.gh • Tamale Headquarters', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                    const Gap(4),
                    const Text('Platform Supervisor Access', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                  ],
                ),
              ),
            ],
          ),
        ).animate().fadeIn(duration: 200.ms),
        const Gap(14),

        // Admin Platform Stats
        Row(
          children: [
            _buildMetricCard(context, count: '11 Live', label: 'Verified Stores', icon: Icons.storefront_rounded),
            const Gap(8),
            _buildMetricCard(context, count: '18 Items', label: 'Listed Products', icon: Icons.shopping_bag_rounded),
            const Gap(8),
            _buildMetricCard(context, count: '99.9%', label: 'System Health', icon: Icons.health_and_safety_rounded),
          ],
        ),
        const Gap(14),

        // Admin Management Actions
        const Text('Master Supervisor Control Tools:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
        const Gap(8),
        _buildActionTile(
          icon: Icons.verified_rounded,
          title: 'Verify Business Profiles & KYC',
          subtitle: 'Review Ghana Card uploads & approve pending storefronts',
          onTap: () => context.go('/businesses'),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.inventory_2_rounded,
          title: 'Moderate Marketplace Listings',
          subtitle: 'Inspect products, prices, and categories',
          onTap: () => context.go('/products'),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.campaign_rounded,
          title: 'Notice Board Community Moderation',
          subtitle: 'Review trade broadcasts and community posts',
          onTap: () => context.go('/community'),
        ),
        const Gap(8),
        _buildActionTile(
          icon: Icons.shield_rounded,
          title: 'Escrow Vault Supervision',
          subtitle: 'Oversee held Mobile Money funds and dispute resolutions',
          onTap: () => context.push('/escrow'),
        ),
        const Gap(16),

        // Log Out Button
        _buildActionTile(
          icon: Icons.logout_rounded,
          title: 'Log Out of Admin Panel',
          subtitle: 'Sign out and return to guest exploration',
          textColor: Colors.red,
          onTap: () => _handleLogout(context),
        ),
      ],
    );
  }

  // Mode Switcher Banner
  Widget _buildModeSwitcher({required bool isMerchant, required VoidCallback onToggle}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isMerchant ? const Color(0xFFFEF3C7) : ServoraColors.emerald600.withOpacity(0.12),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isMerchant ? const Color(0xFFF59E0B) : ServoraColors.emerald600,
          width: 1.5,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isMerchant ? 'MERCHANT PROVIDER MODE 🏬' : 'CUSTOMER BUYER MODE 🛒',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: isMerchant ? const Color(0xFFB45309) : ServoraColors.emerald600,
                  ),
                ),
                const Gap(2),
                Text(
                  isMerchant
                      ? 'Managing business storefront & catalog items'
                      : 'Browse marketplace, hire artisans & buy products',
                  style: const TextStyle(fontSize: 11, color: Colors.black87),
                ),
              ],
            ),
          ),
          Switch(
            value: isMerchant,
            activeColor: const Color(0xFFD97706),
            activeTrackColor: const Color(0xFFFDE68A),
            inactiveThumbColor: ServoraColors.emerald600,
            inactiveTrackColor: ServoraColors.emerald600.withOpacity(0.3),
            onChanged: (val) => onToggle(),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard(BuildContext context, {required String count, required String label, required IconData icon}) {
    return Expanded(
      child: ServoraCard(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
        child: Column(
          children: [
            Icon(icon, size: 18, color: ServoraColors.emerald600),
            const Gap(4),
            Text(
              count,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: ServoraColors.emerald600),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const Gap(2),
            Text(
              label,
              style: const TextStyle(fontSize: 9.5, color: Colors.grey, fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? ServoraColors.darkSurface : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.2 : 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: (textColor ?? ServoraColors.emerald600).withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: textColor ?? ServoraColors.emerald600, size: 18),
            ),
            const Gap(12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                  const Gap(2),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 10.5, color: Colors.grey),
                  ),
                ],
              ),
            ),
            const Gap(8),
            const Icon(Icons.arrow_forward_ios_rounded, size: 13, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
