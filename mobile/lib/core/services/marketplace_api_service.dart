import 'package:dio/dio.dart';
import '../constants/constants.dart';

class MarketplaceApiService {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ServoraConstants.baseUrl,
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 12),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  /// Fetch live marketplace products from database
  static Future<List<dynamic>> fetchProducts() async {
    try {
      final response = await _dio.get('/products');
      if (response.statusCode == 200 && response.data != null) {
        if (response.data is Map && response.data['products'] != null) {
          return response.data['products'] as List<dynamic>;
        } else if (response.data is List) {
          return response.data as List<dynamic>;
        }
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Fetch live verified artisans & businesses from database
  static Future<List<dynamic>> fetchBusinesses() async {
    try {
      final response = await _dio.get('/providers');
      if (response.statusCode == 200 && response.data != null) {
        if (response.data is Map && response.data['providers'] != null) {
          return response.data['providers'] as List<dynamic>;
        }
      }
    } catch (_) {}

    try {
      final response = await _dio.get('/search', queryParameters: {'scope': 'providers'});
      if (response.statusCode == 200 && response.data != null) {
        if (response.data is Map &&
            response.data['results'] != null &&
            response.data['results']['providers'] != null) {
          return response.data['results']['providers'] as List<dynamic>;
        }
      }
    } catch (_) {}

    return [];
  }

  /// Fetch live community trade board notices from database
  static Future<List<dynamic>> fetchCommunityNotices() async {
    try {
      final response = await _dio.get('/search', queryParameters: {'scope': 'community'});
      if (response.statusCode == 200 && response.data != null) {
        if (response.data is Map &&
            response.data['results'] != null &&
            response.data['results']['community'] != null) {
          return response.data['results']['community'] as List<dynamic>;
        }
      }
      return [];
    } catch (_) {
      return [];
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
  static Future<List<dynamic>> fetchTickers() async {
    try {
      final response = await _dio.get('/tickers');
      if (response.statusCode == 200 && response.data != null) {
        if (response.data is Map && response.data['tickers'] != null) {
          return response.data['tickers'] as List<dynamic>;
        } else if (response.data is List) {
          return response.data as List<dynamic>;
        }
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Fetch user saved favorite business IDs and slugs from backend API
  static Future<Set<String>> fetchUserFavoriteIds() async {
    try {
      final response = await _dio.get('/favorites');
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
      final response = await _dio.post('/favorites', data: {'businessId': businessId});
      if (response.statusCode == 200 && response.data != null) {
        return (response.data['isFavorited'] == true);
      }
    } catch (_) {}
    return false;
  }

  /// Fetch public provider storefront data by slug (/api/biz/:slug)
  static Future<Map<String, dynamic>?> fetchPublicProviderBySlug(String slug) async {
    try {
      final response = await _dio.get('/biz/$slug');
      if (response.statusCode == 200 && response.data != null && response.data['profile'] != null) {
        return Map<String, dynamic>.from(response.data['profile'] as Map);
      }
    } catch (_) {}

    try {
      final response = await _dio.get('/public/provider/$slug');
      if (response.statusCode == 200 && response.data != null && response.data is Map) {
        return Map<String, dynamic>.from(response.data as Map);
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

