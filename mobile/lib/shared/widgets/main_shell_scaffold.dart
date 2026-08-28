import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/servora_colors.dart';
import '../../features/auth/providers/auth_provider.dart';

class MainShellScaffold extends StatelessWidget {
  final Widget child;

  const MainShellScaffold({super.key, required this.child});

  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/home')) return 0;
    if (location.startsWith('/products')) return 1;
    if (location.startsWith('/community') || location.startsWith('/notice-board')) return 3;
    if (location.startsWith('/profile') || location.startsWith('/account') || location.startsWith('/portal') || location.startsWith('/dashboard')) return 4;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/products');
        break;
      case 2:
        context.push('/services/request');
        break;
      case 3:
        context.go('/community');
        break;
      case 4:
        context.go('/account');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = _calculateSelectedIndex(context);

    return ListenableBuilder(
      listenable: authNotifier,
      builder: (context, _) {
        final authState = authNotifier.state;
        final user = authState.user;
        final bool isLoggedIn = authState.isAuthenticated && user != null;
        final String role = user?.role.toUpperCase() ?? 'CUSTOMER';

        String accountLabel = 'Account';
        IconData accountIcon = Icons.person_outline_rounded;
        IconData accountSelectedIcon = Icons.person_rounded;

        if (isLoggedIn) {
          if (role == 'ADMIN' || role == 'SUPER_ADMIN') {
            accountLabel = 'Admin';
            accountIcon = Icons.admin_panel_settings_outlined;
            accountSelectedIcon = Icons.admin_panel_settings_rounded;
          } else if (role == 'PROVIDER') {
            accountLabel = 'Portal';
            accountIcon = Icons.storefront_outlined;
            accountSelectedIcon = Icons.storefront_rounded;
          } else {
            accountLabel = 'Dashboard';
            accountIcon = Icons.dashboard_outlined;
            accountSelectedIcon = Icons.dashboard_rounded;
          }
        }

        return PopScope(
          canPop: selectedIndex == 0,
          onPopInvoked: (didPop) {
            if (!didPop) {
              context.go('/home');
            }
          },
          child: Scaffold(
            body: child,
            bottomNavigationBar: NavigationBar(
              selectedIndex: selectedIndex,
              onDestinationSelected: (index) => _onItemTapped(index, context),
              destinations: [
                const NavigationDestination(
                  icon: Icon(Icons.home_outlined),
                  selectedIcon: Icon(Icons.home_filled, color: ServoraColors.emerald600),
                  label: 'Home',
                ),
                const NavigationDestination(
                  icon: Icon(Icons.shopping_bag_outlined),
                  selectedIcon: Icon(Icons.shopping_bag_rounded, color: ServoraColors.emerald600),
                  label: 'Products',
                ),

                // EXACT CENTER PIECE ITEM (#3 OUT OF 5) - PROMINENT FLOATING EMERALD POST BUTTON
                NavigationDestination(
                  icon: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: ServoraColors.emerald600,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: ServoraColors.emerald600.withOpacity(0.4),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.add_rounded, color: Colors.white, size: 26),
                  ),
                  label: 'Post',
                ),

                const NavigationDestination(
                  icon: Icon(Icons.people_outline_rounded),
                  selectedIcon: Icon(Icons.people_rounded, color: ServoraColors.emerald600),
                  label: 'Notice Board',
                ),
                NavigationDestination(
                  icon: Icon(accountIcon),
                  selectedIcon: Icon(accountSelectedIcon, color: ServoraColors.emerald600),
                  label: accountLabel,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
