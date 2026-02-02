import { FindOne, SingleRecordOperation } from "../helper/commonquery.js";
import Product from "../models/Product.js";
import { ProductValidator, UpdateProductValidator } from "../validators/ProductValidator.js";

export const AddProduct = async (req, res) => {
  const { error } = ProductValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const result = await SingleRecordOperation("i", Product, req.body);
    return res.status(result.status).json({ message: "Product added.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const ListProduct = async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10 } = req.query;
    const filter = { is_active: true };
    if (category && ["jwellery", "purse"].includes(category)) filter.category = category;
    if (tag && ["bestseller", "hot", "trending", "sale"].includes(tag)) filter.tags = tag;

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: "Products fetched.",
      data: products,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const UpdateProduct = async (req, res) => {
  const { error } = UpdateProductValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { id } = req.params;
  try {
    const exist = await FindOne(Product, { _id: id });
    if (exist.status !== 200) {
      return res.status(404).json({ message: "Product not found." });
    }

    const result = await SingleRecordOperation("u", Product, { _id: id, ...req.body });
    return res.status(result.status).json({ message: "Product updated.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const DeleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const exist = await FindOne(Product, { _id: id });
    if (exist.status !== 200) {
      return res.status(404).json({ message: "Product not found." });
    }

    await SingleRecordOperation("u", Product, { _id: id, is_active: false });
    return res.status(200).json({ message: "Product deleted." });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
