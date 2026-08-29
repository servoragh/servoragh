import 'package:dio/dio.dart';
import '../constants/constants.dart';
import '../storage/local_storage_service.dart';

class ApiClient {
  late final Dio dio;
  final LocalStorageService storageService;

  ApiClient({required this.storageService}) {
    dio = Dio(
      BaseOptions(
        baseUrl: ServoraConstants.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await storageService.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          final userId = await storageService.getUserId();
          if (userId != null && userId.isNotEmpty) {
            options.headers['x-user-id'] = userId;
          }
          final userPhone = await storageService.getUserPhone();
          if (userPhone != null && userPhone.isNotEmpty) {
            options.headers['x-user-phone'] = userPhone;
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) {
          // Centralized Network Error Handling
          String errorMessage = 'A network error occurred. Please check your connection.';
          if (error.response?.data != null && error.response?.data is Map) {
            errorMessage = error.response?.data['error'] ?? errorMessage;
          }
          return handler.next(
            DioException(
              requestOptions: error.requestOptions,
              error: errorMessage,
              type: error.type,
              response: error.response,
            ),
          );
        },
      ),
    );
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    return await dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    return await dio.post(path, data: data, queryParameters: queryParameters);
  }

  Future<Response> put(String path, {dynamic data}) async {
    return await dio.put(path, data: data);
  }

  Future<Response> delete(String path, {dynamic data}) async {
    return await dio.delete(path, data: data);
  }
}
