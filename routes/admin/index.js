import { Router } from "express";
import { AddProduct, UpdateProduct, DeleteProduct } from "../../controller/Product.js";
import {
  UpdateSection,
  CreateHeroSection,
  UpdateHeroSection,
  CreateBestCollectionsSection,
  UpdateBestCollectionsSection,
  CreateFindPerfectPurseSection,
  UpdateFindPerfectPurseSection,
  CreateElevateLookSection,
  UpdateElevateLookSection,
  CreateFreshStylesSection,
  UpdateFreshStylesSection,
  GetAllLandingPageData,
} from "../../controller/LandingSection.js";
import { UploadImage } from "../../controller/Upload.js";
import { Authorization, AdminOnly } from "../../middlewear/AuthMiddlewear.js";
import { upload } from "../../connection/multer.js";
import { AdminLogin } from "../../controller/AdminAuth.js";
import {
  AddTestimonial,
  ListTestimonial,
  UpdateTestimonial,
  DeleteTestimonial,
} from "../../controller/Testimonial.js";
import {
  AdminListOrders,
  AdminGetOrderDetails,
  AdminUpdateOrderStatus,
} from "../../controller/Order.js";
import {
  CreateShipment,
  GenerateLabel,
  RequestPickup,
} from "../../controller/Shipping.js";

const router = Router();

const adminAuth = [Authorization, AdminOnly];

// Admin login (email + password) – no token required
router.post("/admin/auth/login", AdminLogin);

// Image upload (S3) – use field name "image"
router.post("/admin/upload/image", ...adminAuth, upload.single("image"), UploadImage);

// Product (admin CRUD)
router.post("/admin/product/add", ...adminAuth, AddProduct);
router.put("/admin/product/update/:id", ...adminAuth, UpdateProduct);
router.delete("/admin/product/delete/:id", ...adminAuth, DeleteProduct);

// Testimonial (admin CRUD)
router.post("/admin/testimonial/add", ...adminAuth, AddTestimonial);
router.get("/admin/testimonial/list", ...adminAuth, ListTestimonial);
router.put("/admin/testimonial/update/:id", ...adminAuth, UpdateTestimonial);
router.delete("/admin/testimonial/delete/:id", ...adminAuth, DeleteTestimonial);

// Orders (admin – list, details, update status)
router.get("/admin/order/list", ...adminAuth, AdminListOrders);
router.get("/admin/order/:id", ...adminAuth, AdminGetOrderDetails);
router.put("/admin/order/update-status/:id", ...adminAuth, AdminUpdateOrderStatus);
// Shiprocket – create shipment, label, pickup
router.post("/admin/order/:id/create-shipment", ...adminAuth, CreateShipment);
router.post("/admin/order/:id/generate-label", ...adminAuth, GenerateLabel);
router.post("/admin/order/:id/request-pickup", ...adminAuth, RequestPickup);

// Landing Section (admin) – all data in one API
router.get("/admin/landing", ...adminAuth, GetAllLandingPageData);
router.put("/admin/landing/section/update/:id", ...adminAuth, UpdateSection);

// Hero section
router.post("/admin/landing/hero", ...adminAuth, CreateHeroSection);
router.put("/admin/landing/hero", ...adminAuth, UpdateHeroSection);

// Best collections section
router.post("/admin/landing/best-collections", ...adminAuth, CreateBestCollectionsSection);
router.put("/admin/landing/best-collections", ...adminAuth, UpdateBestCollectionsSection);

// Find perfect purse section
router.post("/admin/landing/find-perfect-purse", ...adminAuth, CreateFindPerfectPurseSection);
router.put("/admin/landing/find-perfect-purse", ...adminAuth, UpdateFindPerfectPurseSection);

// Elevate look section
router.post("/admin/landing/elevate-look", ...adminAuth, CreateElevateLookSection);
router.put("/admin/landing/elevate-look", ...adminAuth, UpdateElevateLookSection);

// Fresh styles section
router.post("/admin/landing/fresh-styles", ...adminAuth, CreateFreshStylesSection);
router.put("/admin/landing/fresh-styles", ...adminAuth, UpdateFreshStylesSection);

export default router;
