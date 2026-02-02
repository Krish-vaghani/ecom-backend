import Joi from "joi";

export const CategoryValidate = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    "any.required": "Category name is required",
  }),
  slug: Joi.string().min(1).max(100).required().messages({
    "any.required": "Slug is required",
  }),
  iconImage: Joi.string().allow(null, "").optional(),
  type: Joi.string().valid("product").optional(),
  is_active: Joi.boolean().optional(),
});

export const UpdateCategoryValidate = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  slug: Joi.string().min(1).max(100).optional(),
  iconImage: Joi.string().allow(null, "").optional(),
  type: Joi.string().valid("product").optional(),
  is_active: Joi.boolean().optional(),
}).min(1);
