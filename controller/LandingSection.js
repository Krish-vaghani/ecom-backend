import { FindOne, SingleRecordOperation } from "../helper/commonquery.js";
import LandingSection from "../models/LandingSection.js";
import Product from "../models/Product.js";
import {
  UpdateLandingSectionValidate,
  HeroSectionValidate,
  BestCollectionsSectionValidate,
  ElevateLookSectionValidate,
  FreshStylesSectionValidate,
} from "../validators/LandingSectionValidator.js";

const HERO_SECTION_KEY = "hero";

/** Valid MongoDB ObjectId is 24 hex characters */
function isValidObjectId(id) {
  if (id == null) return false;
  const s = String(id).trim();
  return s.length === 24 && /^[a-fA-F0-9]{24}$/.test(s);
}

function slugifyName(name) {
  return String(name || "Landing Product")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Ensure every landing product item has a valid Product reference.
 * If product id is missing/invalid or product not found, create a new Product
 * using landing data (images, price, tags, colors) and set item.product to that id.
 * Also normalizes colors[].images to array and colors[].default to boolean.
 */
async function ensureLandingProducts(rawProducts) {
  if (!Array.isArray(rawProducts)) return [];

  const result = [];
  for (const p of rawProducts) {
    const item = { ...p };

    let productId = item.product;
    if (productId && isValidObjectId(productId)) {
      const existing = await Product.findOne({ _id: productId, is_active: true })
        .select("_id")
        .lean();
      if (!existing) {
        productId = null;
      }
    } else {
      productId = null;
    }

    if (!productId) {
      const baseName = item.name || "Landing Product";
      const slugBase = slugifyName(baseName);

      const imagesArr = Array.isArray(item.images) ? item.images : [];
      let mainImage = imagesArr[0] || null;
      if (!mainImage && Array.isArray(item.colors) && item.colors.length > 0) {
        const firstColorImages = item.colors[0]?.images;
        if (Array.isArray(firstColorImages) && firstColorImages[0]) {
          mainImage = firstColorImages[0];
        }
      }

      const price =
        item.price != null
          ? item.price
          : item.originalPrice != null
          ? item.originalPrice
          : 0;

      const colorVariants = Array.isArray(item.colors)
        ? item.colors.map((c, idx) => ({
            colorCode: c.colorCode || null,
            colorName: "",
            images: Array.isArray(c.images) ? c.images : [],
            default: idx === 0,
          }))
        : [];

      const newProduct = await Product.create({
        name: baseName,
        slug: `${slugBase}-${Date.now().toString(36)}`,
        shortDescription: "",
        description: "",
        category: "purse",
        price,
        salePrice:
          item.originalPrice != null && item.originalPrice > price ? price : null,
        image: mainImage,
        tags: item.tags || [],
        colorVariants,
        dimensions: {},
        averageRating: item.rating ?? null,
        numberOfReviews: item.numberOfReviews ?? 0,
        is_active: true,
      });

      item.product = newProduct._id;
    }

    if (Array.isArray(item.colors)) {
      item.colors = item.colors.map((c) => ({
        colorCode: c.colorCode != null ? String(c.colorCode) : "",
        images: Array.isArray(c.images) ? c.images : [],
        default: Boolean(c.default),
      }));
    }

    result.push(item);
  }

  return result;
}
const BEST_COLLECTIONS_SECTION_KEY = "best_collections";
const ELEVATE_LOOK_SECTION_KEY = "elevate_look";
const FRESH_STYLES_SECTION_KEY = "fresh_styles";
const LANDING_SECTION_KEYS = [
  HERO_SECTION_KEY,
  BEST_COLLECTIONS_SECTION_KEY,
  ELEVATE_LOOK_SECTION_KEY,
  FRESH_STYLES_SECTION_KEY,
];

const PRODUCT_ARRAY_KEYS = [
  BEST_COLLECTIONS_SECTION_KEY,
  ELEVATE_LOOK_SECTION_KEY,
  FRESH_STYLES_SECTION_KEY,
];

/** Public API: returns landing data. For hero: single object. For best_collections, elevate_look, fresh_styles: direct array of products. */
export const GetAllLandingPageData = async (req, res) => {
  try {
    const sections = await LandingSection.find({
      is_active: true,
      sectionKey: { $in: LANDING_SECTION_KEYS },
    })
      .sort({ order: 1 })
      .lean();
    const data = {};
    for (const section of sections) {
      if (PRODUCT_ARRAY_KEYS.includes(section.sectionKey)) {
        data[section.sectionKey] = Array.isArray(section.products) ? section.products : [];
      } else {
        data[section.sectionKey] = section;
      }
    }
    return res.status(200).json({ message: "Landing page data fetched.", data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/** Admin API: returns full section documents (with _id, order, is_active, products) so admin can bind create/update APIs. */
export const GetAdminLandingPageData = async (req, res) => {
  try {
    const sections = await LandingSection.find({
      sectionKey: { $in: LANDING_SECTION_KEYS },
    })
      .sort({ order: 1 })
      .lean();
    const data = {};
    for (const section of sections) {
      data[section.sectionKey] = section;
    }
    return res.status(200).json({ message: "Landing page data fetched.", data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const UpdateSection = async (req, res) => {
  const { error } = UpdateLandingSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { id } = req.params;
  try {
    const exist = await FindOne(LandingSection, { _id: id });
    if (exist.status !== 200) {
      return res.status(404).json({ message: "Section not found." });
    }

    const body = { ...req.body };
    if (Array.isArray(body.products)) {
      body.products = await ensureLandingProducts(body.products);
    }
    const result = await SingleRecordOperation("u", LandingSection, { _id: id, ...body });
    return res.status(result.status).json({ message: "Section updated.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// Hero section (single record: create / get / update)
export const CreateHeroSection = async (req, res) => {
  const { error } = HeroSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existing = await FindOne(LandingSection, { sectionKey: HERO_SECTION_KEY });
    if (existing.status === 200) {
      return res.status(409).json({ message: "Hero section already exists. Use update instead." });
    }

    const payload = {
      sectionKey: HERO_SECTION_KEY,
      order: 0,
      is_active: true,
      images: Array.isArray(req.body.images) ? req.body.images : [],
      price: req.body.price ?? null,
      rating: req.body.rating ?? null,
      numberOfReviews: req.body.numberOfReviews ?? 0,
    };
    const result = await SingleRecordOperation("i", LandingSection, payload);
    return res.status(result.status).json({ message: "Hero section created.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const UpdateHeroSection = async (req, res) => {
  const { error } = HeroSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const exist = await FindOne(LandingSection, { sectionKey: HERO_SECTION_KEY });
    if (exist.status !== 200) {
      return res.status(404).json({ message: "Hero section not found." });
    }

    const updateData = {};
    if (req.body.images !== undefined) updateData.images = req.body.images;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.rating !== undefined) updateData.rating = req.body.rating;
    if (req.body.numberOfReviews !== undefined) updateData.numberOfReviews = req.body.numberOfReviews;

    const result = await SingleRecordOperation("u", LandingSection, {
      _id: exist.data._id,
      ...updateData,
    });
    return res.status(result.status).json({ message: "Hero section updated.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// Best collections section (single record with products array – multiple products)
export const CreateBestCollectionsSection = async (req, res) => {
  const { error } = BestCollectionsSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existing = await FindOne(LandingSection, { sectionKey: BEST_COLLECTIONS_SECTION_KEY });
    if (existing.status === 200) {
      return res.status(409).json({ message: "Best collections section already exists. Use update instead." });
    }

    const products = await ensureLandingProducts(req.body.products || []);

    const payload = {
      sectionKey: BEST_COLLECTIONS_SECTION_KEY,
      order: req.body.order ?? 0,
      is_active: req.body.is_active ?? true,
      products,
    };
    const result = await SingleRecordOperation("i", LandingSection, payload);
    return res.status(result.status).json({ message: "Best collections section created.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const UpdateBestCollectionsSection = async (req, res) => {
  const { error } = BestCollectionsSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const exist = await FindOne(LandingSection, { sectionKey: BEST_COLLECTIONS_SECTION_KEY });
    if (exist.status !== 200) {
      return res.status(404).json({ message: "Best collections section not found." });
    }

    const updateData = {};
    if (req.body.order !== undefined) updateData.order = req.body.order;
    if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active;
    if (req.body.products !== undefined) {
      updateData.products = await ensureLandingProducts(req.body.products);
    }

    const result = await SingleRecordOperation("u", LandingSection, {
      _id: exist.data._id,
      ...updateData,
    });
    return res.status(result.status).json({ message: "Best collections section updated.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// Elevate look section (single record with products array – always 4 products)
export const CreateElevateLookSection = async (req, res) => {
  const { error } = ElevateLookSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existing = await FindOne(LandingSection, {
      sectionKey: ELEVATE_LOOK_SECTION_KEY,
    });
    if (existing.status === 200) {
      return res.status(409).json({ message: "Elevate look section already exists. Use update instead." });
    }

    const raw =
      Array.isArray(req.body.products) && req.body.products.length === 4
        ? req.body.products
        : [];
    const products = await ensureLandingProducts(raw);
    const payload = {
      sectionKey: ELEVATE_LOOK_SECTION_KEY,
      order: req.body.order ?? 0,
      is_active: true,
      products,
    };
    const result = await SingleRecordOperation("i", LandingSection, payload);
    return res.status(result.status).json({ message: "Elevate look section created.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const UpdateElevateLookSection = async (req, res) => {
  const { error } = ElevateLookSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const exist = await FindOne(LandingSection, { sectionKey: ELEVATE_LOOK_SECTION_KEY });
    if (exist.status !== 200) {
      return res.status(404).json({ message: "Elevate look section not found." });
    }

    const updateData = {};
    if (req.body.order !== undefined) updateData.order = req.body.order;
    if (req.body.products !== undefined) {
      updateData.products = await ensureLandingProducts(req.body.products);
    }

    const result = await SingleRecordOperation("u", LandingSection, {
      _id: exist.data._id,
      ...updateData,
    });
    return res.status(result.status).json({ message: "Elevate look section updated.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// Fresh styles section (single record with products array – multiple products)
export const CreateFreshStylesSection = async (req, res) => {
  const { error } = FreshStylesSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existing = await FindOne(LandingSection, {
      sectionKey: FRESH_STYLES_SECTION_KEY,
    });
    if (existing.status === 200) {
      return res.status(409).json({ message: "Fresh styles section already exists. Use update instead." });
    }

    const products = await ensureLandingProducts(req.body.products || []);

    const payload = {
      sectionKey: FRESH_STYLES_SECTION_KEY,
      order: req.body.order ?? 0,
      is_active: req.body.is_active ?? true,
      products,
    };
    const result = await SingleRecordOperation("i", LandingSection, payload);
    return res.status(result.status).json({ message: "Fresh styles section created.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const UpdateFreshStylesSection = async (req, res) => {
  const { error } = FreshStylesSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const exist = await FindOne(LandingSection, { sectionKey: FRESH_STYLES_SECTION_KEY });
    if (exist.status !== 200) {
      return res.status(404).json({ message: "Fresh styles section not found." });
    }

    const updateData = {};
    if (req.body.order !== undefined) updateData.order = req.body.order;
    if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active;
    if (req.body.products !== undefined) {
      updateData.products = await ensureLandingProducts(req.body.products);
    }

    const result = await SingleRecordOperation("u", LandingSection, {
      _id: exist.data._id,
      ...updateData,
    });
    return res.status(result.status).json({ message: "Fresh styles section updated.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
