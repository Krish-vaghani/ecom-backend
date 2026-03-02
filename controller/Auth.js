import User from "../models/User.js";
import OtpAttempt from "../models/OtpAttempt.js";
import {
  AuthLoginRequestValidator,
  AuthLoginVerifyValidator,
} from "../validators/Auth.js";
import { FindOne, SingleRecordOperation } from "../helper/commonquery.js";
import { GenerateToken } from "../helper/helper.js";
import { sendOtpSms } from "../connection/twilio.js";

const MAX_SMS_PER_DAY = 5;

/** Get YYYY-MM-DD for today in UTC */
function getTodayDateString() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

/** Ensure phone is E.164 (e.g. +919876543210) for Twilio */
function toE164(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("6") === false) {
    return "+91" + digits;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return "+" + digits;
  }
  return phone.startsWith("+") ? phone : "+" + digits;
}

// Single endpoint: if user exists -> send OTP; if not -> register and send OTP
export const RegisterOrRequestOtp = async (req, res) => {
  // At minimum we need a phone; name can be used when creating a new user
  const { error } = AuthLoginRequestValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, phone } = req.body;

  try {
    const existingByPhone = await FindOne(User, { phone });

    let user;
    let isNewUser = false;

    if (existingByPhone.status === 200 && existingByPhone.data) {
      // User already exists, just reuse it
      user = existingByPhone.data;
    } else {
      // New user: validate full registration payload (name + phone only)
      // const { error: regError } = AuthRegisterValidator.validate({ name, phone });
      // if (regError) {
      //   return res.status(400).json({ message: regError.details[0].message });
      // }

      // if (!name || !String(name).trim()) {
      //   return res.status(400).json({ message: "Name is required for registration." });
      // }

      // Email is no longer part of public registration/login flow
      const created = await SingleRecordOperation("i", User, { name, phone });
      user = created.data;
      isNewUser = true;
    }

    const today = getTodayDateString();
    let attemptDoc = await OtpAttempt.findOne({ phone, date: today }).lean();
    const currentCount = attemptDoc ? attemptDoc.count : 0;
    if (currentCount >= MAX_SMS_PER_DAY) {
      return res.status(429).json({
        message: "Maximum OTP limit reached. You can request only 5 OTPs per day. Try again tomorrow.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const e164Phone = toE164(phone);
    try {
      await sendOtpSms(e164Phone, otp);
    } catch (smsErr) {
      console.error("Twilio SMS error:", smsErr.message);
      return res.status(503).json({
        message: "Unable to send OTP. Please try again later.",
        error: process.env.NODE_ENV !== "production" ? smsErr.message : undefined,
      });
    }

    await OtpAttempt.findOneAndUpdate(
      { phone, date: today },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    await SingleRecordOperation("u", User, {
      _id: user._id,
      otp,
      otpExpires,
    });

    const isDev = process.env.NODE_ENV !== "production";
    return res.status(200).json({
      message: isNewUser ? "Registered and OTP sent." : "OTP sent successfully.",
      data: {
        phone,
        isNewUser,
        ...(isDev && { otp }),
        expiresInMinutes: 5,
      },
    });
  } catch (err) {
    const status = err.response?.status ?? 500;
    const message = err.response?.message ?? err.message;
    const userMessage =
      status === 409 && message && message.includes("email")
        ? "This phone number is already registered. Request OTP to sign in."
        : status === 500 ? "Server error." : message;
    return res.status(status).json({ message: userMessage, error: err.message });
  }
};

// Step 2: verify OTP and issue JWT token
export const Login = async (req, res) => {
  const { error } = AuthLoginVerifyValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { phone, otp, cartItems: incomingCartItems, wishlist: incomingWishlist } = req.body;
  try {
    const userFind = await FindOne(User, { phone });
    if (userFind.status !== 200 || !userFind.data) {
      return res.status(401).json({ message: "Invalid phone number or OTP." });
    }

    const user = userFind.data;

    if (!user.otp || !user.otpExpires) {
      return res.status(401).json({ message: "No active OTP. Please request a new OTP." });
    }

    const now = new Date();
    if (now > new Date(user.otpExpires)) {
      return res.status(401).json({ message: "OTP has expired. Please request a new OTP." });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ message: "Invalid phone number or OTP." });
    }

    // Prepare cart and wishlist merge
    let mergedCartItems = Array.isArray(user.cartItems) ? [...user.cartItems] : [];
    let mergedWishlist = Array.isArray(user.wishlist) ? [...user.wishlist] : [];

    // Merge incoming cart items (array of { productId, quantity })
    if (Array.isArray(incomingCartItems) && incomingCartItems.length > 0) {
      for (const item of incomingCartItems) {
        if (!item || !item.productId) continue;
        const productId = item.productId;
        const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;

        const existingIndex = mergedCartItems.findIndex(
          (ci) => String(ci.product) === String(productId)
        );
        if (existingIndex >= 0) {
          mergedCartItems[existingIndex].quantity += quantity;
        } else {
          mergedCartItems.push({ product: productId, quantity });
        }
      }
    }

    // Merge incoming wishlist (array of productIds)
    if (Array.isArray(incomingWishlist) && incomingWishlist.length > 0) {
      const currentSet = new Set(mergedWishlist.map((id) => String(id)));
      for (const pid of incomingWishlist) {
        if (!pid) continue;
        const idStr = String(pid);
        if (!currentSet.has(idStr)) {
          mergedWishlist.push(pid);
          currentSet.add(idStr);
        }
      }
    }

    // Hard delete OTP fields and save merged cart/wishlist after successful login
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $unset: { otp: "", otpExpires: "" },
        $set: {
          cartItems: mergedCartItems,
          wishlist: mergedWishlist,
        },
      },
      { new: true }
    ).lean();

    const token = GenerateToken(updatedUser._id);
    return res.status(200).json({
      message: "Login successful.",
      data: {
        token,
        cartItems: updatedUser.cartItems || [],
        wishlist: updatedUser.wishlist || [],
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
