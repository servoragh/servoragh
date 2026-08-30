import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../../features/auth/providers/auth_provider.dart';

class StorefrontRentalModal extends StatefulWidget {
  final Map<String, dynamic> rental;
  final String businessName;
  final String businessSlug;
  final String businessPhone;
  final String businessWhatsApp;
  final String businessAddress;

  const StorefrontRentalModal({
    super.key,
    required this.rental,
    required this.businessName,
    required this.businessSlug,
    required this.businessPhone,
    required this.businessWhatsApp,
    required this.businessAddress,
  });

  static Future<void> show({
    required BuildContext context,
    required Map<String, dynamic> rental,
    required String businessName,
    required String businessSlug,
    required String businessPhone,
    required String businessWhatsApp,
    required String businessAddress,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StorefrontRentalModal(
        rental: rental,
        businessName: businessName,
        businessSlug: businessSlug,
        businessPhone: businessPhone,
        businessWhatsApp: businessWhatsApp,
        businessAddress: businessAddress,
      ),
    );
  }

  @override
  State<StorefrontRentalModal> createState() => _StorefrontRentalModalState();
}

class _StorefrontRentalModalState extends State<StorefrontRentalModal> {
  DateTime? _startDate;
  DateTime? _endDate;
  String _fulfillment = 'PICKUP'; // 'PICKUP' or 'SITE_DELIVERY'
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _siteAddressController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _startDate = now.add(const Duration(days: 1));
    _endDate = now.add(const Duration(days: 2));

