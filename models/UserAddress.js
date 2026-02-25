import mongoose from "mongoose";

const UserAddressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    address_type: {
      type: String,
      required: true,
      enum: ["Home", "Office", "Other"],
    },
    full_name: { type: String, required: true },
    mobile_number: { type: String, required: true },
    email_address: { type: String, required: true },
    address_line_1: { type: String, required: true },
    address_line_2: { type: String, default: "" },
    pincode: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    landmark: { type: String, default: "" },
    is_default: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserAddress = mongoose.model("UserAddress", UserAddressSchema);
export default UserAddress;
