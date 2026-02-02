import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const mongo_url = process.env.MONGO_URI;

const connectDb = async () => {
  try {
    await mongoose.connect(mongo_url);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

export default connectDb;
