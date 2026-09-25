import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../../app/theme/servora_colors.dart';
import '../../core/services/user_location_service.dart';

class ServoraLocationPickerSheet extends StatefulWidget {
  final UserLocation? initialLocation;

  const ServoraLocationPickerSheet({super.key, this.initialLocation});

  static Future<UserLocation?> show(BuildContext context, {UserLocation? initialLocation}) async {
    return await showModalBottomSheet<UserLocation>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ServoraLocationPickerSheet(initialLocation: initialLocation),
    );
  }

  @override
  State<ServoraLocationPickerSheet> createState() => _ServoraLocationPickerSheetState();
}

class _ServoraLocationPickerSheetState extends State<ServoraLocationPickerSheet> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _customAddressController = TextEditingController();
  
  bool _isDetectingGps = false;
  bool _isSearching = false;
  List<UserLocation> _searchResults = [];
  Timer? _debounceTimer;

  static const List<Map<String, String>> _popularHubs = [
    {'name': 'All Northern Ghana', 'city': 'Northern Region'},
    {'name': 'Sakasaka', 'city': 'Tamale'},
    {'name': 'Nyohini', 'city': 'Tamale'},
    {'name': 'Choggu', 'city': 'Tamale'},
    {'name': 'Aboabo', 'city': 'Tamale'},
    {'name': 'Dungu (UDS Campus)', 'city': 'Tamale'},
    {'name': 'Lamashegu', 'city': 'Tamale'},
    {'name': 'Vittin', 'city': 'Tamale'},
    {'name': 'Gumani', 'city': 'Tamale'},
    {'name': 'Kalpohin', 'city': 'Tamale'},
    {'name': 'Kukuo', 'city': 'Tamale'},
    {'name': 'Kanvili', 'city': 'Tamale'},
    {'name': 'Tamale Central Market', 'city': 'Tamale'},
    {'name': 'Bolgatanga', 'city': 'Upper East'},
    {'name': 'Wa Central', 'city': 'Upper West'},
    {'name': 'Savelugu', 'city': 'Northern Region'},
    {'name': 'Yendi', 'city': 'Northern Region'},
    {'name': 'Kumasi', 'city': 'Ashanti'},
    {'name': 'Accra', 'city': 'Greater Accra'},
  ];

  @override
  void dispose() {
    _searchController.dispose();
    _customAddressController.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debounceTimer?.cancel();
    if (query.trim().isEmpty) {
      setState(() {
        _isSearching = false;
        _searchResults = [];
      });
      return;
    }

    setState(() => _isSearching = true);
    _debounceTimer = Timer(const Duration(milliseconds: 350), () async {
      final results = await UserLocationService.searchGhanaPlaces(query);
      if (mounted) {
        setState(() {
          _searchResults = results;
          _isSearching = false;
        });
      }
    });
  }

  Future<void> _handleGpsAutoDetect() async {
    setState(() => _isDetectingGps = true);
    try {
      final loc = await UserLocationService.detectCurrentGpsLocation();
      if (mounted) {
        setState(() => _isDetectingGps = false);
        if (loc != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('📍 GPS Location Identified: ${loc.shortLabel}'),
              backgroundColor: ServoraColors.emerald600,
              duration: const Duration(seconds: 2),
            ),
          );
          Navigator.of(context).pop(loc);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Could not access GPS. Please check location permissions or select an area below.'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      }
    } catch (_) {
      if (mounted) setState(() => _isDetectingGps = false);
    }
  }

  void _selectHub(String name, String city) {
    final loc = UserLocation(
      name: name,
      city: city,
      region: city.contains('Region') ? city : 'Northern Region',
      formattedAddress: '$name, $city, Ghana',
      latitude: 9.4008,
      longitude: -0.8393,
      isGps: false,
    );
    UserLocationService.setLocation(loc);
    Navigator.of(context).pop(loc);
  }

  void _applyCustomAddress() {
    final text = _customAddressController.text.trim();
    if (text.isEmpty) return;

    final loc = UserLocation(
      name: text,
      city: 'Tamale',
      region: 'Northern Region',
      formattedAddress: '$text, Tamale, Ghana',
      latitude: UserLocationService.currentLocation.latitude,
      longitude: UserLocationService.currentLocation.longitude,
      isGps: false,
    );
    UserLocationService.setLocation(loc);
    Navigator.of(context).pop(loc);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentLoc = UserLocationService.currentLocation;

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 8),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white24 : Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 16, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.location_on_rounded, color: ServoraColors.emerald600, size: 22),
                    Gap(8),
                    Text(
                      'Identify Your Location 📍',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                // 1. Current Active Location & Google Maps Card
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: currentLoc.isGps ? ServoraColors.emerald600.withOpacity(0.5) : Colors.transparent,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: ServoraColors.emerald600.withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          currentLoc.isGps ? Icons.my_location_rounded : Icons.location_city_rounded,
                          color: ServoraColors.emerald600,
                          size: 20,
                        ),
                      ),
                      const Gap(12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  currentLoc.shortLabel,
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                                if (currentLoc.isGps) ...[
                                  const Gap(6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: ServoraColors.emerald600,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text('GPS ACTIVE', style: TextStyle(fontSize: 8.5, color: Colors.white, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ],
                            ),
                            const Gap(2),
                            Text(
                              currentLoc.formattedAddress,
                              style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey[700]),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const Gap(6),
                      TextButton.icon(
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                          backgroundColor: const Color(0xFF4285F4).withOpacity(0.12),
                          foregroundColor: const Color(0xFF2563EB),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: const Icon(Icons.map_rounded, size: 14),
                        label: const Text('Google Maps', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                        onPressed: () => UserLocationService.openInGoogleMaps(currentLoc.latitude, currentLoc.longitude),
                      ),
                    ],
                  ),
                ),
                const Gap(14),

                // 2. Primary Auto-Detect GPS Button
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ServoraColors.emerald600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  onPressed: _isDetectingGps ? null : _handleGpsAutoDetect,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_isDetectingGps)
                        const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      else
                        const Icon(Icons.gps_fixed_rounded, size: 18),
                      const Gap(10),
                      Text(
                        _isDetectingGps ? 'Identifying GPS Location...' : 'Auto-Detect My GPS Location 🎯',
                        style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                ),
                const Gap(16),

                // 3. Live Universal Search Bar across ALL of Ghana
                TextField(
                  controller: _searchController,
                  onChanged: _onSearchChanged,
                  decoration: InputDecoration(
                    hintText: 'Search ANY street, suburb, or town in Ghana...',
                    hintStyle: const TextStyle(fontSize: 12),
                    prefixIcon: const Icon(Icons.search_rounded, size: 20),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              _onSearchChanged('');
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: isDark ? Colors.white12 : Colors.grey[300]!),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(color: isDark ? Colors.white12 : Colors.grey[300]!),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: ServoraColors.emerald600),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                ),
                const Gap(14),

                // 4. Search Results (if searching)
                if (_isSearching) ...[
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(20.0),
                      child: CircularProgressIndicator(color: ServoraColors.emerald600),
                    ),
                  ),
                ] else if (_searchResults.isNotEmpty) ...[
                  const Text('MATCHING GHANA LOCATIONS:', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.grey)),
                  const Gap(8),
                  ..._searchResults.map((loc) => ListTile(
                        leading: const Icon(Icons.place_rounded, color: ServoraColors.emerald600),
                        title: Text(loc.shortLabel, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        subtitle: Text(loc.formattedAddress, style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        onTap: () {
                          UserLocationService.setLocation(loc);
                          Navigator.of(context).pop(loc);
                        },
                      )),
                  const Gap(14),
                ],

                // 5. Popular Northern Ghana & Nationwide Neighborhoods
                const Text('POPULAR NORTHERN GHANA AREAS & HUBS:', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 0.5)),
                const Gap(8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: _popularHubs.map((hub) {
                    final isSel = currentLoc.name.toLowerCase() == hub['name']!.toLowerCase();
                    return ActionChip(
                      label: Text(hub['name']!, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isSel ? Colors.white : null)),
                      backgroundColor: isSel ? ServoraColors.emerald600 : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: isSel ? ServoraColors.emerald600 : Colors.transparent)),
                      onPressed: () => _selectHub(hub['name']!, hub['city']!),
                    );
                  }).toList(),
                ),
                const Gap(18),

                // 6. Freeform Custom Address / Landmark
                const Text('CUSTOM LANDMARK / ADDRESS ENTRY:', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 0.5)),
                const Gap(8),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _customAddressController,
                        decoration: InputDecoration(
                          hintText: 'e.g. Near Sakasaka Shell Station, House #14',
                          hintStyle: const TextStyle(fontSize: 11.5),
                          filled: true,
                          fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                    const Gap(8),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                        foregroundColor: isDark ? Colors.white : Colors.black87,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      onPressed: _applyCustomAddress,
                      child: const Text('Set 📍', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const Gap(24),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
