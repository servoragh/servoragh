import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addAdminStickyNote } from "@/lib/crmStore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content, isPinned } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Note content is required." }, { status: 400 });
    }

    const newNote = await addAdminStickyNote(
      id,
      session.id,
      session.name || "Master Admin",
      content,
      !!isPinned
    );

    return NextResponse.json({ success: true, note: newNote });
  } catch (error: any) {
    console.error("CRM Notes POST Error:", error);
    return NextResponse.json({ error: "Failed to add internal admin sticky note." }, { status: 500 });
  }
}
