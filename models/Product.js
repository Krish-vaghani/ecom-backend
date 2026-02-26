import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    category: { type: String, required: true, enum: ["jwellery", "purse"] },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    image: { type: String, default: null },
    tags: [
      {
        type: String,
        enum: ["bestseller", "hot", "trending", "sale"],
      },
    ],
    colorVariants: [
      {
        colorCode: { type: String, default: null },
        colorName: { type: String, default: "" },
        images: [{ type: String }],
      },
    ],
    dimensions: {
      heightCm: { type: Number, default: null },
      widthCm: { type: Number, default: null },
      depthCm: { type: Number, default: null },
    },
    averageRating: { type: Number, default: null, min: 0, max: 5 },
    numberOfReviews: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
