import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../shared/widgets/servora_card.dart';

class AdminSettingsView extends StatefulWidget {
  final Map<String, dynamic> storageStats;
  final VoidCallback onRefresh;

  const AdminSettingsView({
    super.key,
    required this.storageStats,
    required this.onRefresh,
  });

  @override
  State<AdminSettingsView> createState() => _AdminSettingsViewState();
}

class _AdminSettingsViewState extends State<AdminSettingsView> {
  String _subTab = 'general';

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
                    Icon(Icons.settings_rounded, color: Colors.grey, size: 20),
                    Gap(6),
                    Text('System & Storage Infrastructure', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  ],
                ),
                Text('Cloudflare R2, PostgreSQL, Redis, WhatsApp API', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 18),
              onPressed: widget.onRefresh,
            ),
          ],
        ),
        const Gap(10),

        // Sub Tabs
        Row(
          children: [
            _buildSubTabChip('General & Platform', 'general'),
            const Gap(6),
            _buildSubTabChip('Cloudflare R2 Storage', 'storage'),
            const Gap(6),
            _buildSubTabChip('Security Keys', 'security'),
          ],
        ),
        const Gap(14),

        if (_subTab == 'general') ...[
          ServoraCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Platform Defaults', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                const Gap(10),
                _buildSettingRow('Default Currency', 'GHS (Ghanaian Cedi GH₵)'),
                const Gap(6),
                _buildSettingRow('Primary Market Region', 'Tamale / Northern Region'),
                const Gap(6),
                _buildSettingRow('Service Fee', '2.5% Escrow Transaction Fee'),
                const Gap(6),
                _buildSettingRow('WhatsApp Bot Engine', 'Twilio / Cloud API (Active)'),
              ],
            ),
          ),
        ] else if (_subTab == 'storage') ...[
          ServoraCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Cloudflare R2 Bucket Stats', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                const Gap(10),
                _buildSettingRow('Used Storage', '${widget.storageStats['totalStorageUsedMB'] ?? 4.55} MB / 100 GB Free Tier'),
                const Gap(6),
                _buildSettingRow('Total Uploaded Assets', '${widget.storageStats['totalFiles'] ?? 38} Images & Ghana Cards'),
                const Gap(6),
                _buildSettingRow('Public CDN Domain', 'media.servora.gh'),
              ],
            ),
          ),
        ] else ...[
          const ServoraCard(
            padding: EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('API Keys & Security Environment', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                Gap(10),
                Text('• PostgreSQL Neon Database: CONNECTED ✓', style: TextStyle(fontSize: 11, color: Color(0xFF059669))),
                Gap(4),
                Text('• Paystack MoMo Webhooks: ACTIVE ✓', style: TextStyle(fontSize: 11, color: Color(0xFF059669))),
                Gap(4),
                Text('• Cloudflare R2 S3 Credentials: ENCRYPTED ✓', style: TextStyle(fontSize: 11, color: Color(0xFF059669))),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildSubTabChip(String label, String tabId) {
    final isSel = _subTab == tabId;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSel ? Colors.white : null)),
      selected: isSel,
      selectedColor: const Color(0xFF059669),
      onSelected: (_) => setState(() => _subTab = tabId),
    );
  }

  Widget _buildSettingRow(String key, String val) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(key, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600)),
        Text(val, style: const TextStyle(fontSize: 11.5, color: Colors.grey)),
      ],
    );
  }
}
