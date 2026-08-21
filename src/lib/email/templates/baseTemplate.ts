export function renderBaseEmailLayout({
  title,
  preheader,
  contentHtml,
}: {
  title: string;
  preheader?: string;
  contentHtml: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background-color: #047857; padding: 24px; text-align: center; }
    .logo { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-decoration: none; }
    .content { padding: 32px 24px; font-size: 14px; line-height: 1.6; color: #334155; }
    .button { display: inline-block; padding: 12px 24px; background-color: #059669; color: #ffffff !important; font-weight: 800; font-size: 13px; text-decoration: none; border-radius: 12px; margin-top: 16px; margin-bottom: 16px; text-align: center; }
    .otp-box { font-family: monospace; font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #047857; background-color: #ecfdf5; padding: 16px 24px; border-radius: 16px; display: inline-block; border: 1px border #a7f3d0; margin: 16px 0; }
    .footer { background-color: #f1f5f9; padding: 20px 24px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer a { color: #059669; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ""}
  <div class="container">
    <div class="header">
      <a href="https://servora.gh" class="logo">SERVORA.GH</a>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Servora Ghana Marketplace. Connecting People & Businesses across Northern Ghana.</p>
      <p><a href="https://servora.gh/privacy">Privacy Policy</a> • <a href="https://servora.gh/trust-safety">Trust & Safety</a> • <a href="https://servora.gh/support">Support Center</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
