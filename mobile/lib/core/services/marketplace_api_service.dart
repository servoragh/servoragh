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
      final response = await _dio.get('/search', queryParameters: {'scope': 'providers'});
      if (response.statusCode == 200 && response.data != null) {
        if (response.data is Map &&
            response.data['results'] != null &&
            response.data['results']['providers'] != null) {
          return response.data['results']['providers'] as List<dynamic>;
        }
      }
      return [];
    } catch (_) {
      return [];
    }
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

  /// Fetch user saved favorite business IDs from backend API
  static Future<Set<String>> fetchUserFavoriteIds() async {
    try {
      final response = await _dio.get('/favorites');
      if (response.statusCode == 200 && response.data != null) {
        if (response.data['favorites'] is List) {
          final list = response.data['favorites'] as List;
          return list.map((f) => (f['businessId'] ?? f['id']).toString()).toSet();
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
}
