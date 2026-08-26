import 'package:flutter/material.dart';

enum ServoraButtonVariant { primary, secondary, outline, whatsapp }

class ServoraButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final ServoraButtonVariant variant;
  final IconData? icon;
  final bool isLoading;
  final double? width;

  const ServoraButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = ServoraButtonVariant.primary,
    this.icon,
    this.isLoading = false,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    Color bg = const Color(0xFF059669);
    Color fg = Colors.white;
    BorderSide border = BorderSide.none;

    if (variant == ServoraButtonVariant.secondary) {
      bg = Theme.of(context).brightness == Brightness.dark
          ? const Color(0xFF1F2937)
          : const Color(0xFFE2E8F0);
      fg = Theme.of(context).brightness == Brightness.dark
          ? Colors.white
          : const Color(0xFF0F172A);
    } else if (variant == ServoraButtonVariant.outline) {
      bg = Colors.transparent;
      fg = const Color(0xFF059669);
      border = const BorderSide(color: Color(0xFF059669), width: 1.5);
    } else if (variant == ServoraButtonVariant.whatsapp) {
      bg = const Color(0xFF25D366);
      fg = Colors.white;
    }

    return SizedBox(
      width: width ?? double.infinity,
      height: 48,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: fg,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: border,
          ),
        ),
        onPressed: isLoading ? null : onPressed,
        child: isLoading
            ? SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation<Color>(fg),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 18, color: fg),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: fg,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
