import { FindOne, SingleRecordOperation } from "../helper/commonquery.js";
import LandingSection from "../models/LandingSection.js";
import {
  UpdateLandingSectionValidate,
  HeroSectionValidate,
  BestCollectionsSectionValidate,
  FindPerfectPurseSectionValidate,
  ElevateLookSectionValidate,
  FreshStylesSectionValidate,
} from "../validators/LandingSectionValidator.js";


/** Returns all active landing sections in one response, keyed by sectionKey */
export const GetAllLandingPageData = async (req, res) => {
  try {
    const sections = await LandingSection.find({ is_active: true })
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

    const result = await SingleRecordOperation("u", LandingSection, { _id: id, ...req.body });
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

// Best collections section (single record: create / get / update – all schema fields)
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

    const payload = {
      sectionKey: BEST_COLLECTIONS_SECTION_KEY,
      order: req.body.order ?? 0,
      is_active: req.body.is_active ?? true,
      images: Array.isArray(req.body.images) ? req.body.images : [],
      price: req.body.price ?? null,
      originalPrice: req.body.originalPrice ?? null,
      rating: req.body.rating ?? null,
      numberOfReviews: req.body.numberOfReviews ?? 0,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      colors: Array.isArray(req.body.colors) ? req.body.colors : [],
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
    if (req.body.images !== undefined) updateData.images = req.body.images;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.originalPrice !== undefined) updateData.originalPrice = req.body.originalPrice;
    if (req.body.rating !== undefined) updateData.rating = req.body.rating;
    if (req.body.numberOfReviews !== undefined) updateData.numberOfReviews = req.body.numberOfReviews;
    if (req.body.tags !== undefined) updateData.tags = req.body.tags;
    if (req.body.colors !== undefined) updateData.colors = req.body.colors;

    const result = await SingleRecordOperation("u", LandingSection, {
      _id: exist.data._id,
      ...updateData,
    });
    return res.status(result.status).json({ message: "Best collections section updated.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// Find perfect purse section (single record: create / get / update – image and order only)
export const CreateFindPerfectPurseSection = async (req, res) => {
  const { error } = FindPerfectPurseSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existing = await FindOne(LandingSection, { sectionKey: FIND_PERFECT_PURSE_SECTION_KEY });
    if (existing.status === 200) {
      return res.status(409).json({ message: "Find perfect purse section already exists. Use update instead." });
    }

    const payload = {
      sectionKey: FIND_PERFECT_PURSE_SECTION_KEY,
      order: req.body.order ?? 0,
      is_active: true,
      images: req.body.image ? [req.body.image] : [],
    };
    const result = await SingleRecordOperation("i", LandingSection, payload);
    return res.status(result.status).json({ message: "Find perfect purse section created.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const UpdateFindPerfectPurseSection = async (req, res) => {
  const { error } = FindPerfectPurseSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const exist = await FindOne(LandingSection, { sectionKey: FIND_PERFECT_PURSE_SECTION_KEY });
    if (exist.status !== 200) {
      return res.status(404).json({ message: "Find perfect purse section not found." });
    }

    const updateData = {};
    if (req.body.image !== undefined) updateData.images = req.body.image ? [req.body.image] : [];
    if (req.body.order !== undefined) updateData.order = req.body.order;

    const result = await SingleRecordOperation("u", LandingSection, {
      _id: exist.data._id,
      ...updateData,
    });
    return res.status(result.status).json({ message: "Find perfect purse section updated.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// Elevate look section (single record: create / get / update – image and order only)
export const CreateElevateLookSection = async (req, res) => {
  const { error } = ElevateLookSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existing = await FindOne(LandingSection, { sectionKey: ELEVATE_LOOK_SECTION_KEY });
    if (existing.status === 200) {
      return res.status(409).json({ message: "Elevate look section already exists. Use update instead." });
    }

    const payload = {
      sectionKey: ELEVATE_LOOK_SECTION_KEY,
      order: req.body.order ?? 0,
      is_active: true,
      images: req.body.image ? [req.body.image] : [],
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
    if (req.body.image !== undefined) updateData.images = req.body.image ? [req.body.image] : [];
    if (req.body.order !== undefined) updateData.order = req.body.order;

    const result = await SingleRecordOperation("u", LandingSection, {
      _id: exist.data._id,
      ...updateData,
    });
    return res.status(result.status).json({ message: "Elevate look section updated.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// Fresh styles section (single record: create / get / update – all schema fields, same as best_collections)
export const CreateFreshStylesSection = async (req, res) => {
  const { error } = FreshStylesSectionValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existing = await FindOne(LandingSection, { sectionKey: FRESH_STYLES_SECTION_KEY });
    if (existing.status === 200) {
      return res.status(409).json({ message: "Fresh styles section already exists. Use update instead." });
    }

    const payload = {
      sectionKey: FRESH_STYLES_SECTION_KEY,
      order: req.body.order ?? 0,
      is_active: req.body.is_active ?? true,
      images: Array.isArray(req.body.images) ? req.body.images : [],
      price: req.body.price ?? null,
      originalPrice: req.body.originalPrice ?? null,
      rating: req.body.rating ?? null,
      numberOfReviews: req.body.numberOfReviews ?? 0,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      colors: Array.isArray(req.body.colors) ? req.body.colors : [],
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
    if (req.body.images !== undefined) updateData.images = req.body.images;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.originalPrice !== undefined) updateData.originalPrice = req.body.originalPrice;
    if (req.body.rating !== undefined) updateData.rating = req.body.rating;
    if (req.body.numberOfReviews !== undefined) updateData.numberOfReviews = req.body.numberOfReviews;
    if (req.body.tags !== undefined) updateData.tags = req.body.tags;
    if (req.body.colors !== undefined) updateData.colors = req.body.colors;

    const result = await SingleRecordOperation("u", LandingSection, {
      _id: exist.data._id,
      ...updateData,
    });
    return res.status(result.status).json({ message: "Fresh styles section updated.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
