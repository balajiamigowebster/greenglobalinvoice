const mongoose = require("mongoose");

// Disable buffering so queries don't hang when DB is offline
mongoose.set("bufferCommands", false);

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/invoice_app";
  try {
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("DB Connected successfully");
  } catch (error) {
    console.log("DB connection note:", error.message);
  }
};

module.exports = connectDB;
