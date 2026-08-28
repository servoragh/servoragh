import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/constants.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../auth/providers/auth_provider.dart';

class AdminEscrowView extends StatefulWidget {
  final VoidCallback onRefresh;

  const AdminEscrowView({super.key, required this.onRefresh});

  @override
  State<AdminEscrowView> createState() => _AdminEscrowViewState();
}

class _AdminEscrowViewState extends State<AdminEscrowView> {
  bool _isLoading = true;
  List<dynamic> _escrowDeals = [];
  double _totalVaultHeld = 0.0;

  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ServoraConstants.baseUrl,
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 12),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  @override
  void initState() {
    super.initState();
    _fetchEscrowDeals();
  }

  Future<void> _fetchEscrowDeals() async {
    setState(() => _isLoading = true);
    try {
      final token = await authNotifier.storage.getToken();
      final res = await _dio.get(
        '/account/escrow',
        options: Options(
          headers: token != null ? {'Authorization': 'Bearer $token'} : {},
        ),
      );

      if (res.statusCode == 200 && res.data != null) {
        final deals = List<dynamic>.from(res.data['escrowDeals'] ?? []);
        final held = (res.data['totalVaultHeld'] is num)
            ? (res.data['totalVaultHeld'] as num).toDouble()
            : 0.0;

        setState(() {
          _escrowDeals = deals;
          _totalVaultHeld = held;
          _isLoading = false;
        });
      }
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleAdminOverride(String dealId, String action) async {
    try {
      final token = await authNotifier.storage.getToken();
      await _dio.post(
        '/account/escrow',
        data: {'action': action, 'dealId': dealId},
        options: Options(
          headers: token != null ? {'Authorization': 'Bearer $token'} : {},
        ),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF059669),
            content: Text('Escrow deal $dealId updated: $action ✓'),
          ),
        );
      }
      _fetchEscrowDeals();
      widget.onRefresh();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red[700],
            content: Text('Admin action failed: ${e.toString()}'),
          ),
        );
      }
    }
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
                    Icon(Icons.account_balance_wallet_rounded, color: Color(0xFF059669), size: 20),
                    Gap(6),
                    Text('Finance & MoMo Escrow Vault', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  ],
                ),
                Text('Real-Time Customer Escrow Contracts & Payouts', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 18, color: Color(0xFF059669)),
              onPressed: () {
                _fetchEscrowDeals();
                widget.onRefresh();
              },
            ),
          ],
        ),
        const Gap(14),

        // 4 KPI Escrow Cards
        Row(
          children: [
            _buildEscrowStatCard('HELD IN ESCROW VAULT', 'GH₵ ${_totalVaultHeld.toStringAsFixed(2)}', const Color(0xFF059669)),
            const Gap(8),
            _buildEscrowStatCard('ACTIVE CONTRACTS', '${_escrowDeals.length}', Colors.amber[800]!),
          ],
        ),
        const Gap(8),
        Row(
          children: [
            _buildEscrowStatCard('EST. PLATFORM FEES', 'GH₵ ${(_totalVaultHeld * 0.025).toStringAsFixed(2)}', const Color(0xFF2563EB)),
            const Gap(8),
            _buildEscrowStatCard('DISPUTED HOLDS', '${_escrowDeals.where((e) => e['status'] == 'DISPUTED').length}', Colors.red[800]!),
          ],
        ),
        const Gap(14),

        // Escrow Deals List
        Text('CUSTOMER ESCROW DEALS & CONTRACTS (${_escrowDeals.length})', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Colors.grey)),
        const Gap(8),

        if (_isLoading)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Center(child: CircularProgressIndicator(color: Color(0xFF059669))),
          )
        else if (_escrowDeals.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 30),
            child: Center(child: Text('No active customer escrow transactions in database.', style: TextStyle(color: Colors.grey, fontSize: 11.5))),
          )
        else
          ..._escrowDeals.map((deal) {
            final isCompleted = deal['status'] == 'COMPLETED';
            final isDisputed = deal['status'] == 'DISPUTED';

            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: ServoraCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF059669).withOpacity(0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(deal['dealCode'] ?? 'ESC', style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Color(0xFF059669))),
                            ),
                            const Gap(6),
                            Text(deal['title'] ?? 'Contract', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Text('GH₵ ${deal['amount'] ?? 0}', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900)),
                      ],
                    ),
                    const Gap(4),
                    Text('Buyer: ${deal['customer']?['name'] ?? "Customer"} (${deal['customer']?['phone'] ?? ""})', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                    Text('Artisan: ${deal['provider']?['name'] ?? "Artisan"} (${deal['provider']?['phone'] ?? ""})', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                    const Gap(8),

                    // Status & Admin Override Action Buttons
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isCompleted
                                ? const Color(0xFFECFDF5)
                                : isDisputed
                                    ? const Color(0xFFFEF2F2)
                                    : const Color(0xFFFFFBEB),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            deal['status'] ?? 'FUNDS_HELD',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                              color: isCompleted
                                  ? const Color(0xFF047857)
                                  : isDisputed
                                      ? Colors.red[800]
                                      : Colors.amber[900],
                            ),
                          ),
                        ),
                        if (!isCompleted)
                          Row(
                            children: [
                              OutlinedButton(
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                ),
                                onPressed: () => _handleAdminOverride(deal['id'], 'RELEASE_FUNDS'),
                                child: const Text('Admin Release 💳', style: TextStyle(fontSize: 10, color: Color(0xFF059669))),
                              ),
                            ],
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }

  Widget _buildEscrowStatCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: color, letterSpacing: 0.5)),
            const Gap(4),
            Text(value, style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: color)),
          ],
        ),
      ),
    );
  }
}
