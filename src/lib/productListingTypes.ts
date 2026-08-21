export type ProductListingStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "REJECTED"
  | "EXPIRED"
  | "SOLD"
  | "SUSPENDED";

export type ItemCondition =
  | "BRAND_NEW"
  | "REFURBISHED"
  | "USED_LIKE_NEW"
  | "USED_GOOD"
  | "USED_FAIR";

export type SellerType = "REGISTERED_USER" | "GUEST";

export interface ProductListingItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  subCategory?: string | null;
  condition: ItemCondition;
  
  // Pricing
  price: number;
  originalPrice?: number | null;
  isNegotiable: boolean;
  currency: string;
  
  // Media & Location
  images: string[];
  videoUrl?: string | null;
  area: string;
  deliveryOptions: string[]; // e.g. ["PICKUP", "LOCAL_DELIVERY", "SHIPPING"]
  
  // Seller Data
  sellerType: SellerType;
  sellerId?: string | null;
  sellerName?: string | null;
  sellerPhone?: string | null;
  sellerSlug?: string | null;
  
  // Guest Seller Specific
  guestName?: string | null;
  guestPhone?: string | null;
  guestWhatsApp?: string | null;
  guestEmail?: string | null;
  isGuestVerified?: boolean;
  guestAccessKey?: string | null;
  
  // Moderation & Controls
  status: ProductListingStatus;
  isFeatured: boolean;
  rejectionReason?: string | null;
  approvedById?: string | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  autoModerationFlags?: string[]; // e.g. ["HIGH_PRICE_ANOMALY", "KEYWORD_REVIEW"]
  
  // Engagement
  viewsCount: number;
  inquiriesCount: number;
  expiresAt?: string | null;
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingPayload {
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  condition: ItemCondition;
  price: number;
  originalPrice?: number;
  isNegotiable?: boolean;
  currency?: string;
  images: string[];
  videoUrl?: string;
  area: string;
  deliveryOptions: string[];
  
  // Seller info (if Guest)
  sellerType: SellerType;
  guestName?: string;
  guestPhone?: string;
  guestWhatsApp?: string;
  guestEmail?: string;
  otpCode?: string; // OTP verified
}

export interface ListingFilterQuery {
  search?: string;
  status?: ProductListingStatus | "ALL";
  sellerType?: SellerType | "ALL";
  category?: string | "ALL";
  area?: string | "ALL";
  condition?: ItemCondition | "ALL";
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}
