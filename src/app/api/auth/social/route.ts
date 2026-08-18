import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, SessionUser, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, name, email, phone, role = "CUSTOMER" } = body;

    if (!provider) {
      return NextResponse.json({ error: "Social provider is required." }, { status: 400 });
    }

    const cleanProvider = String(provider).toLowerCase();
    const mockEmail = email?.toLowerCase() || `${cleanProvider}.user@servora.gh`;
    const mockName = name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
    const mockPhone = phone || `+23324000${Math.floor(1000 + Math.random() * 9000)}`;

    // Find existing user by email or phone
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: mockEmail }, { phone: mockPhone }],
      },
      include: {
        providerProfile: true,
      },
    });

    if (!user) {
      const defaultPassword = await hashPassword(`social-${cleanProvider}-pass-123`);
      user = await prisma.user.create({
        data: {
          name: mockName,
          phone: mockPhone,
          email: mockEmail,
          passwordHash: defaultPassword,
          role: role as any,
          isPhoneVerified: true,
        },
        include: {
          providerProfile: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Failed to create or fetch social user profile." }, { status: 500 });
    }

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role as "CUSTOMER" | "PROVIDER" | "ADMIN",
      avatarUrl: user.avatarUrl,
      isPhoneVerified: true,
      providerProfileId: user.providerProfile?.id || null,
      providerSlug: user.providerProfile?.slug || null,
    };

    await setSessionCookie(sessionUser);

    const redirectUrl =
      user.role === "ADMIN"
        ? "/admin"
        : user.role === "PROVIDER"
        ? "/business/portal"
        : "/dashboard";

    return NextResponse.json({ success: true, user: sessionUser, redirectUrl });
  } catch (error: any) {
    console.error("Social Auth Error:", error);
    return NextResponse.json({ error: "Social authentication failed." }, { status: 500 });
  }
}
