import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../shared/widgets/servora_card.dart';

class AdminSecurityView extends StatelessWidget {
  final List<dynamic> users;
  final VoidCallback onRefresh;
  final Function(String action, {String? targetId, dynamic payload}) onAdminAction;

  const AdminSecurityView({
    super.key,
    required this.users,
    required this.onRefresh,
    required this.onAdminAction,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.security_rounded, color: Colors.red, size: 20),
                    Gap(6),
                    Text('Security & Risk Control Engine', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  ],
                ),
                Text('Device Fingerprints, IP Locks & Fraud Indices', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 18, color: Colors.red),
              onPressed: onRefresh,
            ),
          ],
        ),
        const Gap(14),

        ServoraCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.shield_outlined, size: 16, color: Color(0xFF059669)),
                  Gap(6),
                  Text('Active Security Rules & Heuristics', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                ],
              ),
              const Gap(10),
              _buildRuleRow('Multi-Account IP Velocity Check', 'ACTIVE', const Color(0xFF059669)),
              const Gap(6),
              _buildRuleRow('MoMo Escrow Hold on High-Value Orders', 'ACTIVE (> GH₵ 500)', const Color(0xFF059669)),
              const Gap(6),
              _buildRuleRow('Tamale Central GPS Geo-Fence Matching', 'ACTIVE (Tamale / Bolga)', const Color(0xFF2563EB)),
              const Gap(6),
              _buildRuleRow('Dispute Escalation Auto-Lock', 'ACTIVE (2+ Flags)', Colors.amber[800]!),
            ],
          ),
        ),
        const Gap(14),

        ServoraCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('System Quarantine & User Role Elevation', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              const Gap(8),
              const Text('Promote trusted operations team members to ADMIN or demote restricted accounts.', style: TextStyle(fontSize: 11, color: Colors.grey)),
              const Gap(12),
              ...users.take(6).map((u) {
                final role = u['role']?.toString().toUpperCase() ?? 'CUSTOMER';
                final isAdmin = role == 'ADMIN';
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(u['name'] ?? 'Member', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            Text('${u['phone'] ?? "No Phone"} • Role: $role', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isAdmin ? Colors.red[800] : const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () => onAdminAction('TOGGLE_USER_ROLE', targetId: u['id']),
                        child: Text(isAdmin ? 'Demote Role' : 'Promote Admin 🛡️', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRuleRow(String rule, String status, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Text(rule, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
          Text(status, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: color)),
        ],
      ),
    );
  }
}
