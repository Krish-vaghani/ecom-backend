import Product from "../models/Product.js";
import { checkServiceability, isConfigured } from "../connection/shiprocket.js";

const DEFAULT_WEIGHT_PER_ITEM_KG = 0.2;

/**
 * Get shipping charge for cart items and delivery pincode.
 * Uses product dimensions to estimate weight if available.
 * @param {Array<{productId: string, quantity: number}>} items
 * @param {string} deliveryPincode
 * @param {boolean} isCod
 * @returns {Promise<number>}
 */
export async function getShippingChargeForItems(items, deliveryPincode, isCod = true) {
  if (!isConfigured()) return 0;
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = Object.fromEntries(products.map((p) => [String(p._id), p]));

  let totalWeight = 0;
  for (const item of items) {
    const product = productMap[item.productId];
    const qty = item.quantity || 1;
    if (product?.dimensions?.heightCm && product?.dimensions?.widthCm && product?.dimensions?.depthCm) {
      const volWeight =
        (product.dimensions.heightCm * product.dimensions.widthCm * product.dimensions.depthCm * qty) / 5000;
      totalWeight += Math.max(volWeight, 0.1 * qty);
    } else {
      totalWeight += DEFAULT_WEIGHT_PER_ITEM_KG * qty;
    }
  }
  totalWeight = Math.max(0.5, totalWeight);

  const result = await checkServiceability({
    deliveryPostcode: deliveryPincode,
    weight: totalWeight,
    cod: isCod ? 1 : 0,
  });
  return result.available && result.minCharge != null ? result.minCharge : 0;
}
