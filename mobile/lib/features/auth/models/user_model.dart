class UserModel {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String role; // CUSTOMER, PROVIDER, ADMIN
  final String? avatarUrl;
  final String? logoUrl;
  final String? businessName;
  final String? slug;
  final String? serviceArea;
  final String? bio;
  final bool isPhoneVerified;
  final String activeRole; // Currently selected mode: CUSTOMER vs PROVIDER

  UserModel({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    required this.role,
    this.avatarUrl,
    this.logoUrl,
    this.businessName,
    this.slug,
    this.serviceArea,
    this.bio,
    this.isPhoneVerified = false,
    this.activeRole = 'CUSTOMER',
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final prov = json['providerProfile'] as Map<String, dynamic>?;
    final biz = json['businessProfile'] as Map<String, dynamic>?;

    return UserModel(
      id: json['id'] ?? '',
      name: json['name'] ?? 'User',
      phone: json['phone'] ?? '',
      email: json['email'],
      role: json['role'] ?? 'CUSTOMER',
      avatarUrl: json['avatarUrl'] ?? prov?['avatarUrl'] ?? biz?['logoUrl'],
      logoUrl: prov?['logoUrl'] ?? biz?['logoUrl'] ?? json['logoUrl'],
      businessName: json['businessName'] ?? prov?['businessName'] ?? biz?['businessName'] ?? json['name'] ?? 'Servora Merchant',
      slug: json['slug'] ?? prov?['slug'] ?? biz?['slug'] ?? 'kwame-electrical-tamale',
      serviceArea: json['serviceArea'] ?? prov?['serviceArea'] ?? biz?['serviceArea'] ?? 'Tamale Metro',
      bio: json['bio'] ?? prov?['bio'] ?? biz?['description'] ?? 'Verified Northern Ghana Artisan & Merchant on Servora.gh',
      isPhoneVerified: json['isPhoneVerified'] ?? true,
      activeRole: json['activeRole'] ?? json['role'] ?? 'CUSTOMER',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'role': role,
      'avatarUrl': avatarUrl,
      'logoUrl': logoUrl,
      'businessName': businessName,
      'slug': slug,
      'serviceArea': serviceArea,
      'bio': bio,
      'isPhoneVerified': isPhoneVerified,
      'activeRole': activeRole,
    };
  }

  UserModel copyWith({
    String? name,
    String? phone,
    String? email,
    String? role,
    String? avatarUrl,
    String? logoUrl,
    String? businessName,
    String? slug,
    String? serviceArea,
    String? bio,
    bool? isPhoneVerified,
    String? activeRole,
  }) {
    return UserModel(
      id: id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      role: role ?? this.role,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      logoUrl: logoUrl ?? this.logoUrl,
      businessName: businessName ?? this.businessName,
      slug: slug ?? this.slug,
      serviceArea: serviceArea ?? this.serviceArea,
      bio: bio ?? this.bio,
      isPhoneVerified: isPhoneVerified ?? this.isPhoneVerified,
      activeRole: activeRole ?? this.activeRole,
    );
  }
}
