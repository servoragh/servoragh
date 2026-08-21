import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, setSessionCookie, SessionUser } from "@/lib/auth";
import { getPhoneVariants } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneOrEmail, password } = body;

    if (!phoneOrEmail || !password) {
      return NextResponse.json({ error: "Phone number/email and password are required." }, { status: 400 });
    }

    const cleanInput = phoneOrEmail.trim();
    const cleanLower = cleanInput.toLowerCase();
    const phoneVariants = getPhoneVariants(cleanInput);

    let sessionUser: SessionUser | null = null;

    // Database lookup in real PostgreSQL database
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: { in: phoneVariants } },
          { email: cleanLower },
          { email: { equals: cleanLower, mode: "insensitive" } },
        ],
      },
      include: {
        providerProfile: true,
      },
    });

    if (user) {
      const isValid = await comparePassword(password, user.passwordHash);
      if (isValid) {
        sessionUser = {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role as "CUSTOMER" | "PROVIDER" | "ADMIN",
          avatarUrl: user.avatarUrl,
          isPhoneVerified: user.isPhoneVerified,
          providerProfileId: user.providerProfile?.id || null,
          providerSlug: user.providerProfile?.slug || null,
        };
      } else {
        return NextResponse.json(
          { error: "Invalid password. Please check your password and try again." },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "No account found matching this email/phone number. Please register first." },
        { status: 404 }
      );
    }

    await setSessionCookie(sessionUser);

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error: any) {
    console.error("Database Login Error:", error);
    return NextResponse.json(
      { error: "Authentication system error. Please check database connection." },
      { status: 500 }
    );
  }
}
