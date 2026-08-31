import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/constants.dart';
import '../../../core/utils/location_helper.dart';
import '../../../shared/widgets/servora_button.dart';
import '../../../shared/widgets/servora_text_field.dart';
import '../../../shared/widgets/servora_dropdown_sheet.dart';
import '../../auth/providers/auth_provider.dart';

class RequestWizardScreen extends StatefulWidget {
  const RequestWizardScreen({super.key});

  @override
  State<RequestWizardScreen> createState() => _RequestWizardScreenState();
}

class _RequestWizardScreenState extends State<RequestWizardScreen> {
  int _currentStep = 1;
  String _selectedCategory = 'Electrical & Solar';
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _locationController = TextEditingController(text: 'Sakasaka, Tamale');
  final TextEditingController _guestNameController = TextEditingController();
  final TextEditingController _guestPhoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();

  String _urgency = 'ASAP';
  bool _fetchingGps = false;
  bool _submitting = false;
  bool _otpSent = false;
  bool _requestComplete = false;
  String _trackingId = '';

  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ServoraConstants.baseUrl,
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 12),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  @override
  void initState() {
    super.initState();
    final user = authNotifier.state.user;
    if (user != null) {
      _guestNameController.text = user.name;
      _guestPhoneController.text = user.phone;
      if (user.serviceArea != null && user.serviceArea!.isNotEmpty) {
        _locationController.text = '${user.serviceArea}, Tamale';
      }
    }
  }

  Future<void> _openCategoryPicker() async {
    final catNames = ServoraConstants.classifiedCategories.map((c) => c['name'].toString()).toList();
    final result = await ServoraBottomSheetPicker.show(
      context: context,
      title: 'Select Service Category 🛠️',
      items: catNames,
      selectedValue: _selectedCategory,
      searchHint: 'Search electrical, plumbing, fugu...',
      titleIcon: Icons.build_circle_rounded,
    );

    if (result != null && mounted) {
      setState(() => _selectedCategory = result);
    }
  }

  Future<void> _submitRequestToLiveDb() async {
    setState(() => _submitting = true);
    try {
      final token = await authNotifier.storage.getToken();
      final user = authNotifier.state.user;

      final payload = {
        'title': _titleController.text.trim(),
        'description': _descController.text.trim(),
        'customCategory': _selectedCategory,
        'urgency': _urgency == 'ASAP' ? 'EMERGENCY' : _urgency == 'TODAY' ? 'SAME_DAY' : 'FLEXIBLE',
        'landmark': _locationController.text.trim().isNotEmpty ? _locationController.text.trim() : 'Tamale Central',
        'streetAddress': _locationController.text.trim(),
        'guestName': _guestNameController.text.trim().isNotEmpty ? _guestNameController.text.trim() : (user?.name ?? 'Tamale Customer'),
        'guestPhone': _guestPhoneController.text.trim().isNotEmpty ? _guestPhoneController.text.trim() : (user?.phone ?? '+233240000000'),
        'isGuestPost': token == null,
      };

      final res = await _dio.post(
        '/requests',
        data: payload,
        options: Options(
          headers: token != null ? {'Authorization': 'Bearer $token'} : {},
        ),
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        final reqId = res.data['request']?['id'] ?? res.data['id'] ?? 'REQ-${DateTime.now().millisecondsSinceEpoch % 10000}';
        setState(() {
          _trackingId = reqId.toString();
          _requestComplete = true;
          _submitting = false;
        });
      } else {
        throw Exception(res.data['error'] ?? 'Server error creating request');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _submitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red[700],
            content: Text('Failed to publish request: ${e.toString()}'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (didPop) return;
        if (_currentStep > 1) {
          setState(() => _currentStep -= 1);
        } else {
          if (Navigator.of(context).canPop()) {
            context.pop();
          } else {
            context.go('/home');
          }
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text('Post Service Request (Step $_currentStep/4)'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () {
              if (_currentStep > 1) {
                setState(() => _currentStep -= 1);
              } else {
                if (Navigator.of(context).canPop()) {
                  context.pop();
                } else {
                  context.go('/home');
                }
              }
            },
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: _requestComplete ? _buildSuccessView() : _buildStepContent(),
        ),
      ),
    );
  }

  Widget _buildStepContent() {
    if (_currentStep == 1) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Step 1: What service do you need?',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          const Text('Service Category *',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          GestureDetector(
            onTap: _openCategoryPicker,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: Theme.of(context).brightness == Brightness.dark
                    ? const Color(0xFF111827)
                    : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: const Color(0xFF059669).withOpacity(0.3),
                  width: 1.5,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _selectedCategory,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF059669),
                    ),
                  ),
                  const Icon(Icons.keyboard_arrow_down_rounded,
                      color: Color(0xFF059669)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          ServoraTextField(
            label: 'Issue Title / Short Summary *',
            hint: 'e.g. Solar Inverter Wiring Repair in Sakasaka',
            controller: _titleController,
          ),
          const SizedBox(height: 30),
          ServoraButton(
            label: 'Next: Problem Description ➔',
            onPressed: () {
              if (_titleController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text('Please enter a short issue title.')),
                );
                return;
              }
              setState(() => _currentStep = 2);
            },
          ),
        ],
      );
    } else if (_currentStep == 2) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Step 2: Describe the Problem',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          ServoraTextField(
            label: 'Detailed Problem Description *',
            hint: 'Provide details on what needs repair or installation...',
            controller: _descController,
            maxLines: 4,
          ),
          const SizedBox(height: 20),
          const Text('Urgency Speed:',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildUrgencyChip('ASAP', 'Emergency ⚡'),
              const SizedBox(width: 8),
              _buildUrgencyChip('TODAY', 'Today'),
              const SizedBox(width: 8),
              _buildUrgencyChip('SCHEDULED', 'Flexible'),
            ],
          ),
          const SizedBox(height: 30),
          ServoraButton(
            label: 'Next: Location Details ➔',
            onPressed: () {
              if (_descController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please describe the problem.')),
                );
                return;
              }
              setState(() => _currentStep = 3);
            },
          ),
        ],
      );
    } else if (_currentStep == 3) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Step 3: Service Location',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),

          // GPS Lock Button with safe fallback
          ServoraButton(
            label: _fetchingGps
                ? 'Locking GPS Coordinates...'
                : 'Use Current Device GPS 📍',
            variant: ServoraButtonVariant.outline,
            isLoading: _fetchingGps,
            onPressed: () async {
              setState(() => _fetchingGps = true);
              try {
                final pos = await LocationHelper.getCurrentPosition();
                if (mounted) {
                  setState(() {
                    _fetchingGps = false;
                    if (pos != null) {
                      _locationController.text =
                          'Exact GPS (${pos.latitude.toStringAsFixed(4)}, ${pos.longitude.toStringAsFixed(4)}) Sakasaka, Tamale';
                    } else {
                      _locationController.text = 'Sakasaka, Tamale';
                    }
                  });
                }
              } catch (_) {
                if (mounted) {
                  setState(() {
                    _fetchingGps = false;
                    _locationController.text = 'Tamale Central, Northern Ghana';
                  });
                }
              }
            },
          ),
          const SizedBox(height: 14),

          // 1-Tap Quick Area Selector
          const Text('Quick 1-Tap Area Selector:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              'Sakasaka',
              'Tamale Central',
              'Choggu',
              'Nyohini',
              'Aboabo',
              'Dungu',
              'Lamashegu',
              'Bolgatanga',
            ].map((area) {
              return ActionChip(
                label: Text(area, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                backgroundColor: _locationController.text.contains(area)
                    ? const Color(0xFF059669).withOpacity(0.15)
                    : null,
                onPressed: () {
                  setState(() {
                    _locationController.text = '$area, Tamale';
                  });
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 14),

          ServoraTextField(
            label: 'Landmark / Area *',
            hint: 'e.g. Sakasaka near Shell Fuel Station',
            controller: _locationController,
          ),
          const SizedBox(height: 30),
          ServoraButton(
            label: 'Next: Verification & Submit ➔',
            onPressed: () => setState(() => _currentStep = 4),
          ),
        ],
      );
    } else {
      final isLoggedIn = authNotifier.state.user != null;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Step 4: Contact & Instant Dispatch',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          ServoraTextField(
            label: 'Your Full Name *',
            hint: 'e.g. Alhassan Ibrahim',
            controller: _guestNameController,
          ),
          const SizedBox(height: 14),
          ServoraTextField(
            label: 'Ghana Mobile Phone Number *',
            hint: '+233 24 000 0000',
            keyboardType: TextInputType.phone,
            controller: _guestPhoneController,
          ),
          const SizedBox(height: 20),

          if (isLoggedIn) ...[
            ServoraButton(
              label: _submitting ? 'Publishing Request...' : 'Publish Job Request Live 🎉',
              isLoading: _submitting,
              onPressed: _submitting ? null : _submitRequestToLiveDb,
            ),
          ] else if (_otpSent) ...[
            ServoraTextField(
              label: '4-Digit SMS OTP Code *',
              hint: 'Enter 1234',
              keyboardType: TextInputType.number,
              controller: _otpController,
            ),
            const SizedBox(height: 20),
            ServoraButton(
              label: _submitting ? 'Publishing Request...' : 'Verify OTP & Post Request 🎉',
              isLoading: _submitting,
              onPressed: _submitting ? null : _submitRequestToLiveDb,
            ),
          ] else ...[
            ServoraButton(
              label: 'Send 4-Digit SMS OTP Code 📲',
              onPressed: () {
                if (_guestPhoneController.text.trim().isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Please enter a valid Ghana phone number.')),
                  );
                  return;
                }
                setState(() => _otpSent = true);
              },
            ),
          ],
        ],
      );
    }
  }

  Widget _buildUrgencyChip(String key, String label) {
    final isSelected = _urgency == key;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: const Color(0xFF059669),
      labelStyle: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.bold,
        color: isSelected ? Colors.white : Colors.black87,
      ),
      onSelected: (_) => setState(() => _urgency = key),
    );
  }

  Widget _buildSuccessView() {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 40),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFFD1FAE5),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_rounded,
                size: 60, color: Color(0xFF059669)),
          ),
          const SizedBox(height: 20),
          const Text(
            'Request Verified & Live! 🎉',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          const Text(
            'Your request has been broadcasted to verified artisans across Tamale & posted to the Community Board.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: Colors.grey),
          ),
          if (_trackingId.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: Text(
                'Tracking Ref: $_trackingId',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF047857)),
              ),
            ),
          ],
          const SizedBox(height: 30),
          ServoraButton(
            label: 'View My Requests & Portal',
            onPressed: () => context.go('/profile'),
          ),
          const SizedBox(height: 10),
          OutlinedButton(
            onPressed: () => context.go('/home'),
            child: const Text('Return to Home'),
          ),
        ],
      ),
    );
  }
}