    final user = authNotifier.state.user;
    if (user != null) {
      _nameController.text = user.name;
      _phoneController.text = user.phone;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _siteAddressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  double get _dailyRate {
    final raw = widget.rental['dailyRate'];
    if (raw is num) return raw.toDouble();
    return double.tryParse(raw?.toString() ?? '0') ?? 0.0;
  }

  double get _securityDeposit {
    final raw = widget.rental['securityDeposit'];
    if (raw is num) return raw.toDouble();
    return double.tryParse(raw?.toString() ?? '0') ?? 0.0;
  }

  int get _rentalDays {
    if (_startDate == null || _endDate == null) return 1;
    final diff = _endDate!.difference(_startDate!).inDays;
    return diff <= 0 ? 1 : diff;
  }

  double get _totalRentalFee => (_dailyRate * _rentalDays);
  double get _totalDue => _totalRentalFee + _securityDeposit;

  Future<void> _pickDateRange() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 120)),
      initialDateRange: DateTimeRange(
        start: _startDate ?? now,
        end: _endDate ?? now.add(const Duration(days: 2)),
      ),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFFD97706),
              onPrimary: Colors.white,
              onSurface: Color(0xFF0F172A),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
      });
    }
  }

  Future<void> _submitRental() async {
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter your full name.')));
      return;
    }
    if (_phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter your phone number.')));
      return;
    }

    setState(() => _isSubmitting = true);

    final toolTitle = widget.rental['title'] ?? 'Tool / Equipment';
    final startStr = '${_startDate!.day}/${_startDate!.month}/${_startDate!.year}';
    final endStr = '${_endDate!.day}/${_endDate!.month}/${_endDate!.year}';

    final rentalSummary = '''
🔨 *EQUIPMENT RENTAL RESERVATION*
🏪 *Store:* ${widget.businessName} (servora.gh/biz/@${widget.businessSlug})
🚜 *Equipment:* $toolTitle
📅 *Duration:* $startStr to $endStr ($_rentalDays days)
💰 *Daily Rate:* GH₵ ${_dailyRate.toStringAsFixed(2)} / day
💵 *Rental Fee:* GH₵ ${_totalRentalFee.toStringAsFixed(2)}
🛡️ *Refundable Deposit:* GH₵ ${_securityDeposit.toStringAsFixed(2)}
💎 *Total Estimated:* GH₵ ${_totalDue.toStringAsFixed(2)}
🚚 *Logistics:* ${_fulfillment == 'SITE_DELIVERY' ? 'Site Delivery (${_siteAddressController.text.trim()})' : 'Storefront Pickup (${widget.businessAddress})'}

👤 *Renter:* ${_nameController.text.trim()}
📞 *Phone:* ${_phoneController.text.trim()}
${_notesController.text.trim().isNotEmpty ? '📝 *Notes:* ${_notesController.text.trim()}' : ''}
''';

    try {
      await authNotifier.apiClient.post(
        '/business/leads',
        data: {
          'businessSlug': widget.businessSlug,
          'customerName': _nameController.text.trim(),
          'customerPhone': _phoneController.text.trim(),
          'notes': rentalSummary,
          'quoteAmount': _totalDue,
        },
      );
    } catch (_) {}

    setState(() => _isSubmitting = false);

    await WhatsAppHelper.openWhatsApp(
      phone: widget.businessWhatsApp.isNotEmpty ? widget.businessWhatsApp : widget.businessPhone,
      message: rentalSummary,
    );

    if (mounted) {
      Navigator.pop(context);
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: Color(0xFFD97706), size: 24),
              Gap(8),
              Text('Rental Reserved! 🚜', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Text(
            'Your reservation inquiry for "$toolTitle" for $_rentalDays days has been sent to ${widget.businessName}. They will verify equipment availability and arrange dispatch.',
            style: const TextStyle(fontSize: 12.5, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final keyboardPadding = MediaQuery.of(context).viewInsets.bottom;
    final toolTitle = widget.rental['title'] ?? 'Tool / Equipment Rental';
    final operatorIncluded = widget.rental['operatorIncluded'] == true;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      margin: EdgeInsets.only(bottom: keyboardPadding),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header Bar
          Container(
            padding: const EdgeInsets.fromLTRB(18, 14, 14, 12),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0))),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.handyman_rounded, color: Color(0xFFD97706), size: 20),
                    Gap(8),
                    Text(
                      'Equipment Rental Booking',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20),
                  onPressed: () => Navigator.pop(context),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ),

          // Body
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Equipment Card
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(toolTitle, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold)),
                        const Gap(4),
                        Row(
                          children: [
                            Text('GH₵ ${_dailyRate.toStringAsFixed(2)} / day', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFFD97706))),
                            if (_securityDeposit > 0) ...[
                              const Text(' • ', style: TextStyle(color: Colors.grey)),
                              Text('Deposit: GH₵ ${_securityDeposit.toStringAsFixed(2)}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                            ],
                          ],
                        ),
                        if (operatorIncluded) ...[
                          const Gap(6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD97706).withOpacity(0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text('👷 Certified Operator Included', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const Gap(16),

                  // Dates Picker
                  const Text('1. RENTAL PERIOD', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 0.5)),
                  const Gap(8),
                  GestureDetector(
                    onTap: _pickDateRange,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.date_range_rounded, size: 16, color: Color(0xFFD97706)),
                              const Gap(8),
                              Text(
                                '${_startDate!.day}/${_startDate!.month} — ${_endDate!.day}/${_endDate!.month}/${_endDate!.year}',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD97706).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '$_rentalDays Days',
                              style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFFD97706)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Gap(16),

                  // Fulfillment Option
                  const Text('2. PICKUP OR DISPATCH TO SITE', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 0.5)),
                  const Gap(8),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _fulfillment = 'PICKUP'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                            decoration: BoxDecoration(
                              color: _fulfillment == 'PICKUP' ? const Color(0xFFD97706).withOpacity(0.12) : (isDark ? const Color(0xFF1E293B) : Colors.white),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: _fulfillment == 'PICKUP' ? const Color(0xFFD97706) : (isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
                              ),
                            ),
                            child: const Text('Store Pickup (Free)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                      const Gap(8),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _fulfillment = 'SITE_DELIVERY'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                            decoration: BoxDecoration(
                              color: _fulfillment == 'SITE_DELIVERY' ? const Color(0xFFD97706).withOpacity(0.12) : (isDark ? const Color(0xFF1E293B) : Colors.white),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: _fulfillment == 'SITE_DELIVERY' ? const Color(0xFFD97706) : (isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
                              ),
                            ),
                            child: const Text('Site Delivery & Haulage', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Gap(16),

                  // Client Information
                  const Text('3. RENTER DETAILS', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 0.5)),
                  const Gap(8),
                  _buildInput(_nameController, 'Renter Full Name *', 'e.g. Ibrahim Musah', Icons.person_rounded, isDark),
                  const Gap(8),
                  _buildInput(_phoneController, 'Phone / WhatsApp Number *', 'e.g. 0244123456', Icons.phone_rounded, isDark, keyboard: TextInputType.phone),
                  if (_fulfillment == 'SITE_DELIVERY') ...[
                    const Gap(8),
                    _buildInput(_siteAddressController, 'Site / Construction Location *', 'e.g. Nyohini Project Site', Icons.location_on_rounded, isDark),
                  ],
                  const Gap(8),
                  _buildInput(_notesController, 'Special Notes / Project Scope (Optional)', 'Any specific tool accessories needed...', Icons.notes_rounded, isDark),
                ],
              ),
            ),
          ),

          // Bottom Action
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
              border: Border(top: BorderSide(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0))),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('ESTIMATED RENTAL TOTAL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: isDark ? Colors.white60 : Colors.grey[600], letterSpacing: 0.5)),
                        Text('GH₵ ${_totalDue.toStringAsFixed(2)}', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(0xFFD97706))),
                      ],
                    ),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFD97706),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      icon: _isSubmitting
                          ? const SizedBox.shrink()
                          : const Icon(Icons.handyman_rounded, size: 15),
                      label: _isSubmitting
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Reserve on WhatsApp ➔', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                      onPressed: _isSubmitting ? null : _submitRental,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInput(
    TextEditingController controller,
    String label,
    String hint,
    IconData icon,
    bool isDark, {
    TextInputType keyboard = TextInputType.text,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboard,
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          prefixIcon: Icon(icon, size: 16, color: const Color(0xFFD97706)),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          labelStyle: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey[700]),
          hintStyle: TextStyle(fontSize: 11, color: isDark ? Colors.white30 : Colors.grey[400]),
        ),
      ),
    );
  }
}
