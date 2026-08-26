import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/storage/local_storage_service.dart';
import '../models/user_model.dart';

class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;
  final bool isAuthenticated;

  AuthState({
    this.user,
    this.isLoading = false,
    this.error,
    this.isAuthenticated = false,
  });

  AuthState copyWith({
    UserModel? user,
    bool? isLoading,
    String? error,
    bool? isAuthenticated,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

class AuthNotifier extends ChangeNotifier {
  final ApiClient apiClient;
  final LocalStorageService storage;

  AuthState _state = AuthState();
  AuthState get state => _state;

  AuthNotifier({required this.apiClient, required this.storage}) {
    checkSession();
  }

  Future<void> checkSession() async {
    _state = _state.copyWith(isLoading: true);
    notifyListeners();

    final token = await storage.getToken();
    if (token == null) {
      _state = AuthState(isAuthenticated: false, isLoading: false);
      notifyListeners();
      return;
    }

    try {
      final response = await apiClient.get(ApiEndpoints.authSession);
      if (response.statusCode == 200 && response.data['user'] != null) {
        final user = UserModel.fromJson(response.data['user']);
        final activeRole = storage.getActiveRole();
        _state = AuthState(
          user: user.copyWith(activeRole: activeRole),
          isAuthenticated: true,
          isLoading: false,
        );
      } else {
        await storage.clearToken();
        _state = AuthState(isAuthenticated: false, isLoading: false);
      }
    } catch (e) {
      _state = AuthState(isAuthenticated: false, isLoading: false);
    }
    notifyListeners();
  }

  Future<bool> login(String phone, String password) async {
    _state = _state.copyWith(isLoading: true, error: null);
    notifyListeners();

    try {
      final res = await apiClient.post(ApiEndpoints.authLogin, data: {
        'phone': phone,
        'password': password,
      });

      if (res.statusCode == 200 && res.data['token'] != null) {
        final token = res.data['token'];
        final user = UserModel.fromJson(res.data['user']);
        await storage.saveToken(token);

        _state = AuthState(
          user: user,
          isAuthenticated: true,
          isLoading: false,
        );
        notifyListeners();
        return true;
      }
      _state = _state.copyWith(isLoading: false, error: 'Invalid login credentials.');
      notifyListeners();
      return false;
    } catch (e) {
      _state = _state.copyWith(isLoading: false, error: e.toString());
      notifyListeners();
      return false;
    }
  }

  Future<void> switchRole(String newRole) async {
    if (_state.user != null) {
      await storage.setActiveRole(newRole);
      _state = _state.copyWith(
        user: _state.user!.copyWith(activeRole: newRole),
      );
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await storage.clearToken();
    _state = AuthState(isAuthenticated: false);
    notifyListeners();
  }
}

// Global Auth Notifier Singleton instance for app Scope
late AuthNotifier authNotifier;
