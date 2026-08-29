import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../app/theme/servora_colors.dart';
import '../../core/services/marketplace_api_service.dart';

class ServoraLiveTickerBar extends StatefulWidget {
  const ServoraLiveTickerBar({super.key});

  @override
  State<ServoraLiveTickerBar> createState() => _ServoraLiveTickerBarState();
}

class _ServoraLiveTickerBarState extends State<ServoraLiveTickerBar> {
  int _currentIndex = 0;
  Timer? _timer;
  bool _isAnimatingUp = true;
  List<Map<String, dynamic>> _tickers = [];

  final List<Map<String, dynamic>> _fallbackTickers = [
    {
      'text': 'Are you a business owner or seller? Register your business to boost local sales!',
      'tag': 'BUSINESS_OWNER',
      'badgeText': 'BUSINESS OWNER',
      'badgeColor': 'indigo',
      'ctaLabel': 'Register ➔',
      'ctaUrl': '/auth/login',
    },
    {
      'text': 'Are you looking for a job? Servoragh connects skilled artisans with paying clients!',
      'tag': 'JOB_SEEKER',
      'badgeText': 'JOB SEEKER',
      'badgeColor': 'emerald',
      'ctaLabel': 'Find Jobs ➔',
      'ctaUrl': '/notice-board',
    },
    {
      'text': 'Do you offer repair skills? Register your business & connect with customers in Tamale!',
      'tag': 'EXPERT_ARTISAN',
      'badgeText': 'EXPERT ARTISAN',
      'badgeColor': 'amber',
      'ctaLabel': 'Register ➔',
      'ctaUrl': '/auth/login',
    },
    {
      'text': '24/7 Northern Ghana Emergency Hotline & Dispatch active for urgent repairs!',
      'tag': 'EMERGENCY',
      'badgeText': '24/7 DISPATCH',
      'badgeColor': 'rose',
      'ctaLabel': 'Call ➔',
      'ctaUrl': 'tel:+233240000000',
    },
    {
      'text': 'Got idle power tools or generators? Rent them out & earn daily passive income!',
      'tag': 'RENTAL',
      'badgeText': 'TOOL RENTALS',
      'badgeColor': 'teal',
      'ctaLabel': 'Rent Tools ➔',
      'ctaUrl': '/products',
    },
    {
      'text': 'Special Launch Promo: 0% Service Commission for all new onboarded providers!',
      'tag': 'PROMO',
      'badgeText': 'PROMO 0%',
      'badgeColor': 'purple',
      'ctaLabel': 'Claim Promo ➔',
      'ctaUrl': '/auth/login',
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadTickers();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadTickers() async {
    try {
      final live = await MarketplaceApiService.fetchTickers();
      if (mounted && live.isNotEmpty) {
        setState(() {
          _tickers = live.map((t) => Map<String, dynamic>.from(t as Map)).toList();
        });
      }
    } catch (_) {}
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 6), (_) {
      _nextSlide();
    });
  }

  void _nextSlide() {
    final dataset = _tickers.isNotEmpty ? _tickers : _fallbackTickers;
    if (dataset.isEmpty) return;
    setState(() {
      _isAnimatingUp = true;
      _currentIndex = (_currentIndex + 1) % dataset.length;
    });
  }

  void _prevSlide() {
    final dataset = _tickers.isNotEmpty ? _tickers : _fallbackTickers;
    if (dataset.isEmpty) return;
    setState(() {
      _isAnimatingUp = false;
      _currentIndex = (_currentIndex - 1 + dataset.length) % dataset.length;
    });
  }

  Color _getBadgeBgColor(String colorTag) {
    switch (colorTag.toLowerCase()) {
      case 'emerald':
        return ServoraColors.emerald600.withOpacity(0.2);
      case 'indigo':
        return const Color(0xFF3B82F6).withOpacity(0.25);
      case 'amber':
        return const Color(0xFFF59E0B).withOpacity(0.25);
      case 'rose':
      case 'emergency':
        return const Color(0xFFEF4444).withOpacity(0.25);
      case 'teal':
        return const Color(0xFF14B8A6).withOpacity(0.25);
      case 'purple':
        return const Color(0xFFA855F7).withOpacity(0.25);
      default:
        return ServoraColors.emerald600.withOpacity(0.2);
    }
  }

