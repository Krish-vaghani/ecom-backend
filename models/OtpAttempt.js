import mongoose from "mongoose";

/**
 * Tracks OTP SMS attempts per phone per calendar day.
 * Used to enforce max 5 SMS per phone per day.
 */
const OtpAttemptSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    /** Date string YYYY-MM-DD (UTC) for the day */
    date: { type: String, required: true },
    /** Number of SMS sent this day for this phone */
    count: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

OtpAttemptSchema.index({ phone: 1, date: 1 }, { unique: true });

const OtpAttempt = mongoose.model("OtpAttempt", OtpAttemptSchema);
export default OtpAttempt;
