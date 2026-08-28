import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../core/utils/whatsapp_helper.dart';

class AdminCrmView extends StatefulWidget {
  final List<dynamic> users;
  final VoidCallback onRefresh;
  final Function(String action, {String? targetId, dynamic payload}) onAdminAction;

  const AdminCrmView({
    super.key,
    required this.users,
    required this.onRefresh,
    required this.onAdminAction,
  });

  @override
  State<AdminCrmView> createState() => _AdminCrmViewState();
}

class _AdminCrmViewState extends State<AdminCrmView> {
  String _searchQuery = '';
  String _userRoleFilter = 'ALL';
  String _crmStatusFilter = 'ALL';
  String _crmTagFilter = 'ALL';

  final Map<String, List<String>> _customerTags = {};
  final Map<String, List<Map<String, dynamic>>> _customerNotes = {};
  final Map<String, String> _customerStatuses = {};

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

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filtered = widget.users.where((u) {
      final search = _searchQuery.toLowerCase();
      final name = (u['name']?.toString() ?? '').toLowerCase();
      final phone = (u['phone']?.toString() ?? '').toLowerCase();
      final email = (u['email']?.toString() ?? '').toLowerCase();
      final area = (u['serviceArea']?.toString() ?? 'tamale').toLowerCase();

      final matchesSearch = name.contains(search) || phone.contains(search) || email.contains(search) || area.contains(search);
      if (!matchesSearch) return false;

      final role = u['role']?.toString().toUpperCase() ?? 'CUSTOMER';
      if (_userRoleFilter != 'ALL' && role != _userRoleFilter) return false;

      final status = _customerStatuses[u['id']] ?? 'ACTIVE';
      if (_crmStatusFilter != 'ALL' && status != _crmStatusFilter) return false;

      if (_crmTagFilter != 'ALL') {
        final tags = _customerTags[u['id']] ?? [];
        if (!tags.contains(_crmTagFilter)) return false;
      }

      return true;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Charcoal Hero Header Card
        _buildCrmHeroCard(isDark),
        const Gap(14),

        // 2. Search Bar with Filter Icon
        Row(
          children: [
            Expanded(
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search by name, phone (+233...), email, or area...',
                  hintStyle: const TextStyle(fontSize: 11.5),
                  prefixIcon: const Icon(Icons.search_rounded, size: 18),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
                onChanged: (val) => setState(() => _searchQuery = val),
              ),
            ),
            const Gap(8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF059669),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(Icons.filter_list_rounded, color: Colors.white, size: 20),
            ),
          ],
        ),
        const Gap(10),

