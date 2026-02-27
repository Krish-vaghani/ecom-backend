import Order from "../models/Order.js";
import Product from "../models/Product.js";
import {
  checkServiceability,
  createOrder,
  assignAWB,
  generateLabel,
  generatePickup,
  trackAwb,
  isConfigured,
} from "../connection/shiprocket.js";

const DEFAULT_WEIGHT_PER_ITEM_KG = 0.2;

/**
 * Check shipping serviceability and get rates for a pincode.
 * GET /v1/shipping/check?pincode=110001&weight=0.5&cod=1
 */
export const CheckServiceability = async (req, res) => {
  try {
    const { pincode, weight = 0.5, cod = 1 } = req.query;
    if (!pincode || !String(pincode).trim()) {
      return res.status(400).json({ message: "pincode is required" });
    }
    const result = await checkServiceability({
      deliveryPostcode: String(pincode).trim(),
      weight: Math.max(0.5, Number(weight)),
      cod: cod === "0" || cod === 0 ? 0 : 1,
    });
    return res.status(200).json({
      message: result.available ? "Serviceability checked." : result.message || "Pincode not serviceable",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * Get shipping charge for cart items and delivery pincode.
 * Uses product dimensions to estimate weight if available.
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
      const volWeight = (product.dimensions.heightCm * product.dimensions.widthCm * product.dimensions.depthCm * qty) / 5000;
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

/**
 * Create Shiprocket order and assign AWB when admin marks order as shipped.
 * POST /admin/order/:id/create-shipment
 */
export const CreateShipment = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isConfigured()) {
      return res.status(503).json({
        message: "Shiprocket not configured. Set SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD, SHIPROCKET_PICKUP_POSTCODE in .env",
      });
    }

    const order = await Order.findById(id).populate("items.product", "dimensions");
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    if (order.shiprocketShipmentId) {
      return res.status(400).json({
        message: "Shipment already created for this order.",
        data: { awbCode: order.awbCode, trackingUrl: order.trackingUrl },
      });
    }

    let totalWeight = 0;
    let maxL = 10,
      maxW = 10,
      maxH = 10;
    for (const item of order.items || []) {
      const dim = item.product?.dimensions;
      const qty = item.quantity || 1;
      if (dim?.heightCm && dim?.widthCm && dim?.depthCm) {
        totalWeight += ((dim.heightCm * dim.widthCm * dim.depthCm) / 5000) * qty;
        maxL = Math.max(maxL, dim.heightCm || 10);
        maxW = Math.max(maxW, dim.widthCm || 10);
        maxH = Math.max(maxH, dim.depthCm || 10);
      } else {
        totalWeight += DEFAULT_WEIGHT_PER_ITEM_KG * qty;
      }
    }
    totalWeight = Math.max(0.5, totalWeight);

    const { orderId: srOrderId, shipmentId } = await createOrder(order, {
      weight: totalWeight,
      length: maxL,
      breadth: maxW,
      height: maxH,
    });

    const { awbCode, courierName } = await assignAWB(shipmentId);
    const trackingUrl = awbCode ? `https://track.shiprocket.in/?awb=${awbCode}` : null;

    await Order.findByIdAndUpdate(id, {
      $set: {
        shiprocketOrderId: srOrderId,
        shiprocketShipmentId: shipmentId,
        awbCode,
        trackingUrl,
        status: "shipped",
        shippedAt: new Date(),
      },
    });

    const updated = await Order.findById(id)
      .populate("user", "name phone")
      .populate("items.product", "name image slug")
      .lean();

    return res.status(200).json({
      message: "Shipment created successfully.",
      data: {
        order: updated,
        awbCode,
        courierName,
        trackingUrl,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Shiprocket error.", error: err.message });
  }
};

/**
 * Generate shipping label PDF for an order.
 * POST /admin/order/:id/generate-label
 */
export const GenerateLabel = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (!order.shiprocketShipmentId) {
      return res.status(400).json({ message: "Create shipment first before generating label." });
    }
    const { labelUrl } = await generateLabel([order.shiprocketShipmentId]);
    return res.status(200).json({ message: "Label generated.", data: { labelUrl } });
  } catch (err) {
    return res.status(500).json({ message: "Label generation failed.", error: err.message });
  }
};

/**
 * Request pickup for an order.
 * POST /admin/order/:id/request-pickup
 */
export const RequestPickup = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (!order.shiprocketShipmentId) {
      return res.status(400).json({ message: "Create shipment first before requesting pickup." });
    }
    await generatePickup([order.shiprocketShipmentId]);
    return res.status(200).json({ message: "Pickup requested successfully." });
  } catch (err) {
    return res.status(500).json({ message: "Pickup request failed.", error: err.message });
  }
};

/**
 * Track shipment by AWB or order ID.
 * GET /v1/shipping/track/:awbOrOrderId
 */
export const TrackShipment = async (req, res) => {
  const { awbOrOrderId } = req.params;
  try {
    const order = await Order.findOne({
      $or: [{ orderId: awbOrOrderId }, { awbCode: awbOrOrderId }],
    }).lean();
    if (!order) {
      return res.status(404).json({ message: "Order or AWB not found." });
    }
    if (!order.awbCode) {
      return res.status(400).json({
        message: "Shipment not yet created. Tracking will be available after shipping.",
        data: { orderId: order.orderId },
      });
    }
    const tracking = await trackAwb(order.awbCode);
    return res.status(200).json({
      message: "Tracking details.",
      data: { orderId: order.orderId, awbCode: order.awbCode, tracking },
    });
  } catch (err) {
    return res.status(500).json({ message: "Tracking failed.", error: err.message });
  }
};
