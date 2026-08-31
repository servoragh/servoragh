import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../core/constants/constants.dart';
import '../../../core/utils/time_formatter.dart';
import '../../../shared/widgets/servora_shimmer_skeleton.dart';
import '../../../shared/widgets/presence_badge.dart';
import '../../auth/providers/auth_provider.dart';

class ChatScreen extends StatefulWidget {
  final String? initialRoomId;
  final String? recipientId;
  final String? productId;
  final String? title;

  const ChatScreen({
    super.key,
    this.initialRoomId,
    this.recipientId,
    this.productId,
    this.title,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: ServoraConstants.baseUrl,
    connectTimeout: const Duration(seconds: 8),
    receiveTimeout: const Duration(seconds: 8),
  ));

  List<dynamic> _rooms = [];
  bool _isLoadingRooms = true;

  String? _activeRoomId;
  Map<String, dynamic>? _activeRoomData;
  List<dynamic> _activeMessages = [];
  bool _isLoadingRoomDetails = false;

  final TextEditingController _msgController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  Timer? _pollTimer;
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _activeRoomId = widget.initialRoomId;
    _initChatSystem();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _msgController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<Options> _getAuthOptions() async {
    final token = await authNotifier.storage.getToken();
    return Options(headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    });
  }

  Future<void> _initChatSystem() async {
    await _fetchRooms();

    if (widget.recipientId != null && widget.recipientId!.isNotEmpty) {
      await _createOrOpenRoom(
        recipientId: widget.recipientId!,
        productId: widget.productId,
        title: widget.title,
      );
    } else if (_activeRoomId != null) {
      await _fetchRoomDetails(_activeRoomId!);
    }

    _startPolling();
  }

  void _startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (_activeRoomId != null && mounted) {
        _fetchRoomDetails(_activeRoomId!, silent: true);
      }
    });
  }

  Future<void> _fetchRooms() async {
    try {
      final opts = await _getAuthOptions();
      final res = await _dio.get('/chat/rooms', options: opts);
      if (res.statusCode == 200 && res.data['rooms'] != null) {
        if (mounted) {
          setState(() {
            _rooms = List<dynamic>.from(res.data['rooms']);
            _isLoadingRooms = false;
          });
        }
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingRooms = false);
    }
  }

  Future<void> _createOrOpenRoom({
    required String recipientId,
    String? productId,
    String? title,
  }) async {
    try {
      setState(() => _isLoadingRoomDetails = true);
      final opts = await _getAuthOptions();
      final res = await _dio.post('/chat/rooms',
          data: {
            'scope': 'C2B',
            'recipientId': recipientId,
            'productId': productId,
            'title': title ?? 'Servora Native Inquiry',
          },
          options: opts);

      if (res.statusCode == 200 && res.data['room'] != null) {
        final roomId = res.data['room']['id'].toString();
        setState(() => _activeRoomId = roomId);
        await _fetchRoomDetails(roomId);
        await _fetchRooms();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please log in to start direct merchant chat.')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoadingRoomDetails = false);
    }
  }

  Future<void> _fetchRoomDetails(String roomId, {bool silent = false}) async {
    if (!silent && mounted) setState(() => _isLoadingRoomDetails = true);
    try {
      final opts = await _getAuthOptions();
      final res = await _dio.get('/chat/rooms/$roomId', options: opts);
      if (res.statusCode == 200 && res.data['room'] != null) {
        final roomData = res.data['room'];
        final msgs = List<dynamic>.from(roomData['messages'] ?? []);
        if (mounted) {
          setState(() {
            _activeRoomData = roomData;
            _activeMessages = msgs;
            _isLoadingRoomDetails = false;
          });

          if (!silent) {
            _scrollToBottom();
          }
        }
      }
    } catch (_) {
      if (!silent && mounted) setState(() => _isLoadingRoomDetails = false);
    }
  }

  Future<void> _sendMessage() async {
    final text = _msgController.text.trim();
    if (text.isEmpty || _activeRoomId == null || _isSending) return;

    setState(() => _isSending = true);
    _msgController.clear();

    final currentUserId = authNotifier.state.user?.id ?? '';
    final tempMsg = {
      'id': 'temp_${DateTime.now().millisecondsSinceEpoch}',
      'content': text,
      'createdAt': DateTime.now().toIso8601String(),
      'senderId': currentUserId,
      'sender': {
        'id': currentUserId,
        'name': authNotifier.state.user?.name ?? 'Me',
      },
    };

    setState(() {
      _activeMessages.add(tempMsg);
    });
    _scrollToBottom();

    try {
      final opts = await _getAuthOptions();
      final res = await _dio.post(
        '/chat/rooms/$_activeRoomId',
        data: {'content': text},
        options: opts,
      );

      if (res.statusCode == 200 && res.data['message'] != null) {
        _fetchRoomDetails(_activeRoomId!, silent: true);
        _fetchRooms();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to send message. Please try again.')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentUserId = authNotifier.state.user?.id ?? '';

    return Scaffold(
      appBar: AppBar(
        title: _activeRoomId != null && _activeRoomData != null
            ? _buildActiveRoomHeader(currentUserId, isDark)
            : const Row(
                children: [
                  Icon(Icons.chat_rounded, color: ServoraColors.emerald600),
                  Gap(8),
                  Text('Servora Direct Chat', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
        leading: _activeRoomId != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () {
                  setState(() {
                    _activeRoomId = null;
                    _activeRoomData = null;
                    _activeMessages = [];
                  });
                },
              )
            : IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () => context.pop(),
              ),
        elevation: 1,
      ),
      body: _activeRoomId != null
          ? _buildConversationView(currentUserId, isDark)
          : _buildRoomsList(currentUserId, isDark),
    );
  }

  Widget _buildActiveRoomHeader(String currentUserId, bool isDark) {
    final participants = List<dynamic>.from(_activeRoomData?['participants'] ?? []);
    final otherPart = participants.firstWhere(
      (p) => (p['user']?['id'] ?? p['userId']) != currentUserId,
      orElse: () => participants.isNotEmpty ? participants[0] : {},
    );

    final userObj = otherPart['user'] is Map ? otherPart['user'] : {};
    final String partnerName = userObj['providerProfile']?['businessName'] ?? userObj['name'] ?? _activeRoomData?['title'] ?? 'Merchant Inquiry';
    final String? avatarUrl = userObj['avatarUrl'];

    return Row(
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: ServoraColors.emerald600,
          backgroundImage: (avatarUrl != null && avatarUrl.isNotEmpty) ? CachedNetworkImageProvider(avatarUrl) : null,
          child: (avatarUrl == null || avatarUrl.isEmpty)
              ? Text(partnerName.isNotEmpty ? partnerName[0].toUpperCase() : 'C', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14))
              : null,
        ),
        const Gap(10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                partnerName,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              PresenceBadge(
                isOnline: userObj['isOnline'] == true,
                lastSeen: userObj['lastSeen'],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRoomsList(String currentUserId, bool isDark) {
    if (_isLoadingRooms) {
      return ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: 4,
        separatorBuilder: (_, __) => const Gap(12),
        itemBuilder: (_, __) => const ServoraShimmerSkeleton(width: double.infinity, height: 72, borderRadius: 16),
      );
    }

    if (_rooms.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: ServoraColors.emerald600.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.chat_bubble_outline_rounded, size: 32, color: ServoraColors.emerald600),
              ),
              const Gap(16),
              const Text('Zero Direct Conversations', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const Gap(6),
              const Text(
                'When you chat with verified local merchants, artisans, or buyers on marketplace items, your direct channels appear here.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const Gap(20),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: ServoraColors.emerald600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.storefront_rounded, size: 18),
                label: const Text('Explore Marketplace Products', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                onPressed: () => context.push('/products'),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchRooms,
      color: ServoraColors.emerald600,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _rooms.length,
        separatorBuilder: (_, __) => const Gap(10),
        itemBuilder: (context, index) {
          final room = _rooms[index];
          final participants = List<dynamic>.from(room['participants'] ?? []);
          final otherPart = participants.firstWhere(
            (p) => p['id'] != currentUserId,
            orElse: () => participants.isNotEmpty ? participants[0] : {},
          );

          final name = room['title'] ?? otherPart['name'] ?? 'Classified Inquiry';
          final avatar = otherPart['avatarUrl'];
          final lastMsg = room['lastMessage']?['content'] ?? 'Tap to start conversation';
          final lastTime = room['updatedAt'] ?? room['lastMessage']?['createdAt'];
          final unread = (room['unreadCount'] is num) ? (room['unreadCount'] as num).toInt() : 0;

          return Card(
            elevation: 0,
            color: isDark ? ServoraColors.darkSurface : Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: isDark ? ServoraColors.darkCardBorder : Colors.grey[200]!),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              onTap: () {
                setState(() {
                  _activeRoomId = room['id'].toString();
                });
                _fetchRoomDetails(room['id'].toString());
              },
              leading: CircleAvatar(
                radius: 22,
                backgroundColor: ServoraColors.emerald600,
                backgroundImage: (avatar != null && avatar.toString().isNotEmpty) ? CachedNetworkImageProvider(avatar) : null,
                child: (avatar == null || avatar.toString().isEmpty)
                    ? Text(name.isNotEmpty ? name[0].toUpperCase() : 'C', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))
                    : null,
              ),
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ),
                  if (lastTime != null)
                    Text(
                      TimeFormatter.formatRelativeTime(lastTime),
                      style: const TextStyle(fontSize: 10, color: Colors.grey),
                    ),
                ],
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        lastMsg,
                        style: TextStyle(fontSize: 12, color: unread > 0 ? ServoraColors.emerald600 : Colors.grey, fontWeight: unread > 0 ? FontWeight.bold : FontWeight.normal),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (unread > 0)
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(color: ServoraColors.emerald600, shape: BoxShape.circle),
                        child: Text('$unread', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildConversationView(String currentUserId, bool isDark) {
    if (_isLoadingRoomDetails) {
      return const Center(child: CircularProgressIndicator(color: ServoraColors.emerald600));
    }

    return Column(
      children: [
        // Verified Escrow Notice Banner
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          color: ServoraColors.emerald600.withOpacity(0.08),
          child: const Row(
            children: [
              Icon(Icons.shield_rounded, size: 16, color: ServoraColors.emerald600),
              Gap(8),
              Expanded(
                child: Text(
                  'Protected by Servora Tamale Mediation & Escrow Guarantee.',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
                ),
              ),
            ],
          ),
        ),

        // Messages Stream List
        Expanded(
          child: _activeMessages.isEmpty
              ? const Center(
                  child: Text(
                    'No messages yet. Ask the seller about product condition, pricing, or local delivery in Tamale!',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                )
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: _activeMessages.length,
                  itemBuilder: (context, index) {
                    final msg = _activeMessages[index];
                    final senderId = msg['senderId'] ?? msg['sender']?['id'] ?? '';
                    final isMe = senderId == currentUserId;
                    final content = msg['content'] ?? '';
                    final time = msg['createdAt'];

                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                        decoration: BoxDecoration(
                          color: isMe
                              ? ServoraColors.emerald600
                              : (isDark ? ServoraColors.darkSurface : const Color(0xFFF1F5F9)),
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(16),
                            topRight: const Radius.circular(16),
                            bottomLeft: isMe ? const Radius.circular(16) : const Radius.circular(4),
                            bottomRight: isMe ? const Radius.circular(4) : const Radius.circular(16),
                          ),
                          boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
                        ),
                        child: Column(
                          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            Text(
                              content,
                              style: TextStyle(
                                fontSize: 13.5,
                                color: isMe ? Colors.white : (isDark ? Colors.white : Colors.black87),
                                height: 1.3,
                              ),
                            ),
                            const Gap(4),
                            if (time != null)
                              Text(
                                TimeFormatter.formatRelativeTime(time),
                                style: TextStyle(
                                  fontSize: 9.5,
                                  color: isMe ? Colors.white70 : Colors.grey[600],
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),

        // Message Input Bottom Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: isDark ? ServoraColors.darkSurface : Colors.white,
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 10, offset: const Offset(0, -2))],
          ),
          child: SafeArea(
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark ? ServoraColors.darkBackground : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: isDark ? ServoraColors.darkCardBorder : Colors.grey[300]!),
                    ),
                    child: TextField(
                      controller: _msgController,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                      decoration: const InputDecoration(
                        hintText: 'Type your message to merchant...',
                        hintStyle: TextStyle(fontSize: 12, color: Colors.grey),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                    ),
                  ),
                ),
                const Gap(8),
                IconButton.filled(
                  style: IconButton.styleFrom(
                    backgroundColor: ServoraColors.emerald600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.all(12),
                  ),
                  icon: _isSending
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Icon(Icons.send_rounded, size: 20),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
