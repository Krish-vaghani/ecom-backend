import nodemailer from "nodemailer";

const FROM_EMAIL = "krishvaghani3800@gmail.com";
const TO_EMAIL = "krishvaghani07@gmail.com";

/** Build a transporter only when we have credentials (lazy). */
function getTransporter() {
  const appPassword = process.env.ORDER_CONFIRM_EMAIL_APP_PASSWORD || "jvbo luhi xymr mcno";
  if (!appPassword) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: FROM_EMAIL,
      pass: appPassword,
    },
  });
}

/**
 * Send order confirmation email from FROM_EMAIL to TO_EMAIL.
 * Runs in background; never throws. Logs errors only.
 * @param {Object} order - Order document (plain object with orderId, total, items, deliverTo, etc.)
 */
export function sendOrderConfirmEmail(order) {
  setImmediate(async () => {
    try {
      const transporter = getTransporter();
      if (!transporter) {
        console.warn("[OrderConfirmEmail] ORDER_CONFIRM_EMAIL_APP_PASSWORD not set; skipping email.");
        return;
      }
      const total = order.total != null ? order.total : 0;
      const itemsList = (order.items || [])
        .map((i) => `- ${i.productName || "Item"} x ${i.quantity || 1} = ₹${(i.totalForItem || 0).toFixed(2)}`)
        .join("\n");
      const html = `
        <p><strong>Order confirmed</strong></p>
        <p>Order ID: ${order.orderId || order._id}</p>
        <p>Total: ₹${Number(total).toFixed(2)}</p>
        <p>Items:</p>
        <pre>${itemsList || "—"}</pre>
        <p>Delivery: ${order.deliverTo?.fullName || ""}, ${order.deliverTo?.addressLine1 || ""}, ${order.deliverTo?.pincode || ""}</p>
      `;
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        subject: `Order confirmed: ${order.orderId || order._id}`,
        text: `Order confirmed. Order ID: ${order.orderId}. Total: ₹${Number(total).toFixed(2)}.`,
        html,
      });
    } catch (err) {
      console.error("[OrderConfirmEmail] Failed to send (background):", err.message);
    }
  });
}
