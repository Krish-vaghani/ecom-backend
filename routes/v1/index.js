import { Router } from "express";
import { Login, RegisterOrRequestOtp } from "../../controller/Auth.js";
import { ListProduct, IncrementProductView } from "../../controller/Product.js";
import { GetAllLandingPageData } from "../../controller/LandingSection.js";
import { ListActiveTestimonials } from "../../controller/Testimonial.js";

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

export default router;
