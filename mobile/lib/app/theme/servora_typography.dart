import 'package:flutter/material.dart';
import 'servora_colors.dart';

class ServoraTypography {
  static TextStyle displayLarge(bool isDark) => TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.w900,
        letterSpacing: -0.8,
        height: 1.15,
        color: isDark ? ServoraColors.textPrimaryDark : ServoraColors.textPrimaryLight,
      );

  static TextStyle displayMedium(bool isDark) => TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.5,
        height: 1.2,
        color: isDark ? ServoraColors.textPrimaryDark : ServoraColors.textPrimaryLight,
      );

  static TextStyle titleLarge(bool isDark) => TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.3,
        height: 1.25,
        color: isDark ? ServoraColors.textPrimaryDark : ServoraColors.textPrimaryLight,
      );

  static TextStyle titleMedium(bool isDark) => TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.2,
        height: 1.3,
        color: isDark ? ServoraColors.textPrimaryDark : ServoraColors.textPrimaryLight,
      );

  static TextStyle bodyLarge(bool isDark) => TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        height: 1.4,
        color: isDark ? ServoraColors.textSecondaryDark : ServoraColors.textSecondaryLight,
      );

  static TextStyle bodyMedium(bool isDark) => TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.normal,
        height: 1.4,
        color: isDark ? ServoraColors.textSecondaryDark : ServoraColors.textSecondaryLight,
      );

  static TextStyle labelSmall(bool isDark) => TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.4,
        color: isDark ? ServoraColors.textMutedDark : ServoraColors.textMutedLight,
      );
}
