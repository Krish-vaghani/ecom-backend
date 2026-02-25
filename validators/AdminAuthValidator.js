import Joi from "joi";

export const AdminLoginValidator = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Please enter a valid email",
  }),
  password: Joi.string().min(1).required().messages({
    "any.required": "Password is required",
  }),
});
