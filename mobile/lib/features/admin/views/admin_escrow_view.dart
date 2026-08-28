import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../shared/widgets/servora_card.dart';

class AdminEscrowView extends StatelessWidget {
  final VoidCallback onRefresh;

  const AdminEscrowView({super.key, required this.onRefresh});

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
                    Text('Finance & Mobile Money Escrow Hub', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  ],
                ),
                Text('Paystack / Hubtel Escrow Settlement Engine', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 18, color: Color(0xFF059669)),
              onPressed: onRefresh,
            ),
          ],
        ),
        const Gap(14),

        // 3 Escrow Stats Cards
        Row(
          children: [
            _buildEscrowStatCard('TOTAL SETTLED', 'GH₵ 19,780.00', const Color(0xFF059669)),
            const Gap(8),
            _buildEscrowStatCard('IN ESCROW HOLD', 'GH₵ 450.00', Colors.amber[800]!),
          ],
        ),
        const Gap(8),
        Row(
          children: [
            _buildEscrowStatCard('PLATFORM FEE (2.5%)', 'GH₵ 494.50', const Color(0xFF2563EB)),
            const Gap(8),
            _buildEscrowStatCard('DISPUTED HOLDS', 'GH₵ 0.00', Colors.red[800]!),
          ],
        ),
        const Gap(14),

        ServoraCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Escrow Settlement Policy', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              const Gap(6),
              const Text(
                'Buyer deposits via MTN MoMo / Telecel Cash are locked securely until artisan completes the job and customer confirms delivery with 4-digit PIN.',
                style: TextStyle(fontSize: 11.5, color: Colors.grey, height: 1.4),
              ),
              const Gap(12),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.download_rounded, size: 14),
                label: const Text('Export MoMo Settlement Ledger (CSV)'),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Exporting CSV financial statement...')),
                  );
                },
              ),
            ],
          ),
        ),
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
            Text(label, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: color, letterSpacing: 0.5)),
            const Gap(4),
            Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: color)),
          ],
        ),
      ),
    );
  }
}
