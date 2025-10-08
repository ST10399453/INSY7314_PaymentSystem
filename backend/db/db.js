import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); 

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

export default connect; //export database connection