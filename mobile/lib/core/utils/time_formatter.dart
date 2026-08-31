import 'package:intl/intl.dart';

class TimeFormatter {
  /// Formats UTC ISO string or DateTime to modern relative time (e.g. "Just now", "5m ago", "2h ago", "Yesterday", "3d ago", "Posted Aug 24, 2026").
  static String formatRelativeTime(dynamic dateInput) {
    if (dateInput == null) return 'Recently';

    DateTime? date;
    if (dateInput is DateTime) {
      date = dateInput.toLocal();
    } else if (dateInput is String && dateInput.isNotEmpty) {
      date = DateTime.tryParse(dateInput)?.toLocal();
    }

    if (date == null) return 'Recently';

    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.isNegative) return 'Just now';

    final diffSecs = diff.inSeconds;
    final diffMins = diff.inMinutes;
    final diffHours = diff.inHours;
    final diffDays = diff.inDays;

    if (diffSecs < 60) {
      return 'Just now';
    }
    if (diffMins < 60) {
      return '${diffMins}m ago';
    }
    if (diffHours < 24) {
      return '${diffHours}h ago';
    }
    if (diffDays == 1) {
      return 'Yesterday';
    }
    if (diffDays < 14) {
      return '${diffDays}d ago';
    }
    if (diffDays < 60) {
      final weeks = (diffDays / 7).floor();
      return '${weeks}w ago';
    }
    if (diffDays < 365) {
      final months = (diffDays / 30).floor();
      return '${months}mo ago';
    }

    return 'Posted ${DateFormat('MMM d, yyyy').format(date)}';
  }

  /// Formats UTC ISO string or DateTime to exact date and time (e.g. "Posted August 24, 2026 at 3:42 PM").
  static String formatExactDateTime(dynamic dateInput) {
    if (dateInput == null) return 'Posted recently';

    DateTime? date;
    if (dateInput is DateTime) {
      date = dateInput.toLocal();
    } else if (dateInput is String && dateInput.isNotEmpty) {
      date = DateTime.tryParse(dateInput)?.toLocal();
    }

    if (date == null) return 'Posted recently';

    final dateStr = DateFormat('MMMM d, yyyy').format(date);
    final timeStr = DateFormat('h:mm a').format(date);

    return 'Posted $dateStr at $timeStr';
  }
}