  Color _getBadgeTextColor(String colorTag) {
    switch (colorTag.toLowerCase()) {
      case 'emerald':
        return const Color(0xFF34D399);
      case 'indigo':
        return const Color(0xFF93C5FD);
      case 'amber':
        return const Color(0xFFFDE047);
      case 'rose':
      case 'emergency':
        return const Color(0xFFFCA5A5);
      case 'teal':
        return const Color(0xFF5EEAD4);
      case 'purple':
        return const Color(0xFFE9D5FF);
      default:
        return const Color(0xFF34D399);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dataset = _tickers.isNotEmpty ? _tickers : _fallbackTickers;

    if (dataset.isEmpty) return const SizedBox.shrink();

    final currentItem = dataset[_currentIndex % dataset.length];
    final badgeText = currentItem['badgeText'] ?? currentItem['tag'] ?? 'SERVORA';
    final badgeColorTag = (currentItem['badgeColor'] ?? currentItem['tag'] ?? 'emerald').toString();
    final text = currentItem['text'] ?? '';
    final ctaLabel = currentItem['ctaLabel']?.toString();
    final ctaUrl = currentItem['ctaUrl']?.toString();

    return Container(
      width: double.infinity,
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : ServoraColors.emerald900,
        border: Border(
          bottom: BorderSide(
            color: ServoraColors.emerald600.withOpacity(0.3),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          // Live Pulse Dot & Brand Logo
          Row(
            children: [
              Container(
                width: 7,
                height: 7,
                decoration: const BoxDecoration(
                  color: ServoraColors.emerald500,
                  shape: BoxShape.circle,
                ),
              ),
              const Gap(6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: Image.asset(
                  'assets/images/logo.png',
                  width: 16,
                  height: 16,
                  fit: BoxFit.contain,
                ),
              ),
            ],
          ),
          const Gap(8),

          // Animated Slide-Up Ticker Text Area
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 350),
              transitionBuilder: (Widget child, Animation<double> animation) {
                final offsetAnimation = Tween<Offset>(
                  begin: Offset(0.0, _isAnimatingUp ? 0.8 : -0.8),
                  end: Offset.zero,
                ).animate(animation);
                return SlideTransition(
                  position: offsetAnimation,
                  child: FadeTransition(opacity: animation, child: child),
                );
              },
              child: KeyedSubtree(
                key: ValueKey<int>(_currentIndex),
                child: Row(
                  children: [
                    // Colored Badge Pill
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: _getBadgeBgColor(badgeColorTag),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: _getBadgeTextColor(badgeColorTag).withOpacity(0.4),
                          width: 0.8,
                        ),
                      ),
                      child: Text(
                        badgeText,
                        style: TextStyle(
                          fontSize: 8.5,
                          fontWeight: FontWeight.w900,
                          color: _getBadgeTextColor(badgeColorTag),
                        ),
                      ),
                    ),
                    const Gap(8),

                    // Ticker Message Text
                    Expanded(
                      child: Text(
                        text,
                        style: const TextStyle(
                          fontSize: 10.5,
                          color: Colors.white70,
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const Gap(6),

          // Optional CTA Action Button
          if (ctaLabel != null && ctaLabel.isNotEmpty) ...[
            GestureDetector(
              onTap: () {
                if (ctaUrl != null && ctaUrl.startsWith('tel:')) {
                  launchUrl(Uri.parse(ctaUrl));
                } else if (ctaUrl != null && ctaUrl.isNotEmpty) {
                  context.push(ctaUrl);
                } else {
                  context.push('/auth/login');
                }
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: ServoraColors.emerald600,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  ctaLabel,
                  style: const TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            const Gap(6),
          ],

          // Up / Down Navigation Controls
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              GestureDetector(
                onTap: _prevSlide,
                child: const Icon(Icons.keyboard_arrow_up_rounded, size: 14, color: Colors.white54),
              ),
              GestureDetector(
                onTap: _nextSlide,
                child: const Icon(Icons.keyboard_arrow_down_rounded, size: 14, color: Colors.white54),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
