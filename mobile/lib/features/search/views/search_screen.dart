import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/servora_card.dart';
import '../../../shared/widgets/status_badge.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'ALL';

  final List<Map<String, dynamic>> _allResults = [
    {
      'title': 'Kwame Electrical & Solar Tamale',
      'category': 'ARTISAN',
      'type': 'Artisan Merchant',
      'area': 'Sakasaka, Tamale',
      'rating': 4.9,
      'slug': 'kwame-electrical-tamale',
      'icon': '⚡',
    },
    {
      'title': 'Handwoven Royal Dagbon Smock (Fugu)',
      'category': 'PRODUCT',
      'type': 'Product Listing',
      'area': 'Nyohini, Tamale',
      'price': 'GH₵ 450',
      'slug': 'northern-fugu-fabrics',
      'icon': '🧵',
    },
    {
      'title': 'DeWalt 20V Max Power Drill Kit',
      'category': 'RENTAL',
      'type': 'Tool Rental',
      'area': 'Sakasaka, Tamale',
      'price': 'GH₵ 150 / day',
      'slug': 'northern-hardware',
      'icon': '🚜',
    },
    {
      'title': 'Urgent Solar Inverter Cable Repair',
      'category': 'REQUEST',
      'type': 'Customer Call',
      'area': 'Choggu, Tamale',
      'price': 'GH₵ 300 Budget',
      'slug': 'kwame-electrical-tamale',
      'icon': '🔧',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filtered = _allResults.where((item) {
      if (_selectedFilter != 'ALL' && item['category'] != _selectedFilter) {
        return false;
      }
      final query = _searchController.text.toLowerCase();
      if (query.isEmpty) return true;
      return item['title'].toString().toLowerCase().contains(query) ||
          item['area'].toString().toLowerCase().contains(query);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: TextField(
          controller: _searchController,
          autofocus: true,
          onChanged: (_) => setState(() {}),
          decoration: const InputDecoration(
            hintText: 'Search products, plumbers, smocks, rentals...',
            border: InputBorder.none,
          ),
        ),
        actions: [
          if (_searchController.text.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear_rounded),
              onPressed: () {
                _searchController.clear();
                setState(() {});
              },
            ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: isDark ? const Color(0xFF111827) : const Color(0xFFF1F5F9),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('ALL', 'All Indices'),
                  const SizedBox(width: 8),
                  _buildFilterChip('ARTISAN', 'Artisans 🛠️'),
                  const SizedBox(width: 8),
                  _buildFilterChip('PRODUCT', 'Products 📦'),
                  const SizedBox(width: 8),
                  _buildFilterChip('RENTAL', 'Tool Rentals 🚜'),
                  const SizedBox(width: 8),
                  _buildFilterChip('REQUEST', 'Customer Calls 🔧'),
                ],
              ),
            ),
          ),

          // Search Results Feed
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('🔍', style: TextStyle(fontSize: 48)),
                        const SizedBox(height: 12),
                        Text(
                          'No matching results found',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Try searching for "electrician", "smock", or "drill"',
                          style: TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = filtered[index];
                      return ServoraCard(
                        onTap: () => context.push('/biz/${item['slug']}'),
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: const Color(0xFF059669).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(item['icon'], style: const TextStyle(fontSize: 22)),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['title'],
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${item['type']} • ${item['area']}',
                                    style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                                  ),
                                  if (item['price'] != null) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      item['price'],
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            StatusBadge.verifiedGhanaCard(),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _selectedFilter == key;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: const Color(0xFF059669),
      labelStyle: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.bold,
        color: isSelected ? Colors.white : Colors.black87,
      ),
      onSelected: (_) => setState(() => _selectedFilter = key),
    );
  }
}
