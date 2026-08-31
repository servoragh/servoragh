import 'package:flutter/material.dart';
import '../../core/utils/time_formatter.dart';
import '../../app/theme/servora_colors.dart';

class PresenceBadge extends StatelessWidget {
  final bool isOnline;
  final dynamic lastSeen;
  final bool showHours;

  const PresenceBadge({
    super.key,
    required this.isOnline,
    this.lastSeen,
    this.showHours = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final relative = lastSeen != null ? TimeFormatter.formatRelativeTime(lastSeen) : null;

    return Wrap(
      spacing: 6,
      runSpacing: 4,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        // Real Presence Dot & Text
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: isOnline
                ? (isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5))
                : (isDark ? const Color(0xFF262626) : const Color(0xFFF5F5F4)),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isOnline
                  ? ServoraColors.emerald600.withOpacity(0.4)
                  : (isDark ? const Color(0xFF292524) : const Color(0xFFE7E5E4)),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 7,
                height: 7,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isOnline ? ServoraColors.emerald600 : Colors.grey[400],
                ),
              ),
              const SizedBox(width: 5),
              Text(
                isOnline ? 'Online now' : (relative != null ? 'Active $relative' : 'Offline'),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isOnline
                      ? ServoraColors.emerald600
                      : (isDark ? Colors.grey[400] : Colors.grey[600]),
                ),
              ),
            ],
          ),
        ),

        // Business Hours Coexisting Badge
        if (showHours)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1C1917) : const Color(0xFFF5F5F4),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.access_time_rounded, size: 11, color: ServoraColors.emerald600),
                const SizedBox(width: 4),
                Text(
                  'Open today',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
