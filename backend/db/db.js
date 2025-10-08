import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "PaymentSystem_INSY7314",
    });
    console.log("✅ Connected to MongoDB (PaymentSystem)");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

export default connect;
