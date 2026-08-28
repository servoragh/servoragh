import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../shared/widgets/servora_card.dart';

class AdminDisputesView extends StatelessWidget {
  final VoidCallback onRefresh;

  const AdminDisputesView({super.key, required this.onRefresh});

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
                    Icon(Icons.gavel_rounded, color: Colors.red, size: 20),
                    Gap(6),
                    Text('Disputes & Mediation Resolution Desk', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  ],
                ),
                Text('Escrow Holds, Job Re-works & Buyer Refunds', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
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
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: const BoxDecoration(
                  color: Color(0xFFECFDF5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.verified_user_rounded, color: Color(0xFF059669), size: 36),
              ),
              const Gap(12),
              const Text('Zero Active Escrow Disputes', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              const Gap(4),
              const Text('All payments and service contracts across Northern Ghana are in good standing.', textAlign: TextAlign.center, style: TextStyle(fontSize: 11.5, color: Colors.grey)),
            ],
          ),
        ),
      ],
    );
  }
}
