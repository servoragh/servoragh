class UserModel {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String role; // CUSTOMER, PROVIDER, ADMIN
  final String? avatarUrl;
  final bool isPhoneVerified;
  final String activeRole; // Currently selected mode: CUSTOMER vs PROVIDER

  UserModel({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    required this.role,
    this.avatarUrl,
    this.isPhoneVerified = false,
    this.activeRole = 'CUSTOMER',
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      name: json['name'] ?? 'User',
      phone: json['phone'] ?? '',
      email: json['email'],
      role: json['role'] ?? 'CUSTOMER',
      avatarUrl: json['avatarUrl'],
      isPhoneVerified: json['isPhoneVerified'] ?? false,
      activeRole: json['activeRole'] ?? 'CUSTOMER',
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
      'isPhoneVerified': isPhoneVerified,
      'activeRole': activeRole,
    };
  }

  UserModel copyWith({
    String? name,
    String? phone,
    String? email,
    String? activeRole,
  }) {
    return UserModel(
      id: id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      role: role,
      avatarUrl: avatarUrl,
      isPhoneVerified: isPhoneVerified,
      activeRole: activeRole ?? this.activeRole,
    );
  }
}
