import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface OrderEmailItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  sku?: string;
}

export interface OrderEmailPayload {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  grandTotal: number;
  shippingAddress: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
}

export interface EmailRenderOptions {
  useCid?: boolean;
}

/**
 * Resolves the Northlane Logo as Base64 data URI or CID reference
 */
function getLogoSource(useCid: boolean = false): { src: string; localPath?: string } {
  const possiblePaths = [
    path.resolve(__dirname, "../../assets/northlane-logo.png"),
    path.resolve(__dirname, "../../../northlane-ui/public/northlane-logo.png"),
    path.resolve(process.cwd(), "assets/northlane-logo.png"),
    path.resolve(process.cwd(), "northlane-api/assets/northlane-logo.png"),
    path.resolve(process.cwd(), "../northlane-ui/public/northlane-logo.png"),
    path.resolve(process.cwd(), "northlane-ui/public/northlane-logo.png"),
  ];

  let foundPath: string | undefined;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      foundPath = p;
      break;
    }
  }

  if (useCid) {
    return { src: "cid:northlane-logo", localPath: foundPath };
  }

  if (foundPath) {
    try {
      const buffer = fs.readFileSync(foundPath);
      return {
        src: `data:image/png;base64,${buffer.toString("base64")}`,
        localPath: foundPath,
      };
    } catch {}
  }

  // Fallback high-res public placeholder or clean SVG data URI
  return {
    src: "https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/apple-touch-icon.png",
    localPath: foundPath,
  };
}

/**
 * Builds the aesthetic, minimalist Scandinavian HTML receipt matching Northlane's storefront
 */
