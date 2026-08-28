import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../shared/widgets/servora_card.dart';

class AdminCommunityView extends StatelessWidget {
  final VoidCallback onRefresh;

  const AdminCommunityView({super.key, required this.onRefresh});

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
                    Icon(Icons.forum_rounded, color: Color(0xFF059669), size: 20),
                    Gap(6),
                    Text('Community Trade Notices & Board', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  ],
                ),
                Text('Moderate public job postings & local trade announcements', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 18, color: Color(0xFF059669)),
              onPressed: onRefresh,
            ),
          ],
        ),
        const Gap(14),

        const ServoraCard(
          padding: EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Active Community Channels in Tamale', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              Gap(8),
              Text('• Sakasaka Artisans & Builders Guild (142 Active Members)', style: TextStyle(fontSize: 11.5)),
              Gap(4),
              Text('• Aboabo Market Wholesalers & Agro Traders (89 Active Members)', style: TextStyle(fontSize: 11.5)),
              Gap(4),
              Text('• Nyohini Solar & Electrical Techs (54 Active Members)', style: TextStyle(fontSize: 11.5)),
            ],
          ),
        ),
      ],
    );
  }
}