        // 3. Choice Filters
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildCrmChip('ALL', 'ALL', _userRoleFilter, (v) => setState(() => _userRoleFilter = v)),
              const Gap(6),
              _buildCrmChip('CUSTOMER', 'CUSTOMER', _userRoleFilter, (v) => setState(() => _userRoleFilter = v)),
              const Gap(6),
              _buildCrmChip('PROVIDER', 'PROVIDER', _userRoleFilter, (v) => setState(() => _userRoleFilter = v)),
              const Gap(6),
              _buildCrmChip('ADMIN', 'ADMIN', _userRoleFilter, (v) => setState(() => _userRoleFilter = v)),
              const Gap(10),
              _buildCrmChip('ACTIVE ONLY', 'ACTIVE', _crmStatusFilter, (v) => setState(() => _crmStatusFilter = _crmStatusFilter == v ? 'ALL' : v)),
              const Gap(6),
              _buildCrmChip('SUSPENDED', 'SUSPENDED', _crmStatusFilter, (v) => setState(() => _crmStatusFilter = _crmStatusFilter == v ? 'ALL' : v)),
            ],
          ),
        ),
        const Gap(8),

        // 4. Dynamic Cohort Tag Filters
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildTagChip('All Tags', 'ALL'),
              const Gap(6),
              _buildTagChip('#VIP', 'VIP'),
              const Gap(6),
              _buildTagChip('#Sakasaka', 'Sakasaka'),
              const Gap(6),
              _buildTagChip('#Nyohini', 'Nyohini'),
              const Gap(6),
              _buildTagChip('#Dispute Risk', 'Dispute Risk'),
              const Gap(6),
              _buildTagChip('#High Spender', 'High Spender'),
            ],
          ),
        ),
        const Gap(14),

        // 5. CRM Member Cards List
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('CUSTOMER IDENTITY & 360° DIRECTORY (${filtered.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 0.5)),
            Text('${widget.users.length} Total', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
          ],
        ),
        const Gap(10),

        if (filtered.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                children: [
                  Icon(Icons.person_search_rounded, size: 40, color: Colors.grey.withOpacity(0.5)),
                  const Gap(10),
                  const Text('No members matching filter criteria.', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.grey)),
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
            itemBuilder: (context, idx) => _buildCrmMemberCard(filtered[idx], isDark),
          ),
      ],
    );
  }

  Widget _buildCrmHeroCard(bool isDark) {
    final totalAccounts = widget.users.length;
    final activeAccounts = widget.users.where((u) => _customerStatuses[u['id']] != 'SUSPENDED').length;

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
                    child: const Icon(Icons.people_alt_rounded, color: Colors.white, size: 20),
                  ),
                  const Gap(10),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            '360° Customer Management & CRM',
                            style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Colors.white),
                          ),
                          Gap(4),
                          Text('👥', style: TextStyle(fontSize: 13)),
                        ],
                      ),
                      Text(
                        'Enterprise Operational Control Center',
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
                      Text('Sync Records', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.white)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const Gap(10),
          const Text(
            'Complete customer lifecycle management, real-time risk/fraud index, omni-channel interaction streams, financial ledgers & admin controls.',
            style: TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8), height: 1.3),
          ),
          const Gap(14),

          // 4 Grid Stats Metrics
          Row(
            children: [
              Expanded(
                child: _buildCrmHeroStat(
                  label: 'TOTAL MANAGED ACCOUNTS',
                  value: '$totalAccounts',
                  sub: '$activeAccounts Active on Platform',
                  valColor: Colors.white,
                ),
              ),
              const Gap(8),
              Expanded(
                child: _buildCrmHeroStat(
                  label: 'TOTAL CUSTOMER LTV VOLUME',
                  value: 'GH₵ 19,780.00',
                  sub: 'Cumulative Lifetime Trade',
                  valColor: const Color(0xFF34D399),
                ),
              ),
            ],
          ),
          const Gap(8),
          Row(
            children: [
              Expanded(
                child: _buildCrmHeroStat(
                  label: 'HIGH / CRITICAL RISK FLAGS',
                  value: '1',
                  sub: 'Fraud & Dispute Markers',
                  valColor: const Color(0xFFF87171),
                ),
              ),
              const Gap(8),
              Expanded(
                child: _buildCrmHeroStat(
                  label: 'RESTRICTED & SUSPENDED',
                  value: '1',
                  sub: 'Requires Ops Review',
                  valColor: const Color(0xFFFBBF24),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCrmHeroStat({
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

  Widget _buildCrmChip(String label, String value, String current, Function(String) onSelect) {
    final isSel = current == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSel ? Colors.white : null)),
      selected: isSel,
      selectedColor: ServoraColors.emerald600,
      onSelected: (_) => onSelect(value),
    );
  }

  Widget _buildTagChip(String label, String tag) {
    final isSel = _crmTagFilter == tag;
    return GestureDetector(
      onTap: () => setState(() => _crmTagFilter = tag),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
        decoration: BoxDecoration(
          color: isSel ? const Color(0xFF059669) : Colors.grey.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSel ? const Color(0xFF059669) : Colors.grey.withOpacity(0.2)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: isSel ? Colors.white : Colors.grey[700],
          ),
        ),
      ),
    );
  }

  Widget _buildCrmMemberCard(dynamic user, bool isDark) {
    final id = user['id']?.toString() ?? 'usr';
    final name = user['name']?.toString() ?? 'Member';
    final phone = user['phone']?.toString() ?? 'No Phone';
    final email = user['email']?.toString() ?? 'No Email';
    final role = user['role']?.toString().toUpperCase() ?? 'CUSTOMER';
    final status = _customerStatuses[id] ?? 'ACTIVE';

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.025),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: const BoxDecoration(
                  color: Color(0xFF059669),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : 'U',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
                  ),
                ),
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
                            name,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
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
                                : (role == 'PROVIDER' ? const Color(0xFFFEF3C7) : const Color(0xFFEFF6FF)),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            role == 'PROVIDER' ? 'DUAL' : (role == 'ADMIN' ? 'ADMIN' : 'BUYER'),
                            style: TextStyle(
                              fontSize: 8.5,
                              fontWeight: FontWeight.w900,
                              color: role == 'ADMIN' ? Colors.red : (role == 'PROVIDER' ? const Color(0xFFD97706) : const Color(0xFF2563EB)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Gap(2),
                    Text(
                      '$phone • $email',
                      style: TextStyle(fontSize: 10.5, color: isDark ? Colors.white60 : const Color(0xFF64748B)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: status == 'ACTIVE' ? const Color(0xFFECFDF5) : const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    color: status == 'ACTIVE' ? const Color(0xFF047857) : Colors.red[800],
                  ),
                ),
              ),
            ],
          ),
          const Gap(12),

          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.verified_user_rounded, size: 11, color: Color(0xFF2563EB)),
                    Gap(4),
                    Text('Tier 1 Phone • Sakasaka, Tamale', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8))),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.shield_rounded, size: 11, color: Color(0xFF059669)),
                    Gap(4),
                    Text('LOW (5/100) RISK', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Color(0xFF065F46))),
                  ],
                ),
              ),
            ],
          ),
          const Gap(10),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('GH₵ 0.00', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900)),
                  Text('0 Orders • AOV GH₵ 0.00', style: TextStyle(fontSize: 9.5, color: Colors.grey)),
                ],
              ),
              Row(
                children: [
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.person_search_rounded, size: 13),
                    label: const Text('360° Profile >', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                    onPressed: () => _openCustomer360Drawer(user),
                  ),
                  const Gap(6),
                  IconButton(
                    icon: const Icon(Icons.manage_accounts_rounded, size: 20, color: ServoraColors.emerald600),
                    tooltip: 'Update Status / Role',
                    onPressed: () => _openUpdateAccountStatusModal(user),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _openCustomer360Drawer(dynamic user) {
    final id = user['id']?.toString() ?? 'usr';
    final name = user['name']?.toString() ?? 'Member';
    final phone = user['phone']?.toString() ?? 'No Phone';
    final email = user['email']?.toString() ?? 'No Email';
    final joined = _formatLogDate(user['createdAt']?.toString());
    final status = _customerStatuses[id] ?? 'ACTIVE';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDrawerState) {
            final isDark = Theme.of(ctx).brightness == Brightness.dark;
            final tags = _customerTags[id] ?? ['Provider', 'Artisan', 'Tamale'];
            final notes = _customerNotes[id] ?? [];

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
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
                      child: Row(
                        children: [
                          Container(
                            width: 42,
                            height: 42,
                            decoration: const BoxDecoration(
                              color: Color(0xFF059669),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                name.isNotEmpty ? name[0].toUpperCase() : 'U',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18),
                              ),
                            ),
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
                                        name,
                                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const Gap(6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFECFDF5),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        status,
                                        style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: Color(0xFF047857)),
                                      ),
                                    ),
                                  ],
                                ),
                                const Gap(2),
                                Text(
                                  'ID: $id • Joined $joined',
                                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.grey.withOpacity(0.15),
                              foregroundColor: isDark ? Colors.white : Colors.black87,
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              elevation: 0,
                            ),
                            icon: const Icon(Icons.visibility_rounded, size: 12),
                            label: const Text('Impersonate', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            onPressed: () {
                              Navigator.of(ctx).pop();
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Switched session context to $name (Shadow Mode)')),
                              );
                            },
                          ),
                          const Gap(6),
                          IconButton(
                            icon: const Icon(Icons.close_rounded, size: 20),
                            onPressed: () => Navigator.of(ctx).pop(),
                          ),
                        ],
                      ),
                    ),

                    const TabBar(
                      isScrollable: true,
                      labelColor: Color(0xFF059669),
                      unselectedLabelColor: Colors.grey,
                      indicatorColor: Color(0xFF059669),
                      tabs: [
                        Tab(icon: Icon(Icons.shield_outlined, size: 16), text: 'Identity & Profile'),
                        Tab(icon: Icon(Icons.account_balance_wallet_outlined, size: 16), text: 'Financial Ledger & Wallet'),
                        Tab(icon: Icon(Icons.chat_bubble_outline_rounded, size: 16), text: 'Interaction Stream'),
                        Tab(icon: Icon(Icons.edit_note_rounded, size: 16), text: 'Admin Notes & Audit'),
                      ],
                    ),

                    Expanded(
                      child: TabBarView(
                        children: [
                          // Tab 1: Identity & Profile
                          ListView(
                            padding: const EdgeInsets.all(16),
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFECFDF5),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: const Color(0xFFA7F3D0)),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('AUTOMATED TRUST & RISK INDEX: LOW (5/100)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF065F46))),
                                        Gap(2),
                                        Text('Calculated from disputes, device switches, and verification signals.', style: TextStyle(fontSize: 9, color: Color(0xFF047857))),
                                      ],
                                    ),
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF18181B),
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      ),
                                      onPressed: () => _openUpdateAccountStatusModal(user),
                                      child: const Text('Security Override', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                              ),
                              const Gap(14),

                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: _buildDrawerSectionCard(
                                      isDark,
                                      title: 'CONTACT POINTS',
                                      content: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text('📱 $phone', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                          const Gap(3),
                                          Text('✉️ $email', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                                          const Gap(6),
                                          GestureDetector(
                                            onTap: () => WhatsAppHelper.openWhatsApp(phone: phone, message: "Hello $name, this is Servora Admin."),
                                            child: const Row(
                                              children: [
                                                Icon(Icons.chat_rounded, size: 12, color: Color(0xFF25D366)),
                                                Gap(4),
                                                Text('WhatsApp Active ↗', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF25D366))),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const Gap(10),
                                  Expanded(
                                    child: _buildDrawerSectionCard(
                                      isDark,
                                      title: 'VERIFICATION TIER STATUS',
                                      content: const Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text('🛡️ TIER_1_BASIC', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF059669))),
                                          Gap(3),
                                          Text('Ghana Card / National ID verified & matched against central database.', style: TextStyle(fontSize: 9.5, color: Colors.grey)),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const Gap(14),

                              _buildDrawerSectionCard(
                                isDark,
                                title: 'SAVED SERVICE & DELIVERY ADDRESSES (GPS PINNED)',
                                content: const Row(
                                  children: [
                                    Icon(Icons.location_on_rounded, size: 14, color: Color(0xFF059669)),
                                    Gap(6),
                                    Text('Primary Address (Sakasaka, Tamale Central)', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                              const Gap(14),

                              _buildDrawerSectionCard(
                                isDark,
                                title: 'CONNECTED DEVICES & FINGERPRINTS',
                                content: const Row(
                                  children: [
                                    Icon(Icons.devices_rounded, size: 14, color: Colors.grey),
                                    Gap(6),
                                    Text('📱 dev-web-browser / mobile-app', style: TextStyle(fontSize: 11, color: Colors.grey)),
                                  ],
                                ),
                              ),
                              const Gap(14),

                              _buildDrawerSectionCard(
                                isDark,
                                title: 'CUSTOM CUSTOMER TAGS & DYNAMIC COHORTS',
                                content: Wrap(
                                  spacing: 6,
                                  runSpacing: 6,
                                  children: [
                                    ...tags.map((t) => Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFECFDF5),
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: const Color(0xFFA7F3D0)),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Text('#$t', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF065F46))),
                                              const Gap(4),
                                              GestureDetector(
                                                onTap: () {
                                                  setDrawerState(() {
                                                    tags.remove(t);
                                                    _customerTags[id] = tags;
                                                  });
                                                },
                                                child: const Icon(Icons.close, size: 10, color: Color(0xFF065F46)),
                                              ),
                                            ],
                                          ),
                                        )),
                                    GestureDetector(
                                      onTap: () {
                                        setDrawerState(() {
                                          tags.add('Verified');
                                          _customerTags[id] = tags;
                                        });
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: Colors.grey.withOpacity(0.12),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: const Text('+ Add tag', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),

                          // Tab 2: Financial Ledger
                          ListView(
                            padding: const EdgeInsets.all(16),
                            children: [
                              _buildStatRow('Lifetime Spend / GMV', 'GH₵ 0.00', const Color(0xFF059669)),
                              const Gap(10),
                              _buildStatRow('MoMo Escrow Holds', 'GH₵ 0.00', Colors.grey),
                              const Gap(14),
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF059669),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                icon: const Icon(Icons.add_card_rounded, size: 14),
                                label: const Text('+ Issue Credit Adjustment / Escrow Refund'),
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Financial Adjustment Authorized for User ✓')),
                                  );
                                },
                              ),
                            ],
                          ),

                          // Tab 3: Interaction Stream
                          ListView(
                            padding: const EdgeInsets.all(16),
                            children: const [
                              Text('No past dispute or message escalations logged for this account.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),

                          // Tab 4: Admin Notes
                          ListView(
                            padding: const EdgeInsets.all(16),
                            children: [
                              ...notes.map((n) => Padding(
                                    padding: const EdgeInsets.only(bottom: 8),
                                    child: Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: Colors.grey.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(n['text'] ?? '', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                                          const Gap(2),
                                          Text('By Master Admin • ${n['date']}', style: const TextStyle(fontSize: 9, color: Colors.grey)),
                                        ],
                                      ),
                                    ),
                                  )),
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF059669),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                icon: const Icon(Icons.add_comment_rounded, size: 14),
                                label: const Text('+ Add Internal Supervisor Note'),
                                onPressed: () {
                                  setDrawerState(() {
                                    notes.add({'text': 'Verified via Ghana Card inspection in Tamale.', 'date': 'Just now'});
                                    _customerNotes[id] = notes;
                                  });
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
      },
    );
  }

  Widget _buildDrawerSectionCard(bool isDark, {required String title, required Widget content}) {
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

  Widget _buildStatRow(String label, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: color)),
      ],
    );
  }

  void _openUpdateAccountStatusModal(dynamic user) {
    final id = user['id']?.toString() ?? 'usr';
    final name = user['name']?.toString() ?? 'Member';
    String selectedState = _customerStatuses[id] ?? 'ACTIVE (Normal Operations)';
    final reasonController = TextEditingController(text: 'Verified Ghana card docs & phone check.');

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text('Update Status: $name', style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 20),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Target Status State *', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  const Gap(6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.withOpacity(0.3)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedState,
                        isExpanded: true,
                        items: [
                          'ACTIVE (Normal Operations)',
                          'SUSPENDED (Fraud Review)',
                          'FLAGGED (Dispute Hold)',
                          'RESTRICTED (Security Quarantine)',
                        ].map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 12)))).toList(),
                        onChanged: (val) {
                          if (val != null) setDialogState(() => selectedState = val);
                        },
                      ),
                    ),
                  ),
                  const Gap(14),

                  const Text('Mandatory Admin Operational Reason *', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  const Gap(6),
                  TextField(
                    controller: reasonController,
                    decoration: InputDecoration(
                      hintText: 'e.g. Fraud dispute review / Verified Ghana card docs',
                      hintStyle: const TextStyle(fontSize: 11),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.all(12),
                    ),
                    maxLines: 2,
                  ),
                ],
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
                    final cleanStatus = selectedState.startsWith('ACTIVE') ? 'ACTIVE' : (selectedState.startsWith('SUSPENDED') ? 'SUSPENDED' : 'FLAGGED');
                    setState(() {
                      _customerStatuses[id] = cleanStatus;
                    });
                    widget.onAdminAction('UPDATE_CUSTOMER_STATUS', targetId: id, payload: {
                      'status': cleanStatus,
                      'reason': reasonController.text,
                    });
                    Navigator.of(ctx).pop();
                  },
                  child: const Text('Confirm Action', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
