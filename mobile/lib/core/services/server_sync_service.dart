import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/constants.dart';
import '../storage/local_storage_service.dart';
import 'marketplace_api_service.dart';
import '../../features/auth/providers/auth_provider.dart';

enum ServerSyncMode {
  localAdb,     // http://localhost:3000/api (via adb reverse or desktop)
  localWifi,    // http://10.100.0.83:3000/api (local PC on Wi-Fi)
  localEmulator,// http://10.0.2.2:3000/api (Android Emulator)
  production,   // https://servoragh-inky.vercel.app/api (Cloud Vercel)
  custom,
}

class ServerSyncService {
  static const String _serverUrlKey = 'servora_active_server_url';
  static const String localAdbUrl = 'http://localhost:3000/api';
  static const String localWifiUrl = 'http://10.100.0.83:3000/api';
  static const String localEmulatorUrl = 'http://10.0.2.2:3000/api';
  static const String cloudProductionUrl = 'https://servoragh-inky.vercel.app/api';

  static final ValueNotifier<String> activeServerUrlNotifier =
      ValueNotifier<String>(localAdbUrl);
  static final ValueNotifier<bool> isConnectedNotifier =
      ValueNotifier<bool>(false);
  static final ValueNotifier<int> pingLatencyMsNotifier =
      ValueNotifier<int>(0);
  static final ValueNotifier<String> syncStatusMessageNotifier =
      ValueNotifier<String>('Initializing server sync...');

  static LocalStorageService? _storageService;
  static Timer? _healthCheckTimer;

  static String get activeServerUrl => activeServerUrlNotifier.value;
  static bool get isLocalDev =>
      activeServerUrl.contains('localhost') ||
      activeServerUrl.contains('10.100.0.83') ||
      activeServerUrl.contains('10.0.2.2') ||
      activeServerUrl.contains('127.0.0.1');

  /// Initialize and probe the best available server
  static Future<void> init(LocalStorageService storage) async {
    _storageService = storage;
    
    // Check if user previously saved a manual preference
    final savedUrl = await _loadSavedServerUrl();
    if (savedUrl != null && savedUrl.isNotEmpty) {
      await applyServerUrl(savedUrl, savePreference: false);
      await pingActiveServer();
    } else {
      // Auto-detect: probe local dev server first, fall back to cloud if offline
      await autoDetectServer();
    }

    // Start background heartbeat ping every 30 seconds
    _healthCheckTimer?.cancel();
    _healthCheckTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      pingActiveServer();
    });
  }

  /// Automatically detect whether the local dev server (PC) is reachable
  static Future<bool> autoDetectServer() async {
    syncStatusMessageNotifier.value = 'Probing local web server (http://localhost:3000)...';

    // 1. Probe localhost:3000 (ADB reverse or desktop)
    final adbOk = await _probeUrl(localAdbUrl);
    if (adbOk) {
      await applyServerUrl(localAdbUrl, savePreference: true);
      syncStatusMessageNotifier.value = 'Connected to Local Web (http://localhost:3000) ✓';
      return true;
    }

    // 2. Probe Wi-Fi IP (10.100.0.83:3000)
    final wifiOk = await _probeUrl(localWifiUrl);
    if (wifiOk) {
      await applyServerUrl(localWifiUrl, savePreference: true);
      syncStatusMessageNotifier.value = 'Connected via Wi-Fi LAN (10.100.0.83:3000) ✓';
      return true;
    }

    // 3. Probe Android Emulator IP (10.0.2.2:3000)
    final emuOk = await _probeUrl(localEmulatorUrl);
    if (emuOk) {
      await applyServerUrl(localEmulatorUrl, savePreference: true);
      syncStatusMessageNotifier.value = 'Connected via Android Emulator (10.0.2.2:3000) ✓';
      return true;
    }

    // 4. Fallback to Cloud Vercel
    await applyServerUrl(cloudProductionUrl, savePreference: false);
    syncStatusMessageNotifier.value = 'Connected to Cloud Production (Vercel) ✓';
    await pingActiveServer();
    return false;
  }

  /// Apply a new server URL across the entire mobile runtime
  static Future<void> applyServerUrl(String url, {bool savePreference = true}) async {
    activeServerUrlNotifier.value = url;
    ServoraConstants.setBaseUrl(url);

    // Reconfigure MarketplaceApiService and ApiClient Dio instances
    MarketplaceApiService.reconfigureBaseUrl(url);
    try {
      authNotifier.apiClient.reconfigureBaseUrl(url);
    } catch (_) {}

    if (savePreference && _storageService != null) {
      await _saveServerUrl(url);
    }

    // Force flush stale caches and reload platform settings
    MarketplaceApiService.clearCache();
    await MarketplaceApiService.fetchPlatformSettings();
  }

  /// Test ping active server and calculate latency
  static Future<bool> pingActiveServer() async {
    final sw = Stopwatch()..start();
    try {
      final dio = Dio(
        BaseOptions(
          connectTimeout: const Duration(seconds: 3),
          receiveTimeout: const Duration(seconds: 3),
        ),
      );
      final res = await dio.get('$activeServerUrl/platform/settings');
      sw.stop();
      if (res.statusCode == 200) {
        isConnectedNotifier.value = true;
        pingLatencyMsNotifier.value = sw.elapsedMilliseconds;
        syncStatusMessageNotifier.value = isLocalDev
            ? 'Synced with Local Web (${sw.elapsedMilliseconds}ms) ✓'
            : 'Connected to Cloud (${sw.elapsedMilliseconds}ms) ✓';
        return true;
      }
    } catch (_) {
      sw.stop();
    }
    isConnectedNotifier.value = false;
    pingLatencyMsNotifier.value = 0;
    syncStatusMessageNotifier.value = 'Offline / Server unreachable';
    return false;
  }

  static Future<bool> _probeUrl(String url) async {
    try {
      final dio = Dio(
        BaseOptions(
          connectTimeout: const Duration(milliseconds: 1500),
          receiveTimeout: const Duration(milliseconds: 1500),
        ),
      );
      final res = await dio.get('$url/platform/settings');
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Explicitly switch target to local web dev server
  static Future<void> switchToLocalDev() async {
    await applyServerUrl(localAdbUrl, savePreference: true);
    await pingActiveServer();
  }

  /// Explicitly switch target to remote cloud production
  static Future<void> switchToCloudProduction() async {
    await applyServerUrl(cloudProductionUrl, savePreference: true);
    await pingActiveServer();
  }

  static Future<void> _saveServerUrl(String url) async {
    try {
      await _storageService?.saveCustomValue(_serverUrlKey, url);
    } catch (_) {}
  }

  static Future<String?> _loadSavedServerUrl() async {
    try {
      return _storageService?.getCustomValue(_serverUrlKey);
    } catch (_) {
      return null;
    }
  }
}
