import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        subcategories: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Taxonomy GET Error:", error);
    return NextResponse.json({ error: "Failed to load category taxonomy." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, slug, description, icon, capabilities, verificationRequirement, disclaimerText, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const targetSlug = (slug || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    let updatedCategory;
    if (id) {
      updatedCategory = await prisma.category.update({
        where: { id },
        data: {
          name: name.trim(),
          slug: targetSlug,
          description: description || "",
          icon: icon || "Tag",
          capabilities: typeof capabilities === "string" ? capabilities : JSON.stringify(capabilities || ["SERVICES"]),
          verificationRequirement: verificationRequirement || "NONE",
          disclaimerText: disclaimerText || null,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
    } else {
      updatedCategory = await prisma.category.create({
        data: {
          name: name.trim(),
          slug: targetSlug,
          description: description || "",
          icon: icon || "Tag",
          capabilities: typeof capabilities === "string" ? capabilities : JSON.stringify(capabilities || ["SERVICES"]),
          verificationRequirement: verificationRequirement || "NONE",
          disclaimerText: disclaimerText || null,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "UPDATE_TAXONOMY_CATEGORY",
        details: `Saved category "${updatedCategory.name}" (${updatedCategory.slug}) in PostgreSQL taxonomy.`,
      },
    });

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (error: any) {
    console.error("Taxonomy POST Error:", error);
    return NextResponse.json({ error: "Failed to save category." }, { status: 500 });
  }
}
