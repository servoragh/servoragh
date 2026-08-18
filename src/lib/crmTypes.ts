export type CustomerStatus =
  | "ACTIVE"
  | "PENDING_VERIFICATION"
  | "SUSPENDED"
  | "FROZEN_ESCROW"
  | "BANNED"
  | "ARCHIVED";

export type VerificationTier =
  | "UNVERIFIED"
  | "TIER_1_BASIC"
  | "TIER_2_IDENTITY"
  | "TIER_3_ENTERPRISE";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AdminNote {
  id: string;
  customerId: string;
  adminId: string;
  adminName: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

export interface CustomerAuditLogItem {
  id: string;
  customerId: string;
  performedBy: string;
  action: string;
  metadata?: any;
  ipAddress?: string;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  type: "ORDER" | "SERVICE_REQUEST" | "WALLET_CREDIT" | "REFUND" | "ESCROW_FREEZE" | "DISCOUNT_VOUCHER";
  amount: number;
  currency: string;
  title: string;
  status: "COMPLETED" | "PENDING" | "REFUNDED" | "DISPUTED" | "CANCELLED";
  createdAt: string;
}

export interface OmnichannelEvent {
  id: string;
  type: "SUPPORT_CHAT" | "DISPUTE_THREAD" | "SMS_NOTIFICATION" | "WHATSAPP_MSG" | "EMAIL_SENT" | "COMMUNITY_POST";
  title: string;
  summary: string;
  channel: string;
  timestamp: string;
  metadata?: any;
}

export interface CrmCustomer {
  id: string; // CustomerProfile ID or User ID
  userId: string;
  name: string;
  email: string | null;
  phone: string;
  avatarUrl: string | null;
  role: string; // CUSTOMER, PROVIDER, ADMIN
  accountType: "BUYER" | "VENDOR" | "DUAL";
  
  // Status & Verification
  status: CustomerStatus;
  verificationTier: VerificationTier;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100

  // Lifetime Commercial Metrics
  lifetimeValue: number;
  averageOrderValue: number;
  totalOrdersCount: number;
  completedJobsCount: number;
  disputeCount: number;
  disputeRate: number; // Percentage 0 - 100
  returnCancellationRate: number; // Percentage 0 - 100
  walletBalance: number;
  pendingEscrow: number;
  rewardPoints: number;

  // Contact & Pinned Locations
  serviceArea: string;
  addresses: Array<{
    id: string;
    title: string;
    area: string;
    landmark?: string;
    street?: string;
    latitude?: number;
    longitude?: number;
  }>;
  connectedIdentities: {
    socialLogins: string[];
    deviceIds: string[];
    browserFingerprints: string[];
    linkedGuestSessionsCount: number;
  };

  // Tags & Custom Attributes
  tags: string[];
  customAttributes?: Record<string, any>;

  // Activity & Notes
  internalNotes: AdminNote[];
  activityLogs: CustomerAuditLogItem[];
  recentTransactions: FinancialTransaction[];
  omnichannelEvents: OmnichannelEvent[];

  createdAt: string;
  updatedAt: string;
}

export interface CrmFilterQuery {
  search?: string;
  status?: CustomerStatus | "ALL";
  riskLevel?: RiskLevel | "ALL";
  verificationTier?: VerificationTier | "ALL";
  tag?: string | "ALL";
  sortBy?: "ltv" | "riskScore" | "createdAt" | "ordersCount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
