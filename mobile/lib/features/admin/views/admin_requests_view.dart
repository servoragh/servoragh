import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../shared/widgets/servora_card.dart';

class AdminRequestsView extends StatelessWidget {
  final List<dynamic> requests;
  final VoidCallback onRefresh;

  const AdminRequestsView({super.key, required this.requests, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.message_rounded, color: Color(0xFF059669), size: 20),
                    Gap(6),
                    Text('Service Requests & Dispatch Gigs', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  ],
                ),
                Text('${requests.length} Live Customer Service Inquiries', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 18, color: Color(0xFF059669)),
              onPressed: onRefresh,
            ),
          ],
        ),
        const Gap(14),

        if (requests.isEmpty)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(40),
              child: Text('No active service requests right now.', style: TextStyle(color: Colors.grey)),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: requests.length,
            separatorBuilder: (_, __) => const Gap(10),
            itemBuilder: (context, idx) {
              final r = requests[idx];
              final status = r['status']?.toString() ?? 'OPEN';

              return ServoraCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(r['serviceType'] ?? r['title'] ?? 'Customer Gig Request', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(status, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF047857))),
                        ),
                      ],
                    ),
                    const Gap(4),
                    Text('Customer: ${r['customerName'] ?? r['userName'] ?? "Customer"} • Zone: ${r['location'] ?? "Tamale"}', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                    const Gap(6),
                    Text(r['description'] ?? r['details'] ?? 'Job details pending dispatch confirmation.', style: const TextStyle(fontSize: 11)),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }
}
