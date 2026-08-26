import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/home/views/home_screen.dart';
import '../../features/search/views/search_screen.dart';
import '../../features/community/views/community_screen.dart';
import '../../features/services/views/request_wizard_screen.dart';
import '../../features/business_portal/views/artisan_storefront_screen.dart';
import '../../features/escrow/views/escrow_deal_screen.dart';
import '../../features/activity/views/activity_screen.dart';
import '../../features/profile/views/profile_screen.dart';
import '../../features/auth/views/login_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/home',
  routes: [
    GoRoute(
      path: '/home',
      builder: (BuildContext context, GoRouterState state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/search',
      builder: (BuildContext context, GoRouterState state) => const SearchScreen(),
    ),
    GoRoute(
      path: '/community',
      builder: (BuildContext context, GoRouterState state) => const CommunityScreen(),
    ),
    GoRoute(
      path: '/services/request',
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
      path: '/escrow',
      builder: (BuildContext context, GoRouterState state) => const EscrowDealScreen(),
    ),
    GoRoute(
      path: '/activity',
      builder: (BuildContext context, GoRouterState state) => const ActivityScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (BuildContext context, GoRouterState state) => const ProfileScreen(),
    ),
    GoRoute(
      path: '/auth/login',
      builder: (BuildContext context, GoRouterState state) => const LoginScreen(),
    ),
  ],
);
