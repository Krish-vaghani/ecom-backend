import Joi from "joi";

// Registration: name + phone only (no email in API)
export const AuthRegisterValidator = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    "any.required": "Please enter your name",
  }),
  phone: Joi.string().min(5).max(20).required().messages({
    "any.required": "Please enter a phone number",
  }),
});

// Step 1 login: request OTP using phone
export const AuthLoginRequestValidator = Joi.object({
  phone: Joi.string().min(5).max(20).required().messages({
    "any.required": "Please enter a phone number",
  }),
});

// Step 2 login: verify OTP
export const AuthLoginVerifyValidator = Joi.object({
  phone: Joi.string().min(5).max(20).required().messages({
    "any.required": "Please enter a phone number",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be 6 digits",
    "any.required": "Please enter the OTP",
  }),
});
