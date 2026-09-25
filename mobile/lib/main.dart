import 'package:flutter/material.dart';
import 'app/routes/app_router.dart';
import 'app/theme/servora_theme.dart';
import 'core/network/api_client.dart';
import 'core/storage/local_storage_service.dart';
import 'core/services/marketplace_api_service.dart';
import 'core/services/server_sync_service.dart';
import 'core/services/user_location_service.dart';
import 'features/auth/providers/auth_provider.dart';

final ValueNotifier<ThemeMode> themeModeNotifier = ValueNotifier<ThemeMode>(ThemeMode.light);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storageService = LocalStorageService();
  await storageService.init();

  // Initialize live server synchronizer (connects phone directly to web dev server or fallback)
  await ServerSyncService.init(storageService);

  // Initialize smart location system
  await UserLocationService.init(storageService);

  final apiClient = ApiClient(storageService: storageService);
  authNotifier = AuthNotifier(apiClient: apiClient, storage: storageService);

  // Hydrate platform settings (Escrow enable/disable master switch)
  MarketplaceApiService.fetchPlatformSettings();

  runApp(const ServoraMobileApp());
}

class ServoraMobileApp extends StatelessWidget {
  const ServoraMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge([
        authNotifier,
        themeModeNotifier,
        MarketplaceApiService.escrowEnabledNotifier,
        ServerSyncService.activeServerUrlNotifier,
        UserLocationService.locationNotifier,
      ]),
      builder: (context, _) {
        return MaterialApp.router(
          title: 'Servora.gh',
          debugShowCheckedModeBanner: false,
          theme: ServoraTheme.lightTheme,
          darkTheme: ServoraTheme.darkTheme,
          themeMode: themeModeNotifier.value,
          routerConfig: appRouter,
        );
      },
    );
  }
}
