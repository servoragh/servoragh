import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../../app/theme/servora_colors.dart';
import '../../../shared/widgets/servora_card.dart';

class AdminProductsView extends StatefulWidget {
  final List<dynamic> products;
  final VoidCallback onRefresh;
  final Function(String action, {String? targetId, dynamic payload}) onAdminAction;

  const AdminProductsView({
    super.key,
    required this.products,
    required this.onRefresh,
    required this.onAdminAction,
  });

  @override
  State<AdminProductsView> createState() => _AdminProductsViewState();
}

class _AdminProductsViewState extends State<AdminProductsView> {
  String _filter = 'ALL';
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final filtered = widget.products.where((p) {
      final title = (p['title']?.toString() ?? '').toLowerCase();
      final category = (p['category']?.toString() ?? '').toLowerCase();
      final search = _search.toLowerCase();
      final matchesSearch = title.contains(search) || category.contains(search);
      if (!matchesSearch) return false;

      final status = p['status']?.toString().toUpperCase() ?? 'ACTIVE';
      if (_filter != 'ALL' && status != _filter) return false;
      return true;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.shopping_bag_rounded, color: Color(0xFF7C3AED), size: 20),
                    Gap(6),
                    Text('Product & Catalog Moderation Hub', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900)),
                  ],
                ),
                Text('${widget.products.length} Products Across Northern Ghana', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 18, color: Color(0xFF7C3AED)),
              onPressed: widget.onRefresh,
            ),
          ],
        ),
        const Gap(10),

        // Search
        TextField(
          decoration: InputDecoration(
            hintText: 'Search products by title, category...',
            prefixIcon: const Icon(Icons.search_rounded, size: 18),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          ),
          onChanged: (val) => setState(() => _search = val),
        ),
        const Gap(10),

        // Filter chips
        Row(
          children: [
            _buildFilterChip('All Products (${widget.products.length})', 'ALL'),
            const Gap(6),
            _buildFilterChip('Active Only', 'ACTIVE'),
            const Gap(6),
            _buildFilterChip('Flagged / Review', 'PENDING'),
          ],
        ),
        const Gap(14),

        if (filtered.isEmpty)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(40),
              child: Text('No products found matching filters.', style: TextStyle(color: Colors.grey)),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filtered.length,
            separatorBuilder: (_, __) => const Gap(10),
            itemBuilder: (context, idx) {
              final p = filtered[idx];
              final status = p['status']?.toString() ?? 'ACTIVE';

              return ServoraCard(
                padding: const EdgeInsets.all(14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.inventory_2_rounded, size: 20, color: ServoraColors.emerald600),
                    ),
                    const Gap(10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(p['title'] ?? 'Product Title', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                          const Gap(2),
                          Text('GH₵ ${p['price'] ?? 0} • Stock: ${p['stock'] ?? 1} • Category: ${p['category'] ?? "General"}', style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
                          const Gap(6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(status, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF047857))),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.shield_outlined, size: 18, color: Colors.grey),
                      tooltip: 'Moderate Listing',
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Moderated "${p['title']}"')),
                        );
                      },
                    ),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }

  Widget _buildFilterChip(String label, String filterVal) {
    final isSel = _filter == filterVal;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSel ? Colors.white : null)),
      selected: isSel,
      selectedColor: const Color(0xFF7C3AED),
      onSelected: (_) => setState(() => _filter = filterVal),
    );
  }
}
