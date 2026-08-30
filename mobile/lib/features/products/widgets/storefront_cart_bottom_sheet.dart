import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../core/utils/whatsapp_helper.dart';
import '../../../features/auth/providers/auth_provider.dart';

class StorefrontCartItem {
  final String id;
  final String title;
  final double price;
  final String? image;
  final String? variant;
  int quantity;

  StorefrontCartItem({
    required this.id,
    required this.title,
    required this.price,
    this.image,
    this.variant,
    this.quantity = 1,
  });

  double get totalPrice => price * quantity;
}

class StorefrontCartBottomSheet extends StatefulWidget {
  final String businessName;
  final String businessSlug;
  final String businessPhone;
  final String businessWhatsApp;
  final String businessAddress;
  final List<StorefrontCartItem> cartItems;
  final Function(List<StorefrontCartItem>) onCartUpdated;
  final VoidCallback onOrderPlaced;

  const StorefrontCartBottomSheet({
    super.key,
    required this.businessName,
    required this.businessSlug,
    required this.businessPhone,
    required this.businessWhatsApp,
    required this.businessAddress,
    required this.cartItems,
    required this.onCartUpdated,
    required this.onOrderPlaced,
  });

  static Future<void> show({
    required BuildContext context,
    required String businessName,
    required String businessSlug,
    required String businessPhone,
    required String businessWhatsApp,
    required String businessAddress,
    required List<StorefrontCartItem> cartItems,
    required Function(List<StorefrontCartItem>) onCartUpdated,
    required VoidCallback onOrderPlaced,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StorefrontCartBottomSheet(
        businessName: businessName,
        businessSlug: businessSlug,
        businessPhone: businessPhone,
        businessWhatsApp: businessWhatsApp,
        businessAddress: businessAddress,
        cartItems: cartItems,
        onCartUpdated: onCartUpdated,
        onOrderPlaced: onOrderPlaced,
      ),
    );
  }

  @override
  State<StorefrontCartBottomSheet> createState() => _StorefrontCartBottomSheetState();
}

class _StorefrontCartBottomSheetState extends State<StorefrontCartBottomSheet> {
  late List<StorefrontCartItem> _items;
  bool _isCheckoutStep = false;
  bool _isSubmitting = false;

  // Checkout Fields
  String _deliveryType = 'DELIVERY'; // 'DELIVERY' or 'PICKUP'
  String _paymentMethod = 'MOMO_ESCROW'; // 'MOMO_ESCROW', 'CARD', 'CASH'
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();

  static const double _deliveryFee = 20.0;

  @override
  void initState() {
    super.initState();
    _items = List.from(widget.cartItems);
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
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  double get _subtotal => _items.fold(0.0, (sum, item) => sum + item.totalPrice);
  double get _effectiveDeliveryFee => _deliveryType == 'DELIVERY' ? _deliveryFee : 0.0;
  double get _grandTotal => _subtotal + _effectiveDeliveryFee;

  void _updateQuantity(int index, int delta) {
    setState(() {
      final newQty = _items[index].quantity + delta;
      if (newQty <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = newQty;
      }
    });
    widget.onCartUpdated(_items);
  }

  void _removeItem(int index) {
    setState(() {
      _items.removeAt(index);
    });
    widget.onCartUpdated(_items);
  }

  Future<void> _placeOrder() async {
    if (_items.isEmpty) return;

    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your full name.')),
      );
      return;
    }

