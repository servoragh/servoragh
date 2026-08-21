import { renderBaseEmailLayout } from "./baseTemplate";

export interface RenderedTemplate {
  subject: string;
  category: "AUTHENTICATION" | "GUEST_VERIFICATION" | "MARKETPLACE" | "SERVICE_GIG" | "RENTAL" | "SUPPORT_DISPUTE" | "ADMIN_ALERT" | "SECURITY" | "SYSTEM_NOTIFICATIONS";
  html: string;
  text: string;
}

export function renderEmailTemplate(
  templateName: string,
  data: Record<string, any> = {}
): RenderedTemplate {
  switch (templateName) {
    // -----------------------------------------------------------------
    // 1. AUTHENTICATION & GUEST VERIFICATION
    // -----------------------------------------------------------------
    case "AUTH_EMAIL_VERIFICATION": {
      const name = data.name || "User";
      const verifyUrl = data.verifyUrl || "https://servora.gh/login";
      const otpCode = data.otpCode || "882319";
      const subject = "Verify your Servora Account";
      const contentHtml = `
        <h2>Welcome to Servora, ${name}!</h2>
        <p>Please confirm your email address to complete your account setup and access local service providers across Ghana.</p>
        <div style="text-align:center;">
          <div class="otp-box">${otpCode}</div>
          <br>
          <a href="${verifyUrl}" class="button">Verify Email Account ➔</a>
        </div>
        <p style="font-size:12px;color:#64748b;">If you didn't create an account, you can safely ignore this email.</p>
      `;
      return {
        subject,
        category: "AUTHENTICATION",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Welcome ${name}! Your verification OTP is ${otpCode}. Verify at ${verifyUrl}`,
      };
    }

    case "AUTH_PASSWORD_RESET": {
      const name = data.name || "User";
      const resetUrl = data.resetUrl || "https://servora.gh/login";
      const subject = "Reset your Servora Account Password";
      const contentHtml = `
        <h2>Password Reset Request</h2>
        <p>Hi ${name}, we received a request to reset your password. Click below to choose a new password. This link is valid for 15 minutes.</p>
        <div style="text-align:center;">
          <a href="${resetUrl}" class="button">Reset Password Securely 🔐</a>
        </div>
        <p style="font-size:12px;color:#64748b;">If you didn't request a password reset, please contact security@servora.gh immediately.</p>
      `;
      return {
        subject,
        category: "SECURITY",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Reset your Servora password at ${resetUrl}`,
      };
    }

    case "AUTH_MAGIC_LINK": {
      const loginUrl = data.loginUrl || "https://servora.gh/login";
      const subject = "Your One-Click Passwordless Login Link";
      const contentHtml = `
        <h2>Sign in to Servora</h2>
        <p>Click below to sign in instantly without typing a password:</p>
        <div style="text-align:center;">
          <a href="${loginUrl}" class="button">Sign In Instantly ⚡</a>
        </div>
      `;
      return {
        subject,
        category: "AUTHENTICATION",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Sign in to Servora at ${loginUrl}`,
      };
    }

    case "GUEST_OTP_VERIFY": {
      const otpCode = data.otpCode || "409218";
      const title = data.title || "Guest Item Listing";
      const subject = `OTP Code ${otpCode} for ${title}`;
      const contentHtml = `
        <h2>Verify Guest Posting</h2>
        <p>Use the 6-digit OTP code below to confirm and publish your guest posting for <strong>"${title}"</strong>:</p>
        <div style="text-align:center;">
          <div class="otp-box">${otpCode}</div>
        </div>
      `;
      return {
        subject,
        category: "GUEST_VERIFICATION",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Your OTP for ${title} is ${otpCode}`,
      };
    }

    // -----------------------------------------------------------------
    // 2. MARKETPLACE & CLASSIFIEDS LIFECYCLE
    // -----------------------------------------------------------------
    case "PRODUCT_PENDING_REVIEW": {
      const title = data.title || "5KW Honda Generator";
      const subject = `Listing Pending Review: ${title}`;
      const contentHtml = `
        <h2>Listing Received!</h2>
        <p>Your listing <strong>"${title}"</strong> has been submitted to Servora Marketplace and is pending quick quality review by our moderation team.</p>
        <p>Reviews take under 15 minutes during business hours.</p>
      `;
      return {
        subject,
        category: "MARKETPLACE",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Your listing "${title}" is pending review.`,
      };
    }

    case "PRODUCT_APPROVED_LIVE": {
      const title = data.title || "5KW Honda Generator";
      const itemUrl = data.itemUrl || "https://servora.gh/products";
      const subject = `🎉 Your Listing is Live: ${title}`;
      const contentHtml = `
        <h2>Congratulations! Your listing is Live!</h2>
        <p>Your item <strong>"${title}"</strong> has been approved and published on Servora.</p>
        <div style="text-align:center;">
          <a href="${itemUrl}" class="button">View Listing ↗</a>
        </div>
      `;
      return {
        subject,
        category: "MARKETPLACE",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Your listing "${title}" is now live at ${itemUrl}`,
      };
    }

    case "PRODUCT_REJECTED": {
      const title = data.title || "Listing";
      const reason = data.reason || "Image is blurry or missing contact details.";
      const editUrl = data.editUrl || "https://servora.gh/products";
      const subject = `Action Required: Listing Review Update (${title})`;
      const contentHtml = `
        <h2>Listing Update Needed</h2>
        <p>Your listing <strong>"${title}"</strong> could not be published due to the following reason:</p>
        <blockquote style="background:#fff1f2;padding:12px;border-left:4px solid #e11d48;border-radius:8px;">${reason}</blockquote>
        <div style="text-align:center;">
          <a href="${editUrl}" class="button">Edit & Resubmit Listing ✏️</a>
        </div>
      `;
      return {
        subject,
        category: "MARKETPLACE",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Listing update needed for "${title}". Reason: ${reason}. Edit at ${editUrl}`,
      };
    }

    case "PRODUCT_INQUIRY_ALERT": {
      const buyerName = data.buyerName || "Prospective Buyer";
      const itemTitle = data.itemTitle || "Product Item";
      const message = data.message || "Is this item available for delivery in Tamale Central?";
      const subject = `New Inquiry for ${itemTitle} from ${buyerName}`;
      const contentHtml = `
        <h2>New Buyer Inquiry!</h2>
        <p><strong>${buyerName}</strong> inquired about your item <strong>"${itemTitle}"</strong>:</p>
        <blockquote style="background:#f1f5f9;padding:12px;border-left:4px solid #059669;border-radius:8px;">"${message}"</blockquote>
      `;
      return {
        subject,
        category: "MARKETPLACE",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Inquiry from ${buyerName} regarding ${itemTitle}: "${message}"`,
      };
    }

    // -----------------------------------------------------------------
    // 3. SERVICE REQUESTS & GIGS
    // -----------------------------------------------------------------
    case "SERVICE_REQUEST_BROADCAST": {
      const area = data.area || "Sakasaka, Tamale";
      const serviceName = data.serviceName || "Solar & Electrical Repair";
      const requestUrl = data.requestUrl || "https://servora.gh/requests";
      const subject = `⚡ New Service Gig Alert in ${area}: ${serviceName}`;
      const contentHtml = `
        <h2>New Service Gig Posted in Your Area!</h2>
        <p>A customer in <strong>${area}</strong> needs help with <strong>"${serviceName}"</strong>.</p>
        <div style="text-align:center;">
          <a href="${requestUrl}" class="button">Submit Quote / Bid Now 🛠️</a>
        </div>
      `;
      return {
        subject,
        category: "SERVICE_GIG",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `New gig in ${area}: ${serviceName}. Quote now at ${requestUrl}`,
      };
    }

    case "SERVICE_QUOTE_RECEIVED": {
      const providerName = data.providerName || "Master Electrician";
      const price = data.price || "250";
      const subject = `New Quote Received from ${providerName} (GHS ${price})`;
      const contentHtml = `
        <h2>You Received a New Bid!</h2>
        <p>Artisan <strong>${providerName}</strong> submitted a quote of <strong>GHS ${price}</strong> for your service request.</p>
      `;
      return {
        subject,
        category: "SERVICE_GIG",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `New quote from ${providerName}: GHS ${price}`,
      };
    }

    case "SERVICE_QUOTE_ACCEPTED": {
      const customerName = data.customerName || "Customer";
      const customerPhone = data.customerPhone || "+233201122334";
      const area = data.area || "Choggu, Tamale";
      const subject = `🎉 Quote Accepted! Contact Details for ${customerName}`;
      const contentHtml = `
        <h2>Quote Accepted!</h2>
        <p>Congratulations! <strong>${customerName}</strong> accepted your quote.</p>
        <p><strong>Customer Phone:</strong> ${customerPhone}<br><strong>Location:</strong> ${area}</p>
      `;
      return {
        subject,
        category: "SERVICE_GIG",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Quote accepted by ${customerName}. Phone: ${customerPhone}`,
      };
    }

    case "SERVICE_STATUS_UPDATE": {
      const title = data.title || "Service Call";
      const status = data.status || "IN_PROGRESS";
      const subject = `Job Status Update: ${title} is ${status}`;
      const contentHtml = `
        <h2>Job Status Update</h2>
        <p>Your service request <strong>"${title}"</strong> status has updated to <strong>${status}</strong>.</p>
      `;
      return {
        subject,
        category: "SERVICE_GIG",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Status update for ${title}: ${status}`,
      };
    }

    // -----------------------------------------------------------------
    // 4. TOOL & EQUIPMENT RENTALS
    // -----------------------------------------------------------------
    case "RENTAL_BOOKING_REQUEST": {
      const toolTitle = data.toolTitle || "10kVA Diesel Generator";
      const customerName = data.customerName || "Contractor";
      const duration = data.duration || "3 Days";
      const subject = `Rental Booking Request for ${toolTitle}`;
      const contentHtml = `
        <h2>New Rental Booking Request</h2>
        <p><strong>${customerName}</strong> requested to rent your <strong>"${toolTitle}"</strong> for ${duration}.</p>
      `;
      return {
        subject,
        category: "RENTAL",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Rental request for ${toolTitle} by ${customerName} for ${duration}`,
      };
    }

    case "RENTAL_CONFIRMED": {
      const toolTitle = data.toolTitle || "10kVA Diesel Generator";
      const pickupAddress = data.pickupAddress || "Aboabo Commercial Depot, Tamale";
      const subject = `Booking Confirmed: ${toolTitle}`;
      const contentHtml = `
        <h2>Rental Confirmed!</h2>
        <p>Your equipment booking for <strong>"${toolTitle}"</strong> is confirmed.</p>
        <p><strong>Pickup Address:</strong> ${pickupAddress}</p>
      `;
      return {
        subject,
        category: "RENTAL",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Rental confirmed for ${toolTitle}. Pickup: ${pickupAddress}`,
      };
    }

    // -----------------------------------------------------------------
    // 5. SUPPORT & DISPUTES
    // -----------------------------------------------------------------
    case "SUPPORT_TICKET_CREATED": {
      const ticketId = data.ticketId || "TCK-99821";
      const subject = `Support Inquiry Received [${ticketId}]`;
      const contentHtml = `
        <h2>Support Inquiry Received</h2>
        <p>We received your support ticket <strong>[${ticketId}]</strong>. An administrator will reply shortly.</p>
      `;
      return {
        subject,
        category: "SUPPORT_DISPUTE",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Support ticket created: ${ticketId}`,
      };
    }

    case "SUPPORT_AGENT_REPLY": {
      const ticketId = data.ticketId || "TCK-99821";
      const replyMessage = data.replyMessage || "Thank you for contacting support.";
      const subject = `New Response to Ticket [${ticketId}]`;
      const contentHtml = `
        <h2>Support Response Received</h2>
        <p>Response for ticket <strong>[${ticketId}]</strong>:</p>
        <blockquote style="background:#f8fafc;padding:12px;border-left:4px solid #047857;border-radius:8px;">"${replyMessage}"</blockquote>
      `;
      return {
        subject,
        category: "SUPPORT_DISPUTE",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Response for ticket [${ticketId}]: ${replyMessage}`,
      };
    }

    case "DISPUTE_MEDIATION_ALERT": {
      const caseId = data.caseId || "DSP-501";
      const subject = `Dispute Mediation Alert [Case ${caseId}]`;
      const contentHtml = `
        <h2>Dispute Mediation Alert</h2>
        <p>An administrator has initiated mediation for claim <strong>[Case ${caseId}]</strong>.</p>
      `;
      return {
        subject,
        category: "SUPPORT_DISPUTE",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Dispute mediation alert for case ${caseId}`,
      };
    }

    // -----------------------------------------------------------------
    // 6. SECURITY & ADMIN ALERTS
    // -----------------------------------------------------------------
    case "ADMIN_PENDING_VERIFICATION_ALERT": {
      const applicantName = data.applicantName || "Artisan Supplier";
      const subject = `🛡️ Admin Alert: Ghana Card Verification Submitted (${applicantName})`;
      const contentHtml = `
        <h2>New Ghana Card ID Verification Submitted</h2>
        <p>Applicant <strong>${applicantName}</strong> submitted National ID credentials for verification.</p>
      `;
      return {
        subject,
        category: "ADMIN_ALERT",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `New verification submitted by ${applicantName}`,
      };
    }

    case "ADMIN_FLAGGED_CONTENT_ALERT": {
      const title = data.title || "Reported Item";
      const subject = `⚠️ Admin Alert: Content Flagged Multiple Times (${title})`;
      const contentHtml = `
        <h2>Content Moderation Alert</h2>
        <p>Listing <strong>"${title}"</strong> received multiple community report flags.</p>
      `;
      return {
        subject,
        category: "ADMIN_ALERT",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Content flagged alert for ${title}`,
      };
    }

    case "SECURITY_NEW_DEVICE_LOGIN": {
      const ipAddress = data.ipAddress || "102.176.45.12";
      const device = data.device || "Chrome on Windows (Tamale, Ghana)";
      const subject = `🔒 Security Alert: New Login to your Servora Account`;
      const contentHtml = `
        <h2>Security Notice: New Login</h2>
        <p>Your Servora account was logged into from a new device or IP address:</p>
        <p><strong>Device:</strong> ${device}<br><strong>IP Address:</strong> ${ipAddress}</p>
        <p style="color:#e11d48;font-weight:700;">If this wasn't you, please change your password immediately.</p>
      `;
      return {
        subject,
        category: "SECURITY",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: `Security Alert: New login from ${device} (${ipAddress})`,
      };
    }

    default: {
      const subject = "Servora Platform Notification";
      const contentHtml = `<h2>Servora Platform Update</h2><p>You have a new update on Servora.</p>`;
      return {
        subject,
        category: "SYSTEM_NOTIFICATIONS",
        html: renderBaseEmailLayout({ title: subject, contentHtml }),
        text: "You have a new update on Servora.",
      };
    }
  }
}
