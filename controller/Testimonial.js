import { FindOne, SingleRecordOperation } from "../helper/commonquery.js";
import Testimonial from "../models/Testimonial.js";
import {
  TestimonialValidator,
  UpdateTestimonialValidator,
} from "../validators/TestimonialValidator.js";

export const AddTestimonial = async (req, res) => {
  const { error } = TestimonialValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const result = await SingleRecordOperation("i", Testimonial, req.body);
    return res
      .status(result.status)
      .json({ message: "Testimonial added.", data: result.data });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error.", error: err.message });
  }
};

export const ListTestimonial = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const filter = {};

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Testimonial.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Testimonial.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: "Testimonials fetched.",
      data: items,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error.", error: err.message });
  }
};

export const UpdateTestimonial = async (req, res) => {
  const { error } = UpdateTestimonialValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { id } = req.params;
  try {
    const exist = await FindOne(Testimonial, { _id: id });
    if (exist.status !== 200) {
      return res.status(404).json({ message: "Testimonial not found." });
    }

    const result = await SingleRecordOperation("u", Testimonial, {
      _id: id,
      ...req.body,
    });
    return res
      .status(result.status)
      .json({ message: "Testimonial updated.", data: result.data });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error.", error: err.message });
  }
};

export const DeleteTestimonial = async (req, res) => {
  const { id } = req.params;
  try {
    const exist = await FindOne(Testimonial, { _id: id });
    if (exist.status !== 200) {
      return res.status(404).json({ message: "Testimonial not found." });
    }

    await SingleRecordOperation("u", Testimonial, { _id: id, is_active: false });
    return res.status(200).json({ message: "Testimonial deleted." });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error.", error: err.message });
  }
};

// Public list – only active testimonials
export const ListActiveTestimonials = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const items = await Testimonial.find({ is_active: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return res
      .status(200)
      .json({ message: "Active testimonials fetched.", data: items });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error.", error: err.message });
  }
};