    if (_phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your phone number.')),
      );
      return;
    }

    if (_deliveryType == 'DELIVERY' && _addressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your delivery street / area address.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final orderItemsText = _items.map((item) {
      final variantStr = item.variant != null ? ' (${item.variant})' : '';
      return '• ${item.quantity}x ${item.title}$variantStr — GH₵ ${item.totalPrice.toStringAsFixed(2)}';
    }).join('\n');

    final orderSummary = '''
🛍️ *NEW ORDER via Servora Storefront*
🏪 *Store:* ${widget.businessName} (servora.gh/biz/@${widget.businessSlug})

📦 *Items:*
$orderItemsText

💰 *Subtotal:* GH₵ ${_subtotal.toStringAsFixed(2)}
🚚 *Delivery Method:* ${_deliveryType == 'DELIVERY' ? 'Local Delivery (+GH₵ $_deliveryFee)' : 'Store Pickup (Free)'}
💵 *Grand Total:* GH₵ ${_grandTotal.toStringAsFixed(2)}

👤 *Customer:* ${_nameController.text.trim()}
📞 *Phone:* ${_phoneController.text.trim()}
${_deliveryType == 'DELIVERY' ? '📍 *Delivery Address:* ${_addressController.text.trim()}' : '🏬 *Pickup at:* ${widget.businessAddress}'}
💳 *Payment:* ${_paymentMethod == 'MOMO_ESCROW' ? 'Mobile Money (Escrow Protected)' : _paymentMethod == 'CARD' ? 'Card Payment' : 'Cash on Delivery/Pickup'}
${_notesController.text.trim().isNotEmpty ? '📝 *Notes:* ${_notesController.text.trim()}' : ''}
''';

    // Dispatch to live backend API leads endpoint
    try {
      await authNotifier.apiClient.post(
        '/business/leads',
        data: {
          'businessSlug': widget.businessSlug,
          'customerName': _nameController.text.trim(),
          'customerPhone': _phoneController.text.trim(),
          'notes': orderSummary,
          'quoteAmount': _grandTotal,
        },
      );
    } catch (_) {}

    setState(() => _isSubmitting = false);

    // Open WhatsApp with instant order dispatch
    await WhatsAppHelper.openWhatsApp(
      phone: widget.businessWhatsApp.isNotEmpty ? widget.businessWhatsApp : widget.businessPhone,
      message: orderSummary,
    );

    widget.onOrderPlaced();

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
              Text('Order Dispatched! 🎉', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Your order of ${_items.length} items (GH₵ ${_grandTotal.toStringAsFixed(2)}) has been submitted to ${widget.businessName}.',
                style: const TextStyle(fontSize: 12.5, height: 1.4),
              ),
              const Gap(10),
              const Text(
                'The merchant will review and contact you via phone/WhatsApp to confirm dispatch.',
                style: TextStyle(fontSize: 11.5, color: Colors.grey),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
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
                Row(
                  children: [
                    const Icon(Icons.shopping_bag_rounded, color: ServoraColors.emerald600, size: 20),
                    const Gap(8),
                    Text(
                      _isCheckoutStep ? 'Secure Checkout' : 'Your Shopping Bag (${_items.length})',
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

          // Content Area
          Flexible(
            child: _items.isEmpty
                ? const Padding(
                    padding: EdgeInsets.symmetric(vertical: 48, horizontal: 24),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.shopping_bag_outlined, size: 54, color: Colors.grey),
                          Gap(12),
                          Text('Your bag is empty', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                          Gap(4),
                          Text('Add items from this digital storefront to proceed.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    physics: const BouncingScrollPhysics(),
                    child: _isCheckoutStep ? _buildCheckoutView(isDark) : _buildCartItemsView(isDark),
                  ),
          ),

          // Bottom Action Summary Bar
          if (_items.isNotEmpty)
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
                          Text('TOTAL AMOUNT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: isDark ? Colors.white60 : Colors.grey[600], letterSpacing: 0.5)),
                          Text('GH₵ ${_grandTotal.toStringAsFixed(2)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                        ],
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ServoraColors.emerald600,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                        onPressed: _isSubmitting
                            ? null
                            : () {
                                if (!_isCheckoutStep) {
                                  setState(() => _isCheckoutStep = true);
                                } else {
                                  _placeOrder();
                                }
                              },
                        child: _isSubmitting
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : Text(
                                _isCheckoutStep ? 'Confirm & Order ➔' : 'Proceed to Checkout ➔',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                      ),
                    ],
                  ),
                  if (_isCheckoutStep) ...[
                    const Gap(6),
                    GestureDetector(
                      onTap: () => setState(() => _isCheckoutStep = false),
                      child: const Text('← Edit items in bag', style: TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCartItemsView(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _items.length,
          separatorBuilder: (_, __) => const Divider(height: 16),
          itemBuilder: (context, index) {
            final item = _items[index];
            return Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: SizedBox(
                    width: 58,
                    height: 58,
                    child: item.image != null && item.image!.isNotEmpty
                        ? CachedNetworkImage(imageUrl: item.image!, fit: BoxFit.cover)
                        : Container(color: isDark ? Colors.white12 : Colors.grey[200], child: const Icon(Icons.inventory_2_rounded, size: 24, color: Colors.grey)),
                  ),
                ),
                const Gap(12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.title, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                      if (item.variant != null) ...[
                        const Gap(2),
                        Text(item.variant!, style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                      ],
                      const Gap(4),
                      Text('GH₵ ${item.price.toStringAsFixed(2)}', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                    ],
                  ),
                ),
                // Stepper & Delete
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_rounded, size: 16),
                            onPressed: () => _updateQuantity(index, -1),
                            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                            padding: EdgeInsets.zero,
                          ),
                          Text('${item.quantity}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          IconButton(
                            icon: const Icon(Icons.add_rounded, size: 16),
                            onPressed: () => _updateQuantity(index, 1),
                            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                            padding: EdgeInsets.zero,
                          ),
                        ],
                      ),
                    ),
                    const Gap(6),
                    IconButton(
                      icon: const Icon(Icons.delete_outline_rounded, size: 18, color: Colors.redAccent),
                      onPressed: () => _removeItem(index),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 24, minHeight: 24),
                    ),
                  ],
                ),
              ],
            );
          },
        ),
        const Gap(16),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B).withOpacity(0.5) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Subtotal', style: TextStyle(fontSize: 12, color: isDark ? Colors.white60 : Colors.grey[700])),
                  Text('GH₵ ${_subtotal.toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
              const Gap(6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Escrow Buyer Protection', style: TextStyle(fontSize: 12, color: isDark ? Colors.white60 : Colors.grey[700])),
                  const Text('FREE 🛡️', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCheckoutView(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Delivery Method Selector
        const Text('1. FULFILLMENT METHOD', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 0.5)),
        const Gap(8),
        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _deliveryType = 'DELIVERY'),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                  decoration: BoxDecoration(
                    color: _deliveryType == 'DELIVERY' ? ServoraColors.emerald600.withOpacity(0.12) : (isDark ? const Color(0xFF1E293B) : Colors.white),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _deliveryType == 'DELIVERY' ? ServoraColors.emerald600 : (isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
                      width: _deliveryType == 'DELIVERY' ? 1.5 : 1,
                    ),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.local_shipping_rounded, size: 14, color: ServoraColors.emerald600),
                          Gap(4),
                          Text('Local Delivery', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Gap(2),
                      Text('+GH₵ 20.00 standard fee', style: TextStyle(fontSize: 9.5, color: Colors.grey)),
                    ],
                  ),
                ),
              ),
            ),
            const Gap(10),
            Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _deliveryType = 'PICKUP'),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                  decoration: BoxDecoration(
                    color: _deliveryType == 'PICKUP' ? ServoraColors.emerald600.withOpacity(0.12) : (isDark ? const Color(0xFF1E293B) : Colors.white),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _deliveryType == 'PICKUP' ? ServoraColors.emerald600 : (isDark ? ServoraColors.darkCardBorder : const Color(0xFFCBD5E1)),
                      width: _deliveryType == 'PICKUP' ? 1.5 : 1,
                    ),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.storefront_rounded, size: 14, color: ServoraColors.emerald600),
                          Gap(4),
                          Text('Store Pickup', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Gap(2),
                      Text('Free from shop address', style: TextStyle(fontSize: 9.5, color: Colors.grey)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        const Gap(16),

        // Customer Details
        const Text('2. YOUR CONTACT INFORMATION', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 0.5)),
        const Gap(8),
        _buildTextField(_nameController, 'Full Name *', 'e.g. Kwame Mensah', Icons.person_rounded, isDark),
        const Gap(8),
        _buildTextField(_phoneController, 'Phone / WhatsApp *', 'e.g. 0244123456', Icons.phone_rounded, isDark, keyboard: TextInputType.phone),
        if (_deliveryType == 'DELIVERY') ...[
          const Gap(8),
          _buildTextField(_addressController, 'Delivery Address & Landmark *', 'e.g. Sakasaka, near Regional Hospital', Icons.location_on_rounded, isDark),
        ],
        const Gap(8),
        _buildTextField(_notesController, 'Special Instructions / Notes (Optional)', 'e.g. Deliver before 4 PM', Icons.notes_rounded, isDark),
        const Gap(16),

        // Payment Method Selector
        const Text('3. PAYMENT METHOD', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 0.5)),
        const Gap(8),
        _buildPaymentOption('MOMO_ESCROW', 'MTN / Telecel / AT MoMo (Escrow Protected)', 'Funds held safely until you confirm delivery 🛡️', Icons.account_balance_wallet_rounded, isDark),
        const Gap(6),
        _buildPaymentOption('CARD', 'Debit / Credit Card', 'Mastercard, Visa online payment', Icons.credit_card_rounded, isDark),
        const Gap(6),
        _buildPaymentOption('CASH', 'Cash on Delivery / Pickup', 'Pay merchant directly upon receipt', Icons.payments_rounded, isDark),
      ],
    );
  }

  Widget _buildPaymentOption(String id, String title, String subtitle, IconData icon, bool isDark) {
    final isSel = _paymentMethod == id;
    return GestureDetector(
      onTap: () => setState(() => _paymentMethod = id),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isSel ? ServoraColors.emerald600.withOpacity(0.08) : (isDark ? const Color(0xFF1E293B) : Colors.white),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSel ? ServoraColors.emerald600 : (isDark ? ServoraColors.darkCardBorder : const Color(0xFFE2E8F0)),
            width: isSel ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: isSel ? ServoraColors.emerald600 : Colors.grey),
            const Gap(10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: isSel ? ServoraColors.emerald600 : null)),
                  Text(subtitle, style: const TextStyle(fontSize: 9.5, color: Colors.grey)),
                ],
              ),
            ),
            if (isSel) const Icon(Icons.check_circle_rounded, size: 16, color: ServoraColors.emerald600),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(
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
