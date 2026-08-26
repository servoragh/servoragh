import { RecycleBinItem, RecycleActorType, RecycleBinStats } from "./recycleBinTypes";
import { prisma } from "@/lib/prisma";

// Seeded sample platform deletions across Admin, Customer, and Business actors
const INITIAL_RECYCLE_BIN_ITEMS: RecycleBinItem[] = [
  {
    id: "trash-1",
    entityId: "prod-old-99",
    entityType: "PRODUCT_LISTING",
    title: "DeWalt 20V Cordless Angle Grinder (Used)",
    snippet: "Tool listing removed by merchant seller from active catalog.",
    actorType: "BUSINESS",
    deletedByName: "Northern Hardware & Tools",
    deletedByPhone: "+233244889900",
    deletedByRole: "PROVIDER",
    reason: "Item out of stock & seller closed listing",
    payload: {
      title: "DeWalt 20V Cordless Angle Grinder (Used)",
      category: "Tools",
      price: 650,
      sellerType: "REGISTERED_USER",
    },
    deletedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "trash-2",
    entityId: "req-old-88",
    entityType: "SERVICE_REQUEST",
    title: "Emergency Generator Cable Wiring in Sakasaka",
    snippet: "Service request cancelled & deleted by customer after job completion.",
    actorType: "CUSTOMER",
    deletedByName: "Kwame Mensah",
    deletedByPhone: "+233209876543",
    deletedByRole: "CUSTOMER",
    reason: "Job completed by local electrician",
    payload: {
      title: "Emergency Generator Cable Wiring in Sakasaka",
      area: "Sakasaka",
      budgetMax: 200,
    },
    deletedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "trash-3",
    entityId: "post-old-77",
    entityType: "COMMUNITY_POST",
    title: "Beware of Fake Water Tank Sellers on Bolga Road",
    snippet: "Flagged community post removed by master administrator for moderation compliance.",
    actorType: "ADMIN",
    deletedByName: "Master Administrator",
    deletedByPhone: "+233240000000",
    deletedByRole: "ADMIN",
    reason: "Contains unverified claims & personal phone numbers",
    payload: {
      title: "Beware of Fake Water Tank Sellers on Bolga Road",
      category: "WARNINGS",
    },
    deletedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "trash-4",
    entityId: "user-old-66",
    entityType: "USER_ACCOUNT",
    title: "Spam Account: testuser_9921",
    snippet: "Duplicated account purged by admin security filter.",
    actorType: "ADMIN",
    deletedByName: "Master Administrator",
    deletedByPhone: "+233240000000",
    deletedByRole: "ADMIN",
    reason: "Duplicate bot account detected",
    payload: {
      name: "Test User 9921",
      phone: "+233240999888",
    },
    deletedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "trash-5",
    entityId: "rental-old-55",
    entityType: "TOOL_RENTAL",
    title: "Stihl 2-Stroke Chainsaw Rental",
    snippet: "Rental item deleted by artisan business owner.",
    actorType: "BUSINESS",
    deletedByName: "Salifu Plumbing & Borehole",
    deletedByPhone: "+233201122334",
    deletedByRole: "PROVIDER",
    reason: "Tool sold permanently to private contractor",
    payload: {
      title: "Stihl 2-Stroke Chainsaw Rental",
      dailyRate: 120,
    },
    deletedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: "trash-6",
    entityId: "req-old-44",
    entityType: "SERVICE_REQUEST",
    title: "House Painting & POP Ceiling Finish in Nyohini",
    snippet: "Customer removed duplicate service request.",
    actorType: "CUSTOMER",
    deletedByName: "Amina Abdul",
    deletedByPhone: "+233501239988",
    deletedByRole: "CUSTOMER",
    reason: "Duplicate request submission",
    payload: {
      title: "House Painting & POP Ceiling Finish in Nyohini",
      area: "Nyohini",
    },
    deletedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

// In-memory + AuditLog store for Recycle Bin
let recycleBinMemory: RecycleBinItem[] = [...INITIAL_RECYCLE_BIN_ITEMS];

export async function getRecycleBinItems(filterActor: RecycleActorType | "ALL" = "ALL", searchQuery?: string): Promise<{ items: RecycleBinItem[]; stats: RecycleBinStats }> {
  let list = [...recycleBinMemory];

  // Try fetching deletions from Prisma AuditLog if available
  try {
    const dbAuditDeletes = await prisma.auditLog.findMany({
      where: {
        action: {
          contains: "DELETE",
        },
      },
      include: {
        user: { select: { name: true, phone: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    for (const log of dbAuditDeletes) {
      const isAlreadyInMem = list.some((i) => i.id === log.id || i.snippet.includes(log.id));
      if (!isAlreadyInMem) {
        const userRole = (log.user?.role as any) || "ADMIN";
        const actorType: RecycleActorType = userRole === "ADMIN" ? "ADMIN" : userRole === "PROVIDER" ? "BUSINESS" : "CUSTOMER";

        list.unshift({
          id: log.id,
          entityId: log.id,
          entityType: log.action.includes("USER")
            ? "USER_ACCOUNT"
            : log.action.includes("PRODUCT")
            ? "PRODUCT_LISTING"
            : log.action.includes("REQUEST")
            ? "SERVICE_REQUEST"
            : log.action.includes("POST")
            ? "COMMUNITY_POST"
            : "BUSINESS_PROFILE",
          title: log.details.split('"')[1] || log.details || "Deleted Platform Resource",
          snippet: log.details,
          actorType,
          deletedByUserId: log.userId,
          deletedByName: log.user?.name || "System Admin",
          deletedByPhone: log.user?.phone || "+233240000000",
          deletedByRole: userRole,
          reason: "Logged via System Audit Security Engine",
          deletedAt: log.createdAt.toISOString(),
        });
      }
    }
  } catch (e) {
    // Fallback to memory store if DB query unavailable
  }

  // Calculate overall stats before search filtering
  const stats: RecycleBinStats = {
    totalDeleted: list.length,
    adminDeletes: list.filter((i) => i.actorType === "ADMIN").length,
    customerDeletes: list.filter((i) => i.actorType === "CUSTOMER").length,
    businessDeletes: list.filter((i) => i.actorType === "BUSINESS").length,
    systemDeletes: list.filter((i) => i.actorType === "SYSTEM").length,
  };

  // Filter by Actor Type
  if (filterActor !== "ALL") {
    list = list.filter((i) => i.actorType === filterActor);
  }

  // Filter by Search Query
  if (searchQuery && searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.snippet.toLowerCase().includes(q) ||
        i.deletedByName.toLowerCase().includes(q) ||
        (i.deletedByPhone && i.deletedByPhone.includes(q)) ||
        i.entityType.toLowerCase().includes(q)
    );
  }

  return { items: list, stats };
}

export async function addRecycleBinItem(item: Omit<RecycleBinItem, "id" | "deletedAt">): Promise<RecycleBinItem> {
  const newItem: RecycleBinItem = {
    ...item,
    id: `trash-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    deletedAt: new Date().toISOString(),
  };

  recycleBinMemory.unshift(newItem);
  return newItem;
}

export async function restoreRecycleBinItem(id: string): Promise<boolean> {
  const itemIndex = recycleBinMemory.findIndex((i) => i.id === id);
  if (itemIndex !== -1) {
    recycleBinMemory.splice(itemIndex, 1);
    return true;
  }
  return true;
}

export async function purgeRecycleBinItem(id: string): Promise<boolean> {
  const itemIndex = recycleBinMemory.findIndex((i) => i.id === id);
  if (itemIndex !== -1) {
    recycleBinMemory.splice(itemIndex, 1);
    return true;
  }
  return true;
}

export async function emptyRecycleBin(actorType: RecycleActorType | "ALL" = "ALL"): Promise<boolean> {
  if (actorType === "ALL") {
    recycleBinMemory = [];
  } else {
    recycleBinMemory = recycleBinMemory.filter((i) => i.actorType !== actorType);
  }
  return true;
}
