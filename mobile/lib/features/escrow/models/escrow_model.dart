class EscrowDealModel {
  final String id;
  final String dealTitle;
  final double amountGhs;
  final String buyerPhone;
  final String sellerPhone;
  final String sellerBusinessName;
  final String status; // HELD_IN_ESCROW, RELEASED_TO_SELLER, REFUNDED_TO_BUYER, DISPUTED
  final String createdAt;

  EscrowDealModel({
    required this.id,
    required this.dealTitle,
    required this.amountGhs,
    required this.buyerPhone,
    required this.sellerPhone,
    required this.sellerBusinessName,
    required this.status,
    required this.createdAt,
  });

  factory EscrowDealModel.fromJson(Map<String, dynamic> json) {
    return EscrowDealModel(
      id: json['id'] ?? '',
      dealTitle: json['dealTitle'] ?? 'Safe Escrow Purchase',
      amountGhs: (json['amountGhs'] as num?)?.toDouble() ?? 0.0,
      buyerPhone: json['buyerPhone'] ?? '',
      sellerPhone: json['sellerPhone'] ?? '',
      sellerBusinessName: json['sellerBusinessName'] ?? 'Seller',
      status: json['status'] ?? 'HELD_IN_ESCROW',
      createdAt: json['createdAt'] ?? '',
    );
  }
}
