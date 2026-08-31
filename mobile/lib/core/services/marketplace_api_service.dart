import 'package:dio/dio.dart';
import '../constants/constants.dart';
import '../../features/auth/providers/auth_provider.dart';

class MarketplaceApiService {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ServoraConstants.baseUrl,
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 6),
      sendTimeout: const Duration(seconds: 5),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'max-age=60',
      },
    ),
  );

  // In-Memory Cache for 0ms Instant Page Loads
  static List<dynamic>? _cachedProducts;
  static DateTime? _productsCacheTime;

  static List<dynamic>? _cachedBusinesses;
  static DateTime? _businessesCacheTime;

  static List<dynamic>? _cachedNotices;
  static DateTime? _noticesCacheTime;

  static List<dynamic>? _cachedTickers;
  static DateTime? _tickersCacheTime;

  static final Map<String, dynamic> _storefrontCache = {};

  static const Duration _cacheTtl = Duration(minutes: 5);

  static Future<void> sendPresenceHeartbeat() async {
    try {
      final opts = await _authOptions();
      await _dio.post('/presence/heartbeat', options: opts);
    } catch (_) {}
  }

  static Future<Options> _authOptions() async {
    try {
      final token = await authNotifier.storage.getToken();
      final user = authNotifier.state.user;
      return Options(
        headers: {
          if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
          if (user?.phone != null && user!.phone.isNotEmpty) 'x-user-phone': user.phone,
          if (user?.id != null && user!.id.isNotEmpty) 'x-user-id': user.id,
        },
      );
    } catch (_) {
      return Options();
    }
  }

  /// Invalidate all memory caches to force fresh load on pull-to-refresh
  static void clearCache() {
    _cachedProducts = null;
    _cachedBusinesses = null;
    _cachedNotices = null;
    _cachedTickers = null;
    _storefrontCache.clear();
  }

  /// Fetch live marketplace products with instant in-memory cache & background revalidation
  static Future<List<dynamic>> fetchProducts({bool forceRefresh = false}) async {
    if (!forceRefresh && _cachedProducts != null && _productsCacheTime != null) {
      if (DateTime.now().difference(_productsCacheTime!) < _cacheTtl) {
        // Trigger background silent revalidation
        _revalidateProducts();
        return _cachedProducts!;
      }
    }

    try {
      final response = await _dio.get('/products');
      if (response.statusCode == 200 && response.data != null) {
        if (response.data is Map && response.data['products'] != null) {
          _cachedProducts = response.data['products'] as List<dynamic>;
          _productsCacheTime = DateTime.now();
          return _cachedProducts!;
        } else if (response.data is List) {
          _cachedProducts = response.data as List<dynamic>;
          _productsCacheTime = DateTime.now();
          return _cachedProducts!;
        }
      }
      return _cachedProducts ?? [];
    } catch (_) {
      return _cachedProducts ?? [];
    }
  }

  static Future<void> _revalidateProducts() async {
    try {
      final response = await _dio.get('/products');
      if (response.statusCode == 200 && response.data != null) {
        if (response.data is Map && response.data['products'] != null) {
          _cachedProducts = response.data['products'] as List<dynamic>;
          _productsCacheTime = DateTime.now();
        }
      }
    } catch (_) {}
  }

  /// Fetch live verified artisans & businesses with instant memory cache
  static Future<List<dynamic>> fetchBusinesses({bool forceRefresh = false}) async {
    if (!forceRefresh && _cachedBusinesses != null && _businessesCacheTime != null) {
      if (DateTime.now().difference(_businessesCacheTime!) < _cacheTtl) {
        _revalidateBusinesses();
        return _cachedBusinesses!;
      }
    }

    try {
      final response = await _dio.get('/providers');
      if (response.statusCode == 200 && response.data != null) {
        if (response.data is Map && response.data['providers'] != null) {
          _cachedBusinesses = response.data['providers'] as List<dynamic>;
          _businessesCacheTime = DateTime.now();
          return _cachedBusinesses!;
        }
      }
    } catch (_) {}

    try {
      final response = await _dio.get('/search', queryParameters: {'scope': 'providers'});
      if (response.statusCode == 200 && response.data != null) {
        if (response.data is Map &&
            response.data['results'] != null &&
            response.data['results']['providers'] != null) {
          _cachedBusinesses = response.data['results']['providers'] as List<dynamic>;
          _businessesCacheTime = DateTime.now();
          return _cachedBusinesses!;
        }
      }
    } catch (_) {}

    return _cachedBusinesses ?? [];
  }

  static Future<void> _revalidateBusinesses() async {
    try {
      final response = await _dio.get('/providers');
      if (response.statusCode == 200 && response.data != null && response.data['providers'] != null) {
        _cachedBusinesses = response.data['providers'] as List<dynamic>;
        _businessesCacheTime = DateTime.now();
      }
    } catch (_) {}
  }

  /// Fetch live community trade board notices from database with memory cache
  static Future<List<dynamic>> fetchCommunityNotices({bool forceRefresh = false}) async {
    if (!forceRefresh && _cachedNotices != null && _noticesCacheTime != null) {
      if (DateTime.now().difference(_noticesCacheTime!) < _cacheTtl) {
        return _cachedNotices!;
      }
    }

    try {
      final response = await _dio.get('/search', queryParameters: {'scope': 'community'});
      if (response.statusCode == 200 && response.data != null) {
        if (response.data is Map &&
            response.data['results'] != null &&
            response.data['results']['community'] != null) {
          _cachedNotices = response.data['results']['community'] as List<dynamic>;
          _noticesCacheTime = DateTime.now();
          return _cachedNotices!;
        }
      }
      return _cachedNotices ?? [];
    } catch (_) {
      return _cachedNotices ?? [];
    }
  }

  /// Post a new service request directly into backend database
  static Future<bool> postServiceRequest(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/requests', data: data);
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  /// Fetch live top announcement tickers from database
  static Future<List<dynamic>> fetchTickers({bool forceRefresh = false}) async {
    if (!forceRefresh && _cachedTickers != null && _tickersCacheTime != null) {
      if (DateTime.now().difference(_tickersCacheTime!) < _cacheTtl) {
        return _cachedTickers!;
      }
    }

    try {
      final response = await _dio.get('/tickers');
      if (response.statusCode == 200 && response.data != null) {
        if (response.data is Map && response.data['tickers'] != null) {
          _cachedTickers = response.data['tickers'] as List<dynamic>;
          _tickersCacheTime = DateTime.now();
          return _cachedTickers!;
        } else if (response.data is List) {
          _cachedTickers = response.data as List<dynamic>;
          _tickersCacheTime = DateTime.now();
          return _cachedTickers!;
        }
      }
      return _cachedTickers ?? [];
    } catch (_) {
      return _cachedTickers ?? [];
    }
  }

  /// Fetch user saved favorite business IDs and slugs from backend API
  static Future<Set<String>> fetchUserFavoriteIds() async {
    try {
      final opts = await _authOptions();
      final response = await _dio.get('/favorites', options: opts);
      if (response.statusCode == 200 && response.data != null) {
        if (response.data['favorites'] is List) {
          final list = response.data['favorites'] as List;
          final set = <String>{};
          for (final f in list) {
            if (f is Map) {
              if (f['businessId'] != null) set.add(f['businessId'].toString());
              if (f['id'] != null) set.add(f['id'].toString());
              if (f['business'] is Map) {
                final b = f['business'] as Map;
                if (b['id'] != null) set.add(b['id'].toString());
                if (b['slug'] != null) set.add(b['slug'].toString());
              }
            }
          }
          return set;
        }
      }
    } catch (_) {}
    return {};
  }

  /// Toggle favorite status on backend API (syncs between Web & Mobile)
  static Future<bool> toggleBusinessFavorite(String businessId) async {
    try {
      final opts = await _authOptions();
      final response = await _dio.post('/favorites', data: {'businessId': businessId}, options: opts);
      if (response.statusCode == 200 && response.data != null) {
        return (response.data['isFavorited'] == true);
      }
    } catch (_) {}
    return false;
  }

  /// Fetch public provider storefront data by slug (/api/biz/:slug)
  static Future<Map<String, dynamic>?> fetchPublicProviderBySlug(String slug, {bool forceRefresh = false}) async {
    if (!forceRefresh && _storefrontCache.containsKey(slug)) {
      return _storefrontCache[slug];
    }

    try {
      final response = await _dio.get('/biz/$slug');
      if (response.statusCode == 200 && response.data != null && response.data['profile'] != null) {
        final profile = Map<String, dynamic>.from(response.data['profile'] as Map);
        _storefrontCache[slug] = profile;
        return profile;
      }
    } catch (_) {}

    try {
      final response = await _dio.get('/public/provider/$slug');
      if (response.statusCode == 200 && response.data != null && response.data is Map) {
        final profile = Map<String, dynamic>.from(response.data as Map);
        _storefrontCache[slug] = profile;
        return profile;
      }
    } catch (_) {}

    return null;
  }

  /// Execute universal multi-index hybrid search
  static Future<Map<String, dynamic>?> universalSearch(
    String query, {
    String? zone,
    String? category,
    String? entity,
    double? minPrice,
    double? maxPrice,
    bool verifiedOnly = false,
    int limit = 30,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'q': query,
        'limit': limit,
        'device': 'MOBILE_ANDROID',
      };
      if (zone != null && zone.isNotEmpty && zone != 'all') queryParams['zone'] = zone;
      if (category != null && category.isNotEmpty && category != 'all') queryParams['category'] = category;
      if (entity != null && entity.isNotEmpty && entity != 'all') queryParams['entity'] = entity;
      if (minPrice != null) queryParams['min_price'] = minPrice;
      if (maxPrice != null) queryParams['max_price'] = maxPrice;
      if (verifiedOnly) queryParams['verified'] = 'true';

      final response = await _dio.get('/search/universal', queryParameters: queryParams);
      if (response.statusCode == 200 && response.data != null && response.data is Map) {
        return Map<String, dynamic>.from(response.data as Map);
      }
    } catch (_) {}
    return null;
  }

  /// Fetch trending searches in Northern Ghana
  static Future<List<Map<String, dynamic>>> fetchTrendingSearches() async {
    try {
      final response = await _dio.get('/search/trending');
      if (response.statusCode == 200 && response.data != null && response.data['trending'] is List) {
        return (response.data['trending'] as List)
            .map((item) => Map<String, dynamic>.from(item as Map))
            .toList();
      }
    } catch (_) {}
    return [];
  }

  /// Fetch instant search autocomplete suggestions
  static Future<List<Map<String, dynamic>>> fetchAutocomplete(String query) async {
    try {
      final response = await _dio.get('/search/autocomplete', queryParameters: {'q': query});
      if (response.statusCode == 200 && response.data != null && response.data['suggestions'] is List) {
        return (response.data['suggestions'] as List)
            .map((item) => Map<String, dynamic>.from(item as Map))
            .toList();
      }
    } catch (_) {}
    return [];
  }
}
