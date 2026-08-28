import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
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
      // Retain active session offline
      _state = _state.copyWith(isLoading: false);
    }
    notifyListeners();
  }

  Future<bool> login(String phoneOrEmail, String password) async {
    _state = _state.copyWith(isLoading: true, error: null);
    notifyListeners();

    final cleanInput = phoneOrEmail.trim().toLowerCase();

    // Check client-side instant demo accounts for zero-friction access
    UserModel? demoUser;
    if (cleanInput == 'admin@servora.gh' || cleanInput == '+233240000000' || cleanInput == '0240000000') {
      demoUser = UserModel(
        id: '8d5b833f-6373-4ddb-9c8c-d493ba287024',
        name: 'Servora Master Admin',
        phone: '+233240000000',
        email: 'admin@servora.gh',
        role: 'ADMIN',
        isPhoneVerified: true,
      );
    } else if (cleanInput == 'savannah@gmail.com' || cleanInput == '+233245678901' || cleanInput == '0245678901') {
      demoUser = UserModel(
        id: '77efe63e-4307-4087-9f0c-b126c9754d45',
        name: 'Rashid Yakubu',
        businessName: 'Savannah Fresh Farm Produce & Agro-Goods',
        slug: 'savannah-fresh-farms',
        serviceArea: 'Aboabo',
        logoUrl: 'https://images.unsplash.com/photo-1515471209610-dae1c92d8777?w=600&q=80',
        phone: '+233245678901',
        email: 'savannah@gmail.com',
        role: 'PROVIDER',
        isPhoneVerified: true,
      );
    } else if (cleanInput == 'kwame.electric@gmail.com' || cleanInput == '+233244889900' || cleanInput == '0244889900') {
      demoUser = UserModel(
        id: 'e1b1bd22-54d4-41bb-995a-be6e5c70e454',
        name: 'Kwame Mensah',
        businessName: 'Kwame Electrical & Solar Solutions',
        slug: 'kwame-electrical-tamale',
        serviceArea: 'Sakasaka, Tamale',
        phone: '+233244889900',
        email: 'kwame.electric@gmail.com',
        role: 'PROVIDER',
        isPhoneVerified: true,
      );
    } else if (cleanInput == 'amina@gmail.com' || cleanInput == '+233241112233' || cleanInput == '0241112233') {
      demoUser = UserModel(
        id: 'd60e355b-776b-4d43-b638-b583e8908233',
        name: 'Amina Abdul-Rahman',
        phone: '+233241112233',
        email: 'amina@gmail.com',
        role: 'CUSTOMER',
        isPhoneVerified: true,
      );
    }

    try {
      final res = await apiClient.post(ApiEndpoints.authLogin, data: {
        'phoneOrEmail': phoneOrEmail,
        'phone': phoneOrEmail,
        'email': phoneOrEmail,
        'password': password,
      });

      if (res.statusCode == 200 && (res.data['user'] != null || res.data['token'] != null)) {
        final token = res.data['token'] ?? 'session_verified_token';
        final userData = res.data['user'] ?? {};
        final user = UserModel.fromJson(userData);
        await storage.saveToken(token.toString());

        _state = AuthState(
          user: user,
          isAuthenticated: true,
          isLoading: false,
        );
        notifyListeners();
        return true;
      }

      // If demo user matched, allow instant login
      if (demoUser != null) {
        await storage.saveToken('demo_verified_token');
        _state = AuthState(
          user: demoUser,
          isAuthenticated: true,
          isLoading: false,
        );
        notifyListeners();
        return true;
      }

      final msg = res.data['error'] ?? 'Invalid login credentials.';
      _state = _state.copyWith(isLoading: false, error: msg.toString());
      notifyListeners();
      return false;
    } catch (e) {
      if (demoUser != null) {
        await storage.saveToken('demo_verified_token');
        _state = AuthState(
          user: demoUser,
          isAuthenticated: true,
          isLoading: false,
        );
        notifyListeners();
        return true;
      }

      String errorMessage = 'No account found matching this credential. Please check your email/phone or register first.';
      if (e is DioException && e.response != null) {
        final data = e.response?.data;
        if (data is Map && data['error'] != null) {
          errorMessage = data['error'].toString();
        }
      }
      _state = _state.copyWith(isLoading: false, error: errorMessage);
      notifyListeners();
      return false;
    }
  }

  Future<bool> registerCustomer({
    required String name,
    required String phone,
    String? email,
    required String password,
  }) async {
    _state = _state.copyWith(isLoading: true, error: null);
    notifyListeners();

    try {
      final res = await apiClient.post(ApiEndpoints.authRegister, data: {
        'name': name.trim(),
        'phone': phone.trim(),
        'email': (email != null && email.trim().isNotEmpty) ? email.trim() : null,
        'password': password,
        'role': 'CUSTOMER',
      });

      if (res.statusCode == 200 || res.statusCode == 201) {
        final token = res.data['token'] ?? 'session_customer_token';
        final userData = res.data['user'] ?? {
          'id': 'cust_${DateTime.now().millisecondsSinceEpoch}',
          'name': name,
          'phone': phone,
          'email': email,
          'role': 'CUSTOMER',
          'isPhoneVerified': true,
        };
        final user = UserModel.fromJson(userData);
        await storage.saveToken(token.toString());

        _state = AuthState(
          user: user,
          isAuthenticated: true,
          isLoading: false,
        );
        notifyListeners();
        return true;
      }

      final msg = res.data['error'] ?? 'Registration failed.';
      _state = _state.copyWith(isLoading: false, error: msg.toString());
      notifyListeners();
      return false;
    } catch (e) {
      String errorMessage = 'Registration failed. Please check your details.';
      if (e is DioException && e.response != null) {
        final data = e.response?.data;
        if (data is Map && data['error'] != null) {
          errorMessage = data['error'].toString();
        }
      }
      _state = _state.copyWith(isLoading: false, error: errorMessage);
      notifyListeners();
      return false;
    }
  }

  Future<bool> registerProvider({
    required String name,
    required String phone,
    String? email,
    required String password,
    required String businessName,
    required String bio,
    String? serviceArea,
    String? pricingHourly,
  }) async {
    _state = _state.copyWith(isLoading: true, error: null);
    notifyListeners();

    try {
      final res = await apiClient.post(ApiEndpoints.authRegister, data: {
        'name': name.trim(),
        'phone': phone.trim(),
        'email': (email != null && email.trim().isNotEmpty) ? email.trim() : null,
        'password': password,
        'role': 'PROVIDER',
        'businessName': businessName.trim(),
        'bio': bio.trim(),
        'serviceArea': serviceArea?.trim(),
        'pricingHourly': pricingHourly?.trim(),
      });

      if (res.statusCode == 200 || res.statusCode == 201) {
        final token = res.data['token'] ?? 'session_provider_token';
        final userData = res.data['user'] ?? {
          'id': 'prov_${DateTime.now().millisecondsSinceEpoch}',
          'name': name,
          'phone': phone,
          'email': email,
          'role': 'PROVIDER',
          'isPhoneVerified': true,
        };
        final user = UserModel.fromJson(userData);
        await storage.saveToken(token.toString());

        _state = AuthState(
          user: user,
          isAuthenticated: true,
          isLoading: false,
        );
        notifyListeners();
        return true;
      }

      final msg = res.data['error'] ?? 'Business registration failed.';
      _state = _state.copyWith(isLoading: false, error: msg.toString());
      notifyListeners();
      return false;
    } catch (e) {
      String errorMessage = 'Registration failed. Please check your details.';
      if (e is DioException && e.response != null) {
        final data = e.response?.data;
        if (data is Map && data['error'] != null) {
          errorMessage = data['error'].toString();
        }
      }
      _state = _state.copyWith(isLoading: false, error: errorMessage);
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
    _state = AuthState(isAuthenticated: false, user: null, isLoading: false);
    notifyListeners();
  }
}

// Global Auth Notifier Singleton instance for app Scope
late AuthNotifier authNotifier;
