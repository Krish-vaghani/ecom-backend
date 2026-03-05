/**
 * Drop all products and product reviews, clear user cart/wishlist, and re-seed products
 * (and reviews) with the current schema (colorVariants with multiple images, default flag).
 *
 * Run: node scripts/reset-products.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductReview from "../models/ProductReview.js";
import User from "../models/User.js";
import { seedProducts, seedProductReviews } from "./seed-dummy-data.js";

dotenv.config();

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.\n");

    const r1 = await ProductReview.deleteMany({});
    console.log("ProductReview: deleted", r1.deletedCount);

    const r2 = await Product.deleteMany({});
    console.log("Product: deleted", r2.deletedCount);

    const r3 = await User.updateMany({}, { $set: { cartItems: [], wishlist: [] } });
    console.log("User: cleared cart and wishlist for", r3.modifiedCount, "users\n");

    const products = await seedProducts();
    await seedProductReviews(products);

    console.log("\nProducts and reviews reset and re-seeded successfully.");
  } catch (err) {
    console.error("Script failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
