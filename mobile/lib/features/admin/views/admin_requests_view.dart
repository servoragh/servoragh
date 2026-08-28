import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/constants.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../auth/providers/auth_provider.dart';

class AdminRequestsView extends StatelessWidget {
  final List<dynamic> requests;
  final VoidCallback onRefresh;

  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ServoraConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  const AdminRequestsView({super.key, required this.requests, required this.onRefresh});

  Future<void> _updateStatus(BuildContext context, String reqId, String newStatus) async {
    try {
      final token = await authNotifier.storage.getToken();
      final res = await _dio.patch(
        '/requests/$reqId',
        data: {'status': newStatus},
        options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}),
      );
      if (res.statusCode == 200) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFF059669),
              content: Text('Request marked as $newStatus ✓'),
            ),
          );
        }
        onRefresh();
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.red[700], content: Text('Error updating: $e')),
        );
      }
    }
  }

  Future<void> _deleteRequest(BuildContext context, String reqId) async {
    try {
      final token = await authNotifier.storage.getToken();
      final res = await _dio.delete(
        '/requests/$reqId',
        options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}),
      );
      if (res.statusCode == 200) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: Colors.red,
              content: Text('Request permanently deleted from platform 🗑️'),
            ),
          );
        }
        onRefresh();
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.red[700], content: Text('Error deleting: $e')),
        );
      }
    }
  }

  void _openWhatsApp(String rawPhone, String customerName, String title) async {
    final cleanPhone = rawPhone.replaceAll(RegExp(r'[^0-9]'), '');
    final fullPhone = cleanPhone.startsWith('0') ? '233${cleanPhone.substring(1)}' : cleanPhone;
    final url = Uri.parse(
      'https://wa.me/$fullPhone?text=${Uri.encodeComponent('Hello $customerName, this is Servora Admin regarding your request "$title". How can we assist you with your artisan quotes today?')}',
    );
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  void _openCall(String rawPhone) async {
    final url = Uri.parse('tel:$rawPhone');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  void _showModerationSheet(BuildContext context, dynamic r) {
    final reqId = r['id']?.toString() ?? '';
    final status = r['status']?.toString() ?? 'OPEN';
    final title = r['title']?.toString() ?? 'Customer Request';
    final customerName = r['customer']?['name'] ?? r['customerName'] ?? r['guestName'] ?? 'Customer';
    final phone = r['customer']?['phone'] ?? r['customerPhone'] ?? r['guestPhone'] ?? '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('STATUS: $status', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10, color: Color(0xFF047857))),
                ),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.of(ctx).pop()),
              ],
            ),
            const Gap(6),
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
            const Gap(4),
            Text('Customer: $customerName • $phone', style: const TextStyle(fontSize: 12, color: Colors.grey)),
            const Gap(10),
            Text(r['description'] ?? r['details'] ?? '', style: const TextStyle(fontSize: 12)),
            const Gap(16),

            // WhatsApp & Call Buttons
            if (phone.isNotEmpty) ...[
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669), foregroundColor: Colors.white),
                      icon: const Icon(Icons.chat_rounded, size: 16),
                      label: const Text('WhatsApp 💬', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      onPressed: () {
                        Navigator.of(ctx).pop();
                        _openWhatsApp(phone, customerName, title);
                      },
                    ),
                  ),
                  const Gap(8),
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.phone_rounded, size: 16),
                      label: const Text('Call 📞', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      onPressed: () {
                        Navigator.of(ctx).pop();
                        _openCall(phone);
                      },
                    ),
                  ),
                ],
              ),
              const Gap(12),
            ],

            // Moderation Actions
            if (status == 'OPEN' || status == 'PUBLISHED')
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700], foregroundColor: Colors.white),
                icon: const Icon(Icons.block_rounded, size: 16),
                label: const Text('Take Down / Suspend Request 🚫'),
                onPressed: () {
                  Navigator.of(ctx).pop();
                  _updateStatus(context, reqId, 'SUSPENDED');
                },
              )
            else
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669), foregroundColor: Colors.white),
                icon: const Icon(Icons.check_circle_rounded, size: 16),
                label: const Text('Approve & Make Public ✅'),
                onPressed: () {
                  Navigator.of(ctx).pop();
                  _updateStatus(context, reqId, 'OPEN');
                },
              ),

            const Gap(8),
            TextButton.icon(
              style: TextButton.styleFrom(foregroundColor: Colors.red),
              icon: const Icon(Icons.delete_outline_rounded, size: 16),
              label: const Text('Delete Permanently 🗑️', style: TextStyle(fontWeight: FontWeight.bold)),
              onPressed: () {
                Navigator.of(ctx).pop();
                _deleteRequest(context, reqId);
              },
            ),
          ],
        ),
      ),
    );
  }

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
                Text('${requests.length} Live Requests • Tap to Moderate & WhatsApp', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
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
              final customerName = r['customer']?['name'] ?? r['customerName'] ?? r['guestName'] ?? 'Customer';
              final phone = r['customer']?['phone'] ?? r['customerPhone'] ?? r['guestPhone'] ?? '';

              return InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () => _showModerationSheet(context, r),
                child: ServoraCard(
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
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                            decoration: BoxDecoration(
                              color: status == 'OPEN' || status == 'PUBLISHED'
                                  ? const Color(0xFFECFDF5)
                                  : status == 'SUSPENDED' || status == 'CANCELLED'
                                  ? Colors.red.withOpacity(0.12)
                                  : Colors.amber.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              status,
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                                color: status == 'OPEN' || status == 'PUBLISHED'
                                    ? const Color(0xFF047857)
                                    : status == 'SUSPENDED' || status == 'CANCELLED'
                                    ? Colors.red[700]
                                    : Colors.amber[800],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Gap(4),
                      Text('Customer: $customerName ($phone) • Zone: ${r['landmark'] ?? r['location'] ?? "Tamale"}', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                      const Gap(6),
                      Text(r['description'] ?? r['details'] ?? 'Job details pending dispatch confirmation.', style: const TextStyle(fontSize: 11)),
                      const Gap(10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton.icon(
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              foregroundColor: const Color(0xFF059669),
                            ),
                            icon: const Icon(Icons.shield_outlined, size: 14),
                            label: const Text('Moderate / WhatsApp ➔', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            onPressed: () => _showModerationSheet(context, r),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
      ],
    );
  }
}
