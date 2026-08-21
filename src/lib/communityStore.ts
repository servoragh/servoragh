import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  CommunityPostItem,
  CommunityCommentItem,
  CreateCommunityPostPayload,
  CommunityFilterQuery,
} from "./communityTypes";

const JSON_FILE_PATH = path.join(process.cwd(), "src", "data", "community_data.json");

export const INITIAL_COMMUNITY_POSTS: CommunityPostItem[] = [
  {
    id: "post-101",
    title: "Urgent: 5.5KVA Heavy Duty Generator Needed for Site Work",
    content: "Looking for an artisan or equipment supplier in Sakasaka to rent a 5.5KVA diesel generator for 2 days. Needed for commercial wiring job.",
    category: "TOOL_RENTAL",
    zone: "SAKASAKA",
    status: "OPEN_ACTIVE",
    budget: 250,
    currency: "GHS",
    urgency: "Immediate",
    photos: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    ],
    authorId: "user-102",
    authorName: "Kwame Electrical & Solar",
    authorPhone: "+233244889900",
    authorWhatsApp: "+233244889900",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    isVerifiedArtisan: true,
    upvotesCount: 14,
    commentsCount: 3,
    viewsCount: 185,
    comments: [
      {
        id: "c-1",
        postId: "post-101",
        authorName: "Salifu Equipment Rentals",
        content: "I have a Honda 6KVA generator available right now at Sakasaka Market. Call me on +233245678901.",
        createdAt: "2026-08-18T10:15:00Z",
      },
    ],
    createdAt: "2026-08-18T09:30:00Z",
    updatedAt: "2026-08-18T09:30:00Z",
  },
  {
    id: "post-102",
    title: "GRID ALERT: Planned Power Outage in Nyohini & Lamashegu Zone",
    content: "Grid maintenance team working on main transformer near Nyohini roundabout. Expected downtime from 10:00 AM to 4:00 PM today. Keep solar backups ready.",
    category: "GRID_ALERT",
    zone: "NYOHINI",
    status: "OPEN_ACTIVE",
    budget: null,
    currency: "GHS",
    urgency: "Today",
    photos: [
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80",
    ],
    authorName: "Tamale Community Dispatch",
    authorPhone: "+233501234567",
    authorWhatsApp: "+233501234567",
    authorAvatar: null,
    isVerifiedArtisan: true,
    upvotesCount: 38,
    commentsCount: 7,
    viewsCount: 420,
    comments: [],
    createdAt: "2026-08-18T08:00:00Z",
    updatedAt: "2026-08-18T08:00:00Z",
  },
  {
    id: "post-103",
    title: "Master Artisan Apprenticeship: Traditional Dagbon Fugu Weaving",
    content: "Opening 3 slots for youth apprentices interested in learning handloom Fugu weaving and embroidery at Nyohini Center.",
    category: "SKILL_SHARE",
    zone: "NYOHINI",
    status: "OPEN_ACTIVE",
    budget: 0,
    currency: "GHS",
    urgency: "Scheduled",
    photos: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
    ],
    authorName: "Fatima Abdul-Rahman",
    authorPhone: "+233501234567",
    authorWhatsApp: "+233501234567",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isVerifiedArtisan: true,
    upvotesCount: 52,
    commentsCount: 12,
    viewsCount: 650,
    comments: [],
    createdAt: "2026-08-17T15:00:00Z",
    updatedAt: "2026-08-17T15:00:00Z",
  },
  {
    id: "post-104",
    title: "Urgent Service Call: Borehole Submersible Pump Wiring Repair",
    content: "Borehole pump motor tripped at Choggu Hilltop residence. Need a certified electrical artisan with insulation tester today.",
    category: "SERVICE_CALL",
    zone: "CHOGGU",
    status: "OPEN_ACTIVE",
    budget: 350,
    currency: "GHS",
    urgency: "Immediate",
    photos: [
      "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
    ],
    authorName: "Alhassan Ibrahim",
    authorPhone: "+233240112233",
    authorWhatsApp: "+233240112233",
    authorAvatar: null,
    isVerifiedArtisan: false,
    upvotesCount: 9,
    commentsCount: 2,
    viewsCount: 140,
    comments: [],
    createdAt: "2026-08-18T11:00:00Z",
    updatedAt: "2026-08-18T11:00:00Z",
  },
];

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function readLocalCommunityData(): CommunityPostItem[] {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, "utf8");
      const items = JSON.parse(data);
      if (Array.isArray(items) && items.length > 0) return items;
    }
  } catch (e) {
    console.error("Error reading local community file:", e);
  }
  return INITIAL_COMMUNITY_POSTS;
}

