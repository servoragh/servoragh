import 'package:flutter/material.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/servora_button.dart';
import '../../../shared/widgets/servora_text_field.dart';
import '../../../shared/widgets/status_badge.dart';

class EscrowDealScreen extends StatefulWidget {
  const EscrowDealScreen({super.key});

  @override
  State<EscrowDealScreen> createState() => _EscrowDealScreenState();
}

class _EscrowDealScreenState extends State<EscrowDealScreen> {
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _sellerPhoneController = TextEditingController();
  final TextEditingController _itemController = TextEditingController();

  bool _created = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Safe MoMo Escrow Protection 🛡️'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Escrow Explanation Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.shield_rounded, color: Color(0xFFB45309), size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Money is held safely in Servora MoMo Escrow until you inspect and accept your package or repair.',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFB45309), height: 1.3),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            if (_created) ...[
              ServoraCard(
                child: Column(
                  children: [
                    StatusBadge.safeEscrow(),
                    const SizedBox(height: 12),
                    const Text(
                      'GH₵ 450.00 Locked in Escrow',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Seller: Kwame Electrical & Solar Tamale',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    const SizedBox(height: 20),
                    ServoraButton(
                      label: 'Confirm Package Received & Release Funds 💸',
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Funds released to Kwame Electrical MoMo wallet!')),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ] else ...[
              const Text('Create New Escrow Protection', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              ServoraTextField(
                label: 'Deal / Item Name *',
                hint: 'e.g. Solar Inverter Installation',
                controller: _itemController,
              ),
              const SizedBox(height: 14),
              ServoraTextField(
                label: 'Escrow Amount (GH₵) *',
                hint: '450',
                keyboardType: TextInputType.number,
                controller: _amountController,
              ),
              const SizedBox(height: 14),
              ServoraTextField(
                label: 'Seller / Business Mobile Phone *',
                hint: '+233 24 488 9900',
                keyboardType: TextInputType.phone,
                controller: _sellerPhoneController,
              ),
              const SizedBox(height: 24),
              ServoraButton(
                label: 'Deposit Funds to Safe MoMo Escrow 🛡️',
                onPressed: () {
                  if (_amountController.text.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please enter an escrow amount.')),
                    );
                    return;
                  }
                  setState(() => _created = true);
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}
