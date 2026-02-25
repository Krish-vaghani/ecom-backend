import mongoose from "mongoose";

const ORDER_STATUS = ["order_placed", "confirmed", "shipped", "out_for_delivery", "delivered"];
const PAYMENT_METHOD = "cash_on_delivery";

const DeliverToSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    landmark: { type: String, default: "" },
  },
  { _id: false }
);

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerItem: { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    totalForItem: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      required: true,
      enum: ORDER_STATUS,
      default: "order_placed",
    },
    paymentMethod: { type: String, default: PAYMENT_METHOD },
    paymentStatus: { type: String, enum: ["pending", "confirmed"], default: "pending" },
    placedAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date, default: null },
    shippedAt: { type: Date, default: null },
    outForDeliveryAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    estimatedDeliveryDate: { type: Date, default: null },
    deliverTo: { type: DeliverToSchema, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderId: 1 });

const Order = mongoose.model("Order", OrderSchema);
export default Order;
export { ORDER_STATUS, PAYMENT_METHOD };
