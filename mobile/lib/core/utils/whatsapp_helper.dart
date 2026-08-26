import 'package:url_launcher/url_launcher.dart';

class WhatsAppHelper {
  /// Opens direct WhatsApp conversation with prefilled text message
  static Future<bool> openWhatsApp({
    required String phone,
    required String message,
  }) async {
    // Sanitize phone number (remove +, spaces, dashes)
    String cleanPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
    
    // Default Ghana country code +233 if missing
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '233${cleanPhone.substring(1)}';
    }

    final Uri url = Uri.parse(
      'https://wa.me/$cleanPhone?text=${Uri.encodeComponent(message)}',
    );

    if (await canLaunchUrl(url)) {
      return await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      // Fallback to web WhatsApp link
      final Uri webUrl = Uri.parse(
        'https://api.whatsapp.com/send?phone=$cleanPhone&text=${Uri.encodeComponent(message)}',
      );
      return await launchUrl(webUrl, mode: LaunchMode.externalApplication);
    }
  }

  /// Initiates direct phone call
  static Future<bool> makePhoneCall(String phone) async {
    final Uri url = Uri.parse('tel:$phone');
    if (await canLaunchUrl(url)) {
      return await launchUrl(url);
    }
    return false;
  }
}
