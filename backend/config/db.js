const mongoose = require("mongoose");

const connectDB = async (retries = 5) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10, // max connections
      serverSelectionTimeoutMS: 5000, // timeout after 5s
      socketTimeoutMS: 45000, // close sockets after 45s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // ================= EVENTS =================
    mongoose.connection.on("connected", () => {
      console.log("🟢 Mongoose connected");
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("🟡 Mongoose disconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("🔴 Mongoose error:", err);
    });

  } catch (error) {
    console.error(`❌ DB Connection Failed (${retries} retries left):`, error.message);

    if (retries > 0) {
      setTimeout(() => connectDB(retries - 1), 5000); // retry after 5 sec
    } else {
      console.error("❌ Could not connect to MongoDB. Exiting...");
      process.exit(1);
    }
  }
};

module.exports = connectDB;