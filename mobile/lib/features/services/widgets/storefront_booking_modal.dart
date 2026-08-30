import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../../features/auth/providers/auth_provider.dart';

class StorefrontBookingModal extends StatefulWidget {
  final Map<String, dynamic> service;
  final String businessName;
  final String businessSlug;
  final String businessPhone;
  final String businessWhatsApp;

  const StorefrontBookingModal({
    super.key,
    required this.service,
    required this.businessName,
    required this.businessSlug,
    required this.businessPhone,
    required this.businessWhatsApp,
  });

  static Future<void> show({
    required BuildContext context,
    required Map<String, dynamic> service,
    required String businessName,
    required String businessSlug,
    required String businessPhone,
    required String businessWhatsApp,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StorefrontBookingModal(
        service: service,
        businessName: businessName,
        businessSlug: businessSlug,
        businessPhone: businessPhone,
        businessWhatsApp: businessWhatsApp,
      ),
    );
  }

  @override
  State<StorefrontBookingModal> createState() => _StorefrontBookingModalState();
}

class _StorefrontBookingModalState extends State<StorefrontBookingModal> {
  DateTime? _selectedDate;
  String _preferredTimeSlot = 'Morning (8:00 AM - 12:00 PM)';
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  bool _isSubmitting = false;

  final List<String> _timeSlots = [
    'Morning (8:00 AM - 12:00 PM)',
    'Afternoon (12:00 PM - 4:00 PM)',
    'Evening (4:00 PM - 7:00 PM)',
    'Emergency / As Soon As Possible',
  ];

  @override
  void initState() {
    super.initState();
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
    _locationController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 90)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: ServoraColors.emerald600,
              onPrimary: Colors.white,
              onSurface: Color(0xFF0F172A),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _submitBooking() async {
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter your full name.')));
      return;
    }
    if (_phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter your phone number.')));
      return;
    }

    setState(() => _isSubmitting = true);

    final serviceTitle = widget.service['serviceName'] ?? widget.service['name'] ?? 'Artisan Service';
    final dateStr = _selectedDate != null
        ? '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'
        : 'Flexible / Immediate';

    final bookingSummary = '''
⚡ *SERVICE INQUIRY & BOOKING REQUEST*
🏪 *Store:* ${widget.businessName} (servora.gh/biz/@${widget.businessSlug})
🛠️ *Service:* $serviceTitle
📅 *Preferred Date:* $dateStr
⏰ *Time Slot:* $_preferredTimeSlot
📍 *Job Location:* ${_locationController.text.trim().isNotEmpty ? _locationController.text.trim() : 'At Artisan Workshop'}

👤 *Client:* ${_nameController.text.trim()}
📞 *Phone:* ${_phoneController.text.trim()}
${_notesController.text.trim().isNotEmpty ? '📝 *Job Description:* ${_notesController.text.trim()}' : ''}
''';

    try {
      await authNotifier.apiClient.post(
        '/business/leads',
        data: {
          'businessSlug': widget.businessSlug,
          'customerName': _nameController.text.trim(),
          'customerPhone': _phoneController.text.trim(),
          'notes': bookingSummary,
          'quoteAmount': widget.service['startingPrice'],
        },
      );
    } catch (_) {}

    setState(() => _isSubmitting = false);

    await WhatsAppHelper.openWhatsApp(
      phone: widget.businessWhatsApp.isNotEmpty ? widget.businessWhatsApp : widget.businessPhone,
      message: bookingSummary,
    );

    if (mounted) {
      Navigator.pop(context);
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: ServoraColors.emerald600, size: 24),
              Gap(8),
              Text('Booking Request Sent! 📅', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Text(
            'Your booking inquiry for "$serviceTitle" has been submitted to ${widget.businessName}. They will reach out to confirm scheduling and provide quotation.',
            style: const TextStyle(fontSize: 12.5, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Great, Thanks!', style: TextStyle(fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
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
    final serviceTitle = widget.service['serviceName'] ?? widget.service['name'] ?? 'Artisan Service';
    final startingPrice = widget.service['startingPrice'];
    final duration = widget.service['estimatedDuration'];

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
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
                Row(
                  children: [
                    const Icon(Icons.build_circle_rounded, color: ServoraColors.emerald600, size: 20),
                    const Gap(8),
                    Text(
                      'Book Service / Quote',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
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

          // Scrollable Form Body
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Service Summary Card
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
                        Text(serviceTitle, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold)),
                        const Gap(4),
                        Row(
                          children: [
                            if (startingPrice != null) ...[
                              Text('Starting from GH₵ $startingPrice', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                              const Text(' • ', style: TextStyle(color: Colors.grey)),
                            ],
                            if (duration != null) ...[
                              Text('Est. $duration', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  const Gap(16),

                  // Schedule Pickers
                  const Text('1. PREFERRED DATE & TIME', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 0.5)),
                  const Gap(8),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: _pickDate,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF1E293B) : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.calendar_month_rounded, size: 16, color: ServoraColors.emerald600),
                                const Gap(8),
                                Text(
                                  _selectedDate != null
                                      ? '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'
                                      : 'Select Date',
                                  style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: _selectedDate != null ? null : Colors.grey),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Gap(8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _preferredTimeSlot,
                        isExpanded: true,
                        icon: const Icon(Icons.keyboard_arrow_down_rounded, size: 18),
                        style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87),
                        dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                        items: _timeSlots.map((slot) => DropdownMenuItem(value: slot, child: Text(slot))).toList(),
                        onChanged: (val) => setState(() => _preferredTimeSlot = val ?? _preferredTimeSlot),
                      ),
                    ),
                  ),
                  const Gap(16),

                  // Client Information
                  const Text('2. CLIENT INFORMATION', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 0.5)),
                  const Gap(8),
                  _buildInput(_nameController, 'Your Full Name *', 'e.g. Fatima Alhassan', Icons.person_rounded, isDark),
                  const Gap(8),
                  _buildInput(_phoneController, 'Phone / WhatsApp Number *', 'e.g. 0551234567', Icons.phone_rounded, isDark, keyboard: TextInputType.phone),
                  const Gap(8),
                  _buildInput(_locationController, 'Service Location (Zone / Address)', 'e.g. Choggu Hilltop, near Church', Icons.location_on_rounded, isDark),
                  const Gap(8),
                  _buildInput(_notesController, 'Project Details / Special Requirements', 'Explain what needs to be done...', Icons.description_rounded, isDark, maxLines: 3),
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
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: ServoraColors.emerald600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                icon: _isSubmitting
                    ? const SizedBox.shrink()
                    : const Icon(Icons.send_rounded, size: 16),
                label: _isSubmitting
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Send Booking & Quote Request ➔', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                onPressed: _isSubmitting ? null : _submitBooking,
              ),
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
    int maxLines = 1,
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
        maxLines: maxLines,
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          prefixIcon: Icon(icon, size: 16, color: ServoraColors.emerald600),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          labelStyle: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey[700]),
          hintStyle: TextStyle(fontSize: 11, color: isDark ? Colors.white30 : Colors.grey[400]),
        ),
      ),
    );
  }
}
