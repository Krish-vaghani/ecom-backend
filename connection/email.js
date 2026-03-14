import nodemailer from "nodemailer";
import { sendOrderConfirmSms, sendOrderStatusSms } from "./twilio.js";

const FROM_EMAIL = "krishvaghani3800@gmail.com";
const TO_EMAIL = "krishvaghani07@gmail.com";

/** True if phone is missing, all zeros, or too short to be real. */
function isPlaceholderPhone(phone) {
  if (!phone) return true;
  const digits = String(phone).replace(/\D/g, "");
  return digits.length < 10 || /^0+$/.test(digits);
}

/** Get best phone for SMS: deliverTo.phone, or user.phone if delivery is placeholder. */
function getSmsPhone(order) {
  const delivery = order.deliverTo?.phone;
  if (!isPlaceholderPhone(delivery)) return delivery;
  return order.user?.phone || delivery;
}

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

/**
 * Send order confirmation SMS to the customer (deliverTo.phone or user.phone fallback).
 * Runs in background; never throws. Logs errors only.
 */
function sendOrderConfirmSmsToUser(order) {
  setImmediate(async () => {
    const phone = getSmsPhone(order);
    if (!phone || isPlaceholderPhone(phone)) return;
    const result = await sendOrderConfirmSms(phone, order.orderId || order._id, order.total ?? 0);
    if (!result) {
      console.warn("[OrderConfirmSms] Failed to send (background); check Twilio config.");
    }
  });
}

/**
 * Send both order confirmation email and SMS in the background. Never throws.
 * Call this when payment is confirmed (Razorpay verify or admin confirm).
 */
export function sendOrderConfirmNotifications(order) {
  sendOrderConfirmEmail(order);
  sendOrderConfirmSmsToUser(order);
}

/**
 * Send order status update SMS to the customer (deliverTo.phone or user.phone fallback). Runs in background; never throws.
 * Call this when admin updates order status (shipped, out_for_delivery, delivered, or any status).
 */
export function sendOrderStatusSmsToUser(order, status) {
  setImmediate(async () => {
    try {
      const phone = getSmsPhone(order);
      if (!phone || isPlaceholderPhone(phone)) {
        console.warn("[OrderStatusSms] No valid phone on order", order.orderId || order._id);
        return;
      }
      const orderId = order.orderId || (order._id && String(order._id)) || "";
      const result = await sendOrderStatusSms(phone, orderId, status);
      if (!result) {
        console.warn("[OrderStatusSms] Send failed for order", orderId, "status", status);
      }
    } catch (err) {
      console.error("[OrderStatusSms] Background error:", err.message);
    }
  });
}
