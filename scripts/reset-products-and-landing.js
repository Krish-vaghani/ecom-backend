/**
 * Reset products and home page (landing) data, then add new data.
 * - Deletes: ProductReview, Product, LandingSection
 * - Clears: User cart and wishlist (so they don't reference removed products)
 * - Seeds: New products (40), product reviews, landing sections
 *
 * Run: node scripts/reset-products-and-landing.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductReview from "../models/ProductReview.js";
import LandingSection from "../models/LandingSection.js";
import User from "../models/User.js";

dotenv.config();

const PURSE_IMAGES = [
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
  "https://images.unsplash.com/photo-1591561954557-26941169b49e",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d",
  "https://images.unsplash.com/photo-1594221708779-94832f4320d1",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
  "https://images.unsplash.com/photo-1591561954557-26941169b49e",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d",
  "https://images.unsplash.com/photo-1594221708779-94832f4320d1",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
  "https://images.unsplash.com/photo-1591561954557-26941169b49e",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d",
  "https://images.unsplash.com/photo-1594221708779-94832f4320d1",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
  "https://images.unsplash.com/photo-1591561954557-26941169b49e",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d",
  "https://images.unsplash.com/photo-1594221708779-94832f4320d1",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
  "https://images.unsplash.com/photo-1591561954557-26941169b49e",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d",
  "https://images.unsplash.com/photo-1594221708779-94832f4320d1",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
  "https://images.unsplash.com/photo-1591561954557-26941169b49e",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
];

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const PRODUCT_NAMES = [
  "Ladies Hand Bag Classic Leather",
  "Bloom Mini Tote",
  "Compact Crossbody Bag",
  "Structured Top Handle Tote",
  "Quilted Flap Bag",
  "Saffiano Leather Satchel",
  "Box Bag with Gold Hardware",
  "Hobo Slouch Shoulder Bag",
  "Woven Straw Beach Tote",
  "Belt Bag Sling Purse",
  "Embroidered Clutch Evening Bag",
  "Canvas Messenger Crossbody",
  "Metallic Evening Clutch",
  "Soft Leather Bucket Bag",
  "Chain Link Shoulder Bag",
  "Double Handle Doctor Bag",
  "Fold Over Flap Clutch",
  "Geometric Structured Handbag",
  "Fringed Boho Crossbody",
  "Crocodile Embossed Tote",
  "Round Circle Crossbody Bag",
  "Envelope Clutch with Tassel",
  "Nylon Travel Tote Bag",
  "Pearl Embellished Mini Bag",
  "Wristlet Wallet on Chain",
  "Oversized Shopper Tote",
  "Knot Detail Front Flap Bag",
  "Reversible Tote Two Ways",
  "Bow Front Mini Purse",
  "Laptop Compartment Satchel",
  "Chain Strap Mini Bag",
  "Woven Leather Crossbody",
  "Ruched Satin Clutch",
  "Drawstring Bucket Bag",
  "Top Zip Satchel",
  "Crystal Clasp Evening Bag",
  "Canvas and Leather Tote",
  "Mini Top Handle Bag",
  "Shoulder Bag with Tassel",
  "Straw and Leather Crossbody",
];

while (PRODUCT_NAMES.length < 40) {
  PRODUCT_NAMES.push(`Designer Purse Style ${PRODUCT_NAMES.length + 1}`);
}

const SHORT_DESCRIPTIONS = [
  "Compact tote with spacious interior",
  "Designed for everyday elegance",
  "Minimal style with maximum utility",
  "Soft textures, timeless silhouette",
  "Perfect for daily outings and brunches",
  "Thoughtfully spacious inside",
  "Effortless style upgrade",
  "Premium leather, gold-tone hardware",
  "Structured shape, lightweight feel",
  "Crossbody and shoulder wear",
  "Zip closure, multiple pockets",
  "Handcrafted with attention to detail",
  "Ideal for work and weekend",
  "Classic design, modern finish",
  "Room for tablet and essentials",
  "Adjustable strap, secure closure",
  "Elegant yet practical everyday bag",
  "Refined silhouette, durable construction",
];

const REVIEW_MESSAGES = [
  "The bag is even prettier in person. Fits my laptop and daily essentials. Very happy with the purchase.",
  "Great quality leather and stitching. Arrived well packed. Gets compliments every time I use it.",
  "Exactly as described. Perfect size for everyday—not too big, not too small. Would buy again.",
  "Lovely design and the colour is true to the images. Sturdy and well made. Worth every rupee.",
  "Bought this for my mother and she loves it. The leather feels premium and the hardware is solid.",
  "Perfect for work and weekend. Fits wallet, keys, phone, and a small umbrella. Highly recommend.",
  "Beautiful craftsmanship. The attention to detail is impressive. Shipping was fast too.",
  "I get so many compliments on this bag. Compact from outside but holds a lot. Very practical.",
  "Soft leather, no smell. The strap is comfortable for all-day wear. Very satisfied.",
  "Exactly what I was looking for. Minimal style with maximum utility. Great value for money.",
  "The bag arrived in perfect condition. Quality is top notch. Will order from this brand again.",
  "Designed for everyday elegance—it really is. Use it for office and casual outings. Love it.",
  "Compact tote with spacious interior is right. Fits everything I need without looking bulky.",
  "Premium feel at a reasonable price. The colour is versatile and goes with everything.",
  "Beautiful bag, true to pictures. Arrived quickly. Very pleased with my purchase.",
];

const REVIEWER_NAMES = [
  "Priya S.", "Anita K.", "Riya M.", "Neha R.", "Kavya L.",
  "Courtney Henry", "Sarah M.", "Emma Wilson", "Olivia Brown", "Sophie Davis",
  "Aisha P.", "Meera N.", "Divya R.", "Pooja K.", "Shruti T.",
];

const USER_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
];

const LANDING_SECTION_KEYS = [
  "hero",
  "best_collections",
  "find_perfect_purse",
  "elevate_look",
  "fresh_styles",
  "testimonials",
  "crafted_confidence",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function clearProductsAndLanding() {
  await ProductReview.deleteMany({});
  console.log("ProductReview: deleted all");
  await Product.deleteMany({});
  console.log("Product: deleted all");
  await LandingSection.deleteMany({});
  console.log("LandingSection: deleted all");
  await User.updateMany({}, { $set: { cartItems: [], wishlist: [] } });
  console.log("User: cleared cart and wishlist for all users");
}

async function seedProducts() {
  const tags = ["bestseller", "hot", "trending", "sale"];
  const usedSlugs = new Set();
  const products = [];

  for (let i = 0; i < 40; i++) {
    const name = PRODUCT_NAMES[i];
    let slug = slugify(name);
    if (usedSlugs.has(slug)) slug = `${slug}-${i + 1}`;
    usedSlugs.add(slug);

    const price = Math.round(1200 + Math.random() * 8800);
    const onSale = Math.random() > 0.5;
    const salePrice = onSale ? Math.round(price * (0.7 + Math.random() * 0.25)) : null;
    const productTags = [];
    if (Math.random() > 0.7) productTags.push(tags[Math.floor(Math.random() * tags.length)]);
    if (Math.random() > 0.8) productTags.push(tags[Math.floor(Math.random() * tags.length)]);

    const heightCm = 15 + Math.floor(Math.random() * 8);
    const widthCm = 18 + Math.floor(Math.random() * 10);
    const depthCm = 6 + Math.floor(Math.random() * 6);
    const avgRating = 3.5 + Math.random() * 1.5;
    const numRev = 8 + Math.floor(Math.random() * 70);

    products.push({
      name,
      slug,
      shortDescription: SHORT_DESCRIPTIONS[i % SHORT_DESCRIPTIONS.length],
      description: `Designed for everyday elegance. The ${name.toLowerCase()} is crafted for women who love minimal style with maximum utility. Compact from outside yet thoughtfully spacious inside, it's perfect for daily outings, brunches, shopping, or casual workdays. Soft textures, subtle detailing, and a timeless silhouette make this an effortless style upgrade.`,
      category: "purse",
      price,
      salePrice: salePrice || undefined,
      image: PURSE_IMAGES[i % PURSE_IMAGES.length],
      tags: [...new Set(productTags)],
      colorVariants: [
        { colorCode: "#B0C4DE", colorName: "Slate Blue", images: [PURSE_IMAGES[i % PURSE_IMAGES.length]] },
        { colorCode: "#000000", colorName: "Black", images: [PURSE_IMAGES[(i + 5) % PURSE_IMAGES.length]] },
        { colorCode: "#8B4513", colorName: "Brown", images: [PURSE_IMAGES[(i + 3) % PURSE_IMAGES.length]] },
        { colorCode: "#DEB887", colorName: "Blush", images: [PURSE_IMAGES[(i + 7) % PURSE_IMAGES.length]] },
      ],
      dimensions: { heightCm, widthCm, depthCm },
      averageRating: Math.round(avgRating * 10) / 10,
      numberOfReviews: numRev,
      viewCount: Math.floor(Math.random() * 200),
      is_active: true,
    });
  }

  const inserted = await Product.insertMany(products);
  console.log("Products: inserted", inserted.length);
  return inserted;
}

async function seedProductReviews(products) {
  const reviews = [];
  for (const product of products) {
    const numReviews = 3 + Math.floor(Math.random() * 6);
    for (let r = 0; r < numReviews; r++) {
      reviews.push({
        product: product._id,
        user_name: pick(REVIEWER_NAMES),
        user_image: USER_AVATARS[reviews.length % USER_AVATARS.length],
        rating: 1 + Math.floor(Math.random() * 5),
        message: pick(REVIEW_MESSAGES),
        is_active: true,
      });
    }
  }
  await ProductReview.insertMany(reviews);
  console.log("ProductReviews: inserted", reviews.length);
  return reviews;
}

async function seedLandingSections() {
  const sections = LANDING_SECTION_KEYS.map((sectionKey, idx) => ({
    sectionKey,
    order: idx,
    is_active: true,
    images: [PURSE_IMAGES[idx % PURSE_IMAGES.length]],
    price: 1999 + idx * 100,
    originalPrice: 2499 + idx * 100,
    rating: 4 + Math.random(),
    numberOfReviews: 10 + Math.floor(Math.random() * 40),
    tags: idx % 2 === 0 ? ["bestseller"] : ["trending"],
    colors: [{ colorCode: "#8B4513", images: PURSE_IMAGES[idx % PURSE_IMAGES.length] }],
  }));
  const inserted = await LandingSection.insertMany(sections);
  console.log("LandingSection: inserted", inserted.length);
  return inserted;
}

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.\n");

    console.log("--- Clearing products and home page data ---");
    await clearProductsAndLanding();

    console.log("\n--- Adding new data ---");
    const products = await seedProducts();
    await seedProductReviews(products);
    await seedLandingSections();

    console.log("\nReset and seed completed successfully.");
  } catch (err) {
    console.error("Script failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
