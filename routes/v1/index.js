import { Router } from "express";
import { Login, RegisterOrRequestOtp } from "../../controller/Auth.js";
import { ListProduct, IncrementProductView } from "../../controller/Product.js";
import { GetAllLandingPageData } from "../../controller/LandingSection.js";
import { ListActiveTestimonials } from "../../controller/Testimonial.js";
import {
  AddAddress,
  ListAddresses,
  GetAddress,
  UpdateAddress,
  DeleteAddress,
} from "../../controller/UserAddress.js";
import {
  PlaceOrder,
  CreateRazorpayOrder,
  VerifyRazorpayPayment,
  ListMyOrders,
  GetOrderDetails,
} from "../../controller/Order.js";
import { Authorization } from "../../middlewear/AuthMiddlewear.js";

const router = Router();

// Auth (public)
// Step 1: register if new OR send OTP if existing (single endpoint)
router.post("/v1/auth/register-or-login", RegisterOrRequestOtp);
// Step 2: verify OTP and receive JWT token
router.post("/v1/auth/login", Login);

// Product (read only)
router.get("/v1/product/list", ListProduct);
// Increment product view (call when user views product detail)
router.post("/v1/product/:id/view", IncrementProductView);

// Landing Section (read only)
router.get("/v1/landing", GetAllLandingPageData);

// Testimonials (public – only active)
router.get("/v1/testimonial/list", ListActiveTestimonials);

// User Addresses (requires login – JWT)
router.post("/v1/address/add", Authorization, AddAddress);
router.get("/v1/address/list", Authorization, ListAddresses);
router.get("/v1/address/:id", Authorization, GetAddress);
router.put("/v1/address/update/:id", Authorization, UpdateAddress);
router.delete("/v1/address/delete/:id", Authorization, DeleteAddress);

// Orders (requires login)
router.post("/v1/order/place", Authorization, PlaceOrder); // Cash on Delivery
router.post("/v1/order/create-razorpay-order", Authorization, CreateRazorpayOrder);
router.post("/v1/order/verify-razorpay-payment", Authorization, VerifyRazorpayPayment);
router.get("/v1/order/list", Authorization, ListMyOrders);
router.get("/v1/order/:id", Authorization, GetOrderDetails);

export default router;
