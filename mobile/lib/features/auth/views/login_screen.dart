import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../../../shared/widgets/servora_button.dart';
import '../../../shared/widgets/servora_text_field.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isSignUp = false;
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();

  void _fillDemoCredentials(String identifier, String pass) {
    setState(() {
      _phoneController.text = identifier;
      _passwordController.text = pass;
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: authNotifier,
      builder: (context, _) {
        final authState = authNotifier.state;
        final isDark = Theme.of(context).brightness == Brightness.dark;

        return Scaffold(
          appBar: AppBar(
            title: Text(_isSignUp ? '100% Free Registration 📝' : 'Sign In to Servora.gh'),
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 10),
                Center(
                  child: Image.asset(
                    'assets/images/logo.png',
                    width: 72,
                    height: 72,
                    fit: BoxFit.contain,
                  ),
                ),
                const SizedBox(height: 20),
                Center(
                  child: Column(
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _isSignUp ? 'Sign Up on Servora' : 'Welcome to Servora',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              color: isDark ? Colors.white : const Color(0xFF18181B),
                            ),
                          ),
                          const Text(
                            '.gh',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF059669),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'NORTHERN MARKETPLACE & ARTISAN TRADE HUB',
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF059669),
                          letterSpacing: 0.8,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Quick Demo Account Auto-Fill Chips
                if (!_isSignUp) ...[
                  const Text(
                    'Quick Demo Sign In Chips:',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      ActionChip(
                        avatar: const Text('👑', style: TextStyle(fontSize: 12)),
                        label: const Text('Master Admin', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        backgroundColor: const Color(0xFFFEF2F2),
                        side: const BorderSide(color: Colors.redAccent),
                        onPressed: () => _fillDemoCredentials('admin@servora.gh', 'admin12345'),
                      ),
                      ActionChip(
                        avatar: const Text('⚡', style: TextStyle(fontSize: 12)),
                        label: const Text('Merchant', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        backgroundColor: const Color(0xFFFEF3C7),
                        side: const BorderSide(color: Colors.amber),
                        onPressed: () => _fillDemoCredentials('kwame.electric@gmail.com', 'password123'),
                      ),
                      ActionChip(
                        avatar: const Text('🛒', style: TextStyle(fontSize: 12)),
                        label: const Text('Customer', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        backgroundColor: const Color(0xFFECFDF5),
                        side: const BorderSide(color: Color(0xFF059669)),
                        onPressed: () => _fillDemoCredentials('amina@gmail.com', 'password123'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                ],

                if (_isSignUp) ...[
                  ServoraTextField(
                    label: 'Full Name *',
                    hint: 'e.g. Alhassan Ibrahim',
                    controller: _nameController,
                  ),
                  const SizedBox(height: 16),
                ],

                ServoraTextField(
                  label: 'Ghana Phone Number or Email Address *',
                  hint: 'e.g. +233240000000 or admin@servora.gh',
                  keyboardType: TextInputType.emailAddress,
                  controller: _phoneController,
                ),
                const SizedBox(height: 16),

                ServoraTextField(
                  label: 'Password *',
                  hint: '••••••••',
                  obscureText: true,
                  controller: _passwordController,
                ),
                const SizedBox(height: 24),

                if (authState.error != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      authState.error!,
                      style: const TextStyle(fontSize: 12, color: Colors.red, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                ServoraButton(
                  label: _isSignUp ? '100% Free Sign Up 🎉' : 'Sign In ➔',
                  isLoading: authState.isLoading,
                  onPressed: () async {
                    final navigator = GoRouter.of(context);
                    final success = await authNotifier.login(
                      _phoneController.text.trim(),
                      _passwordController.text.trim(),
                    );
                    if (success) {
                      navigator.go('/home');
                    }
                  },
                ),
                const SizedBox(height: 20),

                Center(
                  child: TextButton(
                    onPressed: () {
                      setState(() => _isSignUp = !_isSignUp);
                    },
                    child: Text(
                      _isSignUp
                          ? 'Already have an account? Sign In'
                          : 'Don\'t have an account? 100% Free Registration',
                      style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
