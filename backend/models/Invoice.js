const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  rate: Number,
  quantity: Number,
  cgst: Number,
  sgst: Number,
  amount: Number,
  image: String,
});

const invoiceSchema = new mongoose.Schema({
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  phone: String,
  invoiceDate: Date,

  address: String,
  products: [productSchema],
  shippingCharge: {
    type: Number,
    default: 0,
  },
  totalAmount: Number,
  paidAmount: Number,
  balanceAmount: Number,
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
