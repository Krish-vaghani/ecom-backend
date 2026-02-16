import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const mongo_url = process.env.MONGO_URI;

const connectDb = async () => {
  try {
    await mongoose.connect(mongo_url);
    console.log("MongoDB connected successfully");
    // Allow multiple users without email (phone-only registration)
    try {
      await User.collection.dropIndex("email_1");
      console.log("Dropped unique index on email (phone-only auth).");
    } catch (e) {
      if (e.code !== 27 && e.codeName !== "IndexNotFound") console.warn("Email index drop:", e.message);
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

export default connectDb;
