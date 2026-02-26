import User from "../models/User.js";
import Product from "../models/Product.js";
import {
  AddToCartValidator,
  UpdateCartItemValidator,
  RemoveFromCartValidator,
} from "../validators/CartValidator.js";

const getUserId = (req) => req.user?.id || req.user?._id;

export const AddToCart = async (req, res) => {
  const { error } = AddToCartValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  const { productId, quantity = 1 } = req.body;

  try {
    const product = await Product.findOne({ _id: productId, is_active: true }).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found or inactive." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingIndex = user.cartItems.findIndex(
      (item) => String(item.product) === String(productId)
    );

    if (existingIndex >= 0) {
      user.cartItems[existingIndex].quantity += quantity;
    } else {
      user.cartItems.push({ product: productId, quantity });
    }
    await user.save();

    const updated = await User.findById(userId)
      .select("cartItems")
      .populate("cartItems.product", "name slug image price salePrice is_active")
      .lean();

    return res.status(200).json({
      message: "Added to cart.",
      data: updated.cartItems,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const UpdateCartItem = async (req, res) => {
  const { error } = UpdateCartItemValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  const { productId, quantity } = req.body;

  try {
    const product = await Product.findOne({ _id: productId, is_active: true }).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found or inactive." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingIndex = user.cartItems.findIndex(
      (item) => String(item.product) === String(productId)
    );
    if (existingIndex < 0) {
      return res.status(404).json({ message: "Product not in cart." });
    }

    user.cartItems[existingIndex].quantity = quantity;
    await user.save();

    const updated = await User.findById(userId)
      .select("cartItems")
      .populate("cartItems.product", "name slug image price salePrice is_active")
      .lean();

    return res.status(200).json({
      message: "Cart updated.",
      data: updated.cartItems,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const RemoveFromCart = async (req, res) => {
  const { error } = RemoveFromCartValidator.validate(req.body);
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

    const initialLength = user.cartItems.length;
    user.cartItems = user.cartItems.filter((item) => String(item.product) !== String(productId));
    if (user.cartItems.length === initialLength) {
      return res.status(404).json({ message: "Product not in cart." });
    }
    await user.save();

    const updated = await User.findById(userId)
      .select("cartItems")
      .populate("cartItems.product", "name slug image price salePrice is_active")
      .lean();

    return res.status(200).json({
      message: "Removed from cart.",
      data: updated.cartItems,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const GetCart = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  try {
    const user = await User.findById(userId)
      .select("cartItems")
      .populate("cartItems.product", "name slug image price salePrice is_active")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Filter out products that were deleted or deactivated
    const validItems = (user.cartItems || []).filter(
      (item) => item.product && item.product.is_active
    );

    return res.status(200).json({
      message: "Cart fetched.",
      data: validItems,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
