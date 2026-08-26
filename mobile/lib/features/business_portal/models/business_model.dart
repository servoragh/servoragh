class BusinessModel {
  final String id;
  final String businessName;
  final String slug;
  final String bio;
  final String serviceArea;
  final String verificationStatus; // VERIFIED, PENDING, UNVERIFIED
  final String? logoUrl;
  final String phone;
  final double ratingAverage;
  final int reviewCount;
  final int completedJobsCount;
  final bool isPromoted;

  BusinessModel({
    required this.id,
    required this.businessName,
    required this.slug,
    required this.bio,
    required this.serviceArea,
    required this.verificationStatus,
    this.logoUrl,
    required this.phone,
    this.ratingAverage = 5.0,
    this.reviewCount = 0,
    this.completedJobsCount = 0,
    this.isPromoted = false,
  });

  factory BusinessModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] ?? {};
    return BusinessModel(
      id: json['id'] ?? '',
      businessName: json['businessName'] ?? 'Local Business',
      slug: json['slug'] ?? '',
      bio: json['bio'] ?? '',
      serviceArea: json['serviceArea'] ?? 'Tamale',
      verificationStatus: json['verificationStatus'] ?? 'UNVERIFIED',
      logoUrl: json['logoUrl'],
      phone: user['phone'] ?? json['phone'] ?? '+233240000000',
      ratingAverage: (json['ratingAverage'] as num?)?.toDouble() ?? 5.0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      completedJobsCount: (json['completedJobsCount'] as num?)?.toInt() ?? 0,
      isPromoted: json['isPromoted'] ?? false,
    );
  }
}
