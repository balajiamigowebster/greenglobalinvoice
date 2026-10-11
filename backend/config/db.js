const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/invoice_app";
  try {
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState === 1;
    console.log("DB Connected successfully");
  } catch (error) {
    console.log("DB connection error:", error.message);
  }
};

module.exports = connectDB;
