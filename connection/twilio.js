import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE;
const appSignature = process.env.TWILIO_APP_SIGNATURE || "";

let client = null;

function getTwilioClient() {
  if (!accountSid || !authToken) {
    throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in .env");
  }
  if (!client) {
    client = twilio(accountSid, authToken);
  }
  return client;
}

/**
 * Send OTP via Twilio SMS.
 * @param {string} to - E.164 phone number (e.g. +919876543210)
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<{ sid: string }>} Twilio message SID on success
 */
export async function sendOtpSms(to, otp) {
  if (!fromNumber) {
    throw new Error("TWILIO_PHONE must be set in .env");
  }
  const messageBody = `<#> ${otp} is your Pursolina OTP\n${appSignature}`;
  const twilioClient = getTwilioClient();
  const message = await twilioClient.messages.create({
    body: messageBody,
    from: fromNumber,
    to: to,
  });
  return { sid: message.sid };
}

/** Convert Indian phone to E.164 for Twilio (e.g. 9876543210 → +919876543210). */
function toE164(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10 && !digits.startsWith("6")) return "+91" + digits;
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
  return phone.startsWith("+") ? phone : "+" + digits;
}

/**
 * Send order confirmation SMS to the customer. Never throws; returns null on failure.
 * @param {string} toPhone - Customer phone (10-digit or E.164)
 * @param {string} orderId - Order ID
 * @param {number} total - Order total in INR
 * @returns {Promise<{ sid: string }|null>} Twilio SID or null if not sent
 */
export async function sendOrderConfirmSms(toPhone, orderId, total) {
  try {
    if (!fromNumber || !accountSid || !authToken) {
      console.warn("[OrderConfirmSms] Twilio not configured: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE in .env");
      return null;
    }
    const to = toE164(toPhone);
    const totalStr = Number(total).toFixed(2);
    const body = `Your order ${orderId} has been confirmed. Total: Rs. ${totalStr}. Thank you!`;
    const twilioClient = getTwilioClient();
    const message = await twilioClient.messages.create({
      body: body,
      from: fromNumber,
      to: to,
    });
    return { sid: message.sid };
  } catch (err) {
    console.error("[OrderConfirmSms] Twilio error:", err.message);
    return null;
  }
}

const ORDER_STATUS_MESSAGES = {
  order_placed: "Your order %s has been placed.",
  confirmed: "Your order %s has been confirmed.",
  shipped: "Your order %s has been shipped.",
  out_for_delivery: "Your order %s is out for delivery.",
  delivered: "Your order %s has been delivered. Thank you!",
};

/**
 * Send order status update SMS to the customer. Never throws; returns null on failure.
 * @param {string} toPhone - Customer phone (10-digit or E.164)
 * @param {string} orderId - Order ID
 * @param {string} status - One of order_placed, confirmed, shipped, out_for_delivery, delivered
 */
export async function sendOrderStatusSms(toPhone, orderId, status) {
  try {
    if (!fromNumber || !accountSid || !authToken) {
      console.warn("[OrderStatusSms] Twilio not configured (fromNumber/accountSid/authToken).");
      return null;
    }
    const msg = ORDER_STATUS_MESSAGES[status];
    if (!msg) {
      console.warn("[OrderStatusSms] Unknown status:", status);
      return null;
    }
    console.log(toPhone,"fdjshksdjbnfjsdbfn  =========");
    const to = toE164(String(toPhone));
    const body = msg.replace("%s", String(orderId));
    const twilioClient = getTwilioClient();
    const message = await twilioClient.messages.create({
      body,
      from: fromNumber,
      to,
    });
    return { sid: message.sid };
  } catch (err) {
    console.error("[OrderStatusSms] Twilio error:", err.message);
    return null;
  }
}
