export type RegionZone =
  | "ALL_NORTHERN_GH"
  | "SAKASAKA"
  | "NYOHINI"
  | "CHOGGU"
  | "ABOABO"
  | "DUNGU_UDS"
  | "LAMASHEGU"
  | "VITTIN"
  | "GUMANI"
  | "KALPOHIN"
  | "CENTRAL_MARKET"
  | "DATOYILI"
  | "BILPELA";

export type PostCategory =
  | "ALL_DISCUSSIONS"
  | "SERVICE_CALL"
  | "TOOL_RENTAL"
  | "ARTISAN_MEETUP"
  | "GRID_ALERT"
  | "SKILL_SHARE"
  | "RECOMMENDATION"
  | "LOST_AND_FOUND";

export type ItemStatus = "OPEN_ACTIVE" | "RESOLVED" | "EXPIRED";

export interface CommunityCommentItem {
  id: string;
  postId: string;
  authorId?: string | null;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
}

export interface CommunityPostItem {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  zone: RegionZone;
  status: ItemStatus;
  isPinned?: boolean;
  isLocked?: boolean;
  
  budget?: number | null;
  currency: string;
  urgency?: "Immediate" | "Today" | "Scheduled" | "Flexible" | null;
  photos: string[];
  
  // Author
  authorId?: string | null;
  authorName: string;
  authorPhone?: string | null;
  authorWhatsApp?: string | null;
  authorAvatar?: string | null;
  isVerifiedArtisan?: boolean;
  
  // Cross-link
  serviceRequestId?: string | null;
  
  // Engagement
  upvotesCount: number;
  commentsCount: number;
  viewsCount: number;
  hasUpvoted?: boolean;
  
  comments?: CommunityCommentItem[];
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunityPostPayload {
  title: string;
  content: string;
  category: PostCategory;
  zone: RegionZone;
  budget?: number;
  currency?: string;
  urgency?: "Immediate" | "Today" | "Scheduled" | "Flexible";
  photos?: string[];
  contactPreference?: "CHAT" | "WHATSAPP" | "CALL";
  
  // Guest fields (if unauthenticated)
  guestName?: string;
  guestPhone?: string;
  guestWhatsApp?: string;
}

export interface CommunityFilterQuery {
  search?: string;
  zone?: RegionZone | "ALL";
  category?: PostCategory | "ALL";
  status?: ItemStatus | "ALL";
}
