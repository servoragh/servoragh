import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../shared/widgets/servora_card.dart';

class AdminTickersView extends StatelessWidget {
  final VoidCallback onRefresh;

  const AdminTickersView({super.key, required this.onRefresh});

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
                    Icon(Icons.campaign_rounded, color: Color(0xFFD97706), size: 20),
                    Gap(6),
                    Text('Announcement Tickers & Broadcasts', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  ],
                ),
                Text('Real-time scrolling banners on mobile & web headers', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 18, color: Color(0xFFD97706)),
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
              const Text('Active Public Broadcast Tickers', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              const Gap(10),
              _buildTickerCard(
                '⚡ Welcome to Servora.gh — Northern Ghana’s #1 Verified Artisan & Trade Marketplace!',
                'ACTIVE BROADCAST',
                const Color(0xFF059669),
              ),
              const Gap(8),
              _buildTickerCard(
                '🛡️ Ghana Card Verification Campaign: Get Verified in Tamale for 0 GHS this month!',
                'CAMPAIGN ACTIVE',
                const Color(0xFF2563EB),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTickerCard(String text, String status, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(text, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600)),
          const Gap(6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(status, style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: color)),
          ),
        ],
      ),
    );
  }
}
