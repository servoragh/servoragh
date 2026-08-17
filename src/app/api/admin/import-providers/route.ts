import { NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { providersData } = body; // Array of artisan records: name, phone, businessName, serviceArea, bio, yearsExperience

    if (!providersData || !Array.isArray(providersData) || providersData.length === 0) {
      return NextResponse.json({ error: "Please provide a valid list of artisan records to import." }, { status: 400 });
    }

    const defaultPassword = await hashPassword("tamale123");
    let importedCount = 0;
    const errors: string[] = [];

    // Get default electrician service
    const defaultService = await prisma.service.findFirst();

    for (const item of providersData) {
      try {
        if (!item.name || !item.phone || !item.businessName) {
          errors.push(`Skipped record without name/phone/businessName: ${JSON.stringify(item)}`);
          continue;
        }

        const cleanPhone = item.phone.trim();
        const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });

        if (existing) {
          errors.push(`Phone ${cleanPhone} already registered.`);
          continue;
        }

        const user = await prisma.user.create({
          data: {
            name: item.name,
            phone: cleanPhone,
            passwordHash: defaultPassword,
            role: "PROVIDER",
            isPhoneVerified: true,
            referralCode: `${item.name.slice(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
          },
        });

        const slug = `${item.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(100 + Math.random() * 900)}`;

        const profile = await prisma.providerProfile.create({
          data: {
            userId: user.id,
            businessName: item.businessName,
            slug,
            bio: item.bio || `Skilled service artisan operating in Tamale.`,
            yearsExperience: Number(item.yearsExperience) || 3,
            serviceArea: item.serviceArea || "Sakasaka, Tamale Central",
            verificationStatus: "VERIFIED",
            badges: JSON.stringify(["PHONE_VERIFIED", "IDENTITY_VERIFIED"]),
          },
        });

        if (defaultService) {
          await prisma.providerService.create({
            data: {
              providerId: profile.id,
              serviceId: defaultService.id,
            },
          });
        }

        importedCount++;
      } catch (err: any) {
        errors.push(`Error importing ${item.name}: ${err.message}`);
      }
    }

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "BATCH_ARTISAN_IMPORT",
        details: `Batch imported ${importedCount} service artisans. Errors: ${errors.length}`,
      },
    });

    return NextResponse.json({ success: true, importedCount, errors });
  } catch (error: any) {
    console.error("Batch Import Error:", error);
    return NextResponse.json({ error: "Batch artisan import failed." }, { status: 500 });
  }
}
