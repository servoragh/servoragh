import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import '../../features/home/views/home_screen.dart';
import '../../features/products/views/products_screen.dart';
import '../../features/delivery/views/delivery_screen.dart';
import '../../features/search/views/search_screen.dart';
import '../../features/community/views/community_screen.dart';
import '../../features/services/views/request_wizard_screen.dart';
import '../../features/business_portal/views/artisan_storefront_screen.dart';
import '../../features/escrow/views/escrow_deal_screen.dart';
import '../../features/activity/views/activity_screen.dart';
import '../../features/profile/views/profile_screen.dart';
import '../../features/auth/views/login_screen.dart';
import '../../features/products/views/product_detail_screen.dart';
import '../../features/businesses/views/businesses_screen.dart';
import '../../features/business_portal/views/edit_business_profile_screen.dart';
import '../../features/chat/views/chat_screen.dart';
import '../../shared/widgets/main_shell_scaffold.dart';

/// Helper to wrap screens in native iOS CupertinoPage with smooth swipe-to-back animations
Page<dynamic> _iosPage({required GoRouterState state, required Widget child}) {
  return CupertinoPage<void>(
    key: ValueKey('${state.uri}_${state.pageKey.value}'),
    child: child,
  );
}

/// Helper for bottom tabs to avoid nested route animation overhead
Page<dynamic> _tabNavPage({required GoRouterState state, required Widget child}) {
  return NoTransitionPage<void>(
    key: ValueKey('${state.uri}_${state.pageKey.value}'),
    child: child,
  );
}

final appRouter = GoRouter(
  initialLocation: '/home',
  routes: [
    // ShellRoute for persistent bottom navigation bar across all main screens
    ShellRoute(
      builder: (BuildContext context, GoRouterState state, Widget child) {
        return MainShellScaffold(child: child);
      },
      routes: [
        GoRoute(
          path: '/home',
          pageBuilder: (BuildContext context, GoRouterState state) => _tabNavPage(
            state: state,
            child: const HomeScreen(),
          ),
        ),
        GoRoute(
          path: '/products',
          pageBuilder: (BuildContext context, GoRouterState state) {
            final cat = state.uri.queryParameters['category'];
            final subCat = state.uri.queryParameters['subCategory'];
            return _tabNavPage(
              state: state,
              child: ProductsScreen(initialCategory: cat, initialSubCategory: subCat),
            );
          },
        ),
        GoRoute(
          path: '/community',
          pageBuilder: (BuildContext context, GoRouterState state) => _tabNavPage(
            state: state,
            child: const CommunityScreen(),
          ),
        ),
        GoRoute(
          path: '/notice-board',
          pageBuilder: (BuildContext context, GoRouterState state) => _tabNavPage(
            state: state,
            child: const CommunityScreen(),
          ),
        ),
        GoRoute(
          path: '/businesses',
          pageBuilder: (BuildContext context, GoRouterState state) => _tabNavPage(
            state: state,
            child: const BusinessesScreen(),
          ),
        ),
        GoRoute(
          path: '/profile',
          pageBuilder: (BuildContext context, GoRouterState state) => _tabNavPage(
            state: state,
            child: const ProfileScreen(),
          ),
        ),
        GoRoute(
          path: '/account',
          pageBuilder: (BuildContext context, GoRouterState state) => _tabNavPage(
            state: state,
            child: const ProfileScreen(),
          ),
        ),
      ],
    ),

    // Full-screen overlay routes (with native iOS slide and swipe back gestures)
    GoRoute(
      path: '/products/detail',
      pageBuilder: (BuildContext context, GoRouterState state) {
        final raw = state.extra;
        final product = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
        return _iosPage(state: state, child: ProductDetailScreen(product: product));
      },
    ),
    GoRoute(
      path: '/products/:slug',
      pageBuilder: (BuildContext context, GoRouterState state) {
        final slug = state.pathParameters['slug'] ?? '';
        final raw = state.extra;
        final product = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{'slug': slug};
        return _iosPage(state: state, child: ProductDetailScreen(product: product, slug: slug));
      },
    ),
    GoRoute(
      path: '/product/:slug',
      pageBuilder: (BuildContext context, GoRouterState state) {
        final slug = state.pathParameters['slug'] ?? '';
        final raw = state.extra;
        final product = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{'slug': slug};
        return _iosPage(state: state, child: ProductDetailScreen(product: product, slug: slug));
      },
    ),
    GoRoute(
      path: '/delivery',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const DeliveryScreen(),
      ),
    ),
    GoRoute(
      path: '/search',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const SearchScreen(),
      ),
    ),
    GoRoute(
      path: '/services/request',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const RequestWizardScreen(),
      ),
    ),
    GoRoute(
      path: '/request',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const RequestWizardScreen(),
      ),
    ),
    GoRoute(
      path: '/biz/:slug',
      pageBuilder: (BuildContext context, GoRouterState state) {
        final slug = state.pathParameters['slug'] ?? 'kwame-electrical-tamale';
        return _iosPage(state: state, child: ArtisanStorefrontScreen(slug: slug));
      },
    ),
    GoRoute(
      path: '/provider/:slug',
      pageBuilder: (BuildContext context, GoRouterState state) {
        final slug = state.pathParameters['slug'] ?? 'kwame-electrical-tamale';
        return _iosPage(state: state, child: ArtisanStorefrontScreen(slug: slug));
      },
    ),
    GoRoute(
      path: '/business/profile/edit',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const EditBusinessProfileScreen(),
      ),
    ),
    GoRoute(
      path: '/business/edit-profile',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const EditBusinessProfileScreen(),
      ),
    ),
    GoRoute(
      path: '/escrow',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const EscrowDealScreen(),
      ),
    ),
    GoRoute(
      path: '/messages',
      pageBuilder: (BuildContext context, GoRouterState state) {
        final roomId = state.uri.queryParameters['roomId'];
        final recipientId = state.uri.queryParameters['recipientId'];
        final productId = state.uri.queryParameters['productId'];
        final title = state.uri.queryParameters['title'];
        return _iosPage(
          state: state,
          child: ChatScreen(
            initialRoomId: roomId,
            recipientId: recipientId,
            productId: productId,
            title: title,
          ),
        );
      },
    ),
    GoRoute(
      path: '/activity',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const ActivityScreen(),
      ),
    ),
    GoRoute(
      path: '/portal',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const ProfileScreen(),
      ),
    ),
    GoRoute(
      path: '/dashboard',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const ProfileScreen(),
      ),
    ),
    GoRoute(
      path: '/auth/login',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const LoginScreen(),
      ),
    ),
    GoRoute(
      path: '/login',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const LoginScreen(),
      ),
    ),
    GoRoute(
      path: '/register',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const LoginScreen(initialRegisterMode: true),
      ),
    ),
    GoRoute(
      path: '/provider/register',
      pageBuilder: (BuildContext context, GoRouterState state) => _iosPage(
        state: state,
        child: const LoginScreen(initialRegisterMode: true, initialRole: 'PROVIDER'),
      ),
    ),
  ],
);
