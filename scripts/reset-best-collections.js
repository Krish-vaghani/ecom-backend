/**
 * Drop best_collections landing section and re-add it from existing products.
 * Use after schema changes so the section has the correct shape (product ref, colors.images array, default).
 *
 * Run: node scripts/reset-best-collections.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import LandingSection from "../models/LandingSection.js";

dotenv.config();

const BEST_COLLECTIONS_SECTION_KEY = "best_collections";
const LANDING_TAGS = ["bestseller", "hot", "trending", "sale"];

function makeLandingProductFromProduct(product) {
  if (!product) return null;

  const baseImages = [product.image].filter(Boolean);
  (product.colorVariants || []).forEach((variant) => {
    (variant.images || []).forEach((img) => {
      if (img && !baseImages.includes(img)) baseImages.push(img);
    });
  });

  const currentPrice = product.salePrice != null ? product.salePrice : product.price;
  const originalPrice = product.salePrice != null ? product.price : null;

  const colors = (product.colorVariants || []).map((v, idx) => ({
    colorCode: v.colorCode || "",
    images: Array.isArray(v.images) ? v.images : [],
    default: idx === 0,
  }));

  return {
    product: product._id,
    images: baseImages.length > 0 ? baseImages : [],
    price: currentPrice,
    originalPrice: originalPrice,
    rating: product.averageRating ?? null,
    numberOfReviews: product.numberOfReviews ?? 0,
    tags:
      product.tags && product.tags.length > 0
        ? product.tags
        : [LANDING_TAGS[Math.floor(Math.random() * LANDING_TAGS.length)]],
    colors,
  };
}

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.\n");

    const deleted = await LandingSection.deleteOne({
      sectionKey: BEST_COLLECTIONS_SECTION_KEY,
    });
    console.log(
      deleted.deletedCount === 1
        ? "best_collections section deleted."
        : "best_collections section was not present (nothing to delete)."
    );

    const products = await Product.find({ is_active: true }).lean();
    if (!products.length) {
      console.log("No active products in DB. Add products first, then run this script again.");
      return;
    }

    const shuffled = [...products].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 6);
    const landingProducts = selected.map(makeLandingProductFromProduct).filter(Boolean);

    await LandingSection.create({
      sectionKey: BEST_COLLECTIONS_SECTION_KEY,
      order: 1,
      is_active: true,
      products: landingProducts,
    });
    console.log("best_collections section re-created with", landingProducts.length, "products.");

    console.log("\nDone.");
  } catch (err) {
    console.error("Script failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
