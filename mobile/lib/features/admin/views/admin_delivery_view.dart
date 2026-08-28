import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../shared/widgets/servora_card.dart';

class AdminDeliveryView extends StatelessWidget {
  final VoidCallback onRefresh;

  const AdminDeliveryView({super.key, required this.onRefresh});

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
                    Icon(Icons.local_shipping_rounded, color: Color(0xFF2563EB), size: 20),
                    Gap(6),
                    Text('Delivery Fleet & Dispatch Hub', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  ],
                ),
                Text('Motorcycle Couriers & Instant Dispatch in Tamale', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 18, color: Color(0xFF2563EB)),
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
              const Text('Active Dispatch Hubs & Zones', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              const Gap(10),
              _buildDispatchRow('Tamale Central (Central Market Hub)', '4 Couriers Online', const Color(0xFF059669)),
              const Gap(6),
              _buildDispatchRow('Sakasaka & Aboabo Hub', '3 Couriers Online', const Color(0xFF059669)),
              const Gap(6),
              _buildDispatchRow('Dungu & UDS Campus Hub', '2 Couriers Online', const Color(0xFF2563EB)),
              const Gap(6),
              _buildDispatchRow('Nyohini & Lamashegu Zone', '1 Courier Online', Colors.amber[800]!),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDispatchRow(String zone, String status, Color color) {
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
          Expanded(child: Text(zone, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold))),
          Text(status, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: color)),
        ],
      ),
    );
  }
}
