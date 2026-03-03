/**
 * Seed script: adds dummy data to all collections.
 * - Products: 40 items (purse & jewellery) with original-like names and purse/handbag images
 * - LandingSection, Testimonial, User, UserAddress, Order
 *
 * Run: node scripts/seed-dummy-data.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductReview from "../models/ProductReview.js";
import LandingSection from "../models/LandingSection.js";
import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";
import UserAddress from "../models/UserAddress.js";
import Order from "../models/Order.js";

dotenv.config();

// --- Purse / handbag image URLs (Unsplash, free to use) ---
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
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// --- 40 product names (purse / handbag style, original-like) ---
const PRODUCT_NAMES = [
  "Classic Leather Crossbody Bag",
  "Vintage Shoulder Purse",
  "Mini Chain Strap Handbag",
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

// Ensure we have 40 names (add more if needed)
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

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

  return {
    product: product._id,
    images: baseImages.length > 0 ? baseImages : [PURSE_IMAGES[0]],
    price: currentPrice,
    originalPrice: originalPrice,
    rating: product.averageRating ?? null,
    numberOfReviews: product.numberOfReviews ?? 0,
    tags: (product.tags && product.tags.length > 0)
      ? product.tags
      : [LANDING_TAGS[Math.floor(Math.random() * LANDING_TAGS.length)]],
    colors: (product.colorVariants || []).map((v) => ({
      colorCode: v.colorCode || "",
      images: (v.images && v.images[0]) || null,
    })),
  };
}

const TESTIMONIALS = [
  { message: "Beautiful quality and fast delivery. My purse gets compliments every day!", review: 5, user_name: "Priya S.", user_address: "Mumbai, India" },
  { message: "Exactly as shown. Perfect size for everyday use. Highly recommend.", review: 5, user_name: "Anita K.", user_address: "Delhi, India" },
  { message: "Great craftsmanship. The leather feels premium. Will order again.", review: 4, user_name: "Riya M.", user_address: "Bangalore, India" },
  { message: "Lovely design and sturdy. Worth every rupee.", review: 5, user_name: "Neha R.", user_address: "Pune, India" },
  { message: "Super happy with my purchase. Packaging was also very nice.", review: 5, user_name: "Kavya L.", user_address: "Hyderabad, India" },
];

const USER_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
];

async function seedProducts() {
  const tags = ["bestseller", "hot", "trending", "sale"];
  const usedSlugs = new Set();
  const products = [];

  function pickRandomImagesForColor(startIndex) {
    // pick between 1 and 3 images for a color
    const count = 1 + Math.floor(Math.random() * 3);
    const images = new Set();
    let idx = startIndex;
    while (images.size < count) {
      images.add(PURSE_IMAGES[idx % PURSE_IMAGES.length]);
      idx += 3;
    }
    return Array.from(images);
  }

  for (let i = 0; i < 40; i++) {
    const name = PRODUCT_NAMES[i];
    let slug = slugify(name);
    if (usedSlugs.has(slug)) slug = `${slug}-${i + 1}`;
    usedSlugs.add(slug);

    const price = Math.round(1200 + Math.random() * 8800);
    const onSale = Math.random() > 0.6;
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
        {
          colorCode: "#B0C4DE",
          colorName: "Slate Blue",
          images: pickRandomImagesForColor(i),
        },
        {
          colorCode: "#000000",
          colorName: "Black",
          images: pickRandomImagesForColor(i + 5),
        },
        {
          colorCode: "#8B4513",
          colorName: "Brown",
          images: pickRandomImagesForColor(i + 3),
        },
        {
          colorCode: "#DEB887",
          colorName: "Blush",
          images: pickRandomImagesForColor(i + 7),
        },
      ],
      dimensions: { heightCm, widthCm, depthCm },
      averageRating: Math.round(avgRating * 10) / 10,
      numberOfReviews: numRev,
      viewCount: Math.floor(Math.random() * 200),
      is_active: true,
    });
  }

  await Product.deleteMany({});
  const inserted = await Product.insertMany(products);
  console.log("Products: inserted", inserted.length);
  return inserted;
}

async function seedProductReviews(products) {
  await ProductReview.deleteMany({});
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

async function seedLandingSections(products) {
  await LandingSection.deleteMany({});

  if (!products || products.length === 0) {
    console.log("LandingSection: no products available to build landing sections");
    return [];
  }

  const shuffled = [...products].sort(() => Math.random() - 0.5);
  const heroProduct = shuffled[0];
  const bestCollectionSource = shuffled.slice(1, 7);
  const elevateLookSource = shuffled.slice(7, 11);
  const freshStylesSource = shuffled.slice(11, 19);

  const bestCollectionsProducts = bestCollectionSource
    .map(makeLandingProductFromProduct)
    .filter(Boolean);
  const elevateLookProducts = elevateLookSource
    .map(makeLandingProductFromProduct)
    .filter(Boolean);
  const freshStylesProducts = freshStylesSource
    .map(makeLandingProductFromProduct)
    .filter(Boolean);

  const heroImages = makeLandingProductFromProduct(heroProduct)?.images || [
    PURSE_IMAGES[0],
    PURSE_IMAGES[1],
  ];
  const heroPrice = heroProduct
    ? heroProduct.salePrice != null
      ? heroProduct.salePrice
      : heroProduct.price
    : 2499;
  const heroOriginalPrice =
    heroProduct && heroProduct.salePrice != null ? heroProduct.price : 2999;

  const sections = [
    {
      sectionKey: "hero",
      order: 0,
      is_active: true,
      images: heroImages,
      price: heroPrice,
      originalPrice: heroOriginalPrice,
      rating: heroProduct?.averageRating ?? 4.5,
      numberOfReviews: heroProduct?.numberOfReviews ?? 42,
    },
    {
      sectionKey: "best_collections",
      order: 1,
      is_active: true,
      products: bestCollectionsProducts,
    },
    {
      sectionKey: "elevate_look",
      order: 2,
      is_active: true,
      products: elevateLookProducts,
    },
    {
      sectionKey: "fresh_styles",
      order: 3,
      is_active: true,
      products: freshStylesProducts,
    },
  ];

  const inserted = await LandingSection.insertMany(sections);
  console.log("LandingSection: inserted", inserted.length);
  return inserted;
}

async function seedTestimonials() {
  await Testimonial.deleteMany({});
  const data = TESTIMONIALS.map((t, i) => ({
    ...t,
    user_image: USER_AVATARS[i % USER_AVATARS.length],
    is_active: true,
  }));
  const inserted = await Testimonial.insertMany(data);
  console.log("Testimonials: inserted", inserted.length);
  return inserted;
}

async function seedUsers() {
  await User.deleteMany({});
  const users = [
    { name: "Demo User One", phone: "9876543210", email: "demo1@example.com", cartItems: [], wishlist: [] },
    { name: "Demo User Two", phone: "9876543211", email: "demo2@example.com", cartItems: [], wishlist: [] },
    { name: "Demo User Three", phone: "9876543212", email: null, cartItems: [], wishlist: [] },
  ];
  const inserted = await User.insertMany(users);
  console.log("Users: inserted", inserted.length);
  return inserted;
}

async function seedUserAddresses(users) {
  await UserAddress.deleteMany({});
  const addresses = [];
  const cities = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"];
  const states = ["Maharashtra", "Delhi", "Karnataka", "Maharashtra", "Telangana"];
  const pincodes = ["400001", "110001", "560001", "411001", "500001"];

  users.forEach((user, uIdx) => {
    addresses.push({
      user: user._id,
      address_type: "Home",
      full_name: user.name,
      mobile_number: user.phone,
      email_address: user.email || "user@example.com",
      address_line_1: `${100 + uIdx} Main Street, Block ${uIdx + 1}`,
      address_line_2: "Near Central Market",
      pincode: pincodes[uIdx % pincodes.length],
      city: cities[uIdx % cities.length],
      state: states[uIdx % states.length],
      landmark: "Opposite Park",
      is_default: true,
    });
    addresses.push({
      user: user._id,
      address_type: "Office",
      full_name: user.name,
      mobile_number: user.phone,
      email_address: user.email || "user@example.com",
      address_line_1: `${200 + uIdx} Business Park`,
      address_line_2: "Tower B",
      pincode: pincodes[(uIdx + 1) % pincodes.length],
      city: cities[(uIdx + 1) % cities.length],
      state: states[(uIdx + 1) % states.length],
      landmark: "",
      is_default: false,
    });
  });

  const inserted = await UserAddress.insertMany(addresses);
  console.log("UserAddresses: inserted", inserted.length);
  return inserted;
}

function generateOrderId() {
  return "ORD" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function seedOrders(users, products) {
  await Order.deleteMany({});
  const orders = [];
  const statuses = ["order_placed", "confirmed", "shipped", "out_for_delivery", "delivered"];
  const cities = ["Mumbai", "Delhi", "Bangalore"];
  const states = ["Maharashtra", "Delhi", "Karnataka"];
  const pincodes = ["400001", "110001", "560001"];

  for (let o = 0; o < 8; o++) {
    const user = users[o % users.length];
    const numItems = 1 + Math.floor(Math.random() * 3);
    const selectedProducts = [];
    const used = new Set();
    while (selectedProducts.length < numItems) {
      const p = products[Math.floor(Math.random() * products.length)];
      if (!used.has(p._id.toString())) {
        used.add(p._id.toString());
        selectedProducts.push(p);
      }
    }

    let subtotal = 0;
    const items = selectedProducts.map((p) => {
      const qty = 1 + Math.floor(Math.random() * 2);
      const pricePerItem = p.salePrice ?? p.price;
      const totalForItem = pricePerItem * qty;
      subtotal += totalForItem;
      return {
        product: p._id,
        productName: p.name,
        quantity: qty,
        pricePerItem,
        originalPrice: p.salePrice ? p.price : null,
        totalForItem,
      };
    });

    const shippingCharge = subtotal >= 2000 ? 0 : 99;
    const total = subtotal + shippingCharge;
    const status = statuses[Math.min(o, statuses.length - 1)];
    const idx = o % 3;

    orders.push({
      orderId: generateOrderId(),
      user: user._id,
      status,
      paymentMethod: Math.random() > 0.5 ? "cash_on_delivery" : "razorpay",
      paymentStatus: status === "order_placed" ? "pending" : "confirmed",
      deliverTo: {
        fullName: user.name,
        addressLine1: `${100 + o} Main Street`,
        addressLine2: "Block A",
        city: cities[idx],
        state: states[idx],
        pincode: pincodes[idx],
        phone: user.phone,
        email: user.email || "customer@example.com",
        landmark: "Near Park",
      },
      items,
      subtotal,
      shippingCharge,
      total,
    });
  }

  const inserted = await Order.insertMany(orders);
  console.log("Orders: inserted", inserted.length);
  return inserted;
}

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB. Seeding...\n");

    const products = await seedProducts();
    await seedProductReviews(products);
    await seedLandingSections(products);
    await seedTestimonials();
    const users = await seedUsers();
    await seedUserAddresses(users);
    await seedOrders(users, products);

    console.log("\nSeed completed successfully.");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
