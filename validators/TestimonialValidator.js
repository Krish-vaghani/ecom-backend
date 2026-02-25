import Joi from "joi";

export const TestimonialValidator = Joi.object({
  message: Joi.string().min(1).max(1000).required().messages({
    "any.required": "Message is required",
  }),
  review: Joi.number().min(1).max(5).required().messages({
    "any.required": "Review rating (1-5) is required",
  }),
  user_image: Joi.string().allow(null, "").optional(),
  user_name: Joi.string().min(1).max(200).required().messages({
    "any.required": "User name is required",
  }),
  user_address: Joi.string().allow("", null).optional(),
  is_active: Joi.boolean().optional(),
});

export const UpdateTestimonialValidator = Joi.object({
  message: Joi.string().min(1).max(1000).optional(),
  review: Joi.number().min(1).max(5).optional(),
  user_image: Joi.string().allow(null, "").optional(),
  user_name: Joi.string().min(1).max(200).optional(),
  user_address: Joi.string().allow("", null).optional(),
  is_active: Joi.boolean().optional(),
}).min(1);

