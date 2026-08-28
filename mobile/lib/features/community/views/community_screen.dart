import 'package:flutter/material.dart';
import '../../../core/constants/constants.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/servora_dropdown_sheet.dart';
import '../../../core/utils/whatsapp_helper.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  String _selectedZone = 'All Northern Ghana';

  final List<Map<String, dynamic>> _posts = [
    {
      'id': 'post-1',
      'title': '3-Phase Solar Inverter Cable Leakage in Sakasaka',
      'content':
          'Need a certified solar technician in Sakasaka to fix inverter cabling issue today. Budget GH₵ 450.',
      'category': 'Urgent Gig',
      'neighborhood': 'Sakasaka',
      'authorName': 'Alhassan Fuseini',
      'authorPhone': '+233240112233',
      'isVerified': true,
      'upvotes': 14,
      'commentsCount': 6,
      'createdAt': '2 hours ago',
    },
    {
      'id': 'post-2',
      'title': 'Authentic Handwoven Royal Dagbon Smocks Available',
      'content':
          'Fresh heavy thread Fugu woven in Nyohini workshop. Direct wholesale prices for local buyers.',
      'category': 'Trade Notice',
      'neighborhood': 'Nyohini',
      'authorName': 'Fatima Abdul-Rahman',
      'authorPhone': '+233501234567',
      'isVerified': true,
      'upvotes': 29,
      'commentsCount': 12,
      'createdAt': '5 hours ago',
    },
    {
      'id': 'post-3',
      'title': 'Borehole Drilling Rig Equipment for Rent in Choggu',
      'content':
          'Commercial grade rig ready for site dispatch. Daily or weekly lease rates.',
      'category': 'Tool Rental',
      'neighborhood': 'Choggu',
      'authorName': 'Salifu Plumbing Services',
      'authorPhone': '+233201122334',
      'isVerified': true,
      'upvotes': 18,
      'commentsCount': 4,
      'createdAt': '1 day ago',
    },
  ];

  Future<void> _openZonePicker() async {
    final result = await ServoraBottomSheetPicker.show(
      context: context,
      title: 'Filter Trade Board Zone 📍',
      items: ServoraConstants.northernNeighborhoods,
      selectedValue: _selectedZone,
      searchHint: 'Filter by neighborhood...',
      titleIcon: Icons.location_on_rounded,
    );

    if (result != null && mounted) {
      setState(() => _selectedZone = result);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filteredPosts = _posts.where((p) {
      if (_selectedZone == 'All Northern Ghana') return true;
      return p['neighborhood'] == _selectedZone;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Community Trade Board 📢'),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded),
            onPressed: _openZonePicker,
          ),
        ],
      ),
      body: Column(
        children: [
          // Selected Zone Filter Bar
          GestureDetector(
            onTap: _openZonePicker,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: isDark ? const Color(0xFF111827) : const Color(0xFFF8FAFC),
              child: Row(
                children: [
                  const Icon(Icons.filter_list_rounded,
                      size: 18, color: Color(0xFF059669)),
                  const SizedBox(width: 8),
                  const Text(
                    'Zone Filter:',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _selectedZone,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF059669),
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.keyboard_arrow_down_rounded,
                            size: 14, color: Color(0xFF059669)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const Divider(height: 1),

          // Community Feed Cards
          Expanded(
            child: RefreshIndicator(
              color: const Color(0xFF059669),
              onRefresh: () async {
                await Future.delayed(const Duration(milliseconds: 600));
                if (mounted) setState(() {});
              },
              child: filteredPosts.isEmpty
                  ? SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: SizedBox(
                        height: MediaQuery.of(context).size.height * 0.5,
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text('📢', style: TextStyle(fontSize: 48)),
                              const SizedBox(height: 12),
                              Text(
                                'No trade notices in $_selectedZone',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                                ),
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'Be the first to post a call or notice!',
                                style: TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                  : ListView.separated(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: filteredPosts.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 14),
                      itemBuilder: (context, index) {
                      final post = filteredPosts[index];
                      return ServoraCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Author Header
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 18,
                                  backgroundColor: const Color(0xFF059669)
                                      .withOpacity(0.15),
                                  child: Text(
                                    post['authorName'][0],
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF059669),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(
                                            post['authorName'],
                                            style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          const Icon(Icons.verified_rounded,
                                              size: 14,
                                              color: Color(0xFF059669)),
                                        ],
                                      ),
                                      Text(
                                        '${post['neighborhood']} • ${post['createdAt']}',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: Colors.grey[500],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                StatusBadge(
                                  label: post['category'],
                                  backgroundColor: const Color(0xFF059669)
                                      .withOpacity(0.1),
                                  textColor: const Color(0xFF059669),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),

                            // Post Content
                            Text(
                              post['title'],
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              post['content'],
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark
                                    ? Colors.grey[300]
                                    : Colors.grey[700],
                                height: 1.4,
                              ),
                            ),
                            const SizedBox(height: 14),

                            // Card Footer Actions
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    IconButton(
                                      icon: const Icon(
                                        Icons.thumb_up_alt_outlined,
                                        size: 18,
                                        color: Color(0xFF059669),
                                      ),
                                      onPressed: () {
                                        setState(() => post['upvotes'] += 1);
                                      },
                                    ),
                                    Text(
                                      '${post['upvotes']}',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    const Icon(
                                      Icons.chat_bubble_outline_rounded,
                                      size: 18,
                                      color: Colors.grey,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${post['commentsCount']}',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF25D366),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 6,
                                    ),
                                    minimumSize: Size.zero,
                                  ),
                                  icon: const Icon(Icons.chat_rounded,
                                      size: 14, color: Colors.white),
                                  label: const Text(
                                    'WhatsApp',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  onPressed: () {
                                    WhatsAppHelper.openWhatsApp(
                                      phone: post['authorPhone'],
                                      message:
                                          'Hello ${post['authorName']}, I saw your community trade post "${post['title']}" on Servora.gh app.',
                                    );
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF059669),
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text(
          'Post Notice',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Notice created & posted to trade board!')),
          );
        },
      ),
    );
  }
}