function writeLocalCommunityData(items: CommunityPostItem[]): boolean {
  try {
    ensureDirectoryExistence(JSON_FILE_PATH);
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(items, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Error writing local community file:", e);
    return false;
  }
}

export async function getAllCommunityPosts(query?: CommunityFilterQuery): Promise<{ posts: CommunityPostItem[]; total: number }> {
  let list = readLocalCommunityData();

  // Try Prisma DB if available
  try {
    if ((prisma as any).communityPost) {
      const dbPosts = await (prisma as any).communityPost.findMany({
        include: {
          author: { select: { name: true, phone: true, avatarUrl: true } },
          comments: true,
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      });

      if (dbPosts && dbPosts.length > 0) {
        list = dbPosts.map((p: any) => ({
          id: p.id,
          title: p.title,
          content: p.content,
          category: p.category,
          zone: p.zone,
          status: p.status,
          isPinned: Boolean(p.isPinned),
          isLocked: Boolean(p.isLocked),
          budget: p.budget ? Number(p.budget) : null,
          currency: p.currency || "GHS",
          urgency: p.urgency || "Flexible",
          photos: Array.isArray(p.photos) ? p.photos : JSON.parse(p.photos || "[]"),
          authorId: p.authorId,
          authorName: p.author?.name || p.guestName || "Community Member",
          authorPhone: p.author?.phone || p.guestPhone || null,
          authorWhatsApp: p.guestWhatsApp || p.author?.phone || null,
          authorAvatar: p.author?.avatarUrl || null,
          isVerifiedArtisan: true,
          upvotesCount: p.upvotesCount || 0,
          commentsCount: p.commentsCount || (p.comments ? p.comments.length : 0),
          viewsCount: p.viewsCount || 0,
          comments: (p.comments || []).map((c: any) => ({
            id: c.id,
            postId: c.postId,
            authorName: c.guestName || "Member",
            content: c.content,
            createdAt: c.createdAt.toISOString(),
          })),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));
      }
    }
  } catch (e) {
    // Database query fallback
  }

  if (query) {
    const { search, zone, category, status } = query;

    if (search && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q)
      );
    }

    if (zone && zone !== "ALL" && zone !== ("ALL_NORTHERN_GH" as any)) {
      list = list.filter((p) => p.zone === zone);
    }

    if (category && category !== "ALL" && category !== ("ALL_DISCUSSIONS" as any)) {
      list = list.filter((p) => p.category === category);
    }

    if (status && status !== "ALL") {
      list = list.filter((p) => p.status === status);
    }
  }

  list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return { posts: list, total: list.length };
}

export async function createCommunityPost(payload: CreateCommunityPostPayload, sessionUser?: any): Promise<CommunityPostItem> {
  const list = readLocalCommunityData();

  const isGuest = !sessionUser;
  const newPost: CommunityPostItem = {
    id: `post-${Date.now()}`,
    title: payload.title,
    content: payload.content,
    category: payload.category || "ALL_DISCUSSIONS",
    zone: payload.zone || "ALL_NORTHERN_GH",
    status: "OPEN_ACTIVE",
    budget: payload.budget ? Number(payload.budget) : null,
    currency: payload.currency || "GHS",
    urgency: payload.urgency || "Flexible",
    photos: payload.photos && payload.photos.length > 0 ? payload.photos : [],
    authorId: sessionUser ? sessionUser.id : null,
    authorName: sessionUser ? sessionUser.name : payload.guestName || "Guest Resident",
    authorPhone: sessionUser ? sessionUser.phone : payload.guestPhone || "+233240000000",
    authorWhatsApp: sessionUser ? sessionUser.phone : payload.guestWhatsApp || payload.guestPhone || "+233240000000",
    authorAvatar: sessionUser?.avatarUrl || null,
    isVerifiedArtisan: !!sessionUser,
    upvotesCount: 1,
    commentsCount: 0,
    viewsCount: 1,
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  list.unshift(newPost);
  writeLocalCommunityData(list);

  try {
    if ((prisma as any).communityPost) {
      await (prisma as any).communityPost.create({
        data: {
          id: newPost.id,
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          zone: newPost.zone,
          status: newPost.status,
          budget: newPost.budget,
          currency: newPost.currency,
          urgency: newPost.urgency,
          photos: newPost.photos,
          authorId: newPost.authorId,
          guestName: isGuest ? payload.guestName : undefined,
          guestPhone: isGuest ? payload.guestPhone : undefined,
          guestWhatsApp: isGuest ? payload.guestWhatsApp : undefined,
          upvotesCount: 1,
        },
      });
    }
  } catch (e) {}

  return newPost;
}

export async function upvoteCommunityPost(postId: string): Promise<number> {
  const list = readLocalCommunityData();
  const target = list.find((p) => p.id === postId);
  if (!target) return 0;

  target.upvotesCount = (target.upvotesCount || 0) + 1;
  target.hasUpvoted = true;
  writeLocalCommunityData(list);

  try {
    if ((prisma as any).communityPost) {
      await (prisma as any).communityPost.update({
        where: { id: postId },
        data: { upvotesCount: target.upvotesCount },
      });
    }
  } catch (e) {}

  return target.upvotesCount;
}

export async function addCommunityComment(postId: string, content: string, authorName: string): Promise<CommunityCommentItem | null> {
  const list = readLocalCommunityData();
  const target = list.find((p) => p.id === postId);
  if (!target) return null;

  const newComment: CommunityCommentItem = {
    id: `c-${Date.now()}`,
    postId,
    authorName,
    content,
    createdAt: new Date().toISOString(),
  };

  if (!target.comments) target.comments = [];
  target.comments.push(newComment);
  target.commentsCount = target.comments.length;

  writeLocalCommunityData(list);

  try {
    if ((prisma as any).communityComment) {
      await (prisma as any).communityComment.create({
        data: {
          id: newComment.id,
          postId,
          guestName: authorName,
          content,
        },
      });
    }
  } catch (e) {}

  return newComment;
}
