const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);
    process.exit(1); // optional: stops app if DB fails
  }
};

module.exports = { connectDb };


