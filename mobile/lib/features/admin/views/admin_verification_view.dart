import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';

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
  String _filter = 'PENDING';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final pending = widget.providers.where((p) => p['verificationStatus'] != 'VERIFIED').toList();
    final verified = widget.providers.where((p) => p['verificationStatus'] == 'VERIFIED').toList();
    final displayed = _filter == 'PENDING' ? pending : (_filter == 'VERIFIED' ? verified : widget.providers);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.verified_user_rounded, color: ServoraColors.emerald600, size: 20),
                    Gap(6),
                    Text('ID & Ghana Card Verification Queue', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  ],
                ),
                Text('${pending.length} Pending Review • ${verified.length} Verified', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 18, color: ServoraColors.emerald600),
              onPressed: widget.onRefresh,
            ),
          ],
        ),
        const Gap(10),

        // Filter Pills
        Row(
          children: [
            ChoiceChip(
              label: Text('⏳ Pending Review (${pending.length})', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _filter == 'PENDING' ? Colors.white : null)),
              selected: _filter == 'PENDING',
              selectedColor: Colors.amber[800],
              onSelected: (_) => setState(() => _filter = 'PENDING'),
            ),
            const Gap(6),
            ChoiceChip(
              label: Text('🛡️ Verified (${verified.length})', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _filter == 'VERIFIED' ? Colors.white : null)),
              selected: _filter == 'VERIFIED',
              selectedColor: ServoraColors.emerald600,
              onSelected: (_) => setState(() => _filter = 'VERIFIED'),
            ),
            const Gap(6),
            ChoiceChip(
              label: Text('All (${widget.providers.length})', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _filter == 'ALL' ? Colors.white : null)),
              selected: _filter == 'ALL',
              selectedColor: const Color(0xFF2563EB),
              onSelected: (_) => setState(() => _filter = 'ALL'),
            ),
          ],
        ),
        const Gap(14),

        if (displayed.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                children: [
                  const Icon(Icons.check_circle_outline_rounded, size: 44, color: ServoraColors.emerald600),
                  const Gap(10),
                  Text(_filter == 'PENDING' ? 'All verification requests resolved! Zero backlog.' : 'No profiles found.', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.grey)),
                ],
              ),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: displayed.length,
            separatorBuilder: (_, __) => const Gap(10),
            itemBuilder: (context, idx) {
              final p = displayed[idx];
              final isVer = p['verificationStatus'] == 'VERIFIED';

              return ServoraCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            p['businessName'] ?? 'Artisan Storefront',
                            style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isVer ? const Color(0xFFECFDF5) : const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            isVer ? 'VERIFIED' : 'PENDING REVIEW',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                              color: isVer ? const Color(0xFF047857) : const Color(0xFFB45309),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Gap(4),
                    Text('Owner: ${p['user']?['name'] ?? "Artisan"} • Phone: ${p['user']?['phone'] ?? "N/A"}', style: TextStyle(fontSize: 10.5, color: isDark ? Colors.white60 : Colors.grey[700])),
                    Text('Service Area: ${p['serviceArea'] ?? "Tamale Central"}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                    const Gap(10),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isVer ? Colors.amber[700] : const Color(0xFF059669),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          icon: Icon(isVer ? Icons.close_rounded : Icons.verified_user_rounded, size: 14),
                          label: Text(isVer ? 'Revoke Verification' : 'Approve Ghana Card 🛡️', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          onPressed: () => widget.onAdminAction('TOGGLE_VERIFICATION', targetId: p['id']),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }
}
