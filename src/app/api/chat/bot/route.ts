import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { message, roomId } = body;

    const text = (message || "").toLowerCase().trim();
    let reply = "";
    let shouldEscalate = false;

    // 1. Order / Request Status Lookup Intent
    if (text.includes("order") || text.includes("request") || text.includes("track") || text.includes("status")) {
      if (session) {
        const lastRequest = await prisma.serviceRequest.findFirst({
          where: { customerId: session.id },
          orderBy: { createdAt: "desc" },
          include: { service: true, location: true },
        });

        if (lastRequest) {
          const serviceName = lastRequest.service?.name || lastRequest.customCategory || "Service";
          const areaName = lastRequest.location?.area || lastRequest.landmark || "Tamale";
          reply = `🤖 **Servora AI Bot**: I found your latest service request "${lastRequest.title}" (${serviceName} in ${areaName}). Current Status: **${lastRequest.status}**.`;
        } else {
          reply = `🤖 **Servora AI Bot**: You don't have any active service requests right now. Would you like help posting one?`;
        }
      } else {
        reply = `🤖 **Servora AI Bot**: Please sign in to check your active orders and service requests.`;
      }
    }
    // 2. Return & Refund Policy Intent
    else if (text.includes("return") || text.includes("refund") || text.includes("cancel") || text.includes("dispute")) {
      reply = `🤖 **Servora AI Bot**: Servora offers 100% Buyer Protection in Tamale! If a provider fails to fulfill a job or a delivered product is damaged, you can open a **Dispute Resolution Ticket** within 48 hours for a full refund mediation.`;
    }
    // 3. Payment & Mobile Money Intent
    else if (text.includes("payment") || text.includes("momo") || text.includes("mtn") || text.includes("telecel") || text.includes("pay")) {
      reply = `🤖 **Servora AI Bot**: We support all major Ghanaian Mobile Money providers (MTN MoMo, Telecel Cash, AT Money). Always keep payments inside Servora Escrow for 100% money-back protection!`;
    }
    // 4. Verification Intent
    else if (text.includes("verify") || text.includes("ghana card") || text.includes("badge")) {
      reply = `🤖 **Servora AI Bot**: Vendors with green **Verified Badges** have uploaded their Ghana Card and undergone physical address verification in Tamale.`;
    }
    // 5. Human Helpdesk Escalation Intent
    else if (text.includes("agent") || text.includes("human") || text.includes("help") || text.includes("support") || text.includes("complaint")) {
      reply = `🤖 **Servora AI Bot**: Connecting you to a live Platform Helpdesk Agent... A support ticket channel has been initialized.`;
      shouldEscalate = true;
    }
    // 6. Default Fallback
    else {
      reply = `🤖 **Servora AI Bot**: Welcome to Servora Support! I can help you check order status, answer refund questions, or connect you to a live Support Agent. How can I assist you today?`;
    }

    // Save Bot Reply to Chat Room if roomId exists
    if (roomId) {
      // Find or create Bot user ID
      const botUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      const botSenderId = botUser?.id || session?.id || "bot-system";

      await prisma.chatMessage.create({
        data: {
          roomId,
          senderId: botSenderId,
          content: reply,
          status: "DELIVERED",
        },
      });

      if (shouldEscalate) {
        await prisma.chatRoom.update({
          where: { id: roomId },
          data: { scope: "C2ADMIN_SUPPORT", status: "OPEN" },
        });
      }
    }

    return NextResponse.json({ reply, shouldEscalate });
  } catch (error: any) {
    console.error("Bot Triage Error:", error);
    return NextResponse.json({ error: "Failed to process bot response." }, { status: 500 });
  }
}
