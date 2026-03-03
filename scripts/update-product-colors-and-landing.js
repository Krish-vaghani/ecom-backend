import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import LandingSection from "../models/LandingSection.js";

dotenv.config();

const RANDOM_COLOR_CODES = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A8",
  "#33FFF2",
  "#FF8C00",
  "#8A2BE2",
  "#20B2AA",
  "#DC143C",
  "#FFD700",
];

function pickRandomColors(count) {
  const shuffled = [...RANDOM_COLOR_CODES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function updateProductColors() {
  const products = await Product.find({ is_active: true }).lean();
  console.log(`Found ${products.length} active products to update colors for.`);

  for (const product of products) {
    const baseImage = product.image || null;
    const colorCount = 3 + Math.floor(Math.random() * 2); // 3 or 4 colors
    const colorCodes = pickRandomColors(colorCount);
    const colorVariants = colorCodes.map((code) => ({
      colorCode: code,
      colorName: "",
      images: baseImage ? [baseImage] : [],
    }));

    await Product.updateOne(
      { _id: product._id },
      { $set: { colorVariants } }
    );
  }

  console.log("Product colorVariants updated for all products.");
}

async function updateLandingColorsFromProducts() {
  const sections = await LandingSection.find({}).lean();
  console.log(`Found ${sections.length} landing sections to update.`);

  for (const section of sections) {
    if (!Array.isArray(section.products) || section.products.length === 0) continue;

    const updatedProducts = [];

    for (const lp of section.products) {
      if (!lp.product) {
        updatedProducts.push(lp);
        continue;
      }

      const product = await Product.findById(lp.product).lean();
      if (!product) {
        updatedProducts.push(lp);
        continue;
      }

      const colors =
        (product.colorVariants || []).map((v) => ({
          colorCode: v.colorCode || "",
          images: (v.images && v.images[0]) || null,
        })) || [];

      const baseImages = new Set(lp.images || []);
      (product.colorVariants || []).forEach((v) => {
        (v.images || []).forEach((img) => {
          if (img) baseImages.add(img);
        });
      });

      updatedProducts.push({
        ...lp,
        colors,
        images: Array.from(baseImages),
      });
    }

    await LandingSection.updateOne(
      { _id: section._id },
      { $set: { products: updatedProducts } }
    );
  }

  console.log("LandingSection products colors/images updated from linked products.");
}

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.\n");

    await updateProductColors();
    await updateLandingColorsFromProducts();

    console.log("\nUpdate colors script completed successfully.");
  } catch (err) {
    console.error("Script failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();

