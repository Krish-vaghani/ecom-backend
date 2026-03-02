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
  const messageBody = `<#> ${otp} is your car hangout OTP\n${appSignature}`;
  const twilioClient = getTwilioClient();
  const message = await twilioClient.messages.create({
    body: messageBody,
    from: fromNumber,
    to: to,
  });
  return { sid: message.sid };
}
