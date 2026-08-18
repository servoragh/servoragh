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

    // 1. Try Google Gemini Real AI API if API key exists
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

    // 2. High-Accuracy Conversational NLP Engine Fallback
    if (!reply) {
      // Identity & Name Questions
      if (
        lowerText.includes("name") ||
        lowerText.includes("who are you") ||
        lowerText.includes("what are you")
      ) {
        reply = `I am Servora AI, your 24/7 virtual assistant for Servora in Northern Ghana! I help you find verified local artisans, post service jobs, track active requests, and explain Mobile Money escrow safety.`;
      }
      // Affirmative Follow-ups ("yes", "sure", "okay", "yep")
      else if (
        lowerText === "yes" ||
        lowerText === "yes please" ||
        lowerText === "sure" ||
        lowerText === "okay" ||
        lowerText === "yep" ||
        lowerText === "yeah"
      ) {
        reply = `Awesome! To post a job right now in Tamale and get instant quotes from verified artisans via WhatsApp, simply click the green "Post Job & Get Quotes" button at the top of your screen, or tell me what service you need (e.g. "I need an electrician in Sakasaka")!`;
      }
      // General Capability ("can you help", "what can you do", "help me")
      else if (
        lowerText.includes("can you help") ||
        lowerText.includes("what can you do") ||
        lowerText.includes("how can you help") ||
        lowerText === "can you help"
      ) {
        reply = `Yes, I certainly can! I can help you: 1) Post a new job & get quotes from verified artisans, 2) Track your active service requests, 3) Explain our 100% Mobile Money Escrow refund protection, or 4) Connect you directly to our human support team on WhatsApp at +233500710610.`;
      }
      // Greetings
      else if (
        lowerText === "hi" ||
        lowerText === "hello" ||
        lowerText === "hey" ||
        lowerText.startsWith("good morning") ||
        lowerText.startsWith("good afternoon")
      ) {
        reply = `Hello! 👋 Welcome to Servora. How can I help you today? You can ask me to find local artisans in Tamale, track your orders, or post a new job request.`;
      }
      // Live Human Escalation Intent
      else if (
        lowerText.includes("agent") ||
        lowerText.includes("human") ||
        lowerText.includes("live support") ||
        lowerText.includes("speak to human") ||
        lowerText.includes("customer service")
      ) {
        reply = `Connecting you to our live Platform Support team! You can chat directly with our helpdesk team via WhatsApp at +233500710610 or submit a support ticket in your dashboard.`;
        shouldEscalate = true;
      }
      // Order Status / Request Tracking Intent
      else if (
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
      }
      // Return & Refund / Escrow Safety Intent
      else if (
        lowerText.includes("return") ||
        lowerText.includes("refund") ||
        lowerText.includes("cancel") ||
        lowerText.includes("dispute") ||
        lowerText.includes("escrow")
      ) {
        reply = `Servora offers 100% Buyer Protection in Tamale! Payments are safely held in Mobile Money Escrow (MTN MoMo, Telecel Cash, AT Money) and only released after you confirm job completion.`;
      }
      // Finding Artisans / Categories
      else if (
        lowerText.includes("electrician") ||
        lowerText.includes("plumber") ||
        lowerText.includes("fugu") ||
        lowerText.includes("repair") ||
        lowerText.includes("artisan") ||
        lowerText.includes("tailor")
      ) {
        reply = `We have verified local artisans available across Tamale, Bolga, and Wa! Click "Post Job & Get Quotes" at the top of the page or browse top-rated providers directly from our homepage.`;
      }
      // Default Helpful Fallback
      else {
        reply = `I'm Servora AI! I can help you find verified local electricians, plumbers, and tailors in Tamale, track active orders, explain Mobile Money escrow safety, or connect you to live support. How can I assist you today?`;
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
