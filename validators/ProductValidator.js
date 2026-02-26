import Joi from "joi";

const ColorVariantSchema = Joi.object({
  colorName: Joi.string().allow("").optional(),
  colorCode: Joi.string().allow(null, "").optional(),
  images: Joi.array().items(Joi.string()).optional(),
});

export const ProductValidator = Joi.object({
  name: Joi.string().min(1).max(200).required().messages({
    "any.required": "Product name is required",
  }),
  slug: Joi.string().min(1).max(200).required().messages({
    "any.required": "Slug is required",
  }),
  description: Joi.string().allow("").optional(),
  price: Joi.number().min(0).required().messages({
    "any.required": "Price is required",
  }),
  salePrice: Joi.number().min(0).allow(null).optional(),
  category: Joi.string().valid("jwellery", "purse").required().messages({
    "any.required": "Category is required (jwellery or purse)",
  }),
  image: Joi.string().allow(null, "").optional(),
  tags: Joi.array()
    .items(Joi.string().valid("bestseller", "hot", "trending", "sale"))
    .optional(),
  colorVariants: Joi.array().items(ColorVariantSchema).optional(),
  shortDescription: Joi.string().allow("").optional(),
  dimensions: Joi.object({
    heightCm: Joi.number().min(0).allow(null).optional(),
    widthCm: Joi.number().min(0).allow(null).optional(),
    depthCm: Joi.number().min(0).allow(null).optional(),
  }).optional(),
  averageRating: Joi.number().min(0).max(5).optional(),
  numberOfReviews: Joi.number().min(0).optional(),
  isFeatured: Joi.boolean().optional(),
  is_active: Joi.boolean().optional(),
});

export const UpdateProductValidator = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  slug: Joi.string().min(1).max(200).optional(),
  description: Joi.string().allow("").optional(),
  price: Joi.number().min(0).optional(),
  salePrice: Joi.number().min(0).allow(null).optional(),
  category: Joi.string().valid("jwellery", "purse").optional(),
  image: Joi.string().allow(null, "").optional(),
  tags: Joi.array()
    .items(Joi.string().valid("bestseller", "hot", "trending", "sale"))
    .optional(),
  colorVariants: Joi.array().items(ColorVariantSchema).optional(),
  shortDescription: Joi.string().allow("").optional(),
  dimensions: Joi.object({
    heightCm: Joi.number().min(0).allow(null).optional(),
    widthCm: Joi.number().min(0).allow(null).optional(),
    depthCm: Joi.number().min(0).allow(null).optional(),
  }).optional(),
  averageRating: Joi.number().min(0).max(5).optional(),
  numberOfReviews: Joi.number().min(0).optional(),
  isFeatured: Joi.boolean().optional(),
  is_active: Joi.boolean().optional(),
}).min(1);
