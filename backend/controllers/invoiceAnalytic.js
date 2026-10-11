const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");

const isDbAvailable = () => mongoose.connection.readyState === 1;

// Fallback values matching default invoices
const FALLBACK_TOTAL_AMOUNT = 654400;
const FALLBACK_TOTAL_PAID = 0;
const FALLBACK_TOTAL_BALANCE = 654400;

exports.getTotalAmount = async (req, res) => {
  try {
    if (isDbAvailable()) {
      const totalAmount = await Invoice.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalAmount",
            },
          },
        },
      ]);

      return res.json({
        totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      });
    }
  } catch (error) {
    console.log("DB aggregate getTotalAmount error:", error.message);
  }

  res.json({ totalAmount: FALLBACK_TOTAL_AMOUNT });
};

exports.totalPaidAmount = async (req, res) => {
  try {
    if (isDbAvailable()) {
      const result = await Invoice.aggregate([
        {
          $match: {
            paidAmount: {
              $gt: 0,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalPaid: {
              $sum: "$paidAmount",
            },
          },
        },
      ]);

      const totalPaid = result.length > 0 ? result[0].totalPaid : 0;
      return res.json({ totalPaid });
    }
  } catch (error) {
    console.log("DB aggregate totalPaidAmount error:", error.message);
  }

  res.json({ totalPaid: FALLBACK_TOTAL_PAID });
};

exports.getTotalBalanceAmount = async (req, res) => {
  try {
    if (isDbAvailable()) {
      const totalBalanceAmount = await Invoice.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$balanceAmount",
            },
          },
        },
      ]);

      return res.json({
        totalBalanceAmount: totalBalanceAmount[0]?.total || 0,
      });
    }
  } catch (error) {
    console.log("DB aggregate getTotalBalanceAmount error:", error.message);
  }

  res.json({ totalBalanceAmount: FALLBACK_TOTAL_BALANCE });
};
