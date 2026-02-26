import Joi from "joi";

const OrderItemSchema = Joi.object({
  productId: Joi.string().required().messages({ "any.required": "Product id is required for each item." }),
  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "Quantity is required for each item.",
  }),
});

export const PlaceOrderValidator = Joi.object({
  addressId: Joi.string().required().messages({
    "any.required": "Delivery address (addressId) is required.",
  }),
  items: Joi.array().items(OrderItemSchema).min(1).required().messages({
    "array.min": "At least one item is required to place an order.",
    "any.required": "Items are required.",
  }),
});

export const UpdateOrderStatusValidator = Joi.object({
  status: Joi.string()
    .valid("order_placed", "confirmed", "shipped", "out_for_delivery", "delivered")
    .required()
    .messages({
      "any.required": "Status is required.",
      "any.only": "Status must be one of: order_placed, confirmed, shipped, out_for_delivery, delivered",
    }),
});

// Same body as place order: used for creating Razorpay order
export const CreateRazorpayOrderValidator = PlaceOrderValidator;

export const VerifyRazorpayPaymentValidator = Joi.object({
  orderId: Joi.string().required().messages({ "any.required": "orderId (your order ID) is required." }),
  razorpay_order_id: Joi.string().required().messages({ "any.required": "razorpay_order_id is required." }),
  razorpay_payment_id: Joi.string().required().messages({ "any.required": "razorpay_payment_id is required." }),
  razorpay_signature: Joi.string().required().messages({ "any.required": "razorpay_signature is required." }),
});
