import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../core/utils/location_helper.dart';
import '../../../shared/widgets/servora_image_upload_widget.dart';
import '../../../features/auth/providers/auth_provider.dart';

class EditBusinessProfileScreen extends StatefulWidget {
  const EditBusinessProfileScreen({super.key});

  @override
  State<EditBusinessProfileScreen> createState() => _EditBusinessProfileScreenState();
}

class _EditBusinessProfileScreenState extends State<EditBusinessProfileScreen> {
  bool _isLoading = true;
  bool _isSaving = false;

  // Text Controllers
  final TextEditingController _businessNameController = TextEditingController();
  final TextEditingController _slugController = TextEditingController();
  final TextEditingController _taglineController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _whatsappController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _landmarkController = TextEditingController();
  final TextEditingController _hoursController = TextEditingController();
  final TextEditingController _ghanaCardPinController = TextEditingController();
  final TextEditingController _tinNumberController = TextEditingController();
  final TextEditingController _tradeAssociationController = TextEditingController();

  // Dropdown States
  String _selectedBusinessType = 'SOLO_ARTISAN';
  String _selectedZone = 'Tamale Central';

  // GPS Coordinates
  double? _latitude;
  double? _longitude;
  bool _isDetectingGps = false;

  // Media URLs
  String? _logoUrl;
  String? _bannerUrl;
  String? _storefrontPhotoUrl;
  String? _idCardPhotoUrl;
  String? _businessCertUrl;

  final List<Map<String, String>> _businessTypes = [
    {'value': 'SOLO_ARTISAN', 'label': 'Solo Artisan & Trade Technician'},
    {'value': 'RETAIL_SHOP', 'label': 'Retail Shop & Agro-Dealer'},
    {'value': 'AGRO_PRODUCER', 'label': 'Agricultural Producer & Wholesaler'},
    {'value': 'EQUIPMENT_RENTAL', 'label': 'Heavy Equipment & Machine Rental Yard'},
    {'value': 'SOLAR_ENERGY', 'label': 'Solar, Electrical & Heavy Tech Specialist'},
    {'value': 'FOOD_CATERING', 'label': 'Food, Agro-Processing & Catering'},
    {'value': 'CONSTRUCTION', 'label': 'Building Contractor & Materials Supply'},
  ];

  final List<String> _tamaleZones = [
    'Tamale Central',
    'Sakasaka',
    'Aboabo',
    'Lamashegu',
    'Nyohini',
    'Vittin',
    'Choggu',
    'Bilpella',
    'Dungu (UDS)',
    'Kalpohin',
    'Gumani',
    'Datoyili',
    'Tishigu',
    'Kukuo',
  ];

  @override
  void initState() {
    super.initState();
    _loadBusinessProfile();
  }

  @override
  void dispose() {
    _businessNameController.dispose();
    _slugController.dispose();
    _taglineController.dispose();
    _descriptionController.dispose();
    _phoneController.dispose();
    _whatsappController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    _landmarkController.dispose();
    _hoursController.dispose();
    _ghanaCardPinController.dispose();
    _tinNumberController.dispose();
    _tradeAssociationController.dispose();
    super.dispose();
  }

