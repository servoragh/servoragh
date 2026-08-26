export type EscrowStatus =
  | "PENDING_PAYMENT"
  | "HELD_IN_ESCROW"
  | "RELEASED_TO_SELLER"
  | "REFUNDED_TO_BUYER"
  | "DISPUTED";

export interface EscrowDeal {
  id: string;
  dealCode: string; // e.g. ESC-8890-GH
  title: string;
  amountGhs: number;
  platformFeeGhs: number;
  sellerPayoutGhs: number;
  buyerName: string;
  buyerPhone: string;
  sellerName: string;
  sellerPhone: string;
  sellerBusinessName?: string;
  deliveryArea: string;
  status: EscrowStatus;
  momoProvider: "MTN_MOMO" | "TELECEL_CASH" | "AT_MONEY";
  momoReference: string;
  notes?: string;
  createdAt: string;
  releasedAt?: string;
  refundedAt?: string;
  disputeReason?: string;
}

export interface EscrowStats {
  totalDeals: number;
  totalHeldGhs: number;
  totalReleasedGhs: number;
  totalRefundedGhs: number;
  activeEscrowsCount: number;
  disputedCount: number;
}
