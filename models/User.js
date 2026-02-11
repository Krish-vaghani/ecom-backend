import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // Email is now optional – login will be done via phone + OTP
    email: { type: String, required: false, unique: true },
    // Primary login identifier
    phone: { type: String, required: true, unique: true },
    // One-time password fields for phone login
    otp: { type: String },
    otpExpires: { type: Date },
    // Cart items synced after login
    cartItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
    // Wishlist (whitelisted) products
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  // Never expose OTP fields in API responses
  delete obj.otp;
  delete obj.otpExpires;
  return obj;
};

const User = mongoose.model("User", UserSchema);
export default User;
