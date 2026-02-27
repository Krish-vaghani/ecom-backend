import mongoose from "mongoose";
import Order, { ORDER_STATUS, PAYMENT_METHOD } from "../models/Order.js";
import UserAddress from "../models/UserAddress.js";
import Product from "../models/Product.js";
import {
  PlaceOrderValidator,
  UpdateOrderStatusValidator,
  CreateRazorpayOrderValidator,
  VerifyRazorpayPaymentValidator,
} from "../validators/OrderValidator.js";
import {
  getRazorpayInstance,
  getRazorpayKeyId,
  verifyPaymentSignature,
} from "../connection/razorpay.js";
import { getShippingChargeForItems } from "../helper/shippingRates.js";

const getUserId = (req) => req.user?.id || req.user?._id;

const ESTIMATED_DAYS_DELIVERY = 5;
const TEST_AMOUNT_INR = 100; // Static amount for test mode when addressId/items not provided or invalid

function generateOrderId() {
  return "ORD-" + Date.now();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const PlaceOrder = async (req, res) => {
  const body = req.body || {};
  const { error } = PlaceOrderValidator.validate(body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  const { addressId, items } = body;

  try {
    const address = await UserAddress.findOne({ _id: addressId, user: userId }).lean();
    if (!address) {
      return res.status(404).json({ message: "Delivery address not found or access denied." });
    }

    const uniqueProductIds = [...new Set(items.map((i) => i.productId))];
    const products = await Product.find({ _id: { $in: uniqueProductIds }, is_active: true }).lean();
    const productMap = Object.fromEntries(products.map((p) => [String(p._id), p]));
    if (products.length !== uniqueProductIds.length) {
      const missing = uniqueProductIds.filter((id) => !productMap[id]);
      return res.status(400).json({
        message: "Some products are invalid or inactive.",
        invalidProductIds: missing,
      });
    }

    const quantityByProduct = {};
    for (const { productId, quantity } of items) {
      quantityByProduct[productId] = (quantityByProduct[productId] || 0) + quantity;
    }

    const orderItems = [];
    let subtotal = 0;
    for (const productId of Object.keys(quantityByProduct)) {
      const product = productMap[productId];
      const quantity = quantityByProduct[productId];
      const pricePerItem = product.salePrice != null ? product.salePrice : product.price;
      const originalPrice = product.salePrice != null ? product.price : null;
      const totalForItem = pricePerItem * quantity;
      subtotal += totalForItem;
      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity,
        pricePerItem,
        originalPrice,
        totalForItem,
      });
    }

    const shippingCharge = await getShippingChargeForItems(items, address.pincode, true);
    const total = subtotal + shippingCharge;
    const estimatedDeliveryDate = addDays(new Date(), ESTIMATED_DAYS_DELIVERY);

    const deliverTo = {
      fullName: address.full_name,
      addressLine1: address.address_line_1,
      addressLine2: address.address_line_2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.mobile_number,
      email: address.email_address,
      landmark: address.landmark || "",
    };

    const order = new Order({
      orderId: generateOrderId(),
      user: userId,
      status: "order_placed",
      paymentMethod: PAYMENT_METHOD,
      paymentStatus: "pending",
      placedAt: new Date(),
      deliverTo,
      items: orderItems,
      subtotal,
      shippingCharge,
      total,
      estimatedDeliveryDate,
    });
    await order.save();

    const saved = await Order.findById(order._id).populate("items.product", "name image slug").lean();
    return res.status(201).json({
      message: "Order placed successfully. Cash on Delivery.",
      data: saved,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * Create an order with paymentMethod razorpay and a Razorpay order for online payment.
 * Returns order + razorpayOrderId + key_id so frontend can open Razorpay Checkout.
 * Test mode: if addressId/items missing or invalid, uses static amount ₹100 and placeholder order.
 */
export const CreateRazorpayOrder = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  const body = req.body || {};
  let deliverTo;
  let orderItems;
  let total;
  let subtotal = 0;
  let shippingCharge = 0;
  let testMode = false;

  // const { error } = CreateRazorpayOrderValidator.validate(body);
  // if (error) {
  //   testMode = true;
  // }
  testMode = true;
  if (!testMode) {
    const { addressId, items } = body;
    const address = await UserAddress.findOne({ _id: addressId, user: userId }).lean();
    if (!address) testMode = true;
    else {
      const uniqueProductIds = [...new Set(items.map((i) => i.productId))];
      const products = await Product.find({ _id: { $in: uniqueProductIds }, is_active: true }).lean();
      const productMap = Object.fromEntries(products.map((p) => [String(p._id), p]));
      if (products.length !== uniqueProductIds.length) testMode = true;
      else {
        const quantityByProduct = {};
        for (const { productId, quantity } of items) {
          quantityByProduct[productId] = (quantityByProduct[productId] || 0) + quantity;
        }
        const itemsList = [];
        let itemsSubtotal = 0;
        for (const productId of Object.keys(quantityByProduct)) {
          const product = productMap[productId];
          const quantity = quantityByProduct[productId];
          const pricePerItem = product.salePrice != null ? product.salePrice : product.price;
          const originalPrice = product.salePrice != null ? product.price : null;
          const totalForItem = pricePerItem * quantity;
          itemsSubtotal += totalForItem;
          itemsList.push({
            product: product._id,
            productName: product.name,
            quantity,
            pricePerItem,
            originalPrice,
            totalForItem,
          });
        }
        subtotal = itemsSubtotal;
        shippingCharge = await getShippingChargeForItems(items, address.pincode, false);
        total = subtotal + shippingCharge;
        orderItems = itemsList;
        deliverTo = {
          fullName: address.full_name,
          addressLine1: address.address_line_1,
          addressLine2: address.address_line_2 || "",
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          phone: address.mobile_number,
          email: address.email_address,
          landmark: address.landmark || "",
        };
      }
    }
  }

  if (testMode) {
    total = TEST_AMOUNT_INR;
    subtotal = total;
    shippingCharge = 0;
    deliverTo = {
      fullName: "Test User",
      addressLine1: "Test Address",
      addressLine2: "",
      city: "Test City",
      state: "Test State",
      pincode: "000000",
      phone: "0000000000",
      email: "test@test.com",
      landmark: "",
    };
    orderItems = [
      {
        product: new mongoose.Types.ObjectId(),
        productName: "Test item",
        quantity: 1,
        pricePerItem: TEST_AMOUNT_INR,
        originalPrice: null,
        totalForItem: TEST_AMOUNT_INR,
      },
    ];
  }

  try {
    const estimatedDeliveryDate = addDays(new Date(), ESTIMATED_DAYS_DELIVERY);
    const order = new Order({
      orderId: generateOrderId(),
      user: userId,
      status: "order_placed",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      placedAt: new Date(),
      deliverTo,
      items: orderItems,
      subtotal,
      shippingCharge,
      total,
      estimatedDeliveryDate,
    });
    await order.save();

    const razorpay = getRazorpayInstance();
    const amountPaise = Math.round(total * 100);
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: order.orderId,
      notes: { orderId: order.orderId },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    const saved = await Order.findById(order._id).populate("items.product", "name image slug").lean();
    const keyId = getRazorpayKeyId();

    return res.status(201).json({
      message: testMode ? "Order created (test mode, ₹100). Complete payment using Razorpay." : "Order created. Complete payment using Razorpay.",
      data: {
        order: saved,
        razorpayOrderId: razorpayOrder.id,
        key_id: keyId,
        amount: amountPaise,
        currency: "INR",
        ...(testMode && { testMode: true }),
      },
    });
  } catch (err) {
    if (err.message && err.message.includes("RAZORPAY")) {
      return res.status(503).json({ message: "Payment gateway not configured.", error: err.message });
    }
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * Verify Razorpay payment after successful Checkout. Updates order paymentStatus to confirmed.
 */
export const VerifyRazorpayPayment = async (req, res) => {
  const body = req.body || {};
  const { error } = VerifyRazorpayPaymentValidator.validate(body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  try {
    const order = await Order.findOne({ orderId, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    if (order.paymentMethod !== "razorpay") {
      return res.status(400).json({ message: "This order is not a Razorpay order." });
    }
    if (order.paymentStatus === "confirmed") {
      return res.status(200).json({ message: "Payment already confirmed.", data: order });
    }
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Razorpay order ID does not match." });
    }

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      await Order.findByIdAndUpdate(order._id, { $set: { paymentStatus: "failed" } });
      return res.status(400).json({ message: "Payment verification failed. Signature invalid." });
    }

    order.paymentStatus = "confirmed";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    const updated = await Order.findById(order._id)
      .populate("items.product", "name image slug")
      .lean();

    return res.status(200).json({
      message: "Payment verified successfully.",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const ListMyOrders = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: userId };
    if (status && ORDER_STATUS.includes(status)) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Order.countDocuments(filter),
    ]);
    return res.status(200).json({
      message: "Orders fetched.",
      data: orders,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const GetOrderDetails = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  const { id } = req.params;
  try {
    const order = await Order.findOne({ _id: id, user: userId })
      .populate("items.product", "name image slug price salePrice")
      .lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    return res.status(200).json({ message: "Order details.", data: order });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const AdminListOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status && ORDER_STATUS.includes(status)) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate("user", "name phone").lean(),
      Order.countDocuments(filter),
    ]);
    return res.status(200).json({
      message: "Orders fetched.",
      data: orders,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const AdminGetOrderDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id).populate("user", "name phone email").populate("items.product", "name image slug price salePrice").lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    return res.status(200).json({ message: "Order details.", data: order });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const AdminUpdateOrderStatus = async (req, res) => {
  const body = req.body || {};
  const { error } = UpdateOrderStatusValidator.validate(body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { id } = req.params;
  const { status } = body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const now = new Date();
    const updates = { status };

    if (status === "confirmed") {
      updates.confirmedAt = now;
      updates.paymentStatus = "confirmed";
    } else if (status === "shipped") {
      updates.shippedAt = now;
    } else if (status === "out_for_delivery") {
      updates.outForDeliveryAt = now;
    } else if (status === "delivered") {
      updates.deliveredAt = now;
    }

    const updated = await Order.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate("user", "name phone")
      .populate("items.product", "name image slug")
      .lean();

    return res.status(200).json({ message: "Order status updated.", data: updated });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
