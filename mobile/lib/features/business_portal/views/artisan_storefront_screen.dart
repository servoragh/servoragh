import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/servora_button.dart';
import '../../../core/utils/whatsapp_helper.dart';

class ArtisanStorefrontScreen extends StatefulWidget {
  final String slug;

  const ArtisanStorefrontScreen({super.key, required this.slug});

  @override
  State<ArtisanStorefrontScreen> createState() => _ArtisanStorefrontScreenState();
}

class _ArtisanStorefrontScreenState extends State<ArtisanStorefrontScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showShareQrSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Digital Business Storefront QR 🔗',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 16),
              QrImageView(
                data: 'https://servora.gh/biz/${widget.slug}',
                version: QrVersions.auto,
                size: 180.0,
              ),
              const SizedBox(height: 16),
              ServoraButton(
                label: 'Share Storefront on WhatsApp 📱',
                variant: ServoraButtonVariant.whatsapp,
                onPressed: () {
                  WhatsAppHelper.openWhatsApp(
                    phone: '+233244889900',
                    message: 'Check out Kwame Electrical & Solar Tamale storefront on Servora.gh: https://servora.gh/biz/${widget.slug}',
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Cover Banner & Profile App Bar
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            actions: [
              IconButton(
                icon: const Icon(Icons.qr_code_2_rounded, color: Colors.white),
                onPressed: _showShareQrSheet,
              ),
              IconButton(
                icon: const Icon(Icons.share_rounded, color: Colors.white),
                onPressed: _showShareQrSheet,
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF059669), Color(0xFF047857)],
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircleAvatar(
                        radius: 36,
                        backgroundColor: Colors.white,
                        child: Text(
                          widget.slug[0].toUpperCase(),
                          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Kwame Electrical & Solar Tamale',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Sakasaka, Tamale • Northern Ghana',
                        style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Business Metadata Header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      StatusBadge.verifiedGhanaCard(),
                      const SizedBox(width: 8),
                      StatusBadge.safeEscrow(),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Certified master electrician & solar installer with 8+ years experience servicing Sakasaka, Nyohini, Choggu, and all Northern Ghana.',
                    style: TextStyle(fontSize: 13, height: 1.4),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildMetricItem('Rating', '4.9 ★ (38)'),
                      _buildMetricItem('Completed', '83 Jobs'),
                      _buildMetricItem('Response', '15 mins'),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Tabbed Catalog Bar
                  TabBar(
                    controller: _tabController,
                    labelColor: const Color(0xFF059669),
                    unselectedLabelColor: isDark ? Colors.grey[400] : Colors.grey[600],
                    indicatorColor: const Color(0xFF059669),
                    tabs: const [
                      Tab(text: 'Services'),
                      Tab(text: 'Rentals'),
                      Tab(text: 'Products'),
                      Tab(text: 'Reviews'),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Tabbed Content Body
          SliverFillRemaining(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildServicesTab(),
                _buildRentalsTab(),
                _buildProductsTab(),
                _buildReviewsTab(),
              ],
            ),
          ),
        ],
      ),

      // Sticky Bottom Action Bar
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF111827) : Colors.white,
          border: Border(
            top: BorderSide(
              color: isDark ? const Color(0xFF1F2937) : const Color(0xFFE2E8F0),
            ),
          ),
        ),
        child: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.phone_rounded, color: Color(0xFF059669)),
              onPressed: () => WhatsAppHelper.makePhoneCall('+233244889900'),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ServoraButton(
                label: 'WhatsApp Inquiry 💬',
                variant: ServoraButtonVariant.whatsapp,
                onPressed: () {
                  WhatsAppHelper.openWhatsApp(
                    phone: '+233244889900',
                    message: 'Hello Kwame Electrical, I am contacting you via Servora.gh app.',
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
      ],
    );
  }

  Widget _buildServicesTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        ListTile(
          leading: Text('⚡', style: TextStyle(fontSize: 24)),
          title: Text('3-Phase Solar Inverter Wiring', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          subtitle: Text('Starting from GH₵ 350 • Warranty Included'),
        ),
        Divider(),
        ListTile(
          leading: Text('🔌', style: TextStyle(fontSize: 24)),
          title: Text('Commercial Workshop Electrical Maintenance', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          subtitle: Text('Starting from GH₵ 200'),
        ),
      ],
    );
  }

  Widget _buildRentalsTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        ListTile(
          leading: Text('🚜', style: TextStyle(fontSize: 24)),
          title: Text('DeWalt Heavy Duty Power Drill Kit', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          subtitle: Text('GH₵ 150 / day • Sakasaka Workshop'),
        ),
      ],
    );
  }

  Widget _buildProductsTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        ListTile(
          leading: Text('🔋', style: TextStyle(fontSize: 24)),
          title: Text('200Ah Deep Cycle Gel Solar Battery', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          subtitle: Text('GH₵ 2,400 • In Stock'),
        ),
      ],
    );
  }

  Widget _buildReviewsTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        ListTile(
          leading: Icon(Icons.star_rounded, color: Colors.amber),
          title: Text('Alhassan Fuseini (5.0 ★)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          subtitle: Text('Kwame installed our 3-phase solar inverter in Sakasaka. Excellent work, fast and reliable!'),
        ),
      ],
    );
  }
}
