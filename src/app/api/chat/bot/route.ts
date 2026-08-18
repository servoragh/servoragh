import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SERVORA_SYSTEM_PROMPT = `You are Servora AI, an intelligent, polite, and highly knowledgeable AI assistant for Servora — Northern Ghana's premier local service marketplace connecting customers with verified electricians, plumbers, phone repair technicians, solar installers, Fugu tailors, and local equipment suppliers in Tamale, Bolgatanga, Wa, Yendi, and Damongo.

Key Platform Guidelines:
- Verification: Artisans with green Verified Badges have passed Ghana Card and physical address checks.
- Payments: Servora Escrow protects payments for 100% money-back safety.
- Requesting Services: Customers can click "Post Job & Get Quotes" or use WhatsApp for direct bids.
- Keep answers helpful, concise, friendly, and structured.`;

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { message, roomId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message content is required." }, { status: 400 });
    }

    const text = message.trim();
    const lowerText = text.toLowerCase();
    let reply = "";
    let shouldEscalate = false;

    // Check if Real Google Gemini AI key is present
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        const aiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${SERVORA_SYSTEM_PROMPT}\n\nCustomer (${session ? session.name : "Guest"}): ${text}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
              },
            }),
          }
        );

        const aiData = await aiResponse.json();
        const candidateText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidateText && candidateText.trim()) {
          reply = `🤖 **Servora Real AI**: ${candidateText.trim()}`;
        }
      } catch (geminiErr) {
        console.error("Gemini AI API Error:", geminiErr);
      }
    }

    // Fallback if Real AI is not configured or fails
    if (!reply) {
      // 1. Order / Request Status Lookup Intent
      if (lowerText.includes("order") || lowerText.includes("request") || lowerText.includes("track") || lowerText.includes("status")) {
        if (session) {
          const lastRequest = await prisma.serviceRequest.findFirst({
            where: { customerId: session.id },
            orderBy: { createdAt: "desc" },
            include: { service: true, location: true },
          });

          if (lastRequest) {
            const serviceName = lastRequest.service?.name || lastRequest.customCategory || "Service";
            const areaName = lastRequest.location?.area || lastRequest.landmark || "Tamale";
            reply = `🤖 **Servora AI Assistant**: I found your latest service request "${lastRequest.title}" (${serviceName} in ${areaName}). Current Status: **${lastRequest.status}**.`;
          } else {
            reply = `🤖 **Servora AI Assistant**: You don't have any active service requests right now. Would you like help posting one?`;
          }
        } else {
          reply = `🤖 **Servora AI Assistant**: Please sign in to check your active orders and service requests in Tamale.`;
        }
      }
      // 2. Return & Refund Policy Intent
      else if (lowerText.includes("return") || lowerText.includes("refund") || lowerText.includes("cancel") || lowerText.includes("dispute")) {
        reply = `🤖 **Servora AI Assistant**: Servora offers 100% Buyer Protection in Tamale! If a provider fails to fulfill a job or a delivered product is damaged, you can open a **Dispute Resolution Ticket** within 48 hours for a full refund mediation.`;
      }
      // 3. Payment & Mobile Money Intent
      else if (lowerText.includes("payment") || lowerText.includes("momo") || lowerText.includes("mtn") || lowerText.includes("telecel") || lowerText.includes("pay")) {
        reply = `🤖 **Servora AI Assistant**: We support all major Ghanaian Mobile Money providers (MTN MoMo, Telecel Cash, AT Money). Always keep payments inside Servora Escrow for 100% money-back protection!`;
      }
      // 4. Verification Intent
      else if (lowerText.includes("verify") || lowerText.includes("ghana card") || lowerText.includes("badge")) {
        reply = `🤖 **Servora AI Assistant**: Vendors with green **Verified Badges** have uploaded their Ghana Card and undergone physical address verification in Tamale.`;
      }
      // 5. Human Helpdesk Escalation Intent
      else if (lowerText.includes("agent") || lowerText.includes("human") || lowerText.includes("help") || lowerText.includes("support") || lowerText.includes("complaint")) {
        reply = `🤖 **Servora AI Assistant**: Connecting you to a live Platform Helpdesk Agent... A support ticket channel has been initialized.`;
        shouldEscalate = true;
      }
      // 6. Default Fallback
      else {
        reply = `🤖 **Servora AI Assistant**: Welcome to Servora Support! I can help you find local electricians, plumbers, tailors, check order status, or answer refund questions. How can I assist you in Northern Ghana today?`;
      }
    }

    // Save Bot Reply to Chat Room if roomId exists
    if (roomId) {
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
