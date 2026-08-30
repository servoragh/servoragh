import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/servora_colors.dart';
import '../../features/auth/providers/auth_provider.dart';

class MainShellScaffold extends StatefulWidget {
  final Widget child;

  const MainShellScaffold({super.key, required this.child});

  @override
  State<MainShellScaffold> createState() => _MainShellScaffoldState();
}

class _MainShellScaffoldState extends State<MainShellScaffold> {
  DateTime? _lastBackPressTime;
  int _lastIndex = 0;
  double _slideDirection = 1.0; // 1.0 for right-to-left (forward), -1.0 for left-to-right (backward)


  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/home')) return 0;
    if (location.startsWith('/products')) return 1;
    if (location.startsWith('/community') || location.startsWith('/notice-board')) return 3;
    if (location.startsWith('/profile') || location.startsWith('/account') || location.startsWith('/portal') || location.startsWith('/dashboard')) return 4;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    if (index == _lastIndex) return;

    setState(() {
      _slideDirection = index > _lastIndex ? 1.0 : -1.0;
      _lastIndex = index;
    });

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

  void _handleBackPress(BuildContext context, int selectedIndex) {
    if (selectedIndex != 0) {
      // Return to Home tab from any other tab with iOS left-to-right slide
      setState(() {
        _slideDirection = -1.0;
        _lastIndex = 0;
      });
      context.go('/home');
      return;
    }

    final now = DateTime.now();
    if (_lastBackPressTime == null || now.difference(_lastBackPressTime!) > const Duration(seconds: 2)) {
      _lastBackPressTime = now;
      ScaffoldMessenger.of(context).removeCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.info_outline_rounded, color: Colors.white, size: 16),
              SizedBox(width: 8),
              Text(
                'Press back again to exit Servora',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ],
          ),
          backgroundColor: const Color(0xFF1E293B),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          margin: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
          duration: const Duration(seconds: 2),
        ),
      );
      return;
    }

    // Double tap occurred within 2s -> Exit application safely
    SystemNavigator.pop();
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
          canPop: false,
          onPopInvoked: (didPop) {
            if (didPop) return;
            _handleBackPress(context, selectedIndex);
          },
          child: Scaffold(
            body: AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              reverseDuration: const Duration(milliseconds: 200),
              switchInCurve: Curves.easeOutCubic,
              switchOutCurve: Curves.easeInCubic,
              transitionBuilder: (Widget child, Animation<double> animation) {
                final inOffset = Tween<Offset>(
                  begin: Offset(_slideDirection * 0.15, 0.0),
                  end: Offset.zero,
                ).animate(animation);

                return SlideTransition(
                  position: inOffset,
                  child: FadeTransition(
                    opacity: animation,
                    child: child,
                  ),
                );
              },
              child: KeyedSubtree(
                key: ValueKey<int>(selectedIndex),
                child: widget.child,
              ),
            ),
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
