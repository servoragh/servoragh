import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/servora_colors.dart';
import '../../features/auth/providers/auth_provider.dart';

class MainShellScaffold extends StatefulWidget {
  final StatefulNavigationShell navigationShell;

  const MainShellScaffold({super.key, required this.navigationShell});

  @override
  State<MainShellScaffold> createState() => _MainShellScaffoldState();
}

class _MainShellScaffoldState extends State<MainShellScaffold> {
  DateTime? _lastBackPressTime;

  int _getNavIndexFromBranch(int branchIndex) {
    switch (branchIndex) {
      case 0:
        return 0; // Home
      case 1:
        return 1; // Products
      case 2:
        return 3; // Notice Board (Community)
      case 3:
        return 4; // Account / Profile
      default:
        return 0;
    }
  }

  void _onDestinationSelected(int index) {
    if (index == 2) {
      // Middle Post Button: Push the modern request wizard modal
      context.push('/services/request');
      return;
    }

    int branch = 0;
    if (index == 0) {
      branch = 0;
    } else if (index == 1) {
      branch = 1;
    } else if (index == 3) {
      branch = 2;
    } else if (index == 4) {
      branch = 3;
    }

    widget.navigationShell.goBranch(
      branch,
      initialLocation: branch == widget.navigationShell.currentIndex,
    );
  }

  void _handleBackPress() {
    if (widget.navigationShell.currentIndex != 0) {
      // Return to Home tab from any other tab instantly
      widget.navigationShell.goBranch(0);
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
    final navIndex = _getNavIndexFromBranch(widget.navigationShell.currentIndex);

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
            _handleBackPress();
          },
          child: Scaffold(
            // ⚡ Zero-lag indexed navigation: branches stay loaded in memory!
            body: widget.navigationShell,
            bottomNavigationBar: NavigationBar(
              selectedIndex: navIndex,
              onDestinationSelected: _onDestinationSelected,
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
