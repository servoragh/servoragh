class ServoraConstants {
  static const String appName = 'Servora.gh';
  static const String appTagline = 'Northern Marketplace & Artisan Trade Hub';
  
  // Base Backend API URL - Change localhost/IP for physical device testing
  static const String baseUrl = 'http://localhost:3000';

  static const List<String> northernNeighborhoods = [
    'All Northern Ghana',
    'Sakasaka',
    'Nyohini',
    'Choggu',
    'Aboabo',
    'Dungu UDS',
    'Lamashegu',
    'Vittin',
    'Gumani',
    'Kalpohin',
    'Central Market',
    'Tamale Industrial Area',
    'Bolgatanga',
    'Wa Central',
  ];

  static const List<Map<String, String>> categories = [
    {'name': 'Electrical & Solar', 'icon': '⚡', 'slug': 'electrical-solar'},
    {'name': 'Plumbing & Borehole', 'icon': '🚰', 'slug': 'plumbing-borehole'},
    {'name': 'Fugu & Weaving', 'icon': '🧵', 'slug': 'fugu-fashion'},
    {'name': 'Automotive & Mechanic', 'icon': '🔧', 'slug': 'automotive'},
    {'name': 'Building & Masonry', 'icon': '🧱', 'slug': 'building-masonry'},
    {'name': 'Catering & Food', 'icon': '🍲', 'slug': 'catering-food'},
    {'name': 'Tool & Machine Rentals', 'icon': '🚜', 'slug': 'tool-rentals'},
    {'name': 'Delivery & Haulage', 'icon': '🚚', 'slug': 'delivery-haulage'},
  ];
}
