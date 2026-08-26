import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/constants.dart';
import '../../../core/utils/location_helper.dart';
import '../../../shared/widgets/servora_button.dart';
import '../../../shared/widgets/servora_text_field.dart';
import '../../../shared/widgets/servora_dropdown_sheet.dart';

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
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _guestNameController = TextEditingController();
  final TextEditingController _guestPhoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();

  String _urgency = 'ASAP';
  bool _fetchingGps = false;
  bool _otpSent = false;
  bool _requestComplete = false;

  Future<void> _openCategoryPicker() async {
    final catNames = ServoraConstants.categories.map((c) => c['name']!).toList();
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Post Service Request (Step $_currentStep/4)'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () {
            if (_currentStep > 1) {
              setState(() => _currentStep -= 1);
            } else {
              context.pop();
            }
          },
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: _requestComplete ? _buildSuccessView() : _buildStepContent(),
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
              _buildUrgencyChip('ASAP', 'Emergency / ASAP ⚡'),
              const SizedBox(width: 8),
              _buildUrgencyChip('TODAY', 'Today'),
              const SizedBox(width: 8),
              _buildUrgencyChip('SCHEDULED', 'Flexible'),
            ],
          ),
          const SizedBox(height: 30),
          ServoraButton(
            label: 'Next: Location Details ➔',
            onPressed: () => setState(() => _currentStep = 3),
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
          ServoraButton(
            label: _fetchingGps
                ? 'Locking GPS Coordinates...'
                : 'Use Current Device GPS 📍',
            variant: ServoraButtonVariant.outline,
            isLoading: _fetchingGps,
            onPressed: () async {
              setState(() => _fetchingGps = true);
              final pos = await LocationHelper.getCurrentPosition();
              setState(() {
                _fetchingGps = false;
                if (pos != null) {
                  _locationController.text =
                      'Exact GPS (${pos.latitude.toStringAsFixed(4)}, ${pos.longitude.toStringAsFixed(4)}) Sakasaka, Tamale';
                } else {
                  _locationController.text = 'Sakasaka, Tamale';
                }
              });
            },
          ),
          const SizedBox(height: 16),
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
          if (_otpSent) ...[
            ServoraTextField(
              label: '4-Digit SMS OTP Code *',
              hint: 'Enter 1234',
              keyboardType: TextInputType.number,
              controller: _otpController,
            ),
            const SizedBox(height: 20),
            ServoraButton(
              label: 'Verify OTP & Post Request 🎉',
              onPressed: () {
                setState(() => _requestComplete = true);
              },
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
            'Your request has been broadcasted to verified artisans across Sakasaka & Northern Ghana.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: Colors.grey),
          ),
          const SizedBox(height: 30),
          ServoraButton(
            label: 'Return to Home',
            onPressed: () => context.go('/home'),
          ),
        ],
      ),
    );
  }
}
