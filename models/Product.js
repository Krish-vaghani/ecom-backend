import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
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
        images: [{ type: String }]
      }
    ],
    numberOfReviews: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
