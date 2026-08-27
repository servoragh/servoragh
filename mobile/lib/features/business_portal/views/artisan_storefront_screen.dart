import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/status_badge.dart';
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
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverAppBar(
              expandedHeight: 220,
              pinned: true,
              leading: IconButton(
                icon: const CircleAvatar(
                  backgroundColor: Colors.black54,
                  child: Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                ),
                onPressed: () => context.pop(),
              ),
              flexibleSpace: FlexibleSpaceBar(
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [ServoraColors.emerald800, ServoraColors.emerald600],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: const Center(
                        child: Icon(Icons.storefront_rounded, size: 80, color: Colors.white24),
                      ),
                    ),
                    Positioned(
                      left: 20,
                      bottom: 20,
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 36,
                            backgroundColor: Colors.white,
                            child: CircleAvatar(
                              radius: 34,
                              backgroundColor: ServoraColors.emerald600.withOpacity(0.2),
                              child: const Text('K', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: ServoraColors.emerald600)),
                            ),
                          ),
                          const Gap(14),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text(
                                'Kwame Electrical & Solar',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
                              ),
                              const Gap(4),
                              Row(
                                children: [
                                  const Icon(Icons.location_on_rounded, size: 14, color: Colors.amber),
                                  const Gap(4),
                                  const Text(
                                    'Sakasaka, Tamale • Open 8am-6pm',
                                    style: TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const StatusBadge(
                          label: 'GHANA CARD VERIFIED',
                          backgroundColor: Color(0xFFD1FAE5),
                          textColor: Color(0xFF047857),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, color: Colors.amber, size: 18),
                            const Gap(4),
                            const Text('4.9 (48 Reviews)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ],
                    ),
                    const Gap(16),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF25D366),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            icon: const Icon(Icons.chat_rounded, size: 18),
                            label: const Text('WhatsApp Direct', style: TextStyle(fontWeight: FontWeight.bold)),
                            onPressed: () {
                              WhatsAppHelper.openWhatsApp(
                                phone: '+233244889900',
                                message: 'Hello Kwame Electrical, I viewed your storefront on Servora.gh app.',
                              );
                            },
                          ),
                        ),
                        const Gap(10),
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ServoraColors.emerald600,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            icon: const Icon(Icons.request_quote_rounded, size: 18),
                            label: const Text('Request Quote', style: TextStyle(fontWeight: FontWeight.bold)),
                            onPressed: () => context.push('/services/request'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            SliverPersistentHeader(
              pinned: true,
              delegate: _SliverTabBarDelegate(
                TabBar(
                  controller: _tabController,
                  indicatorColor: ServoraColors.emerald600,
                  labelColor: ServoraColors.emerald600,
                  unselectedLabelColor: isDark ? Colors.grey[400] : Colors.grey[600],
                  labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  tabs: const [
                    Tab(text: 'Services (6)'),
                    Tab(text: 'Products (4)'),
                    Tab(text: 'Reviews (48)'),
                  ],
                ),
              ),
            ),
          ];
        },
        body: TabBarView(
          controller: _tabController,
          children: [
            // Services Tab
            ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: 3,
              separatorBuilder: (_, __) => const Gap(12),
              itemBuilder: (context, index) {
                final titles = ['Solar Inverter Wiring & Installation', '3-Phase Circuit Breaker Maintenance', 'Generator Servicing & Gas Refill'];
                return ServoraCard(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(titles[index], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                          const Gap(4),
                          const Text('From GH₵ 250 • Same-day dispatch', style: TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: ServoraColors.emerald600, foregroundColor: Colors.white),
                        onPressed: () => context.push('/services/request'),
                        child: const Text('Book', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                );
              },
            ),

            // Products Tab
            ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: 2,
              separatorBuilder: (_, __) => const Gap(12),
              itemBuilder: (context, index) {
                final titles = ['300W Monocrystalline Solar Panel', 'DeWalt Power Drill Machine'];
                final prices = ['GH₵ 2,400.00', 'GH₵ 1,200.00'];
                return ServoraCard(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(titles[index], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                          const Gap(4),
                          Text(prices[index], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: ServoraColors.emerald600)),
                        ],
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: ServoraColors.emerald600, foregroundColor: Colors.white),
                        onPressed: () {
                          WhatsAppHelper.openWhatsApp(phone: '+233244889900', message: 'I want to buy ${titles[index]}.');
                        },
                        child: const Text('Buy Now', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                );
              },
            ),

            // Reviews Tab
            ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: 3,
              separatorBuilder: (_, __) => const Gap(12),
              itemBuilder: (context, index) {
                final reviewers = ['Alhassan I.', 'Fatima A.', 'Salifu M.'];
                final comments = [
                  'Fixed my solar inverter cabling within 2 hours in Sakasaka. Excellent service!',
                  'Very professional work on our shop wiring project.',
                  'Highly recommended certified electrician in Tamale.'
                ];
                return ServoraCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(reviewers[index], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const Row(
                            children: [
                              Icon(Icons.star_rounded, color: Colors.amber, size: 14),
                              Icon(Icons.star_rounded, color: Colors.amber, size: 14),
                              Icon(Icons.star_rounded, color: Colors.amber, size: 14),
                              Icon(Icons.star_rounded, color: Colors.amber, size: 14),
                              Icon(Icons.star_rounded, color: Colors.amber, size: 14),
                            ],
                          ),
                        ],
                      ),
                      const Gap(6),
                      Text(comments[index], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;

  _SliverTabBarDelegate(this.tabBar);

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: tabBar,
    );
  }

  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  double get minExtent => tabBar.preferredSize.height;

  @override
  bool shouldRebuild(covariant _SliverTabBarDelegate oldDelegate) {
    return false;
  }
}
