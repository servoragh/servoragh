import 'package:flutter/material.dart';
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
import '../../shared/widgets/main_shell_scaffold.dart';

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
          builder: (BuildContext context, GoRouterState state) => const HomeScreen(),
        ),
        GoRoute(
          path: '/products',
          builder: (BuildContext context, GoRouterState state) => const ProductsScreen(),
        ),
        GoRoute(
          path: '/community',
          builder: (BuildContext context, GoRouterState state) => const CommunityScreen(),
        ),
        GoRoute(
          path: '/notice-board',
          builder: (BuildContext context, GoRouterState state) => const CommunityScreen(),
        ),
        GoRoute(
          path: '/businesses',
          builder: (BuildContext context, GoRouterState state) => const BusinessesScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (BuildContext context, GoRouterState state) => const ProfileScreen(),
        ),
        GoRoute(
          path: '/account',
          builder: (BuildContext context, GoRouterState state) => const ProfileScreen(),
        ),
      ],
    ),

    // Full-screen overlay routes (without persistent bottom bar)
    GoRoute(
      path: '/products/detail',
      builder: (BuildContext context, GoRouterState state) {
        final raw = state.extra;
        final product = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
        return ProductDetailScreen(product: product);
      },
    ),
    GoRoute(
      path: '/products/:slug',
      builder: (BuildContext context, GoRouterState state) {
        final slug = state.pathParameters['slug'] ?? '';
        final raw = state.extra;
        final product = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{'slug': slug};
        return ProductDetailScreen(product: product, slug: slug);
      },
    ),
    GoRoute(
      path: '/product/:slug',
      builder: (BuildContext context, GoRouterState state) {
        final slug = state.pathParameters['slug'] ?? '';
        final raw = state.extra;
        final product = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{'slug': slug};
        return ProductDetailScreen(product: product, slug: slug);
      },
    ),
    GoRoute(
      path: '/delivery',
      builder: (BuildContext context, GoRouterState state) => const DeliveryScreen(),
    ),
    GoRoute(
      path: '/businesses',
      builder: (BuildContext context, GoRouterState state) => const BusinessesScreen(),
    ),
    GoRoute(
      path: '/search',
      builder: (BuildContext context, GoRouterState state) => const SearchScreen(),
    ),
    GoRoute(
      path: '/services/request',
      builder: (BuildContext context, GoRouterState state) => const RequestWizardScreen(),
    ),
    GoRoute(
      path: '/request',
      builder: (BuildContext context, GoRouterState state) => const RequestWizardScreen(),
    ),
    GoRoute(
      path: '/biz/:slug',
      builder: (BuildContext context, GoRouterState state) {
        final slug = state.pathParameters['slug'] ?? 'kwame-electrical-tamale';
        return ArtisanStorefrontScreen(slug: slug);
      },
    ),
    GoRoute(
      path: '/provider/:slug',
      builder: (BuildContext context, GoRouterState state) {
        final slug = state.pathParameters['slug'] ?? 'kwame-electrical-tamale';
        return ArtisanStorefrontScreen(slug: slug);
      },
    ),
    GoRoute(
      path: '/escrow',
      builder: (BuildContext context, GoRouterState state) => const EscrowDealScreen(),
    ),
    GoRoute(
      path: '/activity',
      builder: (BuildContext context, GoRouterState state) => const ActivityScreen(),
    ),
    GoRoute(
      path: '/portal',
      builder: (BuildContext context, GoRouterState state) => const ProfileScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (BuildContext context, GoRouterState state) => const ProfileScreen(),
    ),
    GoRoute(
      path: '/auth/login',
      builder: (BuildContext context, GoRouterState state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (BuildContext context, GoRouterState state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (BuildContext context, GoRouterState state) => const LoginScreen(initialRegisterMode: true),
    ),
    GoRoute(
      path: '/provider/register',
      builder: (BuildContext context, GoRouterState state) => const LoginScreen(initialRegisterMode: true, initialRole: 'PROVIDER'),
    ),
  ],
);
