import 'package:flutter/material.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/status_badge.dart';

class ActivityScreen extends StatefulWidget {
  const ActivityScreen({super.key});

  @override
  State<ActivityScreen> createState() => _ActivityScreenState();
}

class _ActivityScreenState extends State<ActivityScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Activity & Transactions 📋'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildActivityCard(
            title: 'Solar Inverter Installation & Wiring',
            type: 'SERVICE CALL',
            status: 'COMPLETED',
            date: '26 Aug 2026',
            provider: 'Kwame Electrical & Solar',
            amount: 'GH₵ 450.00',
          ),
          const SizedBox(height: 12),
          _buildActivityCard(
            title: 'DeWalt 20V Max Power Drill Rental',
            type: 'TOOL RENTAL',
            status: 'ACTIVE',
            date: '25 Aug 2026',
            provider: 'Northern Hardware',
            amount: 'GH₵ 150.00',
          ),
          const SizedBox(height: 12),
          _buildActivityCard(
            title: 'Royal Dagbon Smock (Fugu) Purchase',
            type: 'PRODUCT ORDER',
            status: 'DISPATCHED',
            date: '24 Aug 2026',
            provider: 'Northern Authentic Fugu',
            amount: 'GH₵ 450.00',
          ),
        ],
      ),
    );
  }

  Widget _buildActivityCard({
    required String title,
    required String type,
    required String status,
    required String date,
    required String provider,
    required String amount,
  }) {
    return ServoraCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              StatusBadge(
                label: type,
                backgroundColor: const Color(0xFF059669).withOpacity(0.1),
                textColor: const Color(0xFF059669),
              ),
              Text(
                status,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text('$provider • $date', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(amount, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
              const Text('Details ➔', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
            ],
          ),
        ],
      ),
    );
  }
}
