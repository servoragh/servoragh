import 'package:flutter/material.dart';
import '../../app/theme/servora_colors.dart';

class ServoraFavoriteButton extends StatefulWidget {
  final String businessId;
  final String businessName;

  const ServoraFavoriteButton({
    super.key,
    required this.businessId,
    this.businessName = 'Business',
  });

  @override
  State<ServoraFavoriteButton> createState() => _ServoraFavoriteButtonState();
}

class _ServoraFavoriteButtonState extends State<ServoraFavoriteButton> {
  bool _isFavorited = false;
  static final Set<String> _favoriteIds = {};

  @override
  void initState() {
    super.initState();
    _isFavorited = _favoriteIds.contains(widget.businessId);
  }

  void _toggleFavorite() {
    setState(() {
      _isFavorited = !_isFavorited;
      if (_isFavorited) {
        _favoriteIds.add(widget.businessId);
      } else {
        _favoriteIds.remove(widget.businessId);
      }
    });

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _isFavorited
              ? '❤️ Saved "${widget.businessName}" to Favorites'
              : 'Removed "${widget.businessName}" from Favorites',
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
        ),
        backgroundColor: _isFavorited ? ServoraColors.emerald600 : Colors.grey[800],
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: _toggleFavorite,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(7),
        decoration: BoxDecoration(
          color: _isFavorited
              ? Colors.red.withOpacity(0.12)
              : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
          shape: BoxShape.circle,
          border: Border.all(
            color: _isFavorited
                ? Colors.red.withOpacity(0.3)
                : (isDark ? ServoraColors.darkCardBorder : Colors.transparent),
            width: 1,
          ),
        ),
        child: Icon(
          _isFavorited ? Icons.favorite_rounded : Icons.favorite_border_rounded,
          size: 16,
          color: _isFavorited ? Colors.redAccent : (isDark ? Colors.white60 : Colors.grey[600]),
        ),
      ),
    );
  }
}
