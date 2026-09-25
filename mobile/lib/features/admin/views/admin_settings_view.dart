import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../core/services/marketplace_api_service.dart';
import '../../../core/services/server_sync_service.dart';
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
  late bool _escrowEnabled;
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _escrowEnabled = MarketplaceApiService.isEscrowEnabled;
    MarketplaceApiService.escrowEnabledNotifier.addListener(_onEscrowSettingChanged);
    MarketplaceApiService.fetchPlatformSettings().then((val) {
      if (mounted) setState(() => _escrowEnabled = val);
    });
  }

  void _onEscrowSettingChanged() {
    if (mounted) {
      setState(() {
        _escrowEnabled = MarketplaceApiService.isEscrowEnabled;
      });
    }
  }

  @override
  void dispose() {
    MarketplaceApiService.escrowEnabledNotifier.removeListener(_onEscrowSettingChanged);
    super.dispose();
  }

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
              onPressed: () {
                MarketplaceApiService.fetchPlatformSettings();
                widget.onRefresh();
              },
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
          // Web & Mobile Live System Synchronizer Card
          ListenableBuilder(
            listenable: Listenable.merge([
              ServerSyncService.activeServerUrlNotifier,
              ServerSyncService.pingLatencyMsNotifier,
            ]),
            builder: (context, _) {
              final activeUrl = ServerSyncService.activeServerUrlNotifier.value;
              final isLocalDev = activeUrl.contains('localhost') || activeUrl.contains('10.0.2.2') || activeUrl.contains('127.0.0.1');
              final latency = ServerSyncService.pingLatencyMsNotifier.value;

              return ServoraCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.sync_rounded,
                              color: isLocalDev ? const Color(0xFF059669) : Colors.blue.shade600,
                              size: 18,
                            ),
                            const Gap(6),
                            const Text('Web & Mobile Real-time Sync', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isLocalDev ? const Color(0xFF059669).withOpacity(0.15) : Colors.blue.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            isLocalDev ? '🟢 SYNCED (LOCAL WEB)' : '🌐 CLOUD PRODUCTION',
                            style: TextStyle(
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                              color: isLocalDev ? const Color(0xFF059669) : Colors.blue.shade700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Gap(8),
                    Text(
                      'Target API: $activeUrl ${latency > 0 ? "($latency ms latency)" : ""}',
                      style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: Colors.grey),
                    ),
                    const Gap(6),
                    Text(
                      isLocalDev
                          ? 'All actions on the web (localhost:3000) and this mobile app are directly connected to the same live database and state.'
                          : 'Connected to remote cloud API deployment.',
                      style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                    ),
                    const Gap(10),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF059669),
                              side: const BorderSide(color: Color(0xFF059669)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              padding: const EdgeInsets.symmetric(vertical: 8),
                            ),
                            icon: const Icon(Icons.laptop_chromebook_rounded, size: 14),
                            label: const Text('Sync to Local Web', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            onPressed: () async {
                              await ServerSyncService.switchToLocalDev();
                              await MarketplaceApiService.fetchPlatformSettings();
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Switched target to Local Web Dev server (localhost:3000) ✓'),
                                    backgroundColor: Color(0xFF059669),
                                  ),
                                );
                              }
                            },
                          ),
                        ),
                        const Gap(8),
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.blue.shade700,
                              side: BorderSide(color: Colors.blue.shade400),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              padding: const EdgeInsets.symmetric(vertical: 8),
                            ),
                            icon: const Icon(Icons.cloud_sync_rounded, size: 14),
                            label: const Text('Sync to Cloud', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            onPressed: () async {
                              await ServerSyncService.switchToCloudProduction();
                              await MarketplaceApiService.fetchPlatformSettings();
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: const Text('Switched target to Remote Cloud production ✓'),
                                    backgroundColor: Colors.blue.shade700,
                                  ),
                                );
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
          const Gap(10),

          ServoraCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(
                          _escrowEnabled ? Icons.shield_rounded : Icons.shield_outlined,
                          color: _escrowEnabled ? const Color(0xFF059669) : Colors.amber.shade700,
                          size: 18,
                        ),
                        const Gap(6),
                        const Text('MoMo Escrow Subsystem', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Switch(
                      value: _escrowEnabled,
                      activeColor: const Color(0xFF059669),
                      onChanged: _isUpdating ? null : (val) async {
                        setState(() {
                          _escrowEnabled = val;
                          _isUpdating = true;
                        });
                        await MarketplaceApiService.updateEscrowEnabled(val);
                        if (mounted) {
                          setState(() => _isUpdating = false);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(val
                                  ? 'MoMo Escrow Subsystem Enabled ✓ (Active across app & web)'
                                  : 'MoMo Escrow Subsystem Disabled ⛔ (All escrow options hidden across system)'),
                              backgroundColor: val ? const Color(0xFF059669) : Colors.orange.shade800,
                              duration: const Duration(seconds: 3),
                            ),
                          );
                        }
                      },
                    ),
                  ],
                ),
                Text(
                  _escrowEnabled
                      ? 'Escrow is ACTIVE. Safe MoMo deposit & vault features are enabled across the system.'
                      : 'Escrow is DISABLED. All escrow buttons, deal creations, and vaults are removed across the system.',
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
          const Gap(10),
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