  Future<void> _loadBusinessProfile() async {
    setState(() => _isLoading = true);
    try {
      final user = authNotifier.state.user;
      final response = await authNotifier.apiClient.get('/business/profile');
      if (response.statusCode == 200 && response.data != null) {
        final profile = response.data['profile'];
        if (profile != null && profile is Map) {
          _businessNameController.text = profile['businessName'] ?? '';
          _slugController.text = profile['slug'] ?? '';
          _taglineController.text = profile['tagline'] ?? '';
          _descriptionController.text = profile['description'] ?? '';
          _phoneController.text = profile['phone'] ?? user?.phone ?? '';
          _whatsappController.text = profile['whatsappNumber'] ?? profile['phone'] ?? user?.phone ?? '';
          _emailController.text = profile['email'] ?? user?.email ?? '';
          _addressController.text = profile['addressDetails'] ?? '';
          _landmarkController.text = profile['landmark'] ?? '';
          _hoursController.text = profile['businessHours'] ?? 'Mon - Sat: 7:30 AM - 6:00 PM';
          _ghanaCardPinController.text = profile['idCardNumber'] ?? '';
          _tinNumberController.text = profile['tinNumber'] ?? '';
          _tradeAssociationController.text = profile['tradeAssociation'] ?? '';

          _selectedBusinessType = profile['businessType'] ?? 'SOLO_ARTISAN';
          _selectedZone = profile['zone'] ?? 'Tamale Central';

          if (profile['latitude'] != null) {
            _latitude = double.tryParse(profile['latitude'].toString());
          }
          if (profile['longitude'] != null) {
            _longitude = double.tryParse(profile['longitude'].toString());
          }

          _logoUrl = profile['logoUrl'];
          _bannerUrl = profile['bannerUrl'];
          _storefrontPhotoUrl = profile['storefrontPhotoUrl'];
          _idCardPhotoUrl = profile['idCardPhotoUrl'];
          _businessCertUrl = profile['businessCertUrl'];
        }
      }
    } catch (_) {
      // Fallback with current user defaults
      final user = authNotifier.state.user;
      if (user != null) {
        _businessNameController.text = user.name;
        _phoneController.text = user.phone;
        _whatsappController.text = user.phone;
        if (user.email != null) _emailController.text = user.email!;
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _detectGpsLocation() async {
    setState(() => _isDetectingGps = true);
    try {
      final pos = await LocationHelper.getCurrentPosition();
      if (pos != null) {
        setState(() {
          _latitude = pos.latitude;
          _longitude = pos.longitude;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: ServoraColors.emerald600,
              content: Text('📍 GPS Location detected: ${_latitude!.toStringAsFixed(5)}, ${_longitude!.toStringAsFixed(5)}'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red[700],
            content: Text('Could not fetch GPS location: $e'),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isDetectingGps = false);
      }
    }
  }

  Future<void> _saveProfile() async {
    final businessName = _businessNameController.text.trim();
    final phone = _phoneController.text.trim();
    final whatsapp = _whatsappController.text.trim();

    if (businessName.isEmpty || phone.isEmpty || whatsapp.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Colors.red,
          content: Text('Business Name, Phone, and WhatsApp numbers are required.'),
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final payload = {
        'businessName': businessName,
        'slug': _slugController.text.trim().isNotEmpty ? _slugController.text.trim() : null,
        'tagline': _taglineController.text.trim(),
        'description': _descriptionController.text.trim(),
        'businessType': _selectedBusinessType,
        'logoUrl': _logoUrl,
        'bannerUrl': _bannerUrl,
        'storefrontPhotoUrl': _storefrontPhotoUrl,
        'zone': _selectedZone,
        'addressDetails': _addressController.text.trim(),
        'landmark': _landmarkController.text.trim(),
        'latitude': _latitude,
        'longitude': _longitude,
        'phone': phone,
        'whatsappNumber': whatsapp,
        'email': _emailController.text.trim(),
        'businessHours': _hoursController.text.trim(),
        'idCardNumber': _ghanaCardPinController.text.trim(),
        'idCardPhotoUrl': _idCardPhotoUrl,
        'businessCertUrl': _businessCertUrl,
        'tinNumber': _tinNumberController.text.trim(),
        'tradeAssociation': _tradeAssociationController.text.trim(),
      };

      final response = await authNotifier.apiClient.post('/business/profile', data: payload);

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: ServoraColors.emerald600,
              content: Text('✅ Business profile updated and synced successfully!'),
            ),
          );
          context.pop(true);
        }
      } else {
        throw Exception(response.data?['error'] ?? 'Failed to update profile.');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red[700],
            content: Text('Error saving profile: ${e.toString()}'),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF090D16) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Edit Business Profile 🏢',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: ServoraColors.emerald600,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              onPressed: _isSaving ? null : _saveProfile,
              icon: _isSaving
                  ? const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.check_rounded, size: 16),
              label: Text(
                _isSaving ? 'Saving...' : 'Save',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: ServoraColors.emerald600),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header description banner
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: ServoraColors.emerald600.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: ServoraColors.emerald600.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.verified_user_rounded, color: ServoraColors.emerald600, size: 24),
                        const Gap(10),
                        Expanded(
                          child: Text(
                            'Keep your store profile, photos, GPS location, and Ghana Card verified to earn high trust ranking on the Servora Marketplace.',
                            style: TextStyle(
                              fontSize: 11.5,
                              color: isDark ? Colors.white70 : Colors.grey[800],
                              height: 1.35,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Gap(18),

                  // 1. BUSINESS IDENTITY & CLASSIFICATION
                  _buildSectionCard(
                    title: '1. Storefront Identity & Category',
                    icon: Icons.storefront_rounded,
                    isDark: isDark,
                    children: [
                      _buildTextField(
                        controller: _businessNameController,
                        label: 'Official Business Name *',
                        hint: 'e.g., Savannah Fresh Farm Produce & Agro-Goods',
                        isDark: isDark,
                      ),
                      const Gap(12),
                      _buildTextField(
                        controller: _slugController,
                        label: 'Public Storefront URL Slug (Optional)',
                        hint: 'e.g., savannah-fresh-tamale',
                        helperText: 'Your store link: servora.com/biz/your-slug',
                        isDark: isDark,
                      ),
                      const Gap(12),
                      _buildDropdown(
                        label: 'Business Category / Classification *',
                        value: _selectedBusinessType,
                        items: _businessTypes
                            .map((bt) => DropdownMenuItem(
                                  value: bt['value'],
                                  child: Text(bt['label']!, style: const TextStyle(fontSize: 12.5)),
                                ))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedBusinessType = val);
                        },
                        isDark: isDark,
                      ),
                      const Gap(12),
                      _buildTextField(
                        controller: _taglineController,
                        label: 'Business Tagline / Motto',
                        hint: 'e.g., Direct Farm-to-Table Wholesaler in Northern Ghana',
                        isDark: isDark,
                      ),
                      const Gap(12),
                      _buildTextField(
                        controller: _descriptionController,
                        label: 'Full Business Story & Offerings',
                        hint: 'Explain what products you sell, your experience, and why customers in Tamale can trust your service...',
                        maxLines: 4,
                        isDark: isDark,
                      ),
                    ],
                  ),
                  const Gap(16),

                  // 2. BRANDING & PHOTOS (NATIVE UPLOAD)
                  _buildSectionCard(
                    title: '2. Visual Media & Store Photos',
                    icon: Icons.photo_library_rounded,
                    isDark: isDark,
                    children: [
                      ServoraImageUploadWidget(
                        label: 'Business Logo / Profile Avatar',
                        helperText: 'Upload your square logo or artisan portrait.',
                        initialImages: _logoUrl != null ? [_logoUrl!] : [],
                        isSingleImage: true,
                        onImagesChanged: (imgs) {
                          setState(() => _logoUrl = imgs.isNotEmpty ? imgs.first : null);
                        },
                      ),
                      const Gap(16),
                      const Divider(height: 1),
                      const Gap(16),
                      ServoraImageUploadWidget(
                        label: 'Storefront Cover Banner',
                        helperText: 'High resolution landscape photo for the top of your store.',
                        initialImages: _bannerUrl != null ? [_bannerUrl!] : [],
                        isSingleImage: true,
                        onImagesChanged: (imgs) {
                          setState(() => _bannerUrl = imgs.isNotEmpty ? imgs.first : null);
                        },
                      ),
                      const Gap(16),
                      const Divider(height: 1),
                      const Gap(16),
                      ServoraImageUploadWidget(
                        label: 'Physical Storefront & Workshop Photo',
                        helperText: 'Capture the outside of your shop/workshop for customer trust.',
                        initialImages: _storefrontPhotoUrl != null ? [_storefrontPhotoUrl!] : [],
                        isSingleImage: true,
                        onImagesChanged: (imgs) {
                          setState(() => _storefrontPhotoUrl = imgs.isNotEmpty ? imgs.first : null);
                        },
                      ),
                    ],
                  ),
                  const Gap(16),

                  // 3. LOCATION & GPS NAVIGATION
                  _buildSectionCard(
                    title: '3. Physical Location & Live GPS',
                    icon: Icons.location_on_rounded,
                    isDark: isDark,
                    children: [
                      _buildDropdown(
                        label: 'Operating Zone in Northern Ghana *',
                        value: _selectedZone,
                        items: _tamaleZones
                            .map((z) => DropdownMenuItem(
                                  value: z,
                                  child: Text(z, style: const TextStyle(fontSize: 12.5)),
                                ))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedZone = val);
                        },
                        isDark: isDark,
                      ),
                      const Gap(12),
                      _buildTextField(
                        controller: _addressController,
                        label: 'Physical Address & Shed Number',
                        hint: 'e.g., Aboabo Wholesale Agro Market, Shed #12',
                        isDark: isDark,
                      ),
                      const Gap(12),
                      _buildTextField(
                        controller: _landmarkController,
                        label: 'Prominent Landmark',
                        hint: 'e.g., Near Aboabo Yam Market Main Gate',
                        isDark: isDark,
                      ),
                      const Gap(14),

                      // GPS Location Detector Box
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: isDark ? ServoraColors.darkCardBorder : Colors.grey[300]!),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Row(
                                  children: [
                                    Icon(Icons.gps_fixed_rounded, size: 16, color: ServoraColors.emerald600),
                                    Gap(6),
                                    Text('Storefront GPS Coordinates', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                                if (_latitude != null && _longitude != null)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: ServoraColors.emerald600.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text('📍 Pin Saved', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                                  ),
                              ],
                            ),
                            const Gap(6),
                            Text(
                              _latitude != null && _longitude != null
                                  ? 'Latitude: ${_latitude!.toStringAsFixed(5)}  |  Longitude: ${_longitude!.toStringAsFixed(5)}'
                                  : 'No GPS coordinates saved yet. Tap button below to detect from your current location.',
                              style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey[600]),
                            ),
                            const Gap(10),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: ServoraColors.emerald600,
                                  side: const BorderSide(color: ServoraColors.emerald600),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                onPressed: _isDetectingGps ? null : _detectGpsLocation,
                                icon: _isDetectingGps
                                    ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: ServoraColors.emerald600))
                                    : const Icon(Icons.my_location_rounded, size: 16),
                                label: Text(
                                  _isDetectingGps ? 'Detecting current GPS location...' : 'Auto-Detect Shop GPS Location 🎯',
                                  style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Gap(16),

                  // 4. CONTACT & OPERATING HOURS
                  _buildSectionCard(
                    title: '4. Contact Details & Business Hours',
                    icon: Icons.contact_phone_rounded,
                    isDark: isDark,
                    children: [
                      _buildTextField(
                        controller: _phoneController,
                        label: 'Official Phone Call Number *',
                        hint: 'e.g., 0244123456',
                        keyboardType: TextInputType.phone,
                        isDark: isDark,
                      ),
                      const Gap(12),
                      _buildTextField(
                        controller: _whatsappController,
                        label: 'WhatsApp Business Number *',
                        hint: 'e.g., 0244123456',
                        keyboardType: TextInputType.phone,
                        isDark: isDark,
                      ),
                      const Gap(12),
                      _buildTextField(
                        controller: _emailController,
                        label: 'Business Email',
                        hint: 'e.g., info@savannahfresh.com',
                        keyboardType: TextInputType.emailAddress,
                        isDark: isDark,
                      ),
                      const Gap(12),
                      _buildTextField(
                        controller: _hoursController,
                        label: 'Operating Hours',
                        hint: 'e.g., Mon - Sat: 7:30 AM - 6:00 PM',
                        isDark: isDark,
                      ),
                    ],
                  ),
                  const Gap(16),

                  // 5. GHANA CARD & VERIFICATION SUITE
                  _buildSectionCard(
                    title: '5. Ghana Card & Trust Verification',
                    icon: Icons.shield_rounded,
                    isDark: isDark,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF2563EB).withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF2563EB).withOpacity(0.25)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.badge_rounded, color: Color(0xFF2563EB), size: 18),
                            Gap(8),
                            Expanded(
                              child: Text(
                                'Submitting your Ghana Card and registration certificates unlocks the Tier 2/3 Gold Verified Merchant badge across Northern Ghana.',
                                style: TextStyle(fontSize: 11, color: Color(0xFF1D4ED8), height: 1.3),
                              ),
                            ),
                          ],
                        ),
                      ),
                      _buildTextField(
                        controller: _ghanaCardPinController,
                        label: 'Ghana Card PIN (e.g. GHA-000000000-0)',
                        hint: 'GHA-XXXXXXXXX-X',
                        isDark: isDark,
                      ),
                      const Gap(14),
                      ServoraImageUploadWidget(
                        label: 'Ghana Card (Front Photo)',
                        helperText: 'Take a clear camera photo of your Ghana Card front.',
                        initialImages: _idCardPhotoUrl != null ? [_idCardPhotoUrl!] : [],
                        isSingleImage: true,
                        onImagesChanged: (imgs) {
                          setState(() => _idCardPhotoUrl = imgs.isNotEmpty ? imgs.first : null);
                        },
                      ),
                      const Gap(16),
                      const Divider(height: 1),
                      const Gap(16),
                      ServoraImageUploadWidget(
                        label: 'Business Registration / Guild Certificate',
                        helperText: 'Upload Registrar General (RGD) or Trade Association letter.',
                        initialImages: _businessCertUrl != null ? [_businessCertUrl!] : [],
                        isSingleImage: true,
                        onImagesChanged: (imgs) {
                          setState(() => _businessCertUrl = imgs.isNotEmpty ? imgs.first : null);
                        },
                      ),
                      const Gap(14),
                      _buildTextField(
                        controller: _tinNumberController,
                        label: 'Tax Identification Number (TIN - Optional)',
                        hint: 'e.g., P0001234567',
                        isDark: isDark,
                      ),
                      const Gap(12),
                      _buildTextField(
                        controller: _tradeAssociationController,
                        label: 'Trade Association / Guild Name (Optional)',
                        hint: 'e.g., Tamale Welders & Fabricators Association',
                        isDark: isDark,
                      ),
                    ],
                  ),
                  const Gap(24),

                  // Bottom Save Action Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ServoraColors.emerald600,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 2,
                      ),
                      onPressed: _isSaving ? null : _saveProfile,
                      icon: _isSaving
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.check_circle_rounded, size: 20),
                      label: Text(
                        _isSaving ? 'Saving Changes...' : 'Save & Publish Profile 🚀',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required bool isDark,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? ServoraColors.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? ServoraColors.darkCardBorder : ServoraColors.lightBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.25 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: ServoraColors.emerald600),
              const Gap(8),
              Text(
                title,
                style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const Gap(14),
          const Divider(height: 1),
          const Gap(14),
          ...children,
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    String? helperText,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
    required bool isDark,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white70 : Colors.grey[800],
          ),
        ),
        const Gap(6),
        TextField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboardType,
          style: const TextStyle(fontSize: 13),
          decoration: InputDecoration(
            hintText: hint,
            helperText: helperText,
            helperStyle: const TextStyle(fontSize: 10.5, color: ServoraColors.emerald600),
            hintStyle: TextStyle(fontSize: 12, color: isDark ? Colors.white30 : Colors.grey[400]),
            filled: true,
            fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: ServoraColors.emerald600, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<DropdownMenuItem<String>> items,
    required ValueChanged<String?> onChanged,
    required bool isDark,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white70 : Colors.grey[800],
          ),
        ),
        const Gap(6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: items.any((i) => i.value == value) ? value : items.first.value,
              isExpanded: true,
              dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
              items: items,
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}