export function buildOrderReceiptHtml(
  payload: OrderEmailPayload,
  options: EmailRenderOptions = {}
): string {
  const {
    orderId,
    customerEmail,
    customerName = "Valued Client",
    items = [],
    subtotal = 0,
    discount = 0,
    shipping = 0,
    grandTotal = 0,
    shippingAddress = "Standard Delivery Address",
    trackingNumber = "NL-TRK-PENDING",
    carrier = "Standard Courier",
    estimatedDelivery = "3-5 Business Days",
  } = payload;

  const logoInfo = getLogoSource(options.useCid);

  const itemRowsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #F0EFEA; vertical-align: middle; width: 56px;">
          ${
            item.image
              ? `<img src="${item.image}" alt="${item.name}" width="52" height="52" style="border-radius: 8px; object-fit: cover; border: 1px solid #EAE8E2; display: block;" />`
              : `<div style="width: 52px; height: 52px; border-radius: 8px; background-color: #F5F4F0; border: 1px solid #EAE8E2; text-align: center; line-height: 52px; font-size: 11px; font-weight: 700; color: #71717A;">NL</div>`
          }
        </td>
        <td style="padding: 16px 14px; border-bottom: 1px solid #F0EFEA; vertical-align: middle;">
          <div style="font-size: 13px; font-weight: 600; color: #111111; line-height: 1.35;">${item.name}</div>
          <div style="font-size: 11px; color: #71717A; margin-top: 4px; font-weight: 400;">SKU: ${item.sku || `NL-${item.id.toUpperCase()}`} &nbsp;·&nbsp; Qty: ${item.qty}</div>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #F0EFEA; vertical-align: middle; text-align: right; font-size: 13px; font-weight: 600; color: #111111; white-space: nowrap;">
          $${(item.price * item.qty).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #${orderId} — Northlane</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8F9FA; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #EAEAEA; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);" cellspacing="0" cellpadding="0">
          
          <!-- Brand Header with Logo -->
          <tr>
            <td style="padding: 36px 40px 24px 40px; border-bottom: 1px solid #F0EFEA;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <img src="${logoInfo.src}" alt="Northlane" width="34" height="34" style="border-radius: 8px; display: block; border: 1px solid #E8E6E0; object-fit: cover;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <div style="font-size: 13px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #111111; line-height: 1;">NORTHLANE</div>
                          <div style="font-size: 10px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: #8E8E93; margin-top: 3px; line-height: 1;">Studio</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #F4F4F5; border-radius: 9999px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #3F3F46;">
                      Receipt
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Confirmation Greeting Header -->
          <tr>
            <td style="padding: 32px 40px 24px 40px;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #8E8E93; margin-bottom: 8px;">Order Confirmed</div>
              <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; color: #111111; line-height: 1.25;">Thank you for your order, ${customerName}.</h1>
              <p style="margin: 0; font-size: 13px; color: #71717A; line-height: 1.6;">
                We’ve received your order and our team is preparing it for shipment. A tracking confirmation will be sent as soon as your package is on its way.
              </p>
            </td>
          </tr>

          <!-- Sleek Order Metadata Card -->
          <tr>
            <td style="padding: 0 40px 28px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAFAFA; border: 1px solid #F0F0F0; border-radius: 12px; padding: 16px 20px;">
                <tr>
                  <td style="vertical-align: top; width: 34%; padding: 4px 6px 4px 0;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; color: #8E8E93;">Order ID</div>
                    <div style="font-size: 13px; font-weight: 700; color: #111111; margin-top: 3px; white-space: nowrap;">#${orderId}</div>
                  </td>
                  <td style="vertical-align: top; width: 33%; padding: 4px 6px;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; color: #8E8E93;">Courier</div>
                    <div style="font-size: 13px; font-weight: 600; color: #111111; margin-top: 3px; white-space: nowrap;">${carrier}</div>
                  </td>
                  <td style="vertical-align: top; width: 33%; padding: 4px 0 4px 6px;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; color: #8E8E93;">Est. Arrival</div>
                    <div style="font-size: 13px; font-weight: 600; color: #111111; margin-top: 3px; white-space: nowrap;">${estimatedDelivery}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 40px 8px 40px;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 700; color: #8E8E93; margin-bottom: 6px;">Order Summary</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${itemRowsHtml}
              </table>
            </td>
          </tr>

          <!-- Financial Breakdown -->
          <tr>
            <td style="padding: 16px 40px 28px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 13px; color: #71717A; padding: 4px 0;">Subtotal</td>
                  <td style="font-size: 13px; font-weight: 500; color: #111111; text-align: right; padding: 4px 0;">$${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
                ${
                  discount > 0
                    ? `
                <tr>
                  <td style="font-size: 13px; color: #16A34A; padding: 4px 0;">Promo Discount</td>
                  <td style="font-size: 13px; font-weight: 600; color: #16A34A; text-align: right; padding: 4px 0;">-$${discount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="font-size: 13px; color: #71717A; padding: 4px 0;">Shipping (${carrier})</td>
                  <td style="font-size: 13px; font-weight: 500; color: #111111; text-align: right; padding: 4px 0;">${shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 14px;">
                    <div style="border-top: 1px solid #111111; padding-top: 14px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-size: 14px; font-weight: 700; color: #111111;">Total</td>
                          <td style="font-size: 18px; font-weight: 700; color: #111111; text-align: right;">$${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Destination Box -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAFAFA; border: 1px solid #F0F0F0; border-radius: 12px; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; color: #8E8E93; margin-bottom: 6px;">Shipping Address</div>
                    <div style="font-size: 13px; font-weight: 500; color: #111111; line-height: 1.5;">${shippingAddress}</div>
                    <div style="font-size: 11px; color: #71717A; margin-top: 6px;">Tracking Code: <strong style="font-weight: 600; color: #111111;">${trackingNumber}</strong></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action CTA Button -->
          <tr>
            <td style="padding: 0 40px 36px 40px; text-align: center;">
              <a href="https://northlane.studio/account/orders" target="_blank" style="display: inline-block; background-color: #111111; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 9999px; letter-spacing: 0.01em;">
                View Order in Account &rarr;
              </a>
            </td>
          </tr>

          <!-- Clean Minimalist Footer -->
          <tr>
            <td style="background-color: #FAFAFA; border-top: 1px solid #F0F0F0; padding: 28px 40px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #71717A; line-height: 1.6;">
                Need help with your order? Reply directly to this email or write to <a href="mailto:NorthlaneStudioPH@gmail.com" style="color: #111111; text-decoration: underline; font-weight: 500;">NorthlaneStudioPH@gmail.com</a>.
              </p>
              <p style="margin: 12px 0 0 0; font-size: 10px; color: #A1A1AA; letter-spacing: 0.04em;">
                Northlane Studio &nbsp;·&nbsp; Modern Workspace Essentials &nbsp;·&nbsp; © 2026
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Sends real email via Gmail SMTP or fallback simulation
 */
export async function sendOrderConfirmationEmail(payload: OrderEmailPayload) {
  const companySender = process.env.COMPANY_EMAIL || "NorthlaneStudioPH@gmail.com";
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;

  // Generate preview HTML for local verification (uses embedded base64 image)
  const previewHtmlContent = buildOrderReceiptHtml(payload, { useCid: false });
  const previewPath = path.resolve(process.cwd(), `preview-order-${payload.orderId}.html`);
  try {
    fs.writeFileSync(previewPath, previewHtmlContent, "utf-8");
  } catch {}

  // For SMTP dispatch, check if logo attachment is available
  const logoInfo = getLogoSource(true);
  const emailHtmlContent = logoInfo.localPath
    ? buildOrderReceiptHtml(payload, { useCid: true })
    : previewHtmlContent;

  if (!gmailPass) {
    console.log(`[Email Service Notice]: GMAIL_APP_PASSWORD is not configured in northlane-api/.env.`);
    console.log(`[Email Service]: Saved minimalist HTML receipt preview to: ${previewPath}`);
    console.log(`[Email Service]: Generated receipt for recipient: ${payload.customerEmail} (Order #${payload.orderId})`);
    return {
      success: true,
      mode: "preview_saved",
      previewPath,
      recipient: payload.customerEmail,
      sender: companySender,
      message: "Minimalist receipt generated. To dispatch live via Gmail, add GMAIL_APP_PASSWORD to northlane-api/.env.",
    };
  }

  // Live Gmail SMTP Transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: companySender,
      pass: gmailPass,
    },
  });

  const attachments: any[] = [];
  if (logoInfo.localPath) {
    attachments.push({
      filename: "northlane-logo.png",
      path: logoInfo.localPath,
      cid: "northlane-logo",
    });
  }

  const mailOptions = {
    from: `"Northlane Studio" <${companySender}>`,
    to: payload.customerEmail,
    subject: `Order Confirmed #${payload.orderId} — Northlane`,
    html: emailHtmlContent,
    attachments: attachments.length > 0 ? attachments : undefined,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service]: Email dispatched successfully to ${payload.customerEmail}! Message ID: ${info.messageId}`);
    return {
      success: true,
      mode: "smtp_dispatched",
      messageId: info.messageId,
      recipient: payload.customerEmail,
      sender: companySender,
    };
  } catch (err: any) {
    console.error(`[Email Service Error]: Failed to send email via SMTP:`, err.message);
    return {
      success: false,
      error: err.message,
      previewPath,
    };
  }
}

