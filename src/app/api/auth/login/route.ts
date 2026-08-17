import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, setSessionCookie, SessionUser } from "@/lib/auth";
import { getPhoneVariants } from "@/lib/utils";

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

    if (!user) {
      return NextResponse.json({ error: "No account found with this phone number or email." }, { status: 404 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password. Please check your password and try again." }, { status: 401 });
    }

    const sessionUser: SessionUser = {
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

    await setSessionCookie(sessionUser);

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Login failed. Please check your network connection and credentials." }, { status: 500 });
  }
}
