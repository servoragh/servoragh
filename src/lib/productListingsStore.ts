import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  ProductListingItem,
  CreateListingPayload,
  ListingFilterQuery,
  ProductListingStatus,
} from "./productListingTypes";

const JSON_FILE_PATH = path.join(process.cwd(), "src", "data", "productings_data.json");

export const INITIAL_DEFAULT_LISTINGS: ProductListingItem[] = [
  {
    id: "lst-101",
    title: "Toyota Hilux Pickup Truck (2020 Model - Clean Engine)",
    slug: "toyota-hilux-pickup-truck-2020-tamale-lst101",
    description: "Well maintained Toyota Hilux Double Cabin. Air conditioning freezing cold, complete duty paid in Ghana. Ideal for farm and site work in Northern Region.",
    category: "Vehicles & Heavy Equipment",
    subCategory: "Pickup Trucks",
    condition: "USED_LIKE_NEW",
    price: 185000.00,
    isNegotiable: true,
    currency: "GHS",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80",
    ],
    videoUrl: null,
    area: "Sakasaka, Tamale",
    deliveryOptions: ["PICKUP", "LOCAL_DELIVERY"],
    sellerType: "REGISTERED_USER",
    sellerId: "user-102",
    sellerName: "Fatima Abdul-Rahman",
    sellerPhone: "+233501234567",
    status: "ACTIVE",
    isFeatured: true,
    approvedById: "admin-master",
    approvedByName: "Master Admin",
    approvedAt: "2026-08-01T10:00:00Z",
    autoModerationFlags: [],
    viewsCount: 342,
    inquiriesCount: 18,
    expiresAt: "2026-09-30T00:00:00Z",
    createdAt: "2026-08-01T09:30:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "lst-102",
    title: "DeWalt 20V Max Cordless Brushless Combo Drill Kit (Guest Listing)",
    slug: "dewalt-20v-max-cordless-drill-kit-lst102",
    description: "Brand new original DeWalt drill set imported from US. Comes with 2 batteries, charger, and heavy duty contractor bag.",
    category: "Tools & Equipment",
    subCategory: "Power Tools",
    condition: "BRAND_NEW",
    price: 1450.00,
    isNegotiable: false,
    currency: "GHS",
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80",
    ],
    videoUrl: null,
    area: "Central Market, Tamale",
    deliveryOptions: ["PICKUP", "LOCAL_DELIVERY", "SHIPPING"],
    sellerType: "GUEST",
    guestName: "Baba Salifu",
    guestPhone: "+233245678901",
    guestWhatsApp: "+233245678901",
    guestEmail: "salifu.hardware@gmail.com",
    isGuestVerified: true,
    guestAccessKey: "magic_key_salifu_102",
    status: "PENDING_APPROVAL",
    isFeatured: false,
    autoModerationFlags: [],
    viewsCount: 45,
    inquiriesCount: 4,
    expiresAt: "2026-09-18T00:00:00Z",
    createdAt: "2026-08-17T14:20:00Z",
    updatedAt: "2026-08-17T14:20:00Z",
  },
  {
    id: "lst-103",
    title: "Handwoven Royal Dagbon Smock (Batik Fugu - Size XL)",
    slug: "handwoven-royal-dagbon-smock-fugu-lst103",
    description: "Authentic handspun Northern Ghana heavy cotton fugu. Traditional blue and white stripes with intricate neck embroidery.",
    category: "Fashion & Apparel",
    subCategory: "Northern Smocks (Fugu)",
    condition: "BRAND_NEW",
    price: 480.00,
    isNegotiable: true,
    currency: "GHS",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
    ],
    videoUrl: null,
    area: "Nyohini, Tamale",
    deliveryOptions: ["PICKUP", "LOCAL_DELIVERY", "SHIPPING"],
    sellerType: "REGISTERED_USER",
    sellerId: "user-102",
    sellerName: "Northern Authentic Fugu & Fabrics",
    sellerPhone: "+233501234567",
    status: "ACTIVE",
    isFeatured: true,
    approvedById: "admin-master",
    approvedByName: "Master Admin",
    approvedAt: "2026-08-05T08:00:00Z",
    autoModerationFlags: [],
    viewsCount: 620,
    inquiriesCount: 35,
    expiresAt: "2026-10-05T00:00:00Z",
    createdAt: "2026-08-05T07:15:00Z",
    updatedAt: "2026-08-05T08:00:00Z",
  },
  {
    id: "lst-104",
    title: "Commercial Agricultural Solar Water Pump (5HP - High Head)",
    slug: "agricultural-solar-water-pump-5hp-lst104",
    description: "High capacity borehole and river irrigation solar pump set. Includes 5HP submersible pump, inverter controller, and mounting rails.",
    category: "Agricultural & Farming",
    subCategory: "Irrigation & Solar Pumps",
    condition: "BRAND_NEW",
    price: 12500.00,
    isNegotiable: true,
    currency: "GHS",
    images: [
      "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
    ],
    videoUrl: null,
    area: "Aboabo, Tamale",
    deliveryOptions: ["LOCAL_DELIVERY", "SHIPPING"],
    sellerType: "GUEST",
    guestName: "Issahaku Agribusiness",
    guestPhone: "+233201122334",
    guestWhatsApp: "+233201122334",
    guestEmail: "issahaku.agri@gmail.com",
    isGuestVerified: true,
    guestAccessKey: "magic_key_issahaku_104",
    status: "PENDING_APPROVAL",
    isFeatured: false,
    autoModerationFlags: ["HIGH_PRICE_ANOMALY"],
    viewsCount: 88,
    inquiriesCount: 7,
    expiresAt: "2026-09-20T00:00:00Z",
    createdAt: "2026-08-18T09:00:00Z",
    updatedAt: "2026-08-18T09:00:00Z",
  },
];

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function readLocalListingsData(): ProductListingItem[] {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, "utf8");
      const items = JSON.parse(data);
      if (Array.isArray(items) && items.length > 0) return items;
    }
  } catch (e) {
    console.error("Error reading local listings file:", e);
  }
  return INITIAL_DEFAULT_LISTINGS;
}

