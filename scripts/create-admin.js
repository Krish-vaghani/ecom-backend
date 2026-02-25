import dotenv from "dotenv";
import mongoose from "mongoose";
import { hashpassword } from "../helper/helper.js";
import Admin from "../models/Admin.js";

dotenv.config();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "Test@123";
  if (!email || !password) {
    console.error("Usage: node scripts/create-admin.js <email> <password>");
    console.error("Or set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.log("Admin with this email already exists.");
      process.exit(0);
    }
    const hashed = await hashpassword(password);
    await Admin.create({ email: email.toLowerCase().trim(), password: hashed });
    console.log("Admin created successfully:", email);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
