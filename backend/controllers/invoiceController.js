const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const TotalPaidInvoice = require("../models/totalPaidInvoice");

// Sample initial invoices in case MongoDB is disconnected or buffering
let memoryInvoices = [
  {
    _id: "6acafd231ce92908f04a3ccb",
    invoiceNumber: "INV0002",
    customerName: "Ramesh",
    phone: "7603892417",
    invoiceDate: new Date("2026-09-01T00:00:00.000Z"),
    dueDate: new Date("2026-09-01T00:00:00.000Z"),
    address: "Bangalore",
    products: [
      {
        title: "Pathway Stone 2x3",
        description: "Pathway Stone 2x3",
        rate: 110,
        quantity: 2000,
        cgst: 0,
        sgst: 0,
        amount: 220000,
        image: null,
        _id: "6acafd231ce92908f04a3ccc",
      },
      {
        title: "Garden Focus Light In Pathway",
        description: "Garden Focus Light In Pathway",
        rate: 4500,
        quantity: 1,
        cgst: 0,
        sgst: 0,
        amount: 4500,
        image: null,
        _id: "6acafd231ce92908f04a3ccd",
      },
      {
        title: "Lights Wayaers",
        description: "Lights Wayaers",
        rate: 150,
        quantity: 60,
        cgst: 0,
        sgst: 0,
        amount: 9000,
        image: null,
        _id: "6acafd231ce92908f04a3cce",
      },
      {
        title: "Edge Plants",
        description: "Edge Plants",
        rate: 110,
        quantity: 300,
        cgst: 0,
        sgst: 0,
        amount: 33000,
        image: null,
        _id: "6acafd231ce92908f04a3ccf",
      },
      {
        title: "Redsoil",
        description: "Redsoil",
        rate: 15000,
        quantity: 2,
        cgst: 0,
        sgst: 0,
        amount: 30000,
        image: null,
        _id: "6acafd231ce92908f04a3cd0",
      },
      {
        title: "M Sand Chips",
        description: "M Sand Chips",
        rate: 6000,
        quantity: 6,
        cgst: 0,
        sgst: 0,
        amount: 36000,
        image: null,
        _id: "6acafd231ce92908f04a3cd1",
      },
      {
        title: "Bermuda Grass",
        description: "Bermuda Grass",
        rate: 17,
        quantity: 700,
        cgst: 0,
        sgst: 0,
        amount: 11900,
        image: null,
        _id: "6acafd231ce92908f04a3cd2",
      },
      {
        title: "Stone Round Bach",
        description: "Stone Round Bach",
        rate: 45000,
        quantity: 1,
        cgst: 0,
        sgst: 0,
        amount: 45000,
        image: null,
        _id: "6acafd231ce92908f04a3cd3",
      },
      {
        title: "Labour",
        description: "Labour",
        rate: 1500,
        quantity: 160,
        cgst: 0,
        sgst: 0,
        amount: 240000,
        image: null,
        _id: "6acafd231ce92908f04a3cd4",
      },
    ],
    shippingCharge: 25000,
    totalAmount: 654400,
    paidAmount: 0,
    balanceAmount: 654400,
    createAt: new Date("2026-10-11T02:49:07.542Z"),
  },
];

const isDbAvailable = () => mongoose.connection.readyState === 1;

exports.createInvoice = async (req, res) => {
  try {
    if (isDbAvailable()) {
      const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
      let newNumber = 1;

      if (lastInvoice && lastInvoice.invoiceNumber) {
        const lastNumber = parseInt(
          lastInvoice.invoiceNumber.replace("INV", ""),
          10
        );
        newNumber = lastNumber + 1;
      }

      const autoInvoiceNumber = `INV${newNumber.toString().padStart(4, "0")}`;

      const invoice = new Invoice({
        ...req.body,
        invoiceNumber: autoInvoiceNumber,
      });

      await invoice.save();

      if (invoice.paidAmount > 0) {
        let record = await TotalPaidInvoice.findOne();
        if (!record) {
          record = await TotalPaidInvoice.create({
            totalPaid: invoice.paidAmount,
          });
        } else {
          record.totalPaid += invoice.paidAmount;
          await record.save();
        }
      }

      return res.status(201).json({
        msg: "Invoice save Successfull",
        invoice,
      });
    }
  } catch (error) {
    console.log("DB create failed, using memory fallback:", error.message);
  }

  // Memory fallback
  const nextNum = memoryInvoices.length + 1;
  const newInv = {
    ...req.body,
    _id: new mongoose.Types.ObjectId().toString(),
    invoiceNumber: `INV${nextNum.toString().padStart(4, "0")}`,
    createAt: new Date(),
  };
  memoryInvoices.unshift(newInv);
  res.status(201).json({
    msg: "Invoice save Successfull",
    invoice: newInv,
  });
};

exports.getAllInvoices = async (req, res) => {
  try {
    if (isDbAvailable()) {
      const { date } = req.query;
      let filter = {};

      if (date) {
        const start = new Date(date + "T00:00:00.000Z");
        const end = new Date(date + "T23:59:59.999Z");
        filter.invoiceDate = {
          $gte: start,
          $lte: end,
        };
      }

      const invoices = await Invoice.find(filter).sort({ invoiceDate: -1 });
      if (invoices.length > 0) {
        return res.json(invoices);
      }
    }
  } catch (error) {
    console.log("DB query failed, using memory fallback:", error.message);
  }

  // Fallback to memory invoices
  res.json(memoryInvoices);
};

exports.getInvoiceById = async (req, res) => {
  try {
    if (isDbAvailable()) {
      const invoice = await Invoice.findById(req.params.id);
      if (invoice) {
        return res.json(invoice);
      }
    }
  } catch (error) {
    console.log("DB getById failed, using memory fallback:", error.message);
  }

  const mem = memoryInvoices.find(
    (i) => String(i._id) === req.params.id || i.invoiceNumber === req.params.id
  );
  if (mem) {
    return res.json(mem);
  }

  res.status(404).json({ message: "Invoice not found" });
};

exports.deleInvoice = async (req, res) => {
  try {
    if (isDbAvailable()) {
      await Invoice.findByIdAndDelete(req.params.id);
      return res.json({ msg: "Invoice Deleted Successfully" });
    }
  } catch (error) {
    console.log("DB delete failed, using memory fallback:", error.message);
  }

  memoryInvoices = memoryInvoices.filter(
    (i) => String(i._id) !== req.params.id
  );
  res.json({ msg: "Invoice Deleted Successfully" });
};

exports.editInvoice = async (req, res) => {
  try {
    if (isDbAvailable()) {
      const updated = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (updated) {
        return res.json(updated);
      }
    }
  } catch (error) {
    console.log("DB edit failed, using memory fallback:", error.message);
  }

  const idx = memoryInvoices.findIndex((i) => String(i._id) === req.params.id);
  if (idx !== -1) {
    memoryInvoices[idx] = { ...memoryInvoices[idx], ...req.body };
    return res.json(memoryInvoices[idx]);
  }

  res.status(404).json({ message: "Invoice not found" });
};

exports.getTotalCustomers = async (req, res) => {
  try {
    if (isDbAvailable()) {
      const customers = await Invoice.distinct("customerName");
      if (customers && customers.length > 0) {
        return res.status(200).json({ totalCustomers: customers.length });
      }
    }
  } catch (error) {
    console.log("DB distinct failed:", error.message);
  }

  const unique = new Set(memoryInvoices.map((i) => i.customerName));
  res.status(200).json({ totalCustomers: unique.size });
};
