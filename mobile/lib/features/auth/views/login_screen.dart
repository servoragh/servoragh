import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  final bool initialRegisterMode;
  final String? initialRole;

  const LoginScreen({
    super.key,
    this.initialRegisterMode = false,
    this.initialRole,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late bool _isSignUp;
  String _accountType = 'customer'; // 'customer' | 'provider'
  bool _showPassword = false;

  // Controllers
  final TextEditingController _identifierController = TextEditingController(); // Phone or Email
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _businessNameController = TextEditingController();
  final TextEditingController _bioController = TextEditingController();
  final TextEditingController _serviceAreaController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _isSignUp = widget.initialRegisterMode;
    if (widget.initialRole != null) {
      _accountType = widget.initialRole == 'PROVIDER' ? 'provider' : 'customer';
    }
  }

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _businessNameController.dispose();
    _bioController.dispose();
    _serviceAreaController.dispose();
    super.dispose();
  }

  void _fillDemoCredentials(String identifier, String pass, String role) {
    setState(() {
      _isSignUp = false;
      _accountType = role == 'PROVIDER' ? 'provider' : 'customer';
      _identifierController.text = identifier;
      _passwordController.text = pass;
    });
  }

  Future<void> _handleAuthSubmit() async {
    final navigator = GoRouter.of(context);

    if (!_isSignUp) {
      // 1. Sign In
      final identifier = _identifierController.text.trim();
      final password = _passwordController.text.trim();

      if (identifier.isEmpty || password.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter both your phone/email and password.')),
        );
        return;
      }

      final success = await authNotifier.login(identifier, password);
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: ServoraColors.emerald600,
            content: Text('Welcome back, ${authNotifier.state.user?.name ?? 'User'}!'),
          ),
        );
        navigator.go('/account');
      }
    } else {
      // 2. Registration Flow
      final name = _nameController.text.trim();
      final phone = _phoneController.text.trim();
      final email = _emailController.text.trim();
      final password = _passwordController.text.trim();

      if (name.isEmpty || phone.isEmpty || password.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please fill in your Name, Phone number, and Password.')),
        );
        return;
      }

      if (_accountType == 'provider') {
        final businessName = _businessNameController.text.trim();
        final bio = _bioController.text.trim();
        final serviceArea = _serviceAreaController.text.trim();

        if (businessName.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please specify your Business or Brand name.')),
          );
          return;
        }

        final success = await authNotifier.registerProvider(
          name: name,
          phone: phone,
          email: email.isNotEmpty ? email : null,
          password: password,
          businessName: businessName,
          bio: bio.isNotEmpty ? bio : 'Verified Northern Ghana Artisan & Merchant on Servora.gh',
          serviceArea: serviceArea.isNotEmpty ? serviceArea : 'Tamale Metro, Northern Region',
        );

        if (success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: ServoraColors.emerald600,
              content: Text('Business Account created! Launching your Merchant Portal...'),
            ),
          );
          navigator.go('/account');
        }
      } else {
        // Customer Registration
        final success = await authNotifier.registerCustomer(
          name: name,
          phone: phone,
          email: email.isNotEmpty ? email : null,
          password: password,
        );

        if (success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: ServoraColors.emerald600,
              content: Text('Customer Account created! Welcome to Servora.gh.'),
            ),
          );
          navigator.go('/account');
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? ServoraColors.darkSurface : Colors.white;

    return ListenableBuilder(
      listenable: authNotifier,
      builder: (context, _) {
        final authState = authNotifier.state;

        return Scaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              onPressed: () {
                if (Navigator.of(context).canPop()) {
                  context.pop();
                } else {
                  context.go('/home');
                }
              },
            ),
            title: Text(
              _isSignUp
                  ? (_accountType == 'provider' ? 'Register Business' : '100% Free Sign Up')
                  : 'Sign In to Servora.gh',
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            actions: [
              TextButton(
                onPressed: () => context.go('/home'),
                child: const Text(
                  'Explore as Guest',
                  style: TextStyle(color: ServoraColors.emerald600, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 460),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Brand Header
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Column(
                        children: [
                          Container(
                            width: 62,
                            height: 62,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [ServoraColors.emerald600, Color(0xFF0D9488)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: ServoraColors.emerald600.withOpacity(0.3),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const Center(
                              child: Icon(Icons.handyman_rounded, color: Colors.white, size: 30),
                            ),
                          ),
                          const Gap(12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _isSignUp
                                    ? (_accountType == 'provider' ? 'Join as a Merchant' : 'Customer Account')
                                    : 'Log in to Servora',
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                  color: isDark ? Colors.white : const Color(0xFF18181B),
                                ),
                              ),
                              const Text(
                                '.gh',
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                  color: ServoraColors.emerald600,
                                ),
                              ),
                            ],
                          ),
                          const Gap(4),
                          const Text(
                            'NORTHERN MARKETPLACE & ARTISAN TRADE HUB',
                            style: TextStyle(
                              fontSize: 9.5,
                              fontWeight: FontWeight.w900,
                              color: ServoraColors.emerald600,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Role Selector Tabs (Customer / Buyer vs Business / Seller)
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: isDark ? ServoraColors.darkCardBorder.withOpacity(0.5) : Colors.grey[100],
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder,
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _accountType = 'customer'),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                decoration: BoxDecoration(
                                  color: _accountType == 'customer' ? cardBg : Colors.transparent,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: _accountType == 'customer'
                                      ? [
                                          BoxShadow(
                                            color: Colors.black.withOpacity(isDark ? 0.3 : 0.05),
                                            blurRadius: 6,
                                            offset: const Offset(0, 2),
                                          ),
                                        ]
                                      : null,
                                ),
                                child: Center(
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.shopping_cart_outlined,
                                        size: 15,
                                        color: _accountType == 'customer'
                                            ? ServoraColors.emerald600
                                            : Colors.grey[500],
                                      ),
                                      const Gap(6),
                                      Text(
                                        'Customer / Buyer',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: _accountType == 'customer'
                                              ? ServoraColors.emerald600
                                              : Colors.grey[600],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _accountType = 'provider'),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                decoration: BoxDecoration(
                                  color: _accountType == 'provider' ? cardBg : Colors.transparent,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: _accountType == 'provider'
                                      ? [
                                          BoxShadow(
                                            color: Colors.black.withOpacity(isDark ? 0.3 : 0.05),
                                            blurRadius: 6,
                                            offset: const Offset(0, 2),
                                          ),
                                        ]
                                      : null,
                                ),
                                child: Center(
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.storefront_rounded,
                                        size: 15,
                                        color: _accountType == 'provider'
                                            ? const Color(0xFFD97706)
                                            : Colors.grey[500],
                                      ),
                                      const Gap(6),
                                      Text(
                                        'Business / Seller',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: _accountType == 'provider'
                                              ? const Color(0xFFD97706)
                                              : Colors.grey[600],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Gap(16),

                    // Quick Demo Sign In Chips (Only in Sign In mode)
                    if (!_isSignUp) ...[
                      const Text(
                        'Fast 1-Tap Demo Sign In:',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey),
                      ),
                      const Gap(8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          ActionChip(
                            avatar: const Text('👑', style: TextStyle(fontSize: 12)),
                            label: const Text('Master Admin', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            backgroundColor: const Color(0xFFFEF2F2),
                            side: const BorderSide(color: Colors.redAccent),
                            onPressed: () => _fillDemoCredentials('admin@servora.gh', 'admin12345', 'ADMIN'),
                          ),
                          ActionChip(
                            avatar: const Text('⚡', style: TextStyle(fontSize: 12)),
                            label: const Text('Kwame Electrical', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            backgroundColor: const Color(0xFFFEF3C7),
                            side: const BorderSide(color: Colors.amber),
                            onPressed: () => _fillDemoCredentials('kwame.electric@gmail.com', 'password123', 'PROVIDER'),
                          ),
                          ActionChip(
                            avatar: const Text('🛒', style: TextStyle(fontSize: 12)),
                            label: const Text('Amina Customer', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            backgroundColor: const Color(0xFFECFDF5),
                            side: const BorderSide(color: ServoraColors.emerald600),
                            onPressed: () => _fillDemoCredentials('amina@gmail.com', 'password123', 'CUSTOMER'),
                          ),
                        ],
                      ),
                      const Gap(16),
                    ],

                    // Error Alert Banner
                    if (authState.error != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.red.withOpacity(0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline_rounded, color: Colors.red, size: 18),
                            const Gap(8),
                            Expanded(
                              child: Text(
                                authState.error!,
                                style: const TextStyle(fontSize: 11, color: Colors.red, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Gap(14),
                    ],

                    // Form Fields
                    ServoraCard(
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (!_isSignUp) ...[
                            // SIGN IN INPUTS
                            _buildLabel('Phone Number or Email *'),
                            _buildTextField(
                              controller: _identifierController,
                              hint: _accountType == 'provider'
                                  ? 'e.g. +233244889900 (WhatsApp) or email'
                                  : 'e.g. amina@gmail.com or +233241112233',
                              icon: Icons.person_outline_rounded,
                              keyboardType: TextInputType.emailAddress,
                            ),
                            const Gap(14),

                            _buildLabel('Account Password *'),
                            _buildTextField(
                              controller: _passwordController,
                              hint: '••••••••',
                              icon: Icons.lock_outline_rounded,
                              obscureText: !_showPassword,
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _showPassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                                  size: 18,
                                  color: Colors.grey,
                                ),
                                onPressed: () => setState(() => _showPassword = !_showPassword),
                              ),
                            ),
                          ] else ...[
                            // REGISTRATION INPUTS
                            _buildLabel('Full Name *'),
                            _buildTextField(
                              controller: _nameController,
                              hint: 'e.g. Amina Abdul or Kwame Mensah',
                              icon: Icons.badge_outlined,
                            ),
                            const Gap(14),

                            _buildLabel('Ghana Phone Number (WhatsApp) *'),
                            _buildTextField(
                              controller: _phoneController,
                              hint: '+233 24 000 0000',
                              icon: Icons.phone_outlined,
                              keyboardType: TextInputType.phone,
                            ),
                            const Gap(14),

                            _buildLabel('Email Address (Optional)'),
                            _buildTextField(
                              controller: _emailController,
                              hint: 'name@example.com',
                              icon: Icons.mail_outline_rounded,
                              keyboardType: TextInputType.emailAddress,
                            ),
                            const Gap(14),

                            if (_accountType == 'provider') ...[
                              _buildLabel('Business / Enterprise Brand Name *'),
                              _buildTextField(
                                controller: _businessNameController,
                                hint: 'e.g. Tamale Solar Solutions',
                                icon: Icons.storefront_rounded,
                              ),
                              const Gap(14),

                              _buildLabel('Service Area / Neighborhood in Tamale'),
                              _buildTextField(
                                controller: _serviceAreaController,
                                hint: 'e.g. Lamashegu, Sakasaka, Nyohini',
                                icon: Icons.location_on_outlined,
                              ),
                              const Gap(14),

                              _buildLabel('Short Business Description'),
                              _buildTextField(
                                controller: _bioController,
                                hint: 'e.g. Professional solar power installer with 8+ years experience',
                                icon: Icons.description_outlined,
                                maxLines: 2,
                              ),
                              const Gap(14),
                            ],

                            _buildLabel('Set Secure Password *'),
                            _buildTextField(
                              controller: _passwordController,
                              hint: '•••••••• (minimum 6 characters)',
                              icon: Icons.lock_outline_rounded,
                              obscureText: !_showPassword,
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _showPassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                                  size: 18,
                                  color: Colors.grey,
                                ),
                                onPressed: () => setState(() => _showPassword = !_showPassword),
                              ),
                            ),
                          ],

                          const Gap(20),

                          // Submit Action Button
                          SizedBox(
                            width: double.infinity,
                            height: 48,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: _accountType == 'provider'
                                    ? const Color(0xFFD97706)
                                    : ServoraColors.emerald600,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                elevation: 2,
                              ),
                              onPressed: authState.isLoading ? null : _handleAuthSubmit,
                              child: authState.isLoading
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                                    )
                                  : Text(
                                      !_isSignUp
                                          ? 'Sign In to Account ➔'
                                          : (_accountType == 'provider'
                                              ? 'Register Business & Launch Portal 🚀'
                                              : 'Create 100% Free Account 🎉'),
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Gap(16),

                    // Toggle Sign In vs Sign Up
                    Center(
                      child: TextButton(
                        onPressed: () {
                          setState(() {
                            _isSignUp = !_isSignUp;
                          });
                        },
                        child: Text(
                          _isSignUp
                              ? 'Already have an account? Sign In'
                              : 'Don\'t have an account? 100% Free Registration',
                          style: const TextStyle(
                            color: ServoraColors.emerald600,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),

                    const Gap(20),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool obscureText = false,
    TextInputType? keyboardType,
    Widget? suffixIcon,
    int maxLines = 1,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return TextField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      maxLines: obscureText ? 1 : maxLines,
      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(fontSize: 12, color: Colors.grey[400]),
        prefixIcon: Icon(icon, size: 18, color: Colors.grey[500]),
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: isDark ? ServoraColors.darkCardBorder.withOpacity(0.3) : const Color(0xFFF9FAFB),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: ServoraColors.emerald600, width: 1.5),
        ),
      ),
    );
  }
}
