import Joi from "joi";

export const AddToWishlistValidator = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "Product id is required.",
  }),
});

export const RemoveFromWishlistValidator = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "Product id is required.",
  }),
});
