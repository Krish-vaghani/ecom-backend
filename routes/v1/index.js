import { Router } from "express";
import { Login, RegisterOrRequestOtp } from "../../controller/Auth.js";
import { ListProduct } from "../../controller/Product.js";
import { GetAllLandingPageData } from "../../controller/LandingSection.js";

const router = Router();

// Auth (public)
// Step 1: register if new OR send OTP if existing (single endpoint)
router.post("/v1/auth/register-or-login", RegisterOrRequestOtp);
// Step 2: verify OTP and receive JWT token
router.post("/v1/auth/login", Login);

// Product (read only)
router.get("/v1/product/list", ListProduct);

// Landing Section (read only)
router.get("/v1/landing", GetAllLandingPageData);

export default router;
