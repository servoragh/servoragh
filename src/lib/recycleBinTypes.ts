export type RecycleActorType = "ADMIN" | "CUSTOMER" | "BUSINESS" | "SYSTEM";

export type RecycleEntityType =
  | "PRODUCT_LISTING"
  | "SERVICE_REQUEST"
  | "COMMUNITY_POST"
  | "USER_ACCOUNT"
  | "BUSINESS_PROFILE"
  | "SERVICE_OFFERING"
  | "TOOL_RENTAL"
  | "REVIEW"
  | "TICKER_ANNOUNCEMENT";

export interface RecycleBinItem {
  id: string;
  entityId: string;
  entityType: RecycleEntityType;
  title: string;
  snippet: string;
  actorType: RecycleActorType;
  deletedByUserId?: string | null;
  deletedByName: string;
  deletedByPhone?: string | null;
  deletedByRole: "ADMIN" | "CUSTOMER" | "PROVIDER" | "SYSTEM";
  reason?: string | null;
  payload?: any; // Stored entity representation for restoration
  deletedAt: string;
}

export interface RecycleBinStats {
  totalDeleted: number;
  adminDeletes: number;
  customerDeletes: number;
  businessDeletes: number;
  systemDeletes: number;
}
