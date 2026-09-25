import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import '../storage/local_storage_service.dart';

class UserLocation {
  final String name;
  final String city;
  final String region;
  final String formattedAddress;
  final double latitude;
  final double longitude;
  final bool isGps;
  final String? postcode;

  const UserLocation({
    required this.name,
    required this.city,
    required this.region,
    required this.formattedAddress,
    required this.latitude,
    required this.longitude,
    this.isGps = false,
    this.postcode,
  });

  double get lat => latitude;
  double get lon => longitude;

  String get shortLabel {
    if (name.isNotEmpty && city.isNotEmpty) {
      if (name.toLowerCase() == city.toLowerCase()) return name;
      return '$name, $city';
    }
    return name.isNotEmpty ? name : city;
  }

  String get googleMapsUrl =>
      'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude';

  Map<String, dynamic> toJson() => {
        'name': name,
        'city': city,
        'region': region,
        'formattedAddress': formattedAddress,
        'latitude': latitude,
        'longitude': longitude,
        'isGps': isGps,
        'postcode': postcode,
      };

  factory UserLocation.fromJson(Map<String, dynamic> json) => UserLocation(
        name: json['name'] ?? 'Tamale Central',
        city: json['city'] ?? 'Tamale',
        region: json['region'] ?? 'Northern Region',
        formattedAddress: json['formattedAddress'] ?? 'Tamale, Northern Region, Ghana',
        latitude: (json['latitude'] is num) ? (json['latitude'] as num).toDouble() : 9.4008,
        longitude: (json['longitude'] is num) ? (json['longitude'] as num).toDouble() : -0.8393,
        isGps: json['isGps'] == true,
        postcode: json['postcode'],
      );

  static const defaultTamale = UserLocation(
    name: 'Sakasaka',
    city: 'Tamale',
    region: 'Northern Region',
    formattedAddress: 'Sakasaka, Tamale, Northern Region, Ghana',
    latitude: 9.4142,
    longitude: -0.8399,
    isGps: false,
    postcode: 'NT-0148-3057',
  );
}

class UserLocationService {
  static const String _storageKey = 'servora_active_user_location';
  static LocalStorageService? _storage;

  static final ValueNotifier<UserLocation> locationNotifier =
      ValueNotifier<UserLocation>(UserLocation.defaultTamale);

  static UserLocation get currentLocation => locationNotifier.value;

  static final Dio _geoDio = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 4),
      receiveTimeout: const Duration(seconds: 4),
      headers: {
        'User-Agent': 'ServoraGhanaMarketplace/1.0 (contact@servora.gh)',
        'Accept': 'application/json',
      },
    ),
  );

  /// Initialize from persistent storage
  static Future<void> init(LocalStorageService storage) async {
    _storage = storage;
    try {
      final savedJson = storage.getCustomValue(_storageKey);
      if (savedJson != null && savedJson.isNotEmpty) {
        final Map<String, dynamic> map = jsonDecode(savedJson);
        locationNotifier.value = UserLocation.fromJson(map);
      }
    } catch (_) {}
  }

  /// Automatically detect user's exact GPS location and reverse geocode address
  static Future<UserLocation?> detectCurrentGpsLocation([dynamic context]) async {
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

      Position? position;
      try {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 4),
        );
      } catch (_) {
        position = await Geolocator.getLastKnownPosition();
      }

      if (position == null) return null;

      // Reverse geocode via OpenStreetMap Nominatim
      final revLocation = await reverseGeocode(position.latitude, position.longitude);
      if (revLocation != null) {
        await setLocation(revLocation);
        return revLocation;
      }

      // Fallback if network geocoding fails
      final fallback = UserLocation(
        name: 'GPS Pin (${position.latitude.toStringAsFixed(3)}, ${position.longitude.toStringAsFixed(3)})',
        city: 'Tamale',
        region: 'Northern Region',
        formattedAddress: 'GPS: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}',
        latitude: position.latitude,
        longitude: position.longitude,
        isGps: true,
      );
      await setLocation(fallback);
      return fallback;
    } catch (_) {
      return null;
    }
  }

  /// Reverse geocode GPS coordinates to Ghanaian Suburb, City, and Digital Address
  static Future<UserLocation?> reverseGeocode(double lat, double lon) async {
    try {
      final res = await _geoDio.get(
        'https://nominatim.openstreetmap.org/reverse',
        queryParameters: {
          'format': 'json',
          'lat': lat,
          'lon': lon,
          'zoom': 18,
          'addressdetails': 1,
        },
      );

      if (res.statusCode == 200 && res.data != null && res.data is Map) {
        final data = res.data as Map;
        final addr = (data['address'] is Map) ? (data['address'] as Map) : {};
        
        final suburb = addr['suburb'] ?? addr['neighbourhood'] ?? addr['residential'] ?? addr['road'] ?? '';
        final city = addr['city'] ?? addr['town'] ?? addr['village'] ?? addr['municipality'] ?? 'Tamale';
        final region = addr['state'] ?? addr['county'] ?? 'Northern Region';
        final postcode = addr['postcode']?.toString();
        final displayName = data['display_name'] ?? '$suburb, $city, $region, Ghana';

        final name = suburb.toString().isNotEmpty ? suburb.toString() : city.toString();

        return UserLocation(
          name: name,
          city: city.toString(),
          region: region.toString(),
          formattedAddress: displayName.toString(),
          latitude: lat,
          longitude: lon,
          isGps: true,
          postcode: postcode,
        );
      }
    } catch (_) {}
    return null;
  }

  /// Search places, towns, streets, and neighborhoods across Ghana
  static Future<List<UserLocation>> searchGhanaPlaces(String query) async {
    final cleanQuery = query.trim();
    if (cleanQuery.isEmpty) return [];

    try {
      final res = await _geoDio.get(
        'https://nominatim.openstreetmap.org/search',
        queryParameters: {
          'format': 'json',
          'q': '$cleanQuery, Ghana',
          'countrycodes': 'gh',
          'limit': 10,
          'addressdetails': 1,
        },
      );

      if (res.statusCode == 200 && res.data is List) {
        final list = res.data as List;
        return list.map((item) {
          final addr = (item['address'] is Map) ? (item['address'] as Map) : {};
          final suburb = addr['suburb'] ?? addr['neighbourhood'] ?? addr['road'] ?? '';
          final city = addr['city'] ?? addr['town'] ?? addr['village'] ?? addr['county'] ?? 'Ghana';
          final region = addr['state'] ?? 'Northern Region';
          final name = item['name'] ?? (suburb.isNotEmpty ? suburb : city);
          final lat = double.tryParse(item['lat']?.toString() ?? '9.4008') ?? 9.4008;
          final lon = double.tryParse(item['lon']?.toString() ?? '-0.8393') ?? -0.8393;

          return UserLocation(
            name: name.toString(),
            city: city.toString(),
            region: region.toString(),
            formattedAddress: item['display_name'] ?? '$name, $city, Ghana',
            latitude: lat,
            longitude: lon,
            isGps: false,
            postcode: addr['postcode']?.toString(),
          );
        }).toList();
      }
    } catch (_) {}
    return [];
  }

  /// Save location as the active platform location
  static Future<void> setLocation(UserLocation location) async {
    locationNotifier.value = location;
    try {
      if (_storage != null) {
        await _storage!.saveCustomValue(_storageKey, jsonEncode(location.toJson()));
        await _storage!.setSelectedNeighborhood(location.shortLabel);
      }
    } catch (_) {}
  }

  /// Open Google Maps with this location
  static Future<void> openInGoogleMaps(double lat, double lon) async {
    final uri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lon');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
  }
}
