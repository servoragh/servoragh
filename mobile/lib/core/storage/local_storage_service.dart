import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

class LocalStorageService {
  static const _tokenKey = 'servora_jwt_auth_token';
  static const _userRoleKey = 'servora_user_active_role'; // CUSTOMER vs PROVIDER
  static const _selectedNeighborhoodKey = 'servora_selected_neighborhood';

  final _secureStorage = const FlutterSecureStorage();
  late Box _appBox;

  Future<void> init() async {
    await Hive.initFlutter();
    _appBox = await Hive.openBox('servora_app_box');
  }

  // Token Management
  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: _tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: _tokenKey);
  }

  Future<void> clearToken() async {
    await _secureStorage.delete(key: _tokenKey);
  }

  // Role Management (Customer Mode vs Merchant/Provider Mode)
  Future<void> setActiveRole(String role) async {
    await _appBox.put(_userRoleKey, role);
  }

  String getActiveRole() {
    return _appBox.get(_userRoleKey, defaultValue: 'CUSTOMER');
  }

  // Selected Neighborhood (GPS or Dropdown fallback)
  Future<void> setSelectedNeighborhood(String neighborhood) async {
    await _appBox.put(_selectedNeighborhoodKey, neighborhood);
  }

  String getSelectedNeighborhood() {
    return _appBox.get(_selectedNeighborhoodKey, defaultValue: 'Sakasaka, Tamale');
  }

  // Cache Feed Data
  Future<void> cacheData(String key, dynamic data) async {
    await _appBox.put(key, data);
  }

  dynamic getCachedData(String key) {
    return _appBox.get(key);
  }
}