function writeLocalListingsData(items: ProductListingItem[]): boolean {
  try {
    ensureDirectoryExistence(JSON_FILE_PATH);
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(items, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Error writing local listings file:", e);
    return false;
  }
}

export function runAutoModerationCheck(title: string, description: string, price: number): string[] {
  const flags: string[] = [];
  const text = (title + " " + description).toLowerCase();

  const prohibitedKeywords = ["counterfeit", "fake", "weapon", "gun", "illicit", "replica", "clone", "pirated", "weed", "narcotic"];
  prohibitedKeywords.forEach((kw) => {
    if (text.includes(kw)) {
      flags.push(`PROHIBITED_KEYWORD: "${kw}"`);
    }
  });

  if (price <= 0) flags.push("INVALID_ZERO_PRICING");
  if (price > 10000) flags.push("HIGH_VALUE_ITEM_REVIEW");

  return flags;
}

export async function getAllProductListings(query?: ListingFilterQuery): Promise<{ listings: ProductListingItem[]; total: number }> {
  let list = readLocalListingsData();

  // Try Prisma DB if available
  try {
    if ((prisma as any).productListing) {
      const dbListings = await (prisma as any).productListing.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (dbListings && dbListings.length > 0) {
        list = dbListings.map((l: any) => ({
          ...l,
          price: Number(l.price),
          images: Array.isArray(l.images) ? l.images : JSON.parse(l.images || "[]"),
          deliveryOptions: Array.isArray(l.deliveryOptions) ? l.deliveryOptions : JSON.parse(l.deliveryOptions || "[]"),
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.updatedAt.toISOString(),
        }));
      }
    }
  } catch (e) {
    // DB query fallback
  }

  if (query) {
    const { search, status, sellerType, category, area, condition, isFeatured } = query;

    if (search && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.area.toLowerCase().includes(q) ||
          (l.guestName && l.guestName.toLowerCase().includes(q))
      );
    }

    if (status && status !== "ALL") {
      list = list.filter((l) => l.status === status);
    }

    if (sellerType && sellerType !== "ALL") {
      list = list.filter((l) => l.sellerType === sellerType);
    }

    if (category && category !== "ALL") {
      list = list.filter((l) => l.category.toLowerCase() === category.toLowerCase());
    }

    if (area && area !== "ALL") {
      list = list.filter((l) => l.area.toLowerCase().includes(area.toLowerCase()));
    }

    if (condition && condition !== "ALL") {
      list = list.filter((l) => l.condition === condition);
    }

    if (isFeatured !== undefined) {
      list = list.filter((l) => l.isFeatured === isFeatured);
    }
  }

  return { listings: list, total: list.length };
}

