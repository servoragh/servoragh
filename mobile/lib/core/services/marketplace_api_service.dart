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
}
