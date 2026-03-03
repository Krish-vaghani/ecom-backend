import mongoose from "mongoose";

const LandingSectionSchema = new mongoose.Schema(
  {
    sectionKey: {
      type: String,
      required: true,
      unique: true,
      enum: ["hero", "best_collections", "elevate_look", "fresh_styles"],
    },
    order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    images: [{ type: String }],
    price: { type: Number, default: null },
    originalPrice: { type: Number, default: null },
    rating: { type: Number, default: null },
    numberOfReviews: { type: Number, default: 0 },
    tags: [
      {
        type: String,
        enum: ["bestseller", "hot", "trending", "sale"],
      },
    ],
    colors: [
      {
        colorCode: { type: String, default: "" },
        images: { type: String, default: null },
      },
    ],
    // For best_collections (multiple), elevate_look (4), fresh_styles (multiple): array of product items
    products: [
      {
        images: [{ type: String }],
        price: { type: Number, default: null },
        originalPrice: { type: Number, default: null },
        rating: { type: Number, default: null },
        numberOfReviews: { type: Number, default: 0 },
        tags: [{ type: String, enum: ["bestseller", "hot", "trending", "sale"] }],
        colors: [
          {
            colorCode: { type: String, default: "" },
            images: { type: String, default: null },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const LandingSection = mongoose.model("LandingSection", LandingSectionSchema);
export default LandingSection;
