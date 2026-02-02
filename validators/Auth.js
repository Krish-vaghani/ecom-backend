import Joi from "joi";

export const AuthValidator = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email",
    "any.required": "Please enter an email address",
  }),
  password: Joi.string().required().messages({
    "any.required": "Please enter a password",
  }),
});
