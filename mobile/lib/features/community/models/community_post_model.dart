class CommunityPostModel {
  final String id;
  final String title;
  final String content;
  final String category; // Tool Rental, Urgent Gig, Grid Alert, Meetup
  final String neighborhood;
  final String authorName;
  final String authorPhone;
  final bool isVerified;
  final int upvotes;
  final int commentsCount;
  final String createdAt;

  CommunityPostModel({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    required this.neighborhood,
    required this.authorName,
    required this.authorPhone,
    this.isVerified = false,
    this.upvotes = 0,
    this.commentsCount = 0,
    required this.createdAt,
  });

  factory CommunityPostModel.fromJson(Map<String, dynamic> json) {
    final author = json['author'] ?? {};
    return CommunityPostModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      category: json['category'] ?? 'Community Call',
      neighborhood: json['neighborhood'] ?? 'Sakasaka',
      authorName: author['name'] ?? json['authorName'] ?? 'Community Member',
      authorPhone: author['phone'] ?? json['authorPhone'] ?? '',
      isVerified: json['isVerified'] ?? true,
      upvotes: json['upvotes'] ?? 0,
      commentsCount: json['commentsCount'] ?? 0,
      createdAt: json['createdAt'] ?? '',
    );
  }
}
