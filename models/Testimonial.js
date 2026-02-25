import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    review: { type: Number, required: true, min: 1, max: 5 },
    user_image: { type: String, default: null },
    user_name: { type: String, required: true },
    user_address: { type: String, default: "" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Testimonial = mongoose.model("Testimonial", TestimonialSchema);
export default Testimonial;

