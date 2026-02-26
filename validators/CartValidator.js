import Joi from "joi";

export const AddToCartValidator = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "Product id is required.",
  }),
  quantity: Joi.number().integer().min(1).optional().default(1).messages({
    "number.min": "Quantity must be at least 1.",
  }),
});

export const UpdateCartItemValidator = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "Product id is required.",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "Quantity is required.",
    "number.min": "Quantity must be at least 1.",
  }),
});

export const RemoveFromCartValidator = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "Product id is required.",
  }),
});
