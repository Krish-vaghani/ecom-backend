import User from "../models/User.js";
import Product from "../models/Product.js";
import {
  AddToWishlistValidator,
  RemoveFromWishlistValidator,
} from "../validators/WishlistValidator.js";

const getUserId = (req) => req.user?.id || req.user?._id;

export const AddToWishlist = async (req, res) => {
  const { error } = AddToWishlistValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  const { productId } = req.body;

  try {
    const product = await Product.findOne({ _id: productId, is_active: true }).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found or inactive." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const alreadyIn = user.wishlist.some((id) => String(id) === String(productId));
    if (alreadyIn) {
      const list = await User.findById(userId)
        .select("wishlist")
        .populate("wishlist", "name slug image price salePrice is_active")
        .lean();
      return res.status(200).json({
        message: "Product already in wishlist.",
        data: list.wishlist.filter((p) => p && p.is_active),
      });
    }

    user.wishlist.push(productId);
    await user.save();

    const updated = await User.findById(userId)
      .select("wishlist")
      .populate("wishlist", "name slug image price salePrice is_active")
      .lean();

    return res.status(200).json({
      message: "Added to wishlist.",
      data: updated.wishlist.filter((p) => p && p.is_active),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const RemoveFromWishlist = async (req, res) => {
  const { error } = RemoveFromWishlistValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  const { productId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter((id) => String(id) !== String(productId));
    if (user.wishlist.length === initialLength) {
      return res.status(404).json({ message: "Product not in wishlist." });
    }
    await user.save();

    const updated = await User.findById(userId)
      .select("wishlist")
      .populate("wishlist", "name slug image price salePrice is_active")
      .lean();

    return res.status(200).json({
      message: "Removed from wishlist.",
      data: (updated.wishlist || []).filter((p) => p && p.is_active),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const ListWishlist = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  try {
    const user = await User.findById(userId)
      .select("wishlist")
      .populate("wishlist", "name slug image price salePrice is_active")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const validList = (user.wishlist || []).filter((p) => p && p.is_active);

    return res.status(200).json({
      message: "Wishlist fetched.",
      data: validList,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const CheckWishlist = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  const productId = req.params.productId;
  if (!productId) {
    return res.status(400).json({ message: "Product id is required." });
  }

  try {
    const user = await User.findById(userId).select("wishlist").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const inWishlist = (user.wishlist || []).some((id) => String(id) === String(productId));

    return res.status(200).json({
      message: "OK",
      data: { productId, inWishlist },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
