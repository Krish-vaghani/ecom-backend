import { FindOne, SingleRecordOperation } from "../helper/commonquery.js";
import UserAddress from "../models/UserAddress.js";
import {
  UserAddressValidator,
  UpdateUserAddressValidator,
} from "../validators/UserAddressValidator.js";

const getUserId = (req) => req.user?.id || req.user?._id;

export const AddAddress = async (req, res) => {
  const { error } = UserAddressValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  try {
    const body = { ...req.body, user: userId };
    if (body.is_default === true) {
      await UserAddress.updateMany({ user: userId }, { $set: { is_default: false } });
    }
    const result = await SingleRecordOperation("i", UserAddress, body);
    return res.status(result.status).json({ message: "Address added.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const ListAddresses = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { user: userId };
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      UserAddress.find(filter).sort({ is_default: -1, createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      UserAddress.countDocuments(filter),
    ]);
    return res.status(200).json({
      message: "Addresses fetched.",
      data: items,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const GetAddress = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  const { id } = req.params;
  try {
    const address = await UserAddress.findOne({ _id: id, user: userId }).lean();
    if (!address) {
      return res.status(404).json({ message: "Address not found." });
    }
    return res.status(200).json({ message: "Address fetched.", data: address });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const UpdateAddress = async (req, res) => {
  const { error } = UpdateUserAddressValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  const { id } = req.params;
  try {
    const exist = await UserAddress.findOne({ _id: id, user: userId });
    if (!exist) {
      return res.status(404).json({ message: "Address not found." });
    }
    if (req.body.is_default === true) {
      await UserAddress.updateMany({ user: userId, _id: { $ne: id } }, { $set: { is_default: false } });
    }
    const result = await SingleRecordOperation("u", UserAddress, { _id: id, ...req.body });
    return res.status(result.status).json({ message: "Address updated.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const DeleteAddress = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  const { id } = req.params;
  try {
    const deleted = await UserAddress.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) {
      return res.status(404).json({ message: "Address not found." });
    }
    return res.status(200).json({ message: "Address deleted." });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
