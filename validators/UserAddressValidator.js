import Joi from "joi";

export const UserAddressValidator = Joi.object({
  address_type: Joi.string()
    .valid("Home", "Office", "Other")
    .required()
    .messages({ "any.required": "Address type is required (Home, Office, or Other)." }),
  full_name: Joi.string().min(1).max(200).required().messages({
    "any.required": "Full name is required",
  }),
  mobile_number: Joi.string().min(1).max(20).required().messages({
    "any.required": "Mobile number is required",
  }),
  email_address: Joi.string().email().required().messages({
    "any.required": "Email address is required",
  }),
  address_line_1: Joi.string().min(1).max(500).required().messages({
    "any.required": "Address line 1 is required",
  }),
  address_line_2: Joi.string().allow("", null).max(500).optional(),
  pincode: Joi.string().min(1).max(20).required().messages({
    "any.required": "Pincode is required",
  }),
  city: Joi.string().min(1).max(100).required().messages({
    "any.required": "City is required",
  }),
  state: Joi.string().min(1).max(100).required().messages({
    "any.required": "State is required",
  }),
  landmark: Joi.string().allow("", null).max(200).optional(),
  is_default: Joi.boolean().optional(),
});

export const UpdateUserAddressValidator = Joi.object({
  address_type: Joi.string().valid("Home", "Office", "Other").optional(),
  full_name: Joi.string().min(1).max(200).optional(),
  mobile_number: Joi.string().min(1).max(20).optional(),
  email_address: Joi.string().email().optional(),
  address_line_1: Joi.string().min(1).max(500).optional(),
  address_line_2: Joi.string().allow("", null).max(500).optional(),
  pincode: Joi.string().min(1).max(20).optional(),
  city: Joi.string().min(1).max(100).optional(),
  state: Joi.string().min(1).max(100).optional(),
  landmark: Joi.string().allow("", null).max(200).optional(),
  is_default: Joi.boolean().optional(),
}).min(1);
