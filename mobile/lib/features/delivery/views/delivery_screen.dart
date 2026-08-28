import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/servora_button.dart';
import '../../../shared/widgets/servora_text_field.dart';
import '../../../shared/widgets/servora_dropdown_sheet.dart';

class DeliveryScreen extends StatefulWidget {
  const DeliveryScreen({super.key});

  @override
  State<DeliveryScreen> createState() => _DeliveryScreenState();
}

class _DeliveryScreenState extends State<DeliveryScreen> {
  String _vehicleType = 'Motorcycle Express 🛵';
  final TextEditingController _pickupController = TextEditingController();
  final TextEditingController _dropoffController = TextEditingController();
  final TextEditingController _packageDescController = TextEditingController();
  bool _calculating = false;
  double? _estimatedPrice;

  final List<String> _vehicles = [
    'Motorcycle Express 🛵',
    'Tricycle Aboboyaa 🛺',
    'Kia Truck Heavy Haulage 🚚',
  ];

  Future<void> _selectVehicle() async {
    final result = await ServoraBottomSheetPicker.show(
      context: context,
      title: 'Select Delivery Vehicle 🚚',
      items: _vehicles,
      selectedValue: _vehicleType,
      searchHint: 'Choose motorcycle, aboboyaa, truck...',
      titleIcon: Icons.local_shipping_rounded,
    );

    if (result != null && mounted) {
      setState(() => _vehicleType = result);
    }
  }

  void _calculatePrice() {
    if (_pickupController.text.trim().isEmpty || _dropoffController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter pickup and drop-off locations.')),
      );
      return;
    }
    setState(() => _calculating = true);
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        setState(() {
          _calculating = false;
          if (_vehicleType.contains('Motorcycle')) {
            _estimatedPrice = 25.0;
          } else if (_vehicleType.contains('Tricycle')) {
            _estimatedPrice = 60.0;
          } else {
            _estimatedPrice = 250.0;
          }
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Omnichannel Delivery & Haulage 🚚'),
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
        actions: [
          IconButton(
            icon: const Icon(Icons.history_rounded),
            onPressed: () => context.push('/activity'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F766E), Color(0xFF0D9488)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Instant Local Parcel & Heavy Goods Haulage',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Express riders & trucks ready across Tamale, Sakasaka, Bolgatanga & Wa.',
                    style: TextStyle(fontSize: 12, color: Colors.white70),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Vehicle Selector
            const Text('Select Delivery Mode *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            GestureDetector(
              onTap: _selectVehicle,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF111827) : const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF059669).withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(_vehicleType, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                    const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFF059669)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Form Inputs
            ServoraTextField(
              label: 'Pickup Location / Landmark *',
              hint: 'e.g. Sakasaka Shell Station, Tamale',
              controller: _pickupController,
            ),
            const SizedBox(height: 14),
            ServoraTextField(
              label: 'Drop-off Destination *',
              hint: 'e.g. Nyohini Market, Tamale',
              controller: _dropoffController,
            ),
            const SizedBox(height: 14),
            ServoraTextField(
              label: 'Package Description / Weight',
              hint: 'e.g. 2 bags of Fugu smocks (approx 15kg)',
              controller: _packageDescController,
            ),
            const SizedBox(height: 20),

            ServoraButton(
              label: _calculating ? 'Calculating Quote...' : 'Calculate Delivery Estimate ⚡',
              isLoading: _calculating,
              onPressed: _calculatePrice,
            ),

            if (_estimatedPrice != null) ...[
              const SizedBox(height: 20),
              ServoraCard(
                backgroundColor: const Color(0xFFD1FAE5),
                child: Column(
                  children: [
                    const Text('ESTIMATED FARE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                    const SizedBox(height: 4),
                    Text(
                      'GH₵ ${_estimatedPrice!.toStringAsFixed(2)}',
                      style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
                    ),
                    const SizedBox(height: 6),
                    const Text('Instant driver dispatch within 5 mins', style: TextStyle(fontSize: 11, color: Colors.black87)),
                    const SizedBox(height: 14),
                    ServoraButton(
                      label: 'Confirm & Dispatch Rider Now 🚀',
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Delivery rider dispatched! Tracking link sent to phone.')),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