export async function createProductListing(payload: CreateListingPayload, sessionUser?: any): Promise<ProductListingItem> {
  const list = readLocalListingsData();

  const slug = `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-6)}`;
  const flags = runAutoModerationCheck(payload.title, payload.description, payload.price);
  
  const isGuest = payload.sellerType === "GUEST" || !sessionUser;
  const accessKey = isGuest ? `magic_key_${Date.now()}` : undefined;

  const newListing: ProductListingItem = {
    id: `lst-${Date.now()}`,
    title: payload.title,
    slug,
    description: payload.description,
    category: payload.category,
    subCategory: payload.subCategory || null,
    condition: payload.condition,
    price: Number(payload.price),
    isNegotiable: !!payload.isNegotiable,
    currency: payload.currency || "GHS",
    images: payload.images && payload.images.length > 0 ? payload.images : ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80"],
    videoUrl: payload.videoUrl || null,
    area: payload.area || "Tamale Central",
    deliveryOptions: payload.deliveryOptions || ["PICKUP"],
    sellerType: isGuest ? "GUEST" : "REGISTERED_USER",
    sellerId: sessionUser ? sessionUser.id : null,
    sellerName: sessionUser ? sessionUser.name : payload.guestName || "Guest Seller",
    sellerPhone: sessionUser ? sessionUser.phone : payload.guestPhone || "+233240000000",
    guestName: isGuest ? payload.guestName || "Guest Seller" : null,
    guestPhone: isGuest ? payload.guestPhone || null : null,
    guestWhatsApp: isGuest ? payload.guestWhatsApp || payload.guestPhone || null : null,
    guestEmail: isGuest ? payload.guestEmail || null : null,
    isGuestVerified: true, // OTP verified upon submit
    guestAccessKey: accessKey || null,
    status: "PENDING_APPROVAL",
    isFeatured: false,
    autoModerationFlags: flags,
    viewsCount: 1,
    inquiriesCount: 0,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  list.unshift(newListing);
  writeLocalListingsData(list);

  // Try Prisma create
  try {
    if ((prisma as any).productListing) {
      await (prisma as any).productListing.create({
        data: {
          id: newListing.id,
          title: newListing.title,
          slug: newListing.slug,
          description: newListing.description,
          category: newListing.category,
          subCategory: newListing.subCategory,
          condition: newListing.condition,
          price: newListing.price,
          isNegotiable: newListing.isNegotiable,
          currency: newListing.currency,
          images: newListing.images,
          videoUrl: newListing.videoUrl,
          area: newListing.area,
          deliveryOptions: newListing.deliveryOptions,
          sellerType: newListing.sellerType,
          sellerId: newListing.sellerId,
          guestName: newListing.guestName,
          guestPhone: newListing.guestPhone,
          guestWhatsApp: newListing.guestWhatsApp,
          guestEmail: newListing.guestEmail,
          isGuestVerified: newListing.isGuestVerified,
          guestAccessKey: newListing.guestAccessKey,
          status: newListing.status,
          isFeatured: newListing.isFeatured,
          viewsCount: 1,
          expiresAt: new Date(newListing.expiresAt!),
        },
      });
    }
  } catch (e) {
    // Database write fallback
  }

  return newListing;
}

export async function moderateProductListing(
  id: string,
  action: "APPROVE" | "REJECT" | "FEATURE" | "SUSPEND" | "MARK_SOLD" | "DELETE",
  adminUser: { id: string; name: string },
  rejectionReason?: string
): Promise<ProductListingItem | null> {
  const list = readLocalListingsData();
  const index = list.findIndex((l) => l.id === id);
  if (index < 0) return null;

  const target = list[index];

  if (action === "APPROVE") {
    target.status = "ACTIVE";
    target.approvedById = adminUser.id;
    target.approvedByName = adminUser.name;
    target.approvedAt = new Date().toISOString();
    target.rejectionReason = null;
  } else if (action === "REJECT") {
    target.status = "REJECTED";
    target.rejectionReason = rejectionReason || "Does not meet platform community guidelines.";
  } else if (action === "FEATURE") {
    target.isFeatured = !target.isFeatured;
  } else if (action === "SUSPEND") {
    target.status = "SUSPENDED";
  } else if (action === "MARK_SOLD") {
    target.status = "SOLD";
  } else if (action === "DELETE") {
    list.splice(index, 1);
    writeLocalListingsData(list);
    try {
      if ((prisma as any).productListing) {
        await (prisma as any).productListing.delete({ where: { id } });
      }
    } catch (e) {}
    return target;
  }

  target.updatedAt = new Date().toISOString();
  list[index] = target;
  writeLocalListingsData(list);

  try {
    if ((prisma as any).productListing) {
      await (prisma as any).productListing.update({
        where: { id },
        data: {
          status: target.status,
          isFeatured: target.isFeatured,
          rejectionReason: target.rejectionReason,
          approvedById: target.approvedById,
          approvedAt: target.approvedAt ? new Date(target.approvedAt) : null,
        },
      });
    }
  } catch (e) {}

  return target;
}
