import mongoose from "mongoose";

// Cache the connection to avoid reconnecting on every request
let cachedConnection = null;

export const connectdb = async () => {
  try {
    // If already connected, return the cached connection
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log("✅ Using cached database connection");
      return cachedConnection;
    }

    // Disable mongoose buffering
    mongoose.set("bufferCommands", false);

    const conn = await mongoose.connect(process.env.MONGO_DB_URL, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5,  // Maintain a minimum of 5 socket connections
    });

    cachedConnection = conn;
    console.log(`✅ Database is connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ Error in connecting DB:", error.message);
    throw error;
  }
};
