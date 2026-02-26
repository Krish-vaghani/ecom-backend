import mongoose from "mongoose";

const ProductReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user_name: { type: String, required: true },
    user_image: { type: String, default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductReviewSchema.index({ product: 1, createdAt: -1 });

const ProductReview = mongoose.model("ProductReview", ProductReviewSchema);
export default ProductReview;
