import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../app/theme/servora_colors.dart';
import '../../features/auth/providers/auth_provider.dart';

class ServoraImageUploadWidget extends StatefulWidget {
  final List<String> initialImages;
  final ValueChanged<List<String>> onImagesChanged;
  final int maxImages;
  final bool isSingleImage;
  final String label;
  final String helperText;
  final double singleImageHeight;

  const ServoraImageUploadWidget({
    super.key,
    required this.initialImages,
    required this.onImagesChanged,
    this.maxImages = 6,
    this.isSingleImage = false,
    this.label = 'PRODUCT PHOTOS *',
    this.helperText = 'Upload clear, genuine photos taken from your phone camera or gallery.',
    this.singleImageHeight = 140,
  });

  @override
  State<ServoraImageUploadWidget> createState() => _ServoraImageUploadWidgetState();
}

class _ServoraImageUploadWidgetState extends State<ServoraImageUploadWidget> {
  final ImagePicker _picker = ImagePicker();
  late List<String> _images;
  bool _isUploading = false;
  String? _uploadStatusText;

  @override
  void initState() {
    super.initState();
    _images = List<String>.from(widget.initialImages);
  }

  @override
  void didUpdateWidget(covariant ServoraImageUploadWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialImages != widget.initialImages) {
      _images = List<String>.from(widget.initialImages);
    }
  }

  Future<void> _showPickSourceModal() async {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        decoration: BoxDecoration(
          color: isDark ? ServoraColors.darkSurface : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? Colors.white24 : Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const Gap(16),
            const Text(
              'Select Photo Source',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
            ),
            const Gap(4),
            const Text(
              'Upload real, high-resolution media directly from your device.',
              style: TextStyle(fontSize: 11.5, color: Colors.grey),
            ),
            const Gap(20),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () {
                      Navigator.pop(ctx);
                      _pickImage(ImageSource.camera);
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      decoration: BoxDecoration(
                        color: ServoraColors.emerald600.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: ServoraColors.emerald600.withOpacity(0.3)),
                      ),
                      child: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.camera_alt_rounded, color: ServoraColors.emerald600, size: 28),
                          Gap(8),
                          Text('Take Photo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text('Camera', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                ),
                const Gap(12),
                Expanded(
                  child: InkWell(
                    onTap: () {
                      Navigator.pop(ctx);
                      _pickImage(ImageSource.gallery);
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2563EB).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF2563EB).withOpacity(0.3)),
                      ),
                      child: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.photo_library_rounded, color: Color(0xFF2563EB), size: 28),
                          Gap(8),
                          Text('Photo Gallery', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text('Choose file', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      if (widget.isSingleImage) {
        final XFile? file = await _picker.pickImage(
          source: source,
          maxWidth: 1600,
          maxHeight: 1600,
          imageQuality: 85,
        );
        if (file != null) {
          await _uploadFile(file);
        }
      } else {
        if (source == ImageSource.gallery) {
          final List<XFile> files = await _picker.pickMultiImage(
            maxWidth: 1600,
            maxHeight: 1600,
            imageQuality: 85,
          );
          if (files.isNotEmpty) {
            for (final f in files.take(widget.maxImages - _images.length)) {
              await _uploadFile(f);
            }
          }
        } else {
          final XFile? file = await _picker.pickImage(
            source: source,
            maxWidth: 1600,
            maxHeight: 1600,
            imageQuality: 85,
          );
          if (file != null) {
            await _uploadFile(file);
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red[700],
            content: Text('Failed to pick photo: ${e.toString()}'),
          ),
        );
      }
    }
  }

  Future<void> _uploadFile(XFile xFile) async {
    setState(() {
      _isUploading = true;
      _uploadStatusText = 'Uploading image to server...';
    });

    try {
      final token = await authNotifier.storage.getToken();
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          xFile.path,
          filename: xFile.name.isNotEmpty ? xFile.name : 'upload.jpg',
        ),
      });

      final response = await authNotifier.apiClient.dio.post(
        '/upload',
        data: formData,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
            if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data is Map ? response.data : {};
        final uploadedUrl = data['url']?.toString();

        if (uploadedUrl != null && uploadedUrl.isNotEmpty) {
          setState(() {
            if (widget.isSingleImage) {
              _images = [uploadedUrl];
            } else {
              _images.add(uploadedUrl);
            }
          });
          widget.onImagesChanged(_images);
        } else {
          throw Exception('No URL returned from upload server.');
        }
      } else {
        throw Exception('Upload failed with status code ${response.statusCode}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red[700],
            content: Text('Image upload failed: ${e.toString()}'),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
          _uploadStatusText = null;
        });
      }
    }
  }

  void _removeImage(int index) {
    setState(() {
      _images.removeAt(index);
    });
    widget.onImagesChanged(_images);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              widget.label,
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 0.5),
            ),
            if (!widget.isSingleImage)
              Text(
                '${_images.length}/${widget.maxImages} photos',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: _images.isNotEmpty ? ServoraColors.emerald600 : Colors.grey,
                ),
              ),
          ],
        ),
        const Gap(4),
        Text(
          widget.helperText,
          style: const TextStyle(fontSize: 11, color: Colors.grey),
        ),
        const Gap(10),

        if (widget.isSingleImage)
          _buildSingleImagePicker(isDark)
        else
          _buildMultiImagePicker(isDark),

        if (_isUploading) ...[
          const Gap(8),
          Row(
            children: [
              const SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(strokeWidth: 2, color: ServoraColors.emerald600),
              ),
              const Gap(8),
              Text(
                _uploadStatusText ?? 'Uploading...',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ServoraColors.emerald600),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildSingleImagePicker(bool isDark) {
    final hasImage = _images.isNotEmpty && _images[0].isNotEmpty;

    if (hasImage) {
      return Container(
        height: widget.singleImageHeight,
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: ServoraColors.emerald600.withOpacity(0.5)),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            fit: StackFit.expand,
            children: [
              CachedNetworkImage(
                imageUrl: _images[0],
                fit: BoxFit.cover,
                placeholder: (_, __) => Container(
                  color: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                  child: const Center(child: CircularProgressIndicator(strokeWidth: 2, color: ServoraColors.emerald600)),
                ),
                errorWidget: (_, __, ___) => Container(
                  color: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                  child: const Center(child: Icon(Icons.broken_image_rounded, color: Colors.grey)),
                ),
              ),
              Positioned(
                bottom: 8,
                right: 8,
                child: Row(
                  children: [
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black87,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.change_circle_rounded, size: 14),
                      label: const Text('Change', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      onPressed: _isUploading ? null : _showPickSourceModal,
                    ),
                    const Gap(6),
                    CircleAvatar(
                      radius: 14,
                      backgroundColor: Colors.red,
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        icon: const Icon(Icons.close_rounded, size: 14, color: Colors.white),
                        onPressed: () => _removeImage(0),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    return InkWell(
      onTap: _isUploading ? null : _showPickSourceModal,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        height: widget.singleImageHeight,
        width: double.infinity,
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withOpacity(0.04) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? Colors.white12 : const Color(0xFFCBD5E1),
            style: BorderStyle.solid,
            width: 1.5,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: ServoraColors.emerald600.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.add_a_photo_rounded, color: ServoraColors.emerald600, size: 24),
            ),
            const Gap(10),
            const Text(
              'Tap to Upload Photo',
              style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold),
            ),
            const Gap(2),
            const Text(
              'Camera or Phone Gallery',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMultiImagePicker(bool isDark) {
    return SizedBox(
      height: 96,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          // Add Photo Action Button
          if (_images.length < widget.maxImages)
            InkWell(
              onTap: _isUploading ? null : _showPickSourceModal,
              borderRadius: BorderRadius.circular(14),
              child: Container(
                width: 90,
                margin: const EdgeInsets.only(right: 10),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withOpacity(0.04) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark ? Colors.white24 : const Color(0xFFCBD5E1),
                    style: BorderStyle.solid,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: ServoraColors.emerald600.withOpacity(0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.add_photo_alternate_rounded, color: ServoraColors.emerald600, size: 18),
                    ),
                    const Gap(6),
                    const Text(
                      'Add Photo',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),

          // Uploaded Thumbnail Cards
          ..._images.asMap().entries.map((entry) {
            final idx = entry.key;
            final url = entry.value;
            final isCover = idx == 0;

            return Container(
              width: 90,
              margin: const EdgeInsets.only(right: 10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isCover ? ServoraColors.emerald600 : (isDark ? Colors.white12 : const Color(0xFFE2E8F0)),
                  width: isCover ? 2 : 1,
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(13),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    CachedNetworkImage(
                      imageUrl: url,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(
                        color: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                        child: const Center(child: CircularProgressIndicator(strokeWidth: 2, color: ServoraColors.emerald600)),
                      ),
                      errorWidget: (_, __, ___) => Container(
                        color: isDark ? Colors.black26 : const Color(0xFFF1F5F9),
                        child: const Center(child: Icon(Icons.broken_image_rounded, size: 18, color: Colors.grey)),
                      ),
                    ),

                    // Cover Tag
                    if (isCover)
                      Positioned(
                        top: 4,
                        left: 4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                          decoration: BoxDecoration(
                            color: ServoraColors.emerald600,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('COVER', style: TextStyle(color: Colors.white, fontSize: 7.5, fontWeight: FontWeight.w900)),
                        ),
                      ),

                    // Delete X Button
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () => _removeImage(idx),
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
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
