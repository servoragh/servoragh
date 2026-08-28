import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../app/theme/servora_colors.dart';

class ServoraImageLightbox extends StatefulWidget {
  final String title;
  final List<String> images;
  final int initialIndex;

  const ServoraImageLightbox({
    super.key,
    required this.title,
    required this.images,
    this.initialIndex = 0,
  });

  static void show(
    BuildContext context, {
    required String title,
    required List<String> images,
    int initialIndex = 0,
  }) {
    if (images.isEmpty) return;
    Navigator.of(context, rootNavigator: true).push(
      PageRouteBuilder(
        opaque: false,
        barrierDismissible: true,
        barrierColor: Colors.black.withOpacity(0.95),
        pageBuilder: (context, _, __) => ServoraImageLightbox(
          title: title,
          images: images,
          initialIndex: initialIndex,
        ),
        transitionsBuilder: (context, animation, _, child) {
          return FadeTransition(opacity: animation, child: child);
        },
      ),
    );
  }

  @override
  State<ServoraImageLightbox> createState() => _ServoraImageLightboxState();
}

class _ServoraImageLightboxState extends State<ServoraImageLightbox> {
  late PageController _pageController;
  late int _currentIndex;
  final TransformationController _transformController = TransformationController();
  bool _isZoomed = false;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex.clamp(0, widget.images.length - 1);
    _pageController = PageController(initialPage: _currentIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _transformController.dispose();
    super.dispose();
  }

  void _toggleZoom() {
    setState(() {
      if (_isZoomed) {
        _transformController.value = Matrix4.identity();
        _isZoomed = false;
      } else {
        _transformController.value = Matrix4.identity()..scale(2.0);
        _isZoomed = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      widget.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const Gap(8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${_currentIndex + 1} / ${widget.images.length}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const Gap(8),
                  IconButton(
                    icon: Icon(
                      _isZoomed ? Icons.zoom_out_map_rounded : Icons.zoom_in_rounded,
                      color: Colors.white,
                    ),
                    onPressed: _toggleZoom,
                    tooltip: 'Toggle Zoom',
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                    tooltip: 'Close',
                  ),
                ],
              ),
            ),

            // Main Swipeable Stage with Pinch & Zoom
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: widget.images.length,
                onPageChanged: (idx) {
                  setState(() {
                    _currentIndex = idx;
                    _transformController.value = Matrix4.identity();
                    _isZoomed = false;
                  });
                },
                itemBuilder: (context, index) {
                  final imgUrl = widget.images[index];
                  return Center(
                    child: InteractiveViewer(
                      transformationController: index == _currentIndex ? _transformController : null,
                      minScale: 1.0,
                      maxScale: 3.5,
                      onInteractionEnd: (_) {
                        if (_transformController.value.getMaxScaleOnAxis() > 1.05) {
                          if (!_isZoomed) setState(() => _isZoomed = true);
                        } else {
                          if (_isZoomed) setState(() => _isZoomed = false);
                        }
                      },
                      child: imgUrl.startsWith('http')
                          ? Image.network(
                              imgUrl,
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => const Center(
                                child: Icon(Icons.broken_image_rounded, color: Colors.white54, size: 64),
                              ),
                            )
                          : Image.asset(
                              imgUrl,
                              fit: BoxFit.contain,
                            ),
                    ),
                  );
                },
              ),
            ),

            // Bottom Thumbnail Strip
            if (widget.images.length > 1)
              Container(
                height: 70,
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: widget.images.length,
                  separatorBuilder: (_, __) => const Gap(8),
                  itemBuilder: (context, idx) {
                    final imgUrl = widget.images[idx];
                    final isSelected = _currentIndex == idx;
                    return GestureDetector(
                      onTap: () {
                        _pageController.animateToPage(
                          idx,
                          duration: const Duration(milliseconds: 250),
                          curve: Curves.easeInOut,
                        );
                      },
                      child: Container(
                        width: 54,
                        height: 54,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? ServoraColors.emerald500 : Colors.white24,
                            width: isSelected ? 2.5 : 1,
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: imgUrl.startsWith('http')
                              ? Image.network(imgUrl, fit: BoxFit.cover)
                              : Image.asset(imgUrl, fit: BoxFit.cover),
                        ),
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}
