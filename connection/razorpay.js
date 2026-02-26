import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const keyId = "rzp_live_SKe9gBT6ugyCP1";
const keySecret = "mmi12shDBhNMmz6shsnFw4Ts";

let instance = null;

export function getRazorpayInstance() {
  // if (!keyId || !keySecret) {
  //   throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env");
  // }
  if (!instance) {
    instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return instance;
}

export function getRazorpayKeyId() {
  if (!keyId) throw new Error("RAZORPAY_KEY_ID is not set");
  return keyId;
}

/**
 * Verify Razorpay payment signature (order_id + payment_id signed with key_secret).
 * @param {string} razorpayOrderId - Order ID from Razorpay
 * @param {string} razorpayPaymentId - Payment ID from Checkout response
 * @param {string} razorpaySignature - Signature from Checkout response
 * @returns {boolean}
 */
export function verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  if (!keySecret || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");
  return expectedSignature === razorpaySignature;
}
