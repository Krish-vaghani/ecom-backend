import { Router } from "express";
import { Register, Login } from "../../controller/Auth.js";
import { ListProduct } from "../../controller/Product.js";
import { GetAllLandingPageData } from "../../controller/LandingSection.js";

const router = Router();

// Auth (public)
router.post("/v1/auth/register", Register);
router.post("/v1/auth/login", Login);

// Product (read only)
router.get("/v1/product/list", ListProduct);

// Landing Section (read only)
router.get("/v1/landing", GetAllLandingPageData);

export default router;
