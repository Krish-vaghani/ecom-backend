import Joi from "joi";

const TextBlockSchema = Joi.object({
  title: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  ctaText: Joi.string().allow("").optional(),
  ctaLink: Joi.string().allow("").optional(),
});

export const LandingSectionValidate = Joi.object({
  sectionKey: Joi.string()
    .valid(
      "hero",
      "best_collections",
      "find_perfect_purse",
      "elevate_look",
      "fresh_styles",
      "testimonials",
      "crafted_confidence"
    )
    .required(),
  title: Joi.string().allow("").optional(),
  subtitle: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  order: Joi.number().optional(),
  is_active: Joi.boolean().optional(),
  mainHeadline: Joi.string().allow("").optional(),
  subHeadline: Joi.string().allow("").optional(),
  backgroundImage: Joi.string().allow(null, "").optional(),
  ctaButtonText: Joi.string().allow("").optional(),
  ctaButtonLink: Joi.string().allow("").optional(),
  featuredProductId: Joi.string().allow(null, "").optional(),
  image: Joi.string().allow(null, "").optional(),
  images: Joi.array().items(Joi.string()).optional(),
  mainImage: Joi.string().allow(null, "").optional(),
  textBlocks: Joi.array().items(TextBlockSchema).optional(),
  sectionCtaText: Joi.string().allow("").optional(),
  sectionCtaLink: Joi.string().allow("").optional(),
  price: Joi.number().allow(null).optional(),
  numberOfReviews: Joi.number().integer().min(0).optional(),
  rating: Joi.number().min(0).allow(null).optional(),
});

export const HeroSectionValidate = Joi.object({
  images: Joi.array().items(Joi.string()).optional(),
  price: Joi.number().allow(null).optional(),
  numberOfReviews: Joi.number().integer().min(0).optional(),
  rating: Joi.number().min(0).allow(null).optional(),
});

const ColorItemSchema = Joi.object({
  colorCode: Joi.string().allow("").optional(),
  images: Joi.string().allow(null).optional(),
});

export const BestCollectionsSectionValidate = Joi.object({
  order: Joi.number().optional(),
  is_active: Joi.boolean().optional(),
  images: Joi.array().items(Joi.string()).optional(),
  price: Joi.number().allow(null).optional(),
  originalPrice: Joi.number().allow(null).optional(),
  rating: Joi.number().min(0).allow(null).optional(),
  numberOfReviews: Joi.number().integer().min(0).optional(),
  tags: Joi.array()
    .items(Joi.string().valid("bestseller", "hot", "trending", "sale"))
    .optional(),
  colors: Joi.array().items(ColorItemSchema).optional(),
});

export const FreshStylesSectionValidate = Joi.object({
  order: Joi.number().optional(),
  is_active: Joi.boolean().optional(),
  images: Joi.array().items(Joi.string()).optional(),
  price: Joi.number().allow(null).optional(),
  originalPrice: Joi.number().allow(null).optional(),
  rating: Joi.number().min(0).allow(null).optional(),
  numberOfReviews: Joi.number().integer().min(0).optional(),
  tags: Joi.array()
    .items(Joi.string().valid("bestseller", "hot", "trending", "sale"))
    .optional(),
  colors: Joi.array().items(ColorItemSchema).optional(),
});

export const FindPerfectPurseSectionValidate = Joi.object({
  image: Joi.string().allow(null, "").optional(),
  order: Joi.number().optional(),
});

export const ElevateLookSectionValidate = Joi.object({
  image: Joi.string().allow(null, "").optional(),
  order: Joi.number().optional(),
});

export const UpdateLandingSectionValidate = Joi.object({
  title: Joi.string().allow("").optional(),
  subtitle: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  order: Joi.number().optional(),
  is_active: Joi.boolean().optional(),
  mainHeadline: Joi.string().allow("").optional(),
  subHeadline: Joi.string().allow("").optional(),
  backgroundImage: Joi.string().allow(null, "").optional(),
  ctaButtonText: Joi.string().allow("").optional(),
  ctaButtonLink: Joi.string().allow("").optional(),
  featuredProductId: Joi.string().allow(null, "").optional(),
  image: Joi.string().allow(null, "").optional(),
  images: Joi.array().items(Joi.string()).optional(),
  mainImage: Joi.string().allow(null, "").optional(),
  textBlocks: Joi.array().items(TextBlockSchema).optional(),
  sectionCtaText: Joi.string().allow("").optional(),
  sectionCtaLink: Joi.string().allow("").optional(),
  price: Joi.number().allow(null).optional(),
  numberOfReviews: Joi.number().integer().min(0).optional(),
  rating: Joi.number().min(0).allow(null).optional(),
}).min(1);
