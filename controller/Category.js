import { FindOne, SingleRecordOperation } from "../helper/commonquery.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { CategoryValidate, UpdateCategoryValidate } from "../validators/CategoryValidate.js";

export const AddCategory = async (req, res) => {
  const { error } = CategoryValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existingBySlug = await FindOne(Category, { slug: req.body.slug });
    if (existingBySlug.status === 200) {
      return res.status(409).json({ message: "Category with this slug already exists." });
    }

    const result = await SingleRecordOperation("i", Category, req.body);
    return res.status(result.status).json({ message: "Category added.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const ListCategory = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ message: "Categories fetched.", data: categories });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const UpdateCategory = async (req, res) => {
  const { error } = UpdateCategoryValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { id } = req.params;
  try {
    const exist = await FindOne(Category, { _id: id });
    if (exist.status !== 200) {
      return res.status(404).json({ message: "Category not found." });
    }

    const result = await SingleRecordOperation("u", Category, { _id: id, ...req.body });
    return res.status(result.status).json({ message: "Category updated.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const DeleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const exist = await FindOne(Category, { _id: id });
    if (exist.status !== 200) {
      return res.status(404).json({ message: "Category not found." });
    }

    await SingleRecordOperation("u", Category, { _id: id, is_active: false });
    await Product.updateMany({ categoryId: id }, { is_active: false });
    return res.status(200).json({ message: "Category deleted." });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
