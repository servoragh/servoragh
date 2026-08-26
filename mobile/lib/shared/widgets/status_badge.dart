import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final Color backgroundColor;
  final Color textColor;
  final IconData? icon;

  const StatusBadge({
    super.key,
    required this.label,
    required this.backgroundColor,
    required this.textColor,
    this.icon,
  });

  factory StatusBadge.verifiedGhanaCard() {
    return const StatusBadge(
      label: 'Ghana Card Verified',
      backgroundColor: Color(0xFFD1FAE5),
      textColor: Color(0xFF047857),
      icon: Icons.verified_user_rounded,
    );
  }

  factory StatusBadge.safeEscrow() {
    return const StatusBadge(
      label: 'Safe MoMo Escrow 🛡️',
      backgroundColor: Color(0xFFFEF3C7),
      textColor: Color(0xFFB45309),
      icon: Icons.security_rounded,
    );
  }

  factory StatusBadge.urgentGig() {
    return const StatusBadge(
      label: 'URGENT CALL',
      backgroundColor: Color(0xFFFEE2E2),
      textColor: Color(0xFFB91C1C),
      icon: Icons.bolt_rounded,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: textColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: textColor,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}
