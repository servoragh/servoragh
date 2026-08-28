import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "servora-secret-key-tamale-2026";
const TOKEN_NAME = "servora_token";

export interface SessionUser {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  avatarUrl?: string | null;
  isPhoneVerified: boolean;
  providerProfileId?: string | null;
  providerSlug?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(req?: Request): Promise<SessionUser | null> {
  try {
    if (req) {
      const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7).trim();
        const user = verifyToken(token);
        if (user) return user;
      }

      // Mobile / Header fallback resolution
      const phoneHeader = req.headers.get("x-user-phone") || req.headers.get("x-phone");
      const idHeader = req.headers.get("x-user-id") || req.headers.get("x-id");
      if (phoneHeader || idHeader) {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: idHeader || undefined },
              { phone: phoneHeader || undefined },
              { phone: phoneHeader ? phoneHeader.replace("+233", "0") : undefined },
              { phone: phoneHeader ? "+233" + phoneHeader.replace(/^0/, "") : undefined },
            ].filter(Boolean),
          },
        });
        if (dbUser) {
          return {
            id: dbUser.id,
            name: dbUser.name,
            phone: dbUser.phone,
            email: dbUser.email,
            role: dbUser.role as any,
            avatarUrl: dbUser.avatarUrl,
            isPhoneVerified: dbUser.isPhoneVerified,
          };
        }
      }
    }
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  const token = signToken(user);
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getCurrentUserFromDb() {
  const session = await getSession();
  if (!session) return null;
  
  return prisma.user.findUnique({
    where: { id: session.id },
    include: {
      providerProfile: true,
    },
  });
}
