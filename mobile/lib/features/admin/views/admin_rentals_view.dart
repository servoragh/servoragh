import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../shared/widgets/servora_card.dart';

class AdminRentalsView extends StatelessWidget {
  final VoidCallback onRefresh;

  const AdminRentalsView({super.key, required this.onRefresh});

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
                    Icon(Icons.construction_rounded, color: Color(0xFFD97706), size: 20),
                    Gap(6),
                    Text('Heavy Equipment & Tool Rentals Engine', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  ],
                ),
                Text('Generators, Concrete Mixers, Scaffolding in Northern Ghana', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
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
              const Text('Active Equipment Inventory & Rental Hubs', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              const Gap(10),
              _buildRentalRow('5kVA Honda Silent Generator', 'Available • GH₵ 120/day', const Color(0xFF059669)),
              const Gap(6),
              _buildRentalRow('Electric Concrete Mixer (200L)', 'Rented Out (Sakasaka Site)', const Color(0xFF2563EB)),
              const Gap(6),
              _buildRentalRow('Scaffolding Sets (10 Frames)', 'Available • GH₵ 80/day', const Color(0xFF059669)),
              const Gap(6),
              _buildRentalRow('Heavy Duty Rotary Hammer Drill', 'Maintenance Check', Colors.amber[800]!),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRentalRow(String item, String status, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Text(item, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold))),
          Text(status, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: color)),
        ],
      ),
    );
  }
}
