import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SERVORA_SYSTEM_PROMPT = `You are Servora AI, a friendly, intelligent, and highly accurate customer assistant for Servora — Northern Ghana's local service marketplace connecting customers with verified electricians, plumbers, phone technicians, tailors, and suppliers across Tamale, Bolgatanga, Wa, Yendi, and Damongo.

Rules:
- Give clean, direct, helpful, and polite answers.
- Do NOT prefix your response with robotic labels like "🤖 Servora AI:". Just answer naturally.
- Emphasize phone-verified artisans, 100% Mobile Money Escrow protection, and WhatsApp instant quotes.`;

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

    // 1. Check if Google Gemini Real AI Key is available
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
                      text: `${SERVORA_SYSTEM_PROMPT}\n\nCustomer Question (${session ? session.name : "Guest"}): ${text}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: 350,
                temperature: 0.7,
              },
            }),
          }
        );

        const aiData = await aiResponse.json();
        const candidateText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidateText && candidateText.trim()) {
          reply = candidateText
            .replace(/^🤖\s*\*\*Servora.*?\*\*:\s*/i, "")
            .replace(/^Servora AI:\s*/i, "")
            .trim();
        }
      } catch (geminiErr) {
        console.error("Gemini AI API Error:", geminiErr);
      }
    }

    // 2. High-Accuracy Intelligence Engine Fallback
    if (!reply) {
      if (
        lowerText.includes("support") ||
        lowerText.includes("help") ||
        lowerText.includes("contact") ||
        lowerText.includes("agent") ||
        lowerText.includes("human") ||
        lowerText.includes("complaint")
      ) {
        reply = `Our Servora Customer Helpdesk is active 24/7 across Northern Ghana! You can reach our team directly via WhatsApp at +233500710610, submit a dispute ticket under your dashboard, or click "Post Job & Get Quotes" to match with top-rated local artisans.`;
        shouldEscalate = true;
      } else if (
        lowerText.includes("order") ||
        lowerText.includes("request") ||
        lowerText.includes("track") ||
        lowerText.includes("status")
      ) {
        if (session) {
          const lastRequest = await prisma.serviceRequest.findFirst({
            where: { customerId: session.id },
            orderBy: { createdAt: "desc" },
            include: { service: true, location: true },
          });

          if (lastRequest) {
            const serviceName = lastRequest.service?.name || lastRequest.customCategory || "Service";
            const areaName = lastRequest.location?.area || lastRequest.landmark || "Tamale";
            reply = `I found your latest service request "${lastRequest.title}" (${serviceName} in ${areaName}). Current Status: ${lastRequest.status}.`;
          } else {
            reply = `You don't have any active service requests right now. Would you like help posting one?`;
          }
        } else {
          reply = `Please sign in to check your active orders and service requests across Northern Ghana.`;
        }
      } else if (
        lowerText.includes("return") ||
        lowerText.includes("refund") ||
        lowerText.includes("cancel") ||
        lowerText.includes("dispute")
      ) {
        reply = `Servora offers 100% Buyer Protection in Tamale! If an artisan fails to fulfill a job or a delivered product is damaged, you can open a Dispute Ticket within 48 hours for a full escrow refund mediation.`;
      } else if (
        lowerText.includes("payment") ||
        lowerText.includes("momo") ||
        lowerText.includes("mtn") ||
        lowerText.includes("telecel") ||
        lowerText.includes("pay") ||
        lowerText.includes("escrow")
      ) {
        reply = `We support all major Ghanaian Mobile Money networks (MTN MoMo, Telecel Cash, AT Money). Always keep payments inside Servora Escrow for 100% money-back protection!`;
      } else if (
        lowerText.includes("electrician") ||
        lowerText.includes("plumber") ||
        lowerText.includes("fugu") ||
        lowerText.includes("repair") ||
        lowerText.includes("artisan")
      ) {
        reply = `We have verified local artisans available across Tamale, Bolga, and Wa! Click "Post Job & Get Quotes" at the top of the page or browse top-rated providers directly from our homepage.`;
      } else {
        reply = `Welcome to Servora AI! I can help you find verified local electricians, plumbers, and tailors in Tamale, track active orders, explain Mobile Money escrow safety, or connect you to live support. How can I assist you today?`;
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
