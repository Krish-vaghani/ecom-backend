const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_CHARGE_BELOW_THRESHOLD = 79;

/**
 * Get shipping charge by order subtotal.
 * Subtotal > 1000 → ₹0, else → ₹79.
 * @param {Array<{productId: string, quantity: number}>} _items - Cart items (unused; kept for API compatibility)
 * @param {string} _deliveryPincode - Delivery pincode (unused; kept for API compatibility)
 * @param {boolean} _isCod - COD flag (unused; kept for API compatibility)
 * @param {number} subtotal - Order subtotal in INR
 * @returns {Promise<number>} Shipping charge in INR
 */
export async function getShippingChargeForItems(_items, _deliveryPincode, _isCod = true, subtotal = 0) {
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE_BELOW_THRESHOLD;
}
