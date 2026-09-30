import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/constants/constants.dart';
import '../../../core/services/user_location_service.dart';
import '../../../shared/widgets/servora_location_picker_sheet.dart';
import '../../auth/providers/auth_provider.dart';

// ─────────────────────────────────────────────────────────────
//  Servora · Ultra-Modern Post Service Request Wizard Screen
//  Synced 1:1 with Web RequestWizardModal (Features & Styles)
// ─────────────────────────────────────────────────────────────

class _UploadedMediaItem {
  final String localPath;
  String? remoteUrl;
  final String mediaType; // IMAGE or VIDEO
  final String fileName;
  double progress;
  bool isUploading;
  String? error;

  _UploadedMediaItem({
    required this.localPath,
    required this.mediaType,
    required this.fileName,
    this.isUploading = false,
  }) : progress = 0.0;
}

class RequestWizardScreen extends StatefulWidget {
  const RequestWizardScreen({super.key});

  @override
  State<RequestWizardScreen> createState() => _RequestWizardScreenState();
}

class _RequestWizardScreenState extends State<RequestWizardScreen>
    with TickerProviderStateMixin {
  // ── Form State ──────────────────────────────
  String _selectedCategory = 'Other';
  String _urgency = 'SAME_DAY';
  bool _fetchingGps = false;
  bool _submitting = false;
  bool _success = false;
  String _trackingId = '';

  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _locationCtrl = TextEditingController(text: 'Sakasaka, Tamale');
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  // ── Media Attachments ───────────────────────
  final List<_UploadedMediaItem> _mediaList = [];
  final ImagePicker _picker = ImagePicker();

  // ── Animations ──────────────────────────────
  late final AnimationController _fadeCtrl;
  late final Animation<double> _fadeAnim;
  late final AnimationController _successCtrl;
  late final Animation<double> _successScaleAnim;

  static final _dio = Dio(BaseOptions(
    baseUrl: ServoraConstants.baseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
  ));

  // ── Quick-Fill Shortcut Chips (Identical to Web) ──
  static const _quickFills = [
    {'emoji': '⚡', 'label': 'Generator Repair', 'cat': 'Electrical'},
    {'emoji': '❄️', 'label': 'AC Service', 'cat': 'AC'},
    {'emoji': '🔧', 'label': 'Pipe Leaking', 'cat': 'Plumbing'},
    {'emoji': '📱', 'label': 'Screen Repair', 'cat': 'Phone'},
    {'emoji': '🪚', 'label': 'Carpenter / Door', 'cat': 'Carpentry'},
    {'emoji': '🚗', 'label': 'Auto Mechanic', 'cat': 'Auto'},
    {'emoji': '🪡', 'label': 'Sew Kaba', 'cat': 'Tailoring'},
    {'emoji': '💡', 'label': 'Wiring / Lights', 'cat': 'Electrical'},
    {'emoji': '🏠', 'label': 'Roof Leak', 'cat': 'Roofing'},
    {'emoji': '🧹', 'label': 'Home Cleaning', 'cat': 'Cleaning'},
  ];

  // ── Urgency Data (Identical to Web) ─────────
  static const _urgencyOpts = [
    {'id': 'EMERGENCY_ASAP', 'emoji': '🚨', 'label': 'ASAP', 'sub': 'Emergency', 'color': 0xFFDC2626},
    {'id': 'SAME_DAY',       'emoji': '⚡', 'label': 'Today', 'sub': 'Same day',   'color': 0xFFD97706},
    {'id': 'SCHEDULED',      'emoji': '📅', 'label': 'Sched', 'sub': 'Pick date',  'color': 0xFF7C3AED},
    {'id': 'FLEXIBLE',       'emoji': '🌱', 'label': 'Flex',  'sub': 'No rush',    'color': 0xFF059669},
  ];

  @override
  void initState() {
    super.initState();

    _fadeCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 350));
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
    _fadeCtrl.forward();

    _successCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _successScaleAnim = CurvedAnimation(parent: _successCtrl, curve: Curves.elasticOut);

    final user = authNotifier.state.user;
    if (user != null) {
      _nameCtrl.text = user.name;
      _phoneCtrl.text = user.phone;
      if (user.serviceArea != null && user.serviceArea!.isNotEmpty) {
        _locationCtrl.text = '${user.serviceArea}, Tamale';
      }
    }
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    _successCtrl.dispose();
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _locationCtrl.dispose();
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  // ── Media Pickers ───────────────────────────
  Future<void> _pickPhotos() async {
    try {
      final currentImages = _mediaList.where((m) => m.mediaType == 'IMAGE').length;
      if (currentImages >= 6) {
        _snack('Maximum 6 photos allowed.');
        return;
      }

      final picked = await _picker.pickMultiImage();
      if (picked.isEmpty) return;

      for (final xf in picked) {
        if (_mediaList.where((m) => m.mediaType == 'IMAGE').length >= 6) {
          _snack('Maximum 6 photos allowed.');
          break;
        }
        final item = _UploadedMediaItem(
          localPath: xf.path,
          mediaType: 'IMAGE',
          fileName: xf.name,
          isUploading: true,
        );
        setState(() => _mediaList.add(item));
        _uploadFile(item);
      }
    } catch (e) {
      _snack('Could not select photos: $e', isError: true);
    }
  }

  Future<void> _pickVideo() async {
    try {
      if (_mediaList.any((m) => m.mediaType == 'VIDEO')) {
        _snack('Maximum 1 video clip allowed.');
        return;
      }

      final picked = await _picker.pickVideo(
        source: ImageSource.gallery,
        maxDuration: const Duration(seconds: 30),
      );
      if (picked == null) return;

      final item = _UploadedMediaItem(
        localPath: picked.path,
        mediaType: 'VIDEO',
        fileName: picked.name,
        isUploading: true,
      );
      setState(() => _mediaList.add(item));
      _uploadFile(item);
    } catch (e) {
      _snack('Could not select video: $e', isError: true);
    }
  }

  Future<void> _uploadFile(_UploadedMediaItem item) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(item.localPath, filename: item.fileName),
      });

      final res = await _dio.post(
        '/upload',
        data: formData,
        onSendProgress: (sent, total) {
          if (total > 0 && mounted) {
            setState(() {
              item.progress = sent / total;
            });
          }
        },
      );

      if (res.statusCode == 200 && res.data != null && res.data['url'] != null) {
        if (mounted) {
          setState(() {
            item.remoteUrl = res.data['url'] as String;
            item.isUploading = false;
            item.progress = 1.0;
          });
        }
      } else {
        throw Exception(res.data?['error'] ?? 'Upload failed');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          item.isUploading = false;
          item.error = 'Failed to upload';
        });
      }
    }
  }

  void _removeMedia(int index) {
    setState(() {
      _mediaList.removeAt(index);
    });
  }

  // ── Submit Request ──────────────────────────
  Future<void> _submit() async {
    if (_titleCtrl.text.trim().isEmpty) {
      _snack('Please describe what you need.', isError: true);
      return;
    }

    if (_mediaList.any((m) => m.isUploading)) {
      _snack('Please wait for photos/video to finish uploading.', isError: true);
      return;
    }

    final currentUser = authNotifier.state.user;
    if (currentUser == null && (_nameCtrl.text.trim().isEmpty || _phoneCtrl.text.trim().isEmpty)) {
      _snack('Please provide your name and WhatsApp number.', isError: true);
      return;
    }

    setState(() => _submitting = true);

    try {
      final token = await authNotifier.storage.getToken();

      final mediaPayload = _mediaList
          .where((m) => m.remoteUrl != null && m.remoteUrl!.isNotEmpty)
          .map((m) => {
                'mediaUrl': m.remoteUrl,
                'mediaType': m.mediaType,
                'fileName': m.fileName,
              })
          .toList();

      final res = await _dio.post(
        '/requests',
        data: {
          'title': _titleCtrl.text.trim(),
          'description': _descCtrl.text.trim(),
          'customCategory': _selectedCategory,
          'urgency': _urgency,
          'landmark': _locationCtrl.text.trim().isNotEmpty ? _locationCtrl.text.trim() : 'Tamale Central',
          'streetAddress': _locationCtrl.text.trim(),
          'latitude': UserLocationService.currentLocation.isGps ? UserLocationService.currentLocation.lat : null,
          'longitude': UserLocationService.currentLocation.isGps ? UserLocationService.currentLocation.lon : null,
          'guestName': _nameCtrl.text.trim().isNotEmpty ? _nameCtrl.text.trim() : (currentUser?.name ?? 'Customer'),
          'guestPhone': _phoneCtrl.text.trim().isNotEmpty ? _phoneCtrl.text.trim() : (currentUser?.phone ?? '+233240000000'),
          'isGuestPost': currentUser == null,
          'pricingType': 'OPEN_FOR_QUOTES',
          'visibility': 'PUBLIC_ALL',
          'media': mediaPayload,
        },
        options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : {}),
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        final reqId = res.data['request']?['id'] ?? res.data['id'] ?? '';
        setState(() {
          _trackingId = reqId.toString();
          _success = true;
          _submitting = false;
        });
        HapticFeedback.heavyImpact();
        _successCtrl.forward();
      } else {
        throw Exception(res.data['error'] ?? 'Server error');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _submitting = false);
        _snack('Failed: ${e.toString()}', isError: true);
      }
    }
  }

  void _snack(String msg, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: const TextStyle(fontWeight: FontWeight.bold)),
      backgroundColor: isError ? const Color(0xFFDC2626) : const Color(0xFF059669),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.all(16),
    ));
  }

  // ── UI Build ────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0A0F1A) : const Color(0xFFF8FAFC);
    final surface = isDark ? const Color(0xFF111827) : Colors.white;
    final border = isDark ? const Color(0xFF1F2937) : const Color(0xFFE2E8F0);
    final textMain = isDark ? Colors.white : const Color(0xFF0F172A);
    final textSub = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    const green = Color(0xFF059669);

    if (_success) {
      return _buildSuccessScreen(green, textMain, textSub, surface, border);
    }

    return Scaffold(
      backgroundColor: bg,
      body: FadeTransition(
        opacity: _fadeAnim,
        child: CustomScrollView(
        slivers: [
          // ── Gradient Header (Exact Web Styling) ──
          SliverAppBar(
            pinned: true,
            expandedHeight: 140,
            backgroundColor: const Color(0xFF064E3B),
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
              onPressed: () {
                if (Navigator.of(context).canPop()) {
                  context.pop();
                } else {
                  context.go('/home');
                }
              },
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF064E3B), Color(0xFF0F766E), Color(0xFF065F46)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(20, 50, 20, 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.18),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'SERVORA · POST ANY JOB',
                        style: TextStyle(
                          color: Color(0xFF6EE7B7),
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'What do you need help with?',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 19,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Reach verified artisans in Tamale instantly.',
                      style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 11),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── "Where It Appears" Context Banner (Exact Web Feature) ──
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF064E3B).withOpacity(0.3) : const Color(0xFFECFDF5),
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? const Color(0xFF064E3B) : const Color(0xFFA7F3D0),
                  ),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.remove_red_eye_outlined, size: 16, color: Color(0xFF059669)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? const Color(0xFFA7F3D0) : const Color(0xFF065F46),
                        ),
                        children: const [
                          TextSpan(text: 'Publicly listed on '),
                          TextSpan(
                            text: 'Requests Board',
                            style: TextStyle(fontWeight: FontWeight.w900, decoration: TextDecoration.underline),
                          ),
                          TextSpan(text: ' · Local providers send you price quotes!'),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Form Body ──────────────────────────
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // 1. Primary Free-Text Field (Front & Center)
                _sectionLabel('Describe what you need *', Icons.edit_note_rounded, green),
                const SizedBox(height: 6),
                _inputField(
                  controller: _titleCtrl,
                  hint: 'e.g. Fix broken pipe, repair Samsung phone, sew a kaba, weld gate...',
                  surface: surface,
                  border: border,
                  textMain: textMain,
                  maxLines: 2,
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 4, left: 2),
                  child: Text(
                    'Type anything — any service, trade, or task in Tamale & Northern Ghana',
                    style: TextStyle(fontSize: 10, color: textSub),
                  ),
                ),

                const SizedBox(height: 18),

                // 2. Quick-Fill Shortcuts (Category Helper Chips)
                _sectionLabel('⚡ Quick-fill a category (optional)', Icons.bolt_rounded, const Color(0xFFD97706)),
                const SizedBox(height: 8),
                SizedBox(
                  height: 36,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _quickFills.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, idx) {
                      final q = _quickFills[idx];
                      final isSelected = _titleCtrl.text == q['label'];
                      return InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () {
                          HapticFeedback.selectionClick();
                          setState(() {
                            _titleCtrl.text = q['label']!;
                            _selectedCategory = q['cat']!;
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? green
                                : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected
                                  ? green
                                  : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(q['emoji']!, style: const TextStyle(fontSize: 13)),
                              const SizedBox(width: 6),
                              Text(
                                q['label']!,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : textMain,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 20),

                // 3. Problem Details (Description)
                _sectionLabel('More details', Icons.description_outlined, green, optional: true),
                const SizedBox(height: 6),
                _inputField(
                  controller: _descCtrl,
                  hint: 'Model numbers, symptoms, size, quantity, or anything useful...',
                  surface: surface,
                  border: border,
                  textMain: textMain,
                  maxLines: 3,
                ),

                const SizedBox(height: 20),

                // 4. Urgency Selector
                _sectionLabel('How urgent?', Icons.timer_outlined, green),
                const SizedBox(height: 8),
                Row(
                  children: _urgencyOpts.map((opt) {
                    final isSelected = _urgency == opt['id'];
                    final color = Color(opt['color'] as int);
                    return Expanded(
                      child: GestureDetector(
                        onTap: () {
                          HapticFeedback.selectionClick();
                          setState(() => _urgency = opt['id'] as String);
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          margin: const EdgeInsets.only(right: 6),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? color.withOpacity(0.12) : surface,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSelected ? color : border,
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: Column(
                            children: [
                              Text(opt['emoji'] as String, style: const TextStyle(fontSize: 18)),
                              const SizedBox(height: 4),
                              Text(
                                opt['label'] as String,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  color: isSelected ? color : textSub,
                                ),
                              ),
                              Text(
                                opt['sub'] as String,
                                style: TextStyle(fontSize: 8, color: textSub),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 20),

                // 5. Location / Landmark & GPS
                _sectionLabel('Your Location / Landmark *', Icons.location_on_outlined, green),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: _inputField(
                        controller: _locationCtrl,
                        hint: 'e.g. Near Sakasaka Taxi Rank, Tamale',
                        surface: surface,
                        border: border,
                        textMain: textMain,
                      ),
                    ),
                    const SizedBox(width: 8),
                    // GPS Button
                    GestureDetector(
                      onTap: _fetchingGps
                          ? null
                          : () async {
                              setState(() => _fetchingGps = true);
                              final loc = await UserLocationService.detectCurrentGpsLocation(context);
                              if (mounted) {
                                setState(() {
                                  _fetchingGps = false;
                                  if (loc != null) _locationCtrl.text = loc.formattedAddress;
                                });
                              }
                            },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF059669), Color(0xFF0D9488)],
                          ),
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: green.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: _fetchingGps
                            ? const Center(
                                child: SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                ),
                              )
                            : const Icon(Icons.my_location_rounded, color: Colors.white, size: 20),
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Map Picker
                    GestureDetector(
                      onTap: () async {
                        final picked = await ServoraLocationPickerSheet.show(context);
                        if (picked != null && mounted) {
                          setState(() => _locationCtrl.text = picked.formattedAddress);
                        }
                      },
                      child: Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: border),
                        ),
                        child: Icon(Icons.map_rounded, color: textSub, size: 20),
                      ),
                    ),
                  ],
                ),

                // GPS Captured Indicator
                if (UserLocationService.currentLocation.isGps) ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.gps_fixed_rounded, size: 12, color: Color(0xFF059669)),
                      const SizedBox(width: 4),
                      Text(
                        '📍 ${UserLocationService.currentLocation.lat.toStringAsFixed(4)}, ${UserLocationService.currentLocation.lon.toStringAsFixed(4)} — GPS captured',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF059669), fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                ],

                const SizedBox(height: 20),

                // 6. Dynamic Photos & Video Upload (Web Feature)
                _sectionLabel('Photos / Video', Icons.photo_library_outlined, green, optional: true),
                const SizedBox(height: 4),
                Text(
                  'Pick up to 6 photos + 1 video (max 30s) — helps artisans quote accurately',
                  style: TextStyle(fontSize: 10, color: textSub),
                ),
                const SizedBox(height: 10),

                // Media Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _pickPhotos,
                        icon: const Icon(Icons.add_photo_alternate_rounded, size: 18),
                        label: const Text('Add Photos', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: green,
                          side: const BorderSide(color: green),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _pickVideo,
                        icon: const Icon(Icons.videocam_rounded, size: 18),
                        label: const Text('Add Video (30s)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF0284C7),
                          side: const BorderSide(color: Color(0xFF0284C7)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ],
                ),

                // Media Previews Grid with Progress Bars
                if (_mediaList.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 90,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _mediaList.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 10),
                      itemBuilder: (context, i) {
                        final m = _mediaList[i];
                        final isVideo = m.mediaType == 'VIDEO';
                        return Stack(
                          children: [
                            Container(
                              width: 85,
                              height: 85,
                              decoration: BoxDecoration(
                                color: surface,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: border),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: Stack(
                                fit: StackFit.expand,
                                children: [
                                  if (!isVideo)
                                    Image.file(File(m.localPath), fit: BoxFit.cover)
                                  else
                                    Container(
                                      color: const Color(0xFF0F172A),
                                      child: const Center(
                                        child: Icon(Icons.play_circle_fill_rounded, color: Colors.white, size: 30),
                                      ),
                                    ),
                                  // Uploading Overlay & Progress Bar
                                  if (m.isUploading)
                                    Container(
                                      color: Colors.black54,
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          SizedBox(
                                            width: 24,
                                            height: 24,
                                            child: CircularProgressIndicator(
                                              value: m.progress > 0 ? m.progress : null,
                                              color: Colors.white,
                                              strokeWidth: 2.5,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '${(m.progress * 100).toInt()}%',
                                            style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                                          ),
                                        ],
                                      ),
                                    ),
                                  // Video Badge
                                  if (isVideo)
                                    Positioned(
                                      bottom: 4,
                                      left: 4,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.black87,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: const Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(Icons.videocam, size: 10, color: Colors.amber),
                                            SizedBox(width: 2),
                                            Text('VIDEO', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                                          ],
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            // Delete Button
                            Positioned(
                              top: 2,
                              right: 2,
                              child: GestureDetector(
                                onTap: () => _removeMedia(i),
                                child: Container(
                                  padding: const EdgeInsets.all(3),
                                  decoration: const BoxDecoration(
                                    color: Colors.black87,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.close_rounded, size: 12, color: Colors.white),
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ],

                const SizedBox(height: 22),

                // 7. Contact Info (Identical to Web Card)
                _sectionLabel('Your Contact Details', Icons.phone_outlined, green),
                const SizedBox(height: 8),
                if (authNotifier.state.user != null) ...[
                  // Logged-in User Badge
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: green.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: green.withOpacity(0.25)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [Color(0xFF059669), Color(0xFF0D9488)]),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Text(
                              authNotifier.state.user!.name.isNotEmpty
                                  ? authNotifier.state.user!.name[0].toUpperCase()
                                  : 'U',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 17),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(authNotifier.state.user!.name, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: textMain)),
                            Text(authNotifier.state.user!.phone, style: TextStyle(fontSize: 11, color: textSub, fontFamily: 'monospace')),
                          ],
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: green.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: green.withOpacity(0.3)),
                          ),
                          child: const Text('Logged in ✓', style: TextStyle(color: Color(0xFF059669), fontSize: 10, fontWeight: FontWeight.w900)),
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  // Guest Contact Inputs
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: surface,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: border),
                    ),
                    child: Column(
                      children: [
                        _inputField(
                          controller: _nameCtrl,
                          hint: 'Your Full Name *',
                          surface: isDark ? const Color(0xFF1F2937) : const Color(0xFFF1F5F9),
                          border: border,
                          textMain: textMain,
                          prefixIcon: const Icon(Icons.person_outline_rounded, size: 18),
                        ),
                        const SizedBox(height: 10),
                        _inputField(
                          controller: _phoneCtrl,
                          hint: 'WhatsApp Number * (+233...)',
                          surface: isDark ? const Color(0xFF1F2937) : const Color(0xFFF1F5F9),
                          border: border,
                          textMain: textMain,
                          keyboardType: TextInputType.phone,
                          prefixIcon: const Icon(Icons.phone_iphone_rounded, size: 18),
                        ),
                      ],
                    ),
                  ),
                ],
              ]),
            ),
          ),
        ],
      ),
    ),

      // ── Floating Submit Button (Identical to Web) ──
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
        decoration: BoxDecoration(
          color: bg,
          border: Border(top: BorderSide(color: border)),
        ),
        child: GestureDetector(
          onTap: _submitting ? null : _submit,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            height: 54,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: _submitting
                    ? [const Color(0xFF475569), const Color(0xFF475569)]
                    : [const Color(0xFF059669), const Color(0xFF0D9488)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: green.withOpacity(_submitting ? 0 : 0.35),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: _submitting
                  ? const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
                        SizedBox(width: 10),
                        Text('Publishing Request...', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14)),
                      ],
                    )
                  : const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('🚀', style: TextStyle(fontSize: 18)),
                        SizedBox(width: 8),
                        Text('Post Request & Get Quotes', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15)),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }

  // ── Success Screen (Synced 1:1 with Web) ───────
  Widget _buildSuccessScreen(Color green, Color textMain, Color textSub, Color surface, Color border) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1A),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Animated Check Circle
                ScaleTransition(
                  scale: _successScaleAnim,
                  child: Container(
                    width: 84,
                    height: 84,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF059669), Color(0xFF10B981)]),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(color: green.withOpacity(0.4), blurRadius: 20, offset: const Offset(0, 8)),
                      ],
                    ),
                    child: const Center(
                      child: Icon(Icons.check_rounded, color: Colors.white, size: 44),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Your Request is Live! 🎉',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Publicly listed on the Requests Board. Local providers in Tamale can now send you price offers!',
                  style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.75), height: 1.4),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 20),

                // Visual "Appears On" Preview Card (Exact Web Component)
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 4,
                        height: 36,
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'servora.com/requests',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13),
                            ),
                            Text(
                              'Public Requests Board · Visible to all artisans in Tamale',
                              style: TextStyle(color: Colors.white60, fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // Action 1: View Request & Offers
                GestureDetector(
                  onTap: () {
                    if (_trackingId.isNotEmpty) {
                      context.push('/requests/$_trackingId');
                    } else {
                      context.go('/community');
                    }
                  },
                  child: Container(
                    width: double.infinity,
                    height: 52,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF059669), Color(0xFF0D9488)]),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(color: green.withOpacity(0.35), blurRadius: 16, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: const Center(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('View Your Request & Offers', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14)),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 16),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Action 2: Return to Home
                GestureDetector(
                  onTap: () => context.go('/home'),
                  child: Container(
                    width: double.infinity,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: const Center(
                      child: Text('Return to Home', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Helper Widgets ─────────────────────────
  Widget _sectionLabel(String text, IconData icon, Color green, {bool optional = false}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Row(
      children: [
        Icon(icon, size: 15, color: green),
        const SizedBox(width: 6),
        Text(
          text,
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: isDark ? Colors.white : const Color(0xFF0F172A)),
        ),
        if (optional) ...[
          const SizedBox(width: 6),
          Text(
            '(optional)',
            style: TextStyle(fontSize: 10, color: isDark ? const Color(0xFF6B7280) : const Color(0xFF94A3B8)),
          ),
        ],
      ],
    );
  }

  Widget _inputField({
    required TextEditingController controller,
    required String hint,
    required Color surface,
    required Color border,
    required Color textMain,
    int maxLines = 1,
    TextInputType? keyboardType,
    Widget? prefixIcon,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        style: TextStyle(fontSize: 13, color: textMain, fontWeight: FontWeight.w600),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8), fontWeight: FontWeight.w400),
          border: InputBorder.none,
          prefixIcon: prefixIcon,
          contentPadding: EdgeInsets.symmetric(
            horizontal: prefixIcon == null ? 14 : 10,
            vertical: maxLines > 1 ? 12 : 12,
          ),
        ),
      ),
    );
  }
}
