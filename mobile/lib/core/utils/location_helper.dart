import 'dart:async';
import 'package:geolocator/geolocator.dart';

class LocationHelper {
  static Future<Position?> getCurrentPosition() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return null;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return null;
      }

      // 1. Try instant last known position first (< 100ms)
      try {
        final lastKnown = await Geolocator.getLastKnownPosition();
        if (lastKnown != null) {
          return lastKnown;
        }
      } catch (_) {}

      // 2. Fetch current position with 3-second tight timeout
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
        timeLimit: const Duration(seconds: 3),
      ).timeout(
        const Duration(seconds: 3),
        onTimeout: () async {
          return await Geolocator.getLastKnownPosition() ??
              Position(
                latitude: 9.4008,
                longitude: -0.8393,
                timestamp: DateTime.now(),
                accuracy: 100.0,
                altitude: 150.0,
                altitudeAccuracy: 10.0,
                heading: 0.0,
                headingAccuracy: 0.0,
                speed: 0.0,
                speedAccuracy: 0.0,
              );
        },
      );
    } catch (_) {
      // Graceful fallback to Tamale center coords
      return Position(
        latitude: 9.4008,
        longitude: -0.8393,
        timestamp: DateTime.now(),
        accuracy: 100.0,
        altitude: 150.0,
        altitudeAccuracy: 10.0,
        heading: 0.0,
        headingAccuracy: 0.0,
        speed: 0.0,
        speedAccuracy: 0.0,
      );
    }
  }
}
