import 'package:flutter/material.dart';
import 'app/routes/app_router.dart';
import 'app/theme/servora_theme.dart';
import 'core/network/api_client.dart';
import 'core/storage/local_storage_service.dart';
import 'features/auth/providers/auth_provider.dart';

final ValueNotifier<ThemeMode> themeModeNotifier = ValueNotifier<ThemeMode>(ThemeMode.light);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storageService = LocalStorageService();
  await storageService.init();

  final apiClient = ApiClient(storageService: storageService);
  authNotifier = AuthNotifier(apiClient: apiClient, storage: storageService);

  runApp(const ServoraMobileApp());
}

class ServoraMobileApp extends StatelessWidget {
  const ServoraMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge([authNotifier, themeModeNotifier]),
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
