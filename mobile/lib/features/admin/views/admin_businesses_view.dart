import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../core/utils/whatsapp_helper.dart';

class AdminBusinessesView extends StatefulWidget {
  final List<dynamic> providers;
  final List<dynamic> products;
  final VoidCallback onRefresh;
  final Function(String action, {String? targetId, dynamic payload}) onAdminAction;

  const AdminBusinessesView({
    super.key,
    required this.providers,
    required this.products,
    required this.onRefresh,
    required this.onAdminAction,
  });

  @override
  State<AdminBusinessesView> createState() => _AdminBusinessesViewState();
}

class _AdminBusinessesViewState extends State<AdminBusinessesView> {
  String _searchQuery = '';
  String _statusFilter = 'ALL';
  String _areaFilter = 'ALL';

  final List<String> _serviceAreas = [
    'ALL',
    'Sakasaka',
    'Aboabo',
    'Nyohini',
    'Choggu',
    'Dungu',
    'Tamale Central',
    'Lamashegu',
    'Bolgatanga',
    'Wa',
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filtered = widget.providers.where((p) {
      final search = _searchQuery.toLowerCase();
      final name = (p['businessName']?.toString() ?? '').toLowerCase();
      final owner = (p['user']?['name']?.toString() ?? '').toLowerCase();
      final phone = (p['user']?['phone']?.toString() ?? '').toLowerCase();
      final area = (p['serviceArea']?.toString() ?? 'tamale').toLowerCase();

      final matchesSearch = name.contains(search) || owner.contains(search) || phone.contains(search) || area.contains(search);
      if (!matchesSearch) return false;

      final isVerified = p['verificationStatus'] == 'VERIFIED';
      final isPromoted = p['isPromoted'] == true;

      if (_statusFilter == 'VERIFIED' && !isVerified) return false;
      if (_statusFilter == 'PENDING' && isVerified) return false;
      if (_statusFilter == 'PROMOTED' && !isPromoted) return false;

      if (_areaFilter != 'ALL' && !area.contains(_areaFilter.toLowerCase())) return false;

      return true;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Hero Header Card (Web Blueprint)
        _buildHeroHeaderCard(isDark),
        const Gap(14),

        // 2. Search Bar & Add Business Button
        Row(
          children: [
            Expanded(
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search by business name, owner, phone, or zone...',
                  hintStyle: const TextStyle(fontSize: 11.5),
                  prefixIcon: const Icon(Icons.search_rounded, size: 18),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
                onChanged: (val) => setState(() => _searchQuery = val),
              ),
            ),
            const Gap(8),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF059669),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              icon: const Icon(Icons.add_business_rounded, size: 16),
              label: const Text('Register Business', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              onPressed: _openRegisterBusinessModal,
            ),
          ],
        ),
        const Gap(10),

        // 3. Status Filter Chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildFilterChip('ALL MERCHANTS (${widget.providers.length})', 'ALL', _statusFilter, (v) => setState(() => _statusFilter = v)),
              const Gap(6),
              _buildFilterChip('🛡️ VERIFIED ONLY', 'VERIFIED', _statusFilter, (v) => setState(() => _statusFilter = v)),
              const Gap(6),
              _buildFilterChip('⏳ PENDING REVIEW', 'PENDING', _statusFilter, (v) => setState(() => _statusFilter = v)),
              const Gap(6),
              _buildFilterChip('🚀 PROMOTED ADVERTS', 'PROMOTED', _statusFilter, (v) => setState(() => _statusFilter = v)),
            ],
          ),
        ),
        const Gap(8),

        // 4. Service Area Pills
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: _serviceAreas.map((area) {
              final isSel = _areaFilter == area;
              return Padding(
                padding: const EdgeInsets.only(right: 6),
                child: GestureDetector(
                  onTap: () => setState(() => _areaFilter = area),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                    decoration: BoxDecoration(
                      color: isSel ? const Color(0xFF059669) : Colors.grey.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: isSel ? const Color(0xFF059669) : Colors.grey.withOpacity(0.2)),
                    ),
                    child: Text(
                      area == 'ALL' ? 'All Zones' : '#$area',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isSel ? Colors.white : (isDark ? Colors.white70 : Colors.grey[700]),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const Gap(14),

        // 5. Providers Directory List
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('REGISTERED STOREFRONTS & ARTISANS (${filtered.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 0.5)),
            Text('${widget.providers.length} Total', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
          ],
        ),
        const Gap(10),

        if (filtered.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                children: [
                  Icon(Icons.storefront_rounded, size: 40, color: Colors.grey.withOpacity(0.5)),
                  const Gap(10),
                  const Text('No business profiles found matching filters.', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.grey)),
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
            itemBuilder: (context, idx) => _buildBusinessCard(filtered[idx], isDark),
          ),
      ],
    );
  }

  Widget _buildHeroHeaderCard(bool isDark) {
    final totalMerchants = widget.providers.length;
    final verifiedCount = widget.providers.where((p) => p['verificationStatus'] == 'VERIFIED').length;
    final promotedCount = widget.providers.where((p) => p['isPromoted'] == true).length;
    final catalogItems = widget.products.length;

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
                    child: const Icon(Icons.apartment_rounded, color: Colors.white, size: 20),
                  ),
                  const Gap(10),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Business Profiles & Verified Artisans',
                            style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Colors.white),
                          ),
                          Gap(4),
                          Text('🏢', style: TextStyle(fontSize: 13)),
                        ],
                      ),
                      Text(
                        'Merchant Storefronts & Trade Directorate',
                        style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                      ),
                    ],
                  ),
                ],
              ),
              InkWell(
                onTap: widget.onRefresh,
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
                      Text('Sync Directory', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.white)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const Gap(10),
          const Text(
            'Manage registered local service providers, artisans, catalog storefronts, and verification compliance across Northern Ghana.',
            style: TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8), height: 1.3),
          ),
          const Gap(14),

          // 4 Grid Stats Metrics
          Row(
            children: [
              Expanded(
                child: _buildHeroStat(
                  label: 'REGISTERED MERCHANTS',
                  value: '$totalMerchants',
                  sub: 'Total Active Accounts',
                  valColor: Colors.white,
                ),
              ),
              const Gap(8),
              Expanded(
                child: _buildHeroStat(
                  label: 'VERIFIED ARTISANS',
                  value: '$verifiedCount',
                  sub: 'Ghana Card Approved 🛡️',
                  valColor: const Color(0xFF34D399),
                ),
              ),
            ],
          ),
          const Gap(8),
          Row(
            children: [
              Expanded(
                child: _buildHeroStat(
                  label: 'PROMOTED ADVERTS',
                  value: '$promotedCount',
                  sub: 'Featured on Homepage 🚀',
                  valColor: const Color(0xFFFBBF24),
                ),
              ),
              const Gap(8),
              Expanded(
                child: _buildHeroStat(
                  label: 'STORE CATALOG ITEMS',
                  value: '$catalogItems',
                  sub: 'Live Products & Supplies',
                  valColor: const Color(0xFF60A5FA),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeroStat({
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

  Widget _buildFilterChip(String label, String value, String current, Function(String) onSelect) {
    final isSel = current == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSel ? Colors.white : null)),
      selected: isSel,
      selectedColor: ServoraColors.emerald600,
      onSelected: (_) => onSelect(value),
    );
  }

  Widget _buildBusinessCard(dynamic prov, bool isDark) {
    final id = prov['id']?.toString() ?? 'biz';
    final businessName = prov['businessName']?.toString() ?? 'Business Storefront';
    final ownerName = prov['user']?['name']?.toString() ?? 'Merchant';
    final phone = prov['user']?['phone']?.toString() ?? '+233240000000';
    final area = prov['serviceArea']?.toString() ?? 'Tamale';
    final slug = prov['slug']?.toString() ?? id;
    final isVerified = prov['verificationStatus'] == 'VERIFIED';
    final isPromoted = prov['isPromoted'] == true;
    final logoUrl = prov['logoUrl']?.toString() ?? '';

    // Calculate count of products for this business
    final storeProducts = widget.products.where((p) => p['providerId'] == id || p['provider']?['slug'] == slug).toList();

    return ServoraCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Logo, Title, Owner info, Advert tag
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: ServoraColors.emerald600.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: logoUrl.isNotEmpty
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: CachedNetworkImage(
                          imageUrl: logoUrl,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) => const Icon(Icons.storefront_rounded, color: ServoraColors.emerald600, size: 26),
                        ),
                      )
                    : const Icon(Icons.storefront_rounded, color: ServoraColors.emerald600, size: 26),
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
                            businessName,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const Gap(6),
                        if (isVerified)
                          const Icon(Icons.verified_rounded, size: 14, color: Color(0xFF059669)),
                      ],
                    ),
                    const Gap(2),
                    Text(
                      'Owner: $ownerName • $phone',
                      style: TextStyle(fontSize: 10.5, color: isDark ? Colors.white60 : Colors.grey[700]),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const Gap(2),
                    Text(
                      'Service Area: $area • ${storeProducts.length} Products Listed',
                      style: const TextStyle(fontSize: 10, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Gap(10),

          // Status Badges & Advert Toggle
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              // Verification status pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                decoration: BoxDecoration(
                  color: isVerified ? const Color(0xFFD1FAE5) : const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isVerified ? 'VERIFIED ARTISAN 🛡️' : 'PENDING REVIEW ⏳',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w900,
                    color: isVerified ? const Color(0xFF047857) : const Color(0xFFB45309),
                  ),
                ),
              ),

              // Promoted Advert Toggle Button
              GestureDetector(
                onTap: () => widget.onAdminAction('TOGGLE_PROMOTED_PROVIDER', targetId: id),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: isPromoted ? const Color(0xFFF59E0B) : Colors.grey.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.auto_awesome_rounded, size: 11, color: isPromoted ? Colors.black : Colors.grey[700]),
                      const Gap(4),
                      Text(
                        isPromoted ? 'Promoted Advert 🚀' : '+ Feature Advert',
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w900,
                          color: isPromoted ? Colors.black : (isDark ? Colors.white70 : Colors.grey[800]),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const Gap(12),

          // Bottom Action Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // 360 Storefront Profile Inspector
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
                icon: const Icon(Icons.store_rounded, size: 13),
                label: const Text('360° Storefront >', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                onPressed: () => _openBusiness360Drawer(prov, storeProducts),
              ),

              Row(
                children: [
                  // View Live Storefront
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: () => context.push('/biz/$slug'),
                    child: const Text('View Live ↗', style: TextStyle(fontSize: 10.5)),
                  ),
                  const Gap(6),

                  // Quick Verify Toggle
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isVerified ? Colors.amber[700] : const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      elevation: 0,
                    ),
                    onPressed: () => widget.onAdminAction('TOGGLE_VERIFICATION', targetId: id),
                    child: Text(isVerified ? 'Unverify' : 'Verify 🛡️', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
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
  // 360° BUSINESS STOREFRONT INSPECTOR DRAWER
  // =========================================================
  void _openBusiness360Drawer(dynamic prov, List<dynamic> storeProducts) {
    final id = prov['id']?.toString() ?? 'biz';
    final businessName = prov['businessName']?.toString() ?? 'Business Storefront';
    final ownerName = prov['user']?['name']?.toString() ?? 'Merchant';
    final phone = prov['user']?['phone']?.toString() ?? '+233240000000';
    final email = prov['user']?['email']?.toString() ?? 'merchant@servora.gh';
    final area = prov['serviceArea']?.toString() ?? 'Tamale';
    final bio = prov['bio'] ?? prov['description'] ?? 'Certified local service provider and trade merchant in Northern Ghana.';
    final isVerified = prov['verificationStatus'] == 'VERIFIED';
    final slug = prov['slug']?.toString() ?? id;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;

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
                // Top Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: const Color(0xFF059669).withOpacity(0.18),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.storefront_rounded, color: Color(0xFF059669), size: 24),
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
                                    businessName,
                                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const Gap(6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                  decoration: BoxDecoration(
                                    color: isVerified ? const Color(0xFFECFDF5) : const Color(0xFFFEF3C7),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    isVerified ? 'VERIFIED' : 'PENDING',
                                    style: TextStyle(
                                      fontSize: 8.5,
                                      fontWeight: FontWeight.w900,
                                      color: isVerified ? const Color(0xFF047857) : const Color(0xFFB45309),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const Gap(2),
                            Text('Owner: $ownerName • Area: $area', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20),
                        onPressed: () => Navigator.of(ctx).pop(),
                      ),
                    ],
                  ),
                ),

                // 4 Tabs
                const TabBar(
                  isScrollable: true,
                  labelColor: Color(0xFF059669),
                  unselectedLabelColor: Colors.grey,
                  indicatorColor: Color(0xFF059669),
                  tabs: [
                    Tab(icon: Icon(Icons.store_rounded, size: 16), text: 'Storefront Details & Bio'),
                    Tab(icon: Icon(Icons.inventory_2_outlined, size: 16), text: 'Product Catalog'),
                    Tab(icon: Icon(Icons.shield_outlined, size: 16), text: 'Compliance & Ghana Card'),
                    Tab(icon: Icon(Icons.settings_outlined, size: 16), text: 'Quick Edit & Actions'),
                  ],
                ),

                // Tab Views
                Expanded(
                  child: TabBarView(
                    children: [
                      // Tab 1: Details & Bio
                      ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          _buildDetailSection(
                            isDark,
                            title: 'BUSINESS BIOGRAPHY & MISSION',
                            content: Text(bio, style: const TextStyle(fontSize: 11.5, height: 1.4)),
                          ),
                          const Gap(14),
                          _buildDetailSection(
                            isDark,
                            title: 'CONTACT & DISPATCH POINTS',
                            content: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('📱 Phone: $phone', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                const Gap(3),
                                Text('✉️ Email: $email', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                                const Gap(8),
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF25D366),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  icon: const Icon(Icons.chat_rounded, size: 14),
                                  label: const Text('Open Merchant WhatsApp', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  onPressed: () => WhatsAppHelper.openWhatsApp(phone: phone, message: "Hello $ownerName, this is Servora Admin."),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      // Tab 2: Products Catalog
                      ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('CATALOG LISTINGS (${storeProducts.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
                              OutlinedButton(
                                onPressed: () => context.push('/biz/$slug'),
                                child: const Text('Public Store ↗', style: TextStyle(fontSize: 10)),
                              ),
                            ],
                          ),
                          const Gap(10),
                          if (storeProducts.isEmpty)
                            const Padding(
                              padding: EdgeInsets.all(30),
                              child: Center(child: Text('No products currently listed for this business.', style: TextStyle(color: Colors.grey, fontSize: 12))),
                            )
                          else
                            ...storeProducts.map((prod) => Padding(
                                  padding: const EdgeInsets.only(bottom: 8),
                                  child: Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: isDark ? Colors.black26 : const Color(0xFFF8FAFC),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(prod['title'] ?? 'Product', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                              Text('GH₵ ${prod['price'] ?? 0} • Status: ${prod['status'] ?? "ACTIVE"}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                                            ],
                                          ),
                                        ),
                                        const Icon(Icons.check_circle_rounded, size: 16, color: Color(0xFF059669)),
                                      ],
                                    ),
                                  ),
                                )),
                        ],
                      ),

                      // Tab 3: Compliance & KYC
                      ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: isVerified ? const Color(0xFFECFDF5) : const Color(0xFFFEF3C7),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(isVerified ? Icons.verified_user_rounded : Icons.pending_actions_rounded, color: isVerified ? const Color(0xFF059669) : const Color(0xFFD97706)),
                                    const Gap(8),
                                    Text(
                                      isVerified ? 'VERIFICATION COMPLIANCE: APPROVED' : 'VERIFICATION COMPLIANCE: PENDING',
                                      style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: isVerified ? const Color(0xFF065F46) : const Color(0xFFB45309)),
                                    ),
                                  ],
                                ),
                                const Gap(6),
                                const Text('Ghana Card and artisan trade credentials recorded in central database.', style: TextStyle(fontSize: 10, color: Colors.grey)),
                              ],
                            ),
                          ),
                          const Gap(14),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isVerified ? Colors.amber[700] : const Color(0xFF059669),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            icon: Icon(isVerified ? Icons.cancel_rounded : Icons.verified_rounded, size: 16),
                            label: Text(isVerified ? 'Revoke Verification Status' : 'Approve & Verify Business 🛡️', style: const TextStyle(fontWeight: FontWeight.bold)),
                            onPressed: () {
                              Navigator.of(ctx).pop();
                              widget.onAdminAction('TOGGLE_VERIFICATION', targetId: id);
                            },
                          ),
                        ],
                      ),

                      // Tab 4: Quick Edit & Actions
                      ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFF59E0B),
                              foregroundColor: Colors.black,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            icon: const Icon(Icons.auto_awesome_rounded, size: 16),
                            label: Text(prov['isPromoted'] == true ? 'Remove From Featured Advert' : 'Promote on Homepage Carousel 🚀', style: const TextStyle(fontWeight: FontWeight.bold)),
                            onPressed: () {
                              Navigator.of(ctx).pop();
                              widget.onAdminAction('TOGGLE_PROMOTED_PROVIDER', targetId: id);
                            },
                          ),
                          const Gap(10),
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.red,
                              side: const BorderSide(color: Colors.red),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            icon: const Icon(Icons.delete_outline_rounded, size: 16),
                            label: const Text('Suspend Storefront Profile', style: TextStyle(fontWeight: FontWeight.bold)),
                            onPressed: () {
                              Navigator.of(ctx).pop();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Storefront suspension command issued.')),
                              );
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
  }

  Widget _buildDetailSection(bool isDark, {required String title, required Widget content}) {
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
  // REGISTER NEW BUSINESS MODAL
  // =========================================================
  void _openRegisterBusinessModal() {
    final nameCtrl = TextEditingController();
    final areaCtrl = TextEditingController(text: 'Sakasaka');
    final phoneCtrl = TextEditingController();
    final categoryCtrl = TextEditingController(text: 'Artisan & Trade');
    final descCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Register New Business', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
              IconButton(
                icon: const Icon(Icons.close_rounded, size: 20),
                onPressed: () => Navigator.of(ctx).pop(),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Business / Storefront Name *', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                const Gap(4),
                TextField(
                  controller: nameCtrl,
                  decoration: InputDecoration(
                    hintText: 'e.g. Tamale Solar & Tech Hub',
                    hintStyle: const TextStyle(fontSize: 11),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
                const Gap(10),

                const Text('Service Area / Zone *', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                const Gap(4),
                TextField(
                  controller: areaCtrl,
                  decoration: InputDecoration(
                    hintText: 'e.g. Sakasaka, Tamale Central',
                    hintStyle: const TextStyle(fontSize: 11),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
                const Gap(10),

                const Text('Contact Phone Number *', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                const Gap(4),
                TextField(
                  controller: phoneCtrl,
                  decoration: InputDecoration(
                    hintText: '+233 24 000 0000',
                    hintStyle: const TextStyle(fontSize: 11),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
                const Gap(10),

                const Text('Primary Category', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                const Gap(4),
                TextField(
                  controller: categoryCtrl,
                  decoration: InputDecoration(
                    hintText: 'e.g. Solar, Fugu, Plumbing',
                    hintStyle: const TextStyle(fontSize: 11),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
                const Gap(10),

                const Text('Description / Bio', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                const Gap(4),
                TextField(
                  controller: descCtrl,
                  maxLines: 2,
                  decoration: InputDecoration(
                    hintText: 'Brief summary of services and products...',
                    hintStyle: const TextStyle(fontSize: 11),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.all(12),
                  ),
                ),
              ],
            ),
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
                final name = nameCtrl.text.trim();
                if (name.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please enter a business name.')),
                  );
                  return;
                }

                widget.onAdminAction('REGISTER_BUSINESS_PROFILE', payload: {
                  'businessName': name,
                  'serviceArea': areaCtrl.text.trim(),
                  'phone': phoneCtrl.text.trim(),
                  'category': categoryCtrl.text.trim(),
                  'description': descCtrl.text.trim(),
                });
                Navigator.of(ctx).pop();
              },
              child: const Text('Register Storefront ✓', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }
}
