import 'package:dio/dio.dart';
import '../constants/constants.dart';

class MarketplaceApiService {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ServoraConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  /// Fetch live products from production backend database
  static Future<List<dynamic>> fetchProducts() async {
    try {
      final response = await _dio.get('/products');
      if (response.statusCode == 200 && response.data is List) {
        return response.data;
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Fetch live verified businesses from production database
  static Future<List<dynamic>> fetchBusinesses() async {
    try {
      final response = await _dio.get('/business');
      if (response.statusCode == 200 && response.data is List) {
        return response.data;
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Fetch live community trade notices from production database
  static Future<List<dynamic>> fetchCommunityNotices() async {
    try {
      final response = await _dio.get('/community');
      if (response.statusCode == 200 && response.data is List) {
        return response.data;
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Fetch live urgent service requests
  static Future<List<dynamic>> fetchUrgentRequests() async {
    try {
      final response = await _dio.get('/requests');
      if (response.statusCode == 200 && response.data is List) {
        return response.data;
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
