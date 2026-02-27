import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_VALIDITY_MS = 9 * 24 * 60 * 60 * 1000; // 9 days (refresh before 10-day expiry)

let cachedToken = null;
let tokenFetchedAt = null;

const email = process.env.SHIPROCKET_EMAIL;
const password = process.env.SHIPROCKET_PASSWORD;
const pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE || "";
const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || "Default";

function isConfigured() {
  return !!(email && password && pickupPostcode);
}

/**
 * Get auth token. Uses cached token if still valid.
 * @returns {Promise<string|null>}
 */
export async function getToken() {
  if (!email || !password) {
    throw new Error("SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be set in .env");
  }
  if (cachedToken && tokenFetchedAt && Date.now() - tokenFetchedAt < TOKEN_VALIDITY_MS) {
    return cachedToken;
  }
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.token) {
    throw new Error(data.message || "Shiprocket auth failed");
  }
  cachedToken = data.token;
  tokenFetchedAt = Date.now();
  return cachedToken;
}

/**
 * Check courier serviceability and get shipping rates.
 * @param {Object} params
 * @param {string} params.deliveryPostcode - Delivery pincode
 * @param {number} params.weight - Weight in kg (min 0.5)
 * @param {number} params.cod - 1 for COD, 0 for prepaid
 * @param {string} [params.mode] - "Surface" or "Air"
 * @returns {Promise<{available: boolean, couriers: Array, minCharge?: number}>}
 */
export async function checkServiceability({ deliveryPostcode, weight = 0.5, cod = 1, mode = "Surface" }) {
  if (!isConfigured()) {
    return { available: false, couriers: [], message: "Shiprocket not configured" };
  }
  const token = await getToken();
  const params = new URLSearchParams({
    pickup_postcode: pickupPostcode,
    delivery_postcode: String(deliveryPostcode).trim(),
    weight: Math.max(0.5, Number(weight)),
    cod: cod ? 1 : 0,
    mode,
  });
  const res = await fetch(`${BASE_URL}/courier/serviceability/?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.status === 0 || !data.data?.available) {
    return {
      available: false,
      couriers: [],
      message: data.message || "Pincode not serviceable",
    };
  }
  const couriers = (data.data?.courier_availibility || []).map((c) => ({
    id: c.courier_id,
    name: c.courier_name,
    charge: c.charges,
    etd: c.etd,
  }));
  const minCharge = couriers.length ? Math.min(...couriers.map((c) => c.charge)) : null;
  return { available: true, couriers, minCharge };
}

/**
 * Create adhoc order in Shiprocket.
 * @param {Object} order - Order document with deliverTo, items, orderId, etc.
 * @param {number} weight - Package weight in kg
 * @param {number} length - Length in cm
 * @param {number} breadth - Breadth in cm
 * @param {number} height - Height in cm
 * @returns {Promise<{orderId: number, shipmentId: number}|null>}
 */
export async function createOrder(order, { weight = 0.5, length = 10, breadth = 10, height = 10 } = {}) {
  if (!isConfigured()) {
    throw new Error("Shiprocket not configured. Set SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD, SHIPROCKET_PICKUP_POSTCODE.");
  }
  const token = await getToken();
  const d = order.deliverTo;
  const nameParts = (d.fullName || "").trim().split(" ");
  const firstName = nameParts[0] || d.fullName || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "";

  const orderItems = (order.items || []).map((item) => ({
    name: String(item.productName || "Product").substring(0, 100),
    sku: String(item.product || item.productId || "SKU").replace(/[^a-zA-Z0-9-_]/g, "-").substring(0, 50),
    units: item.quantity || 1,
    selling_price: Math.round(item.pricePerItem || 0),
  }));

  const payload = {
    order_id: order.orderId,
    order_date: (order.placedAt || new Date()).toISOString().split("T")[0],
    pickup_location: pickupLocation,
    channel_id: "",
    comment: "Order from ecommerce backend",
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: d.addressLine1 || "",
    billing_address_2: d.addressLine2 || "",
    billing_city: d.city || "",
    billing_pincode: String(d.pincode || "").trim(),
    billing_state: d.state || "",
    billing_country: "India",
    billing_email: d.email || "",
    billing_phone: String(d.phone || "").replace(/\D/g, "").slice(-10) || "0000000000",
    shipping_is_billing: true,
    shipping_customer_name: firstName,
    shipping_last_name: lastName,
    shipping_address: d.addressLine1 || "",
    shipping_address_2: d.addressLine2 || "",
    shipping_city: d.city || "",
    shipping_pincode: String(d.pincode || "").trim(),
    shipping_state: d.state || "",
    shipping_country: "India",
    shipping_phone: String(d.phone || "").replace(/\D/g, "").slice(-10) || "0000000000",
    order_items: orderItems,
    payment_method: order.paymentMethod === "cash_on_delivery" ? "cod" : "prepaid",
    sub_total: order.subtotal || 0,
    length,
    breadth,
    height,
    weight: Math.max(0.5, weight),
  };

  const res = await fetch(`${BASE_URL}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) {
    throw new Error(data.message || data.errors?.[0]?.message || "Shiprocket order creation failed");
  }
  return {
    orderId: data.order_id,
    shipmentId: data.shipment_id,
  };
}

/**
 * Assign AWB to shipment.
 * @param {number} shipmentId - Shiprocket shipment ID
 * @param {number} [courierId] - Preferred courier ID (optional)
 * @returns {Promise<{awbCode: string, courierName: string}>}
 */
export async function assignAWB(shipmentId, courierId = null) {
  const token = await getToken();
  const payload = { shipment_id: [shipmentId] };
  if (courierId) payload.courier_id = courierId;

  const res = await fetch(`${BASE_URL}/courier/assign/awb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) {
    throw new Error(data.message || "AWB assignment failed");
  }
  const row = data.data?.awb_assign_status?.[0] || data.data?.[0];
  return {
    awbCode: row?.awb_code || row?.awb,
    courierName: row?.courier_name || row?.courier || "",
  };
}

/**
 * Generate pickup request for shipment.
 * @param {number[]} shipmentIds - Array of shipment IDs
 */
export async function generatePickup(shipmentIds) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/courier/generate/pickup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) {
    throw new Error(data.message || "Pickup generation failed");
  }
  return data;
}

/**
 * Generate shipping label PDF URL.
 * @param {number[]} shipmentIds - Array of shipment IDs
 * @returns {Promise<{labelUrl: string}>}
 */
export async function generateLabel(shipmentIds) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/courier/generate/label`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) {
    throw new Error(data.message || "Label generation failed");
  }
  const labelUrl = data.label_url || data.data?.label_url;
  return { labelUrl };
}

/**
 * Track shipment by AWB code.
 * @param {string} awbCode - AWB/tracking number
 * @returns {Promise<Object>}
 */
export async function trackAwb(awbCode) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/courier/track/awb/${encodeURIComponent(awbCode)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Tracking failed");
  }
  return data;
}

export { isConfigured };
