export interface TickerItem {
  id: string;
  text: string;
  tag: "JOB_SEEKER" | "BUSINESS_OWNER" | "EXPERT_ARTISAN" | "EMERGENCY" | "RENTAL" | "PROMO" | "ANNOUNCEMENT";
  badgeText?: string;
  badgeColor?: string; // emerald, amber, indigo, purple, rose, teal, cyan
  ctaLabel?: string;
  ctaUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_DEFAULT_TICKERS: TickerItem[] = [
  {
    id: "ticker-1",
    text: "Are you looking for a job? Servoragh connects skilled artisans & workers with paying clients across Northern Ghana!",
    tag: "JOB_SEEKER",
    badgeText: "JOB SEEKER",
    badgeColor: "emerald",
    ctaLabel: "Find Jobs",
    ctaUrl: "/requests",
    isActive: true,
    displayOrder: 1,
  },
  {
    id: "ticker-2",
    text: "Are you a business owner or seller? Register your business, showcase your items & products to boost local sales!",
    tag: "BUSINESS_OWNER",
    badgeText: "BUSINESS OWNER",
    badgeColor: "indigo",
    ctaLabel: "Register Business",
    ctaUrl: "/provider/register",
    isActive: true,
    displayOrder: 2,
  },
  {
    id: "ticker-3",
    text: "Do you offer services or repair skills? Register your business and connect with customers in Tamale!",
    tag: "EXPERT_ARTISAN",
    badgeText: "BUSINESS OWNER",
    badgeColor: "amber",
    ctaLabel: "Register Business",
    ctaUrl: "/provider/register",
    isActive: true,
    displayOrder: 3,
  },
  {
    id: "ticker-4",
    text: "24/7 Northern Ghana Emergency Hotline & Dispatch active for urgent electrical, plumbing & power failures!",
    tag: "EMERGENCY",
    badgeText: "24/7 DISPATCH",
    badgeColor: "rose",
    ctaLabel: "Call Dispatch",
    ctaUrl: "tel:+233240000000",
    isActive: true,
    displayOrder: 4,
  },
  {
    id: "ticker-5",
    text: "Got idle power tools, scaffolding or generators? Rent them out on Servoragh & earn daily passive income!",
    tag: "RENTAL",
    badgeText: "TOOL RENTALS",
    badgeColor: "teal",
    ctaLabel: "Rent Tools",
    ctaUrl: "/rentals",
    isActive: true,
    displayOrder: 5,
  },
  {
    id: "ticker-6",
    text: "Looking for quality local products? Shop directly from verified Northern Ghana vendors & artisans!",
    tag: "PROMO",
    badgeText: "SHOP LOCAL",
    badgeColor: "purple",
    ctaLabel: "Browse Market",
    ctaUrl: "/products",
    isActive: true,
    displayOrder: 6,
  },
  {
    id: "ticker-7",
    text: "Join 1,000+ verified professionals in Tamale & Northern Region built for fast, transparent service delivery!",
    tag: "ANNOUNCEMENT",
    badgeText: "SERVO RAGH",
    badgeColor: "cyan",
    ctaLabel: "Join Free",
    ctaUrl: "/register",
    isActive: true,
    displayOrder: 7,
  },
  {
    id: "ticker-8",
    text: "Special Launch Promo: 0% Service Commission for all newly onboarded service providers this month!",
    tag: "PROMO",
    badgeText: "PROMO 0%",
    badgeColor: "emerald",
    ctaLabel: "Claim Promo",
    ctaUrl: "/register",
    isActive: true,
    displayOrder: 8,
  },
  {
    id: "ticker-9",
    text: "Need neighborhood advice or artisan recommendations? Check out our active Community Notice Board!",
    tag: "ANNOUNCEMENT",
    badgeText: "COMMUNITY",
    badgeColor: "purple",
    ctaLabel: "View Board",
    ctaUrl: "/community",
    isActive: true,
    displayOrder: 9,
  },
  {
    id: "ticker-10",
    text: "Guaranteed Trust & Safety: All service providers undergo Ghana Card ID verification & community reviews!",
    tag: "ANNOUNCEMENT",
    badgeText: "VERIFIED SAFE",
    badgeColor: "emerald",
    ctaLabel: "Learn More",
    ctaUrl: "/about",
    isActive: true,
    displayOrder: 10,
  },
];
