import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/constants.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/servora_button.dart';
import '../../../shared/widgets/servora_dropdown_sheet.dart';
import '../../auth/providers/auth_provider.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ServoraConstants.baseUrl,
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 12),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  List<dynamic> _posts = [];
  bool _isLoading = true;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  String _selectedZone = 'All Northern Ghana';
  String _selectedCategory = 'ALL';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  final List<Map<String, String>> _categories = [
    {'id': 'ALL', 'label': '🌟 All Notices'},
    {'id': 'SERVICE_CALL', 'label': '⚡ Urgent Gigs & Services'},
    {'id': 'TOOL_RENTAL', 'label': '🔨 Tool Rentals'},
    {'id': 'ARTISAN_MEETUP', 'label': '🤝 Artisan Meetups'},
    {'id': 'GRID_ALERT', 'label': '⚡ Power/Grid Alerts'},
    {'id': 'SKILL_SHARE', 'label': '🎓 Skill Share'},
    {'id': 'RECOMMENDATION', 'label': '⭐ Recommendations'},
    {'id': 'LOST_AND_FOUND', 'label': '🔍 Lost & Found'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchLivePosts();
  }

  Future<void> _fetchLivePosts() async {
    setState(() => _isLoading = true);
    try {
      final token = await authNotifier.storage.getToken();
      final user = authNotifier.state.user;

      final queryParams = <String, dynamic>{};
      if (_searchQuery.isNotEmpty) queryParams['search'] = _searchQuery;
      if (_selectedCategory != 'ALL') queryParams['category'] = _selectedCategory;
      if (_selectedZone != 'All Northern Ghana') {
        queryParams['zone'] = _selectedZone.toUpperCase().replaceAll(' ', '_');
      }

      final res = await _dio.get(
        '/community/posts',
        queryParameters: queryParams,
        options: Options(
          headers: {
            if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
            if (user?.phone != null) 'x-user-phone': user!.phone,
          },
        ),
      );

      if (res.statusCode == 200 && res.data != null) {
        final rawPosts = res.data['posts'] ?? [];
        setState(() {
          _posts = List<dynamic>.from(rawPosts);
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load community board');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleUpvote(String postId) async {
    try {
      final token = await authNotifier.storage.getToken();
      final res = await _dio.post(
        '/community/posts/$postId/upvote',
        options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}),
      );
      if (res.statusCode == 200 && res.data != null) {
        setState(() {
          _posts = _posts.map((p) {
            if (p['id'] == postId) {
              final newCount = res.data['upvotesCount'] ?? ((p['upvotesCount'] ?? 0) + 1);
              return {...p, 'upvotesCount': newCount, 'hasUpvoted': true};
            }
            return p;
          }).toList();
        });
      }
    } catch (_) {}
  }

  void _openWhatsApp(String rawPhone, String authorName, String title) async {
    final cleanPhone = rawPhone.replaceAll(RegExp(r'[^0-9]'), '');
    final fullPhone = cleanPhone.startsWith('0') ? '233${cleanPhone.substring(1)}' : cleanPhone;
    final url = Uri.parse(
      'https://wa.me/$fullPhone?text=${Uri.encodeComponent('Hello $authorName, I saw your post "$title" on the Servora Community Board.')}',
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

  Future<void> _openZonePicker() async {
    final result = await ServoraBottomSheetPicker.show(
      context: context,
      title: 'Filter by Neighborhood 📍',
      items: ServoraConstants.northernNeighborhoods,
      selectedValue: _selectedZone,
      searchHint: 'Search Sakasaka, Choggu, Aboabo...',
      titleIcon: Icons.location_on_rounded,
    );

    if (result != null && mounted) {
      setState(() => _selectedZone = result);
      _fetchLivePosts();
    }
  }

  void _openCreatePostModal() {
    final titleCtrl = TextEditingController();
    final contentCtrl = TextEditingController();
    final budgetCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final nameCtrl = TextEditingController();
    String category = 'SERVICE_CALL';
    String zone = 'Sakasaka';
    String urgency = 'ASAP';
    bool submitting = false;

    final currentUser = authNotifier.state.user;
    if (currentUser != null) {
      nameCtrl.text = currentUser.name;
      phoneCtrl.text = currentUser.phone;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            top: 20,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.campaign_rounded, color: Color(0xFF059669), size: 22),
                        Gap(8),
                        Text('Post Notice / Equipment Call', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                      ],
                    ),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.of(ctx).pop()),
                  ],
                ),
                const Text(
                  'Post directly to the Tamale Community Notice Board (synced with Web & Mobile).',
                  style: TextStyle(fontSize: 11, color: Colors.grey),
                ),
                const Gap(14),

                // Category Selector
                const Text('Notice Category *', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                const Gap(4),
                DropdownButtonFormField<String>(
                  value: category,
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'SERVICE_CALL', child: Text('⚡ Urgent Gig / Service Call')),
                    DropdownMenuItem(value: 'TOOL_RENTAL', child: Text('🔨 Tool / Equipment Needed')),
                    DropdownMenuItem(value: 'ARTISAN_MEETUP', child: Text('🤝 Artisan Meetup / Event')),
                    DropdownMenuItem(value: 'GRID_ALERT', child: Text('⚡ Power / Water Grid Alert')),
                    DropdownMenuItem(value: 'SKILL_SHARE', child: Text('🎓 Apprenticeship / Skill Share')),
                    DropdownMenuItem(value: 'RECOMMENDATION', child: Text('⭐ Trade Recommendation')),
                    DropdownMenuItem(value: 'LOST_AND_FOUND', child: Text('🔍 Lost & Found Tools')),
                    DropdownMenuItem(value: 'ALL_DISCUSSIONS', child: Text('💬 General Discussion')),
                  ],
                  onChanged: (v) => setModalState(() => category = v ?? 'URGENT_GIG'),
                ),
                const Gap(10),

                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(labelText: 'Title / Summary *', hintText: 'e.g. Need scaffolding in Sakasaka today'),
                ),
                const Gap(10),

                TextField(
                  controller: contentCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Detailed Notice *', hintText: 'Describe equipment specs, location, or problem...'),
                ),
                const Gap(10),

                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: budgetCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Budget (GH₵ Optional)', hintText: '350'),
                      ),
                    ),
                    const Gap(10),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: zone,
                        decoration: InputDecoration(
                          labelText: 'Zone *',
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        items: ['Sakasaka', 'Tamale Central', 'Choggu', 'Nyohini', 'Aboabo', 'Dungu', 'Lamashegu', 'Bolgatanga']
                            .map((z) => DropdownMenuItem(value: z, child: Text(z, style: const TextStyle(fontSize: 12))))
                            .toList(),
                        onChanged: (v) => setModalState(() => zone = v ?? 'Sakasaka'),
                      ),
                    ),
                  ],
                ),
                const Gap(10),

                if (currentUser == null) ...[
                  TextField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(labelText: 'Your Name *', hintText: 'e.g. Amina'),
                  ),
                  const Gap(10),
                  TextField(
                    controller: phoneCtrl,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(labelText: 'WhatsApp Phone Number *', hintText: '+233 24 000 0000'),
                  ),
                  const Gap(10),
                ],

                const Gap(12),
                ServoraButton(
                  label: submitting ? 'Publishing Notice...' : 'Publish to Community Live 🎉',
                  isLoading: submitting,
                  onPressed: submitting
                      ? null
                      : () async {
                          if (titleCtrl.text.trim().isEmpty || contentCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Please enter title and content.')),
                            );
                            return;
                          }
                          final messenger = ScaffoldMessenger.of(ctx);
                          setModalState(() => submitting = true);
                          try {
                            final token = await authNotifier.storage.getToken();
                            final res = await _dio.post(
                              '/community/posts',
                              data: {
                                'title': titleCtrl.text.trim(),
                                'content': contentCtrl.text.trim(),
                                'category': category,
                                'zone': zone.toUpperCase().replaceAll(' ', '_'),
                                'budget': budgetCtrl.text.isNotEmpty ? double.tryParse(budgetCtrl.text) : null,
                                'urgency': urgency,
                                'guestName': nameCtrl.text.trim().isNotEmpty ? nameCtrl.text.trim() : (currentUser?.name ?? 'Tamale Member'),
                                'guestPhone': phoneCtrl.text.trim().isNotEmpty ? phoneCtrl.text.trim() : (currentUser?.phone ?? '+233240000000'),
                              },
                              options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}),
                            );

                            if (res.statusCode == 200 || res.statusCode == 201) {
                              if (ctx.mounted) Navigator.of(ctx).pop();
                              messenger.showSnackBar(
                                const SnackBar(
                                  backgroundColor: Color(0xFF059669),
                                  content: Text('Notice posted to Community Board! Live on Web & Mobile ✓'),
                                ),
                              );
                              _fetchLivePosts();
                            }
                          } catch (e) {
                            setModalState(() => submitting = false);
                            messenger.showSnackBar(
                              SnackBar(backgroundColor: Colors.red, content: Text('Error posting: $e')),
                            );
                          }
                        },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _openCommentsSheet(dynamic post) {
    final postId = post['id'].toString();
    final commentCtrl = TextEditingController();
    List<dynamic> comments = List<dynamic>.from(post['comments'] ?? []);
    bool sending = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setCommentsState) => Padding(
          padding: EdgeInsets.only(
            top: 20,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: SizedBox(
            height: MediaQuery.of(context).size.height * 0.65,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Comments (${comments.length}) 💬', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.of(ctx).pop()),
                  ],
                ),
                Text(post['title'] ?? '', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                const Divider(),
                Expanded(
                  child: comments.isEmpty
                      ? const Center(child: Text('No comments yet. Be the first to reply!', style: TextStyle(color: Colors.grey, fontSize: 12)))
                      : ListView.separated(
                          itemCount: comments.length,
                          separatorBuilder: (_, __) => const Gap(8),
                          itemBuilder: (context, i) {
                            final c = comments[i];
                            final author = c['author']?['name'] ?? c['guestName'] ?? 'Community Member';
                            return Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(author, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                                  const Gap(2),
                                  Text(c['content'] ?? '', style: const TextStyle(fontSize: 12)),
                                ],
                              ),
                            );
                          },
                        ),
                ),
                const Gap(8),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: commentCtrl,
                        decoration: InputDecoration(
                          hintText: 'Write a community reply...',
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(20)),
                        ),
                      ),
                    ),
                    const Gap(8),
                    IconButton(
                      icon: sending
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.send_rounded, color: Color(0xFF059669)),
                      onPressed: sending
                          ? null
                          : () async {
                              final text = commentCtrl.text.trim();
                              if (text.isEmpty) return;
                              setCommentsState(() => sending = true);
                              try {
                                final token = await authNotifier.storage.getToken();
                                final user = authNotifier.state.user;
                                final res = await _dio.post(
                                  '/community/posts/$postId/comments',
                                  data: {
                                    'content': text,
                                    'guestName': user?.name ?? 'Community Member',
                                  },
                                  options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}),
                                );
                                if (res.statusCode == 200 || res.statusCode == 201) {
                                  commentCtrl.clear();
                                  setCommentsState(() {
                                    comments.add({
                                      'author': {'name': user?.name ?? 'Community Member'},
                                      'content': text,
                                    });
                                    sending = false;
                                  });
                                  _fetchLivePosts();
                                }
                              } catch (_) {
                                setCommentsState(() => sending = false);
                              }
                            },
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          tooltip: 'Back to Home',
          onPressed: () {
            if (Navigator.of(context).canPop()) {
              context.pop();
            } else {
              context.go('/home');
            }
          },
        ),
        title: const Text('Community Trade Board 📢'),
        actions: [
          IconButton(
            icon: const Icon(Icons.location_on_rounded, color: Color(0xFF059669)),
            onPressed: _openZonePicker,
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _fetchLivePosts,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF059669),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Post Notice', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: _openCreatePostModal,
      ).animate().scale(delay: 200.ms, curve: Curves.easeOutBack),
      body: RefreshIndicator(
        color: const Color(0xFF059669),
        onRefresh: _fetchLivePosts,
        child: Column(
          children: [
            // Search & Zone Filter Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Search notices, gigs, alerts...',
                        hintStyle: const TextStyle(fontSize: 12, color: Colors.grey),
                        prefixIcon: const Icon(Icons.search_rounded, size: 18, color: Color(0xFF059669)),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear_rounded, size: 16),
                                onPressed: () {
                                  _searchController.clear();
                                  _searchQuery = '';
                                  _fetchLivePosts();
                                },
                              )
                            : null,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                      ),
                      onSubmitted: (v) {
                        _searchQuery = v.trim();
                        _fetchLivePosts();
                      },
                    ),
                  ),
                  const Gap(8),
                  InkWell(
                    borderRadius: BorderRadius.circular(14),
                    onTap: _openZonePicker,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.place_rounded, size: 16, color: Color(0xFF059669)),
                          const Gap(4),
                          Text(
                            _selectedZone.length > 10 ? '${_selectedZone.substring(0, 8)}..' : _selectedZone,
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF059669)),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Horizontal Category Pills
            SizedBox(
              height: 38,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _categories.length,
                separatorBuilder: (_, __) => const Gap(6),
                itemBuilder: (context, idx) {
                  final cat = _categories[idx];
                  final isSel = _selectedCategory == cat['id'];
                  return ChoiceChip(
                    label: Text(cat['label']!),
                    selected: isSel,
                    selectedColor: const Color(0xFF059669),
                    labelStyle: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isSel ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                    ),
                    onSelected: (_) {
                      setState(() => _selectedCategory = cat['id']!);
                      _fetchLivePosts();
                    },
                  ).animate().fadeIn(delay: (idx * 25).ms, duration: 200.ms).scale(begin: const Offset(0.9, 0.9), end: const Offset(1, 1), curve: Curves.easeOutCubic);
                },
              ),
            ),
            const Gap(6),

            // Posts Feed List
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: Color(0xFF059669)))
                  : _posts.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.campaign_outlined, size: 50, color: Colors.grey),
                              const Gap(10),
                              const Text('No community notices found.', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
                              const Gap(4),
                              const Text('Be the first to post a notice or request!', style: TextStyle(fontSize: 11, color: Colors.grey)),
                              const Gap(14),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669), foregroundColor: Colors.white),
                                onPressed: _openCreatePostModal,
                                child: const Text('+ Post New Notice'),
                              ),
                            ],
                          ),
                        ).animate().fadeIn(duration: 300.ms).scale(begin: const Offset(0.9, 0.9), end: const Offset(1, 1))
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          itemCount: _posts.length,
                          separatorBuilder: (_, __) => const Gap(12),
                          itemBuilder: (context, idx) {
                            final p = _posts[idx];
                            return _buildPostCard(p, isDark).animate().fadeIn(delay: (idx * 40).ms, duration: 300.ms).slideY(begin: 0.06, end: 0, curve: Curves.easeOutCubic);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPostCard(dynamic p, bool isDark) {
    final authorName = p['author']?['name'] ?? p['guestName'] ?? 'Community Member';
    final phone = p['author']?['phone'] ?? p['guestPhone'] ?? p['guestWhatsApp'] ?? '';
    final title = p['title'] ?? 'Community Notice';
    final content = p['content'] ?? '';
    final category = p['category']?.toString() ?? 'GENERAL';
    final zone = p['zone']?.toString().replaceAll('_', ' ') ?? 'Tamale';
    final budget = p['budget'] != null ? 'GH₵ ${p['budget']}' : null;
    final upvotesCount = p['upvotesCount'] ?? 0;
    final commentsCount = p['commentsCount'] ?? (p['comments']?.length ?? 0);
    final hasUpvoted = p['hasUpvoted'] == true;

    return ServoraCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Author Header
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFF059669),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    authorName.isNotEmpty ? authorName[0].toUpperCase() : 'U',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const Gap(10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(authorName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    Text('📍 $zone', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF059669).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  category.replaceAll('_', ' '),
                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF047857)),
                ),
              ),
            ],
          ),
          const Gap(10),

          // Title & Content
          Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
          const Gap(4),
          Text(content, style: const TextStyle(fontSize: 12, height: 1.35)),
          const Gap(10),

          // Budget Badge
          if (budget != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '💰 Budget: $budget',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF92400E)),
              ),
            ),
            const Gap(10),
          ],

          // Footer Action Strip
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  // Upvote Button
                  InkWell(
                    borderRadius: BorderRadius.circular(8),
                    onTap: () => _handleUpvote(p['id'].toString()),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                      child: Row(
                        children: [
                          Icon(
                            hasUpvoted ? Icons.thumb_up_rounded : Icons.thumb_up_outlined,
                            size: 15,
                            color: hasUpvoted ? const Color(0xFF059669) : Colors.grey,
                          ),
                          const Gap(4),
                          Text('$upvotesCount', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: hasUpvoted ? const Color(0xFF059669) : Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                  const Gap(10),

                  // Comment Button
                  InkWell(
                    borderRadius: BorderRadius.circular(8),
                    onTap: () => _openCommentsSheet(p),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                      child: Row(
                        children: [
                          const Icon(Icons.chat_bubble_outline_rounded, size: 15, color: Colors.grey),
                          const Gap(4),
                          Text('$commentsCount', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              // Contact WhatsApp / Call
              if (phone.isNotEmpty)
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chat_rounded, size: 18, color: Color(0xFF059669)),
                      tooltip: 'WhatsApp Author',
                      onPressed: () => _openWhatsApp(phone, authorName, title),
                    ),
                    IconButton(
                      icon: const Icon(Icons.phone_rounded, size: 18, color: Colors.blueGrey),
                      tooltip: 'Call Phone',
                      onPressed: () => _openCall(phone),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}
