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
import { Authorization } from "../../middlewear/AuthMiddlewear.js";
import { upload } from "../../connection/multer.js";
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

const router = Router();

// Image upload (S3) – use field name "image"
router.post("/admin/upload/image", Authorization, upload.single("image"), UploadImage);

// Product (admin CRUD)
router.post("/admin/product/add", Authorization, AddProduct);
router.put("/admin/product/update/:id", Authorization, UpdateProduct);
router.delete("/admin/product/delete/:id", Authorization, DeleteProduct);

// Testimonial (admin CRUD)
router.post("/admin/testimonial/add", Authorization, AddTestimonial);
router.get("/admin/testimonial/list", Authorization, ListTestimonial);
router.put("/admin/testimonial/update/:id", Authorization, UpdateTestimonial);
router.delete("/admin/testimonial/delete/:id", Authorization, DeleteTestimonial);

// Orders (admin – list, details, update status)
router.get("/admin/order/list", Authorization, AdminListOrders);
router.get("/admin/order/:id", Authorization, AdminGetOrderDetails);
router.put("/admin/order/update-status/:id", Authorization, AdminUpdateOrderStatus);

// Landing Section (admin) – all data in one API
router.get("/admin/landing", Authorization, GetAllLandingPageData);
router.put("/admin/landing/section/update/:id", Authorization, UpdateSection);

// Hero section
router.post("/admin/landing/hero", Authorization, CreateHeroSection);
router.put("/admin/landing/hero", Authorization, UpdateHeroSection);

// Best collections section
router.post("/admin/landing/best-collections", Authorization, CreateBestCollectionsSection);
router.put("/admin/landing/best-collections", Authorization, UpdateBestCollectionsSection);

// Find perfect purse section
router.post("/admin/landing/find-perfect-purse", Authorization, CreateFindPerfectPurseSection);
router.put("/admin/landing/find-perfect-purse", Authorization, UpdateFindPerfectPurseSection);

// Elevate look section
router.post("/admin/landing/elevate-look", Authorization, CreateElevateLookSection);
router.put("/admin/landing/elevate-look", Authorization, UpdateElevateLookSection);

// Fresh styles section
router.post("/admin/landing/fresh-styles", Authorization, CreateFreshStylesSection);
router.put("/admin/landing/fresh-styles", Authorization, UpdateFreshStylesSection);

export default router;
