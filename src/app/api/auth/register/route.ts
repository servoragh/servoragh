import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword, setSessionCookie, SessionUser } from "@/lib/auth";
import { getPhoneVariants } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, password, role } = body;

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "Name, phone number, and password are required." }, { status: 400 });
    }

    const phoneVariants = getPhoneVariants(phone);

    // Check if phone number already exists in any variant (+233 vs 024)
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: { in: phoneVariants },
      },
      include: {
        providerProfile: true,
      },
    });

    if (existingUser) {
      // Check if password matches existing account
      const isPasswordValid = await comparePassword(password, existingUser.passwordHash);

      if (isPasswordValid) {
        // Upgrade account to PROVIDER if requested
        const targetRole = role === "PROVIDER" ? "PROVIDER" : existingUser.role;

        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: targetRole,
            ...(email && !existingUser.email ? { email } : {}),
          },
          include: {
            providerProfile: true,
          },
        });

        const sessionUser: SessionUser = {
          id: updatedUser.id,
          name: updatedUser.name,
          phone: updatedUser.phone,
          email: updatedUser.email,
          role: updatedUser.role as "CUSTOMER" | "PROVIDER" | "ADMIN",
          avatarUrl: updatedUser.avatarUrl,
          isPhoneVerified: updatedUser.isPhoneVerified,
          providerProfileId: updatedUser.providerProfile?.id || null,
          providerSlug: updatedUser.providerProfile?.slug || null,
        };

        await setSessionCookie(sessionUser);

        return NextResponse.json({
          success: true,
          user: sessionUser,
          isExisting: true,
          message: "Account verified and upgraded successfully.",
        });
      }

      // Password mismatch
      return NextResponse.json(
        {
          error: "Your phone number is already registered. Please enter your account password or sign in.",
          isExisting: true,
        },
        { status: 400 }
      );
    }

    // New Registration
    const passwordHash = await hashPassword(password);
    const userRole = role === "PROVIDER" ? "PROVIDER" : "CUSTOMER";
    const referralCode = `${name.slice(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;

    const user = await prisma.user.create({
      data: {
        name,
        phone: phone.trim(),
        email: email || null,
        passwordHash,
        role: userRole,
        referralCode,
        isPhoneVerified: true,
      },
    });

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role as "CUSTOMER" | "PROVIDER" | "ADMIN",
      avatarUrl: user.avatarUrl,
      isPhoneVerified: user.isPhoneVerified,
    };

    await setSessionCookie(sessionUser);

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: error.message || "Registration failed. Please try again." }, { status: 500 });
  }
}
