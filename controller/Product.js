import { FindOne, SingleRecordOperation } from "../helper/commonquery.js";
import Product from "../models/Product.js";
import ProductReview from "../models/ProductReview.js";
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

const LANDING_SECTION_VALUES = ["hero", "best_collections", "elevate_look", "fresh_styles"];

export const ListProduct = async (req, res) => {
  try {
    const { category, tag, landingSection, page = 1, limit = 10 } = req.query;
    const filter = { is_active: true };
    if (category && ["jwellery", "purse"].includes(category)) filter.category = category;
    if (tag && ["bestseller", "hot", "trending", "sale"].includes(tag)) filter.tags = tag;
    if (landingSection && LANDING_SECTION_VALUES.includes(landingSection))
      filter.landingSection = landingSection;

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

/**
 * Admin product listing – shows ALL products (active + inactive).
 * Supports filters: category, tag, landingSection, is_active, page, limit.
 */
export const AdminListProduct = async (req, res) => {
  try {
    const { category, tag, landingSection, is_active, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (is_active !== undefined) filter.is_active = is_active === "true";
    if (category && ["jwellery", "purse"].includes(category)) filter.category = category;
    if (tag && ["bestseller", "hot", "trending", "sale"].includes(tag)) filter.tags = tag;
    if (landingSection && LANDING_SECTION_VALUES.includes(landingSection))
      filter.landingSection = landingSection;

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

/**
 * Get product detail by id (param) or slug (query ?slug=xxx).
 * Returns product, images (main + thumbnails), dimensions, star breakdown, and paginated reviews.
 */
export const GetProductDetail = async (req, res) => {
  const { id } = req.params;
  const { slug } = req.query;
  const reviewPage = Math.max(1, Number(req.query.reviewPage) || 1);
  const reviewLimit = Math.min(50, Math.max(5, Number(req.query.reviewLimit) || 10));

  const filter = { is_active: true };
  if (id) filter._id = id;
  else if (slug) filter.slug = slug;
  else {
    return res.status(400).json({ message: "Product id (param) or slug (query) is required." });
  }

  try {
    const product = await Product.findOne(filter).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const productId = product._id;

    // Star breakdown and reviews from ProductReview
    const [reviewsAgg, reviewsList] = await Promise.all([
      ProductReview.aggregate([
        { $match: { product: productId, is_active: true } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
      ProductReview.find({ product: productId, is_active: true })
        .sort({ createdAt: -1 })
        .skip((reviewPage - 1) * reviewLimit)
        .limit(reviewLimit)
        .lean(),
    ]);

    const starBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let reviewCount = 0;
    let sumRating = 0;
    reviewsAgg.forEach((r) => {
      starBreakdown[r._id] = r.count;
      reviewCount += r.count;
      sumRating += r._id * r.count;
    });

    const averageRating =
      product.averageRating != null
        ? product.averageRating
        : reviewCount > 0
          ? Math.round((sumRating / reviewCount) * 10) / 10
          : null;
    const numberOfReviews = product.numberOfReviews != null ? product.numberOfReviews : reviewCount;

    const currentPrice = product.salePrice != null ? product.salePrice : product.price;
    const originalPrice = product.salePrice != null ? product.price : null;
    const savings =
      originalPrice != null && currentPrice < originalPrice
        ? originalPrice - currentPrice
        : null;

    // Use stored default flag; if none set, first variant is default
    const variants = product.colorVariants || [];
    const hasStoredDefault = variants.some((v) => v.default === true);
    const colorVariantsWithDefault = variants.map((v, index) => ({
      ...v,
      default: hasStoredDefault ? v.default === true : index === 0,
    }));

    return res.status(200).json({
      message: "Product detail fetched.",
      data: {
        ...product,
        colorVariants: colorVariantsWithDefault,
        currentPrice,
        originalPrice: originalPrice || undefined,
        savings: savings ?? undefined,
        averageRating: averageRating ?? undefined,
        numberOfReviews,
        starBreakdown,
        reviews: reviewsList,
        reviewPage,
        reviewLimit,
        totalReviews: reviewCount,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/** Increment product view count. Call when a product is viewed (e.g. product detail page). */
export const IncrementProductView = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Product.findOneAndUpdate(
      { _id: id, is_active: true },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({
      message: "Product view recorded.",
      data: { viewCount: updated.viewCount },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
