const mongoose = require("mongoose");
require("dotenv").config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");

    // Optional: check a dummy collection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("📂 Collections:", collections.map(c => c.name));

    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

testConnection();
