import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  CrmCustomer,
  CrmFilterQuery,
  CustomerStatus,
  VerificationTier,
  RiskLevel,
  AdminNote,
  CustomerAuditLogItem,
} from "./crmTypes";

const JSON_FILE_PATH = path.join(process.cwd(), "src", "data", "crm_data.json");

export const INITIAL_DEFAULT_CUSTOMERS: CrmCustomer[] = [
  {
    id: "crm-cust-1",
    userId: "user-101",
    name: "Alhassan Ibrahim",
    email: "alhassan.ibrahim@tamale.gh",
    phone: "+233240112233",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "CUSTOMER",
    accountType: "BUYER",
    status: "ACTIVE",
    verificationTier: "TIER_2_IDENTITY",
    riskLevel: "LOW",
    riskScore: 12.5,
    lifetimeValue: 4850.00,
    averageOrderValue: 404.16,
    totalOrdersCount: 12,
    completedJobsCount: 11,
    disputeCount: 0,
    disputeRate: 0.0,
    returnCancellationRate: 8.3,
    walletBalance: 320.00,
    pendingEscrow: 0.00,
    rewardPoints: 450,
    serviceArea: "Sakasaka, Tamale",
    addresses: [
      {
        id: "addr-1",
        title: "Home",
        area: "Sakasaka",
        street: "Hospital Road",
        landmark: "Near Police Station",
        latitude: 9.4075,
        longitude: -0.8389,
      },
      {
        id: "addr-2",
        title: "Office",
        area: "Central Market",
        street: "Bank Street",
        landmark: "Opposite GCB Bank",
        latitude: 9.4042,
        longitude: -0.8401,
      },
    ],
    connectedIdentities: {
      socialLogins: ["Google"],
      deviceIds: ["dev-iphone-14-pro", "dev-macbook-m2"],
      browserFingerprints: ["fp_982a71e289"],
      linkedGuestSessionsCount: 2,
    },
    tags: ["VIP", "Sakasaka", "Early Adopter", "High Spender"],
    customAttributes: {
      preferredLanguage: "Dagbani & English",
      preferredArtisanGender: "No Preference",
    },
    internalNotes: [
      {
        id: "note-101",
        customerId: "crm-cust-1",
        adminId: "admin-master",
        adminName: "Master Admin",
        content: "VIP Customer - Priority dispatch for electrical & solar requests in Sakasaka.",
        isPinned: true,
        createdAt: "2026-08-10T10:30:00Z",
      },
    ],
    activityLogs: [
      {
        id: "log-101",
        customerId: "crm-cust-1",
        performedBy: "admin-master",
        action: "TIER_UPGRADE",
        metadata: { from: "TIER_1_BASIC", to: "TIER_2_IDENTITY", docType: "Ghana Card" },
        ipAddress: "102.176.54.12",
        createdAt: "2026-08-01T14:15:00Z",
      },
    ],
    recentTransactions: [
      {
        id: "tx-1",
        type: "SERVICE_REQUEST",
        amount: 650.00,
        currency: "GHS",
        title: "Solar Inverter Installation & Repair",
        status: "COMPLETED",
        createdAt: "2026-08-14T16:20:00Z",
      },
      {
        id: "tx-2",
        type: "ORDER",
        amount: 1200.00,
        currency: "GHS",
        title: "DeWalt 20V Max Heavy Duty Power Drill Kit",
        status: "COMPLETED",
        createdAt: "2026-08-05T11:00:00Z",
      },
    ],
    omnichannelEvents: [
      {
        id: "ev-1",
        type: "SUPPORT_CHAT",
        title: "WhatsApp Dispatch Inquiry",
        summary: "Inquired about 24/7 emergency solar repair team availability.",
        channel: "WhatsApp",
        timestamp: "2026-08-14T15:00:00Z",
      },
      {
        id: "ev-2",
        type: "EMAIL_SENT",
        title: "Receipt & Warranty Confirmation",
        summary: "Digital warranty certificate emailed for DeWalt Drill Kit.",
        channel: "Email",
        timestamp: "2026-08-05T11:05:00Z",
      },
    ],
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-08-14T16:20:00Z",
  },
  {
    id: "crm-cust-2",
    userId: "user-102",
    name: "Fatima Abdul-Rahman",
    email: "fatima.abdul@gmail.com",
    phone: "+233501234567",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    role: "PROVIDER",
    accountType: "DUAL",
    status: "ACTIVE",
    verificationTier: "TIER_3_ENTERPRISE",
    riskLevel: "LOW",
    riskScore: 5.0,
    lifetimeValue: 12450.00,
    averageOrderValue: 655.26,
    totalOrdersCount: 19,
    completedJobsCount: 18,
    disputeCount: 0,
    disputeRate: 0.0,
    returnCancellationRate: 5.2,
    walletBalance: 1450.00,
    pendingEscrow: 850.00,
    rewardPoints: 1200,
    serviceArea: "Nyohini & Aboabo, Tamale",
    addresses: [
      {
        id: "addr-3",
        title: "Workshop & Boutique",
        area: "Nyohini",
        street: "Lamashegu Link",
        landmark: "Near Nyohini Presby",
        latitude: 9.3988,
        longitude: -0.8450,
      },
    ],
    connectedIdentities: {
      socialLogins: ["Google", "Facebook"],
      deviceIds: ["dev-samsung-s23", "dev-ipad-air"],
      browserFingerprints: ["fp_451c88a109"],
      linkedGuestSessionsCount: 4,
    },
    tags: ["Verified Artisan", "Fugu Tailor", "Nyohini", "High Spender", "Wholesale Buyer"],
    customAttributes: {
      businessName: "Northern Authentic Fugu & Fabrics",
      yearsInBusiness: 6,
    },
    internalNotes: [
      {
        id: "note-102",
        customerId: "crm-cust-2",
        adminId: "admin-master",
        adminName: "Master Admin",
        content: "Top-rated artisan & customer. Approved for Tier 3 Enterprise status.",
        isPinned: true,
        createdAt: "2026-07-20T11:00:00Z",
      },
    ],
    activityLogs: [
      {
        id: "log-102",
        customerId: "crm-cust-2",
        performedBy: "admin-master",
        action: "TIER_UPGRADE",
        metadata: { from: "TIER_2_IDENTITY", to: "TIER_3_ENTERPRISE", docType: "Business Cert & Ghana Card" },
        ipAddress: "102.176.12.88",
        createdAt: "2026-07-20T10:50:00Z",
      },
    ],
    recentTransactions: [
      {
        id: "tx-3",
        type: "ORDER",
        amount: 2400.00,
        currency: "GHS",
        title: "Bulk Handwoven Smock/Fugu Fabric Bundle",
        status: "COMPLETED",
        createdAt: "2026-08-12T14:30:00Z",
      },
    ],
    omnichannelEvents: [
      {
        id: "ev-3",
        type: "COMMUNITY_POST",
        title: "Artisan Meetup Announcement",
        summary: "Posted workshop invitation on Northern Artisans Community Notice Board.",
        channel: "Community Board",
        timestamp: "2026-08-11T09:15:00Z",
      },
    ],
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-08-12T14:30:00Z",
  },
  {
    id: "crm-cust-3",
    userId: "user-103",
    name: "Kwame Mensah",
    email: "kwame.mensah@yahoomail.com",
    phone: "+233209876543",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "CUSTOMER",
    accountType: "BUYER",
    status: "SUSPENDED",
    verificationTier: "UNVERIFIED",
    riskLevel: "HIGH",
    riskScore: 68.0,
    lifetimeValue: 350.00,
    averageOrderValue: 175.00,
    totalOrdersCount: 2,
    completedJobsCount: 1,
    disputeCount: 2,
    disputeRate: 100.0,
    returnCancellationRate: 50.0,
    walletBalance: 0.00,
    pendingEscrow: 350.00,
    rewardPoints: 0,
    serviceArea: "Choggu, Tamale",
    addresses: [
      {
        id: "addr-4",
        title: "Residence",
        area: "Choggu Manayili",
        street: "Kumbungu Road",
        latitude: 9.4211,
        longitude: -0.8520,
      },
    ],
    connectedIdentities: {
      socialLogins: [],
      deviceIds: ["dev-android-unknown-1", "dev-android-unknown-2", "dev-pc-win10"],
      browserFingerprints: ["fp_112x900", "fp_887z111"],
      linkedGuestSessionsCount: 7,
    },
    tags: ["Dispute Risk", "Frequent Canceller", "Unverified ID", "Choggu"],
    customAttributes: {
      flaggedReason: "Multiple chargeback attempts on mobile money payouts.",
    },
    internalNotes: [
      {
        id: "note-103",
        customerId: "crm-cust-3",
        adminId: "admin-master",
        adminName: "Master Admin",
        content: "Account suspended due to 2 consecutive false dispute claims against a plumber.",
        isPinned: true,
        createdAt: "2026-08-15T16:00:00Z",
      },
    ],
    activityLogs: [
      {
        id: "log-103",
        customerId: "crm-cust-3",
        performedBy: "admin-master",
        action: "SUSPEND_ACCOUNT",
        metadata: { reason: "DISPUTE_FRAUD", escrowFrozenGHS: 350.00 },
        ipAddress: "197.251.190.5",
        createdAt: "2026-08-15T16:05:00Z",
      },
    ],
    recentTransactions: [
      {
        id: "tx-4",
        type: "ESCROW_FREEZE",
        amount: 350.00,
        currency: "GHS",
        title: "Plumbing Repair Escrow Lock (Disputed)",
        status: "DISPUTED",
        createdAt: "2026-08-15T12:00:00Z",
      },
    ],
    omnichannelEvents: [
      {
        id: "ev-4",
        type: "DISPUTE_THREAD",
        title: "Plumbing Service Dispute Claim",
        summary: "Claimed job was not completed, provider submitted photos proving completion.",
        channel: "Helpdesk Disputing",
        timestamp: "2026-08-15T13:20:00Z",
      },
    ],
    createdAt: "2026-06-10T14:00:00Z",
    updatedAt: "2026-08-15T16:05:00Z",
  },
  {
    id: "crm-cust-4",
    userId: "user-104",
    name: "Yakubu Fuseini",
    email: "yakubu.fuseini@dungu.uds.edu.gh",
    phone: "+233244889900",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "CUSTOMER",
    accountType: "BUYER",
    status: "ACTIVE",
    verificationTier: "TIER_1_BASIC",
    riskLevel: "LOW",
    riskScore: 18.0,
    lifetimeValue: 1850.00,
    averageOrderValue: 370.00,
    totalOrdersCount: 5,
    completedJobsCount: 5,
    disputeCount: 0,
    disputeRate: 0.0,
    returnCancellationRate: 0.0,
    walletBalance: 150.00,
    pendingEscrow: 0.00,
    rewardPoints: 180,
    serviceArea: "Dungu UDS Campus, Tamale",
    addresses: [
      {
        id: "addr-5",
        title: "Hostel",
        area: "Dungu UDS Campus",
        street: "University Main Gate Road",
        latitude: 9.3510,
        longitude: -0.8312,
      },
    ],
    connectedIdentities: {
      socialLogins: ["Google"],
      deviceIds: ["dev-pixel-7"],
      browserFingerprints: ["fp_px77701"],
      linkedGuestSessionsCount: 1,
    },
    tags: ["UDS Student", "Dungu", "Tool Rental", "Early Adopter"],
    customAttributes: {
      institution: "University for Development Studies (UDS)",
    },
    internalNotes: [
      {
        id: "note-104",
        customerId: "crm-cust-4",
        adminId: "admin-master",
        adminName: "Master Admin",
        content: "Frequent tool rentals for student engineering projects.",
        isPinned: false,
        createdAt: "2026-07-28T09:00:00Z",
      },
    ],
    activityLogs: [
      {
        id: "log-104",
        customerId: "crm-cust-4",
        performedBy: "SYSTEM",
        action: "PHONE_VERIFIED",
        metadata: { phone: "+233244889900" },
        ipAddress: "102.176.40.11",
        createdAt: "2026-05-20T10:00:00Z",
      },
    ],
    recentTransactions: [
      {
        id: "tx-5",
        type: "SERVICE_REQUEST",
        amount: 320.00,
        currency: "GHS",
        title: "Generator Rental (2 Days)",
        status: "COMPLETED",
        createdAt: "2026-08-08T08:30:00Z",
      },
    ],
    omnichannelEvents: [
      {
        id: "ev-5",
        type: "SMS_NOTIFICATION",
        title: "Rental Confirmation SMS",
        summary: "SMS sent confirming generator pickup at Sakasaka depot.",
        channel: "SMS",
        timestamp: "2026-08-08T08:31:00Z",
      },
    ],
    createdAt: "2026-05-20T10:00:00Z",
    updatedAt: "2026-08-08T08:30:00Z",
  },
];

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function readLocalCrmData(): CrmCustomer[] {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, "utf8");
      const items = JSON.parse(data);
      if (Array.isArray(items) && items.length > 0) return items;
    }
  } catch (e) {
    console.error("Error reading local CRM file:", e);
  }
  return INITIAL_DEFAULT_CUSTOMERS;
}

function writeLocalCrmData(items: CrmCustomer[]): boolean {
  try {
    ensureDirectoryExistence(JSON_FILE_PATH);
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(items, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Error writing local CRM file:", e);
    return false;
  }
}

export function calculateRiskScore(cust: Partial<CrmCustomer>): { score: number; level: RiskLevel } {
  let score = 0;

  if (cust.status === "SUSPENDED" || cust.status === "BANNED") score += 40;
  if (cust.status === "FROZEN_ESCROW") score += 30;

  const disputeCount = cust.disputeCount || 0;
  score += Math.min(disputeCount * 20, 40);

  const cancellationRate = cust.returnCancellationRate || 0;
  if (cancellationRate > 30) score += 20;
  else if (cancellationRate > 15) score += 10;

  if (cust.verificationTier === "UNVERIFIED") score += 15;
  else if (cust.verificationTier === "TIER_1_BASIC") score += 5;

  const devCount = cust.connectedIdentities?.deviceIds?.length || 1;
  if (devCount >= 3) score += 15;

  const guestCount = cust.connectedIdentities?.linkedGuestSessionsCount || 0;
  if (guestCount > 5) score += 10;

  const finalScore = Math.min(Math.max(score, 0), 100);

  let level: RiskLevel = "LOW";
  if (finalScore >= 75) level = "CRITICAL";
  else if (finalScore >= 50) level = "HIGH";
  else if (finalScore >= 25) level = "MEDIUM";

  return { score: Number(finalScore.toFixed(1)), level };
}

export async function getAllCrmCustomers(query?: CrmFilterQuery): Promise<{ customers: CrmCustomer[]; total: number }> {
  let list = readLocalCrmData();

  // Also query DB users to merge any real users in database
  try {
    if ((prisma as any).customerProfile || prisma.user) {
      const dbUsers = await prisma.user.findMany({
        include: {
          providerProfile: true,
          serviceRequests: true,
          verificationRequests: true,
        },
      });

      if (dbUsers && dbUsers.length > 0) {
        dbUsers.forEach((u) => {
          const exists = list.some((l) => l.userId === u.id || l.phone === u.phone);
          if (!exists) {
            const requests = u.serviceRequests || [];
            const completedCount = requests.filter((r) => r.status === "COMPLETED").length;
            const ltv = requests.reduce((acc, r) => acc + (r.budgetMin || 150), 0);

            const isProvider = u.role === "PROVIDER" || !!u.providerProfile;
            const tier: VerificationTier = u.verificationRequests?.some((v) => v.status === "VERIFIED")
              ? "TIER_2_IDENTITY"
              : u.isPhoneVerified
              ? "TIER_1_BASIC"
              : "UNVERIFIED";

            const newCust: CrmCustomer = {
              id: `crm-${u.id}`,
              userId: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              avatarUrl: u.avatarUrl || u.providerProfile?.logoUrl || null,
              role: u.role,
              accountType: isProvider ? "DUAL" : "BUYER",
              status: "ACTIVE",
              verificationTier: tier,
              riskLevel: "LOW",
              riskScore: 10.0,
              lifetimeValue: ltv,
              averageOrderValue: requests.length > 0 ? Number((ltv / requests.length).toFixed(2)) : 0,
              totalOrdersCount: requests.length,
              completedJobsCount: completedCount,
              disputeCount: 0,
              disputeRate: 0,
              returnCancellationRate: 0,
              walletBalance: 0,
              pendingEscrow: 0,
              rewardPoints: 100,
              serviceArea: u.providerProfile?.serviceArea || "Tamale Central",
              addresses: [
                {
                  id: `addr-${u.id}`,
                  title: "Primary Address",
                  area: u.providerProfile?.serviceArea || "Tamale",
                  street: "Main St",
                },
              ],
              connectedIdentities: {
                socialLogins: [],
                deviceIds: ["dev-web-browser"],
                browserFingerprints: ["fp_web_active"],
                linkedGuestSessionsCount: 1,
              },
              tags: isProvider ? ["Provider", "Artisan", "Tamale"] : ["Buyer", "Tamale"],
              internalNotes: [],
              activityLogs: [
                {
                  id: `log-${Date.now()}`,
                  customerId: `crm-${u.id}`,
                  performedBy: "SYSTEM",
                  action: "ACCOUNT_CREATED",
                  createdAt: u.createdAt.toISOString(),
                },
              ],
              recentTransactions: [],
              omnichannelEvents: [],
              createdAt: u.createdAt.toISOString(),
              updatedAt: u.updatedAt.toISOString(),
            };

            const risk = calculateRiskScore(newCust);
            newCust.riskScore = risk.score;
            newCust.riskLevel = risk.level;

            list.push(newCust);
          }
        });
      }
    }
  } catch (e) {
    // DB query fallback
  }

  // Filtering
  if (query) {
    const { search, status, riskLevel, verificationTier, tag } = query;

    if (search && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          c.serviceArea.toLowerCase().includes(q)
      );
    }

    if (status && status !== "ALL") {
      list = list.filter((c) => c.status === status);
    }

    if (riskLevel && riskLevel !== "ALL") {
      list = list.filter((c) => c.riskLevel === riskLevel);
    }

    if (verificationTier && verificationTier !== "ALL") {
      list = list.filter((c) => c.verificationTier === verificationTier);
    }

    if (tag && tag !== "ALL") {
      list = list.filter((c) => c.tags.includes(tag));
    }

    if (query.sortBy) {
      list.sort((a, b) => {
        let valA = a[query.sortBy as keyof CrmCustomer] as any;
        let valB = b[query.sortBy as keyof CrmCustomer] as any;
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (query.sortOrder === "asc") return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
    }
  }

  return { customers: list, total: list.length };
}

export async function getCrmCustomerById(id: string): Promise<CrmCustomer | null> {
  const { customers } = await getAllCrmCustomers();
  const found = customers.find((c) => c.id === id || c.userId === id);
  return found || null;
}

export async function updateCustomerStatus(
  id: string,
  newStatus: CustomerStatus,
  adminId: string,
  reason?: string
): Promise<CrmCustomer | null> {
  const list = readLocalCrmData();
  const target = list.find((c) => c.id === id || c.userId === id);
  if (!target) return null;

  const oldStatus = target.status;
  target.status = newStatus;
  target.updatedAt = new Date().toISOString();

  // Recalculate risk score
  const risk = calculateRiskScore(target);
  target.riskScore = risk.score;
  target.riskLevel = risk.level;

  // Append Audit log
  target.activityLogs.unshift({
    id: `log-${Date.now()}`,
    customerId: target.id,
    performedBy: adminId,
    action: "STATUS_UPDATE",
    metadata: { oldStatus, newStatus, reason: reason || "Admin Status Adjustment" },
    createdAt: new Date().toISOString(),
  });

  writeLocalCrmData(list);
  return target;
}

export async function addAdminStickyNote(
  customerId: string,
  adminId: string,
  adminName: string,
  content: string,
  isPinned: boolean = false
): Promise<AdminNote | null> {
  const list = readLocalCrmData();
  const target = list.find((c) => c.id === customerId || c.userId === customerId);
  if (!target) return null;

  const newNote: AdminNote = {
    id: `note-${Date.now()}`,
    customerId: target.id,
    adminId,
    adminName,
    content,
    isPinned,
    createdAt: new Date().toISOString(),
  };

  if (isPinned) {
    target.internalNotes.unshift(newNote);
  } else {
    target.internalNotes.push(newNote);
  }

  target.activityLogs.unshift({
    id: `log-${Date.now()}`,
    customerId: target.id,
    performedBy: adminId,
    action: "ADD_ADMIN_NOTE",
    metadata: { noteId: newNote.id, isPinned },
    createdAt: new Date().toISOString(),
  });

  writeLocalCrmData(list);
  return newNote;
}

export async function updateCustomerTags(
  customerId: string,
  tags: string[],
  adminId: string
): Promise<CrmCustomer | null> {
  const list = readLocalCrmData();
  const target = list.find((c) => c.id === customerId || c.userId === customerId);
  if (!target) return null;

  target.tags = tags;
  target.updatedAt = new Date().toISOString();

  target.activityLogs.unshift({
    id: `log-${Date.now()}`,
    customerId: target.id,
    performedBy: adminId,
    action: "UPDATE_TAGS",
    metadata: { tags },
    createdAt: new Date().toISOString(),
  });

  writeLocalCrmData(list);
  return target;
}

export async function applyFinancialAdjustment(
  customerId: string,
  type: "WALLET_CREDIT" | "DISCOUNT_VOUCHER" | "REFUND" | "ESCROW_FREEZE",
  amount: number,
  title: string,
  adminId: string
): Promise<CrmCustomer | null> {
  const list = readLocalCrmData();
  const target = list.find((c) => c.id === customerId || c.userId === customerId);
  if (!target) return null;

  if (type === "WALLET_CREDIT" || type === "REFUND") {
    target.walletBalance += amount;
  } else if (type === "ESCROW_FREEZE") {
    target.status = "FROZEN_ESCROW";
    target.pendingEscrow += amount;
  }

  target.recentTransactions.unshift({
    id: `tx-${Date.now()}`,
    type,
    amount,
    currency: "GHS",
    title,
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
  });

  target.activityLogs.unshift({
    id: `log-${Date.now()}`,
    customerId: target.id,
    performedBy: adminId,
    action: `MANUAL_${type}`,
    metadata: { amount, title },
    createdAt: new Date().toISOString(),
  });

  const risk = calculateRiskScore(target);
  target.riskScore = risk.score;
  target.riskLevel = risk.level;

  writeLocalCrmData(list);
  return target;
}

export async function generateShadowLoginToken(
  customerId: string,
  adminId: string,
  reason: string
): Promise<{ token: string; expiresAt: string } | null> {
  const list = readLocalCrmData();
  const target = list.find((c) => c.id === customerId || c.userId === customerId);
  if (!target) return null;

  const token = `shadow_token_${target.userId}_${Date.now()}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  target.activityLogs.unshift({
    id: `log-${Date.now()}`,
    customerId: target.id,
    performedBy: adminId,
    action: "IMPERSONATION_SHADOW_LOGIN",
    metadata: { reason, token, expiresAt },
    createdAt: new Date().toISOString(),
  });

  writeLocalCrmData(list);
  return { token, expiresAt };
}
