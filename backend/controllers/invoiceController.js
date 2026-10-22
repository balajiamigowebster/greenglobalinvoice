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
  {
    _id: "6ace33fce22acf7e9aa21bd0",
    invoiceNumber: "INV0003",
    customerName: "Suresh Kumar",
    phone: "9845123456",
    invoiceDate: new Date("2026-10-13T00:00:00.000Z"),
    dueDate: new Date("2026-10-13T00:00:00.000Z"),
    address: "Indiranagar, Bangalore",
    products: [
      {
        title: "Garden Plants & Pathway Tiles",
        description: "Premium decorative tiles and outdoor shrubs",
        rate: 1200,
        quantity: 15,
        cgst: 9,
        sgst: 9,
        amount: 21240,
        image: null,
        _id: "6ace33fce22acf7e9aa21bd1",
      },
    ],
    shippingCharge: 1500,
    totalAmount: 22740,
    paidAmount: 10000,
    balanceAmount: 12740,
    createAt: new Date("2026-10-13T13:37:00.490Z"),
  },
];

const fs = require("fs");
const path = require("path");
const TMP_INVOICE_FILE = path.join("/tmp", "invoice_cache.json");

const loadCachedInvoices = () => {
  try {
    if (fs.existsSync(TMP_INVOICE_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_INVOICE_FILE, "utf-8"));
      if (Array.isArray(data) && data.length > 0) {
        return normalizeBackendInvoices(data);
      }
    }
  } catch (e) {}
  return memoryInvoices;
};

const saveCachedInvoices = (list) => {
  try {
    fs.writeFileSync(TMP_INVOICE_FILE, JSON.stringify(list), "utf-8");
  } catch (e) {}
};

// Initialize from cache if exists
memoryInvoices = loadCachedInvoices();

const isDbAvailable = () => mongoose.connection.readyState === 1;

const normalizeBackendInvoices = (list) => {
  if (!Array.isArray(list) || list.length === 0) return [];
  const seenIds = new Set();
  const deduped = [];
  for (const inv of list) {
    const id = inv._id ? String(inv._id) : (inv.invoiceNumber ? String(inv.invoiceNumber) : Math.random().toString());
    if (!seenIds.has(id)) {
      seenIds.add(id);
      deduped.push(inv);
    }
  }

  deduped.sort((a, b) => {
    const timeA = new Date(a.invoiceDate || a.createAt || 0).getTime();
    const timeB = new Date(b.invoiceDate || b.createAt || 0).getTime();
    return timeA - timeB;
  });

  const used = new Set();
  const result = [];
  for (const inv of deduped) {
    let num = 0;
    if (inv.invoiceNumber) {
      const m = String(inv.invoiceNumber).match(/\d+/);
      if (m) num = parseInt(m[0], 10);
    }
    if (!num || num < 2 || used.has(num)) {
      let cand = 2;
      while (used.has(cand)) cand++;
      num = cand;
    }
    used.add(num);
    result.push({
      ...inv,
      invoiceNumber: `INV${num.toString().padStart(4, "0")}`,
    });
  }

  result.sort((a, b) => {
    const numA = parseInt(String(a.invoiceNumber).replace(/\D/g, "") || "0", 10);
    const numB = parseInt(String(b.invoiceNumber).replace(/\D/g, "") || "0", 10);
    return numB - numA;
  });

  return result;
};

const computeNextInvoiceNumber = (list) => {
  let max = 3; // Baseline INV0003
  const items = Array.isArray(list) ? list : [];
  for (const item of items) {
    if (item.invoiceNumber) {
      const match = String(item.invoiceNumber).match(/\d+/);
      const val = match ? parseInt(match[0], 10) : 0;
      if (val > max) max = val;
    }
  }
  return `INV${(max + 1).toString().padStart(4, "0")}`;
};

exports.createInvoice = async (req, res) => {
  memoryInvoices = loadCachedInvoices();
  const nextInvoiceNumber = req.body.invoiceNumber || computeNextInvoiceNumber(memoryInvoices);

  try {
    if (isDbAvailable()) {
      const allDb = await Invoice.find({}, "invoiceNumber");
      const dbNextNumber = req.body.invoiceNumber || computeNextInvoiceNumber(allDb);

      const invoice = new Invoice({
        ...req.body,
        shippingCharge: Number(req.body.shippingCharge || 0),
        totalAmount: Number(req.body.totalAmount || 0),
        paidAmount: Number(req.body.paidAmount || 0),
        balanceAmount: Number(req.body.balanceAmount || 0),
        invoiceNumber: dbNextNumber,
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

      // Also keep memory cache in sync
      memoryInvoices.unshift(invoice.toObject());
      saveCachedInvoices(memoryInvoices);

      return res.status(201).json({
        msg: "Invoice save Successfull",
        invoice,
      });
    }
  } catch (error) {
    console.log("DB create failed, using memory fallback:", error.message);
  }

  // Memory fallback
  const newInv = {
    ...req.body,
    _id: req.body._id || new mongoose.Types.ObjectId().toString(),
    shippingCharge: Number(req.body.shippingCharge || 0),
    totalAmount: Number(req.body.totalAmount || 0),
    paidAmount: Number(req.body.paidAmount || 0),
    balanceAmount: Number(req.body.balanceAmount || 0),
    invoiceNumber: nextInvoiceNumber,
    createAt: req.body.createAt || new Date(),
  };

  memoryInvoices.unshift(newInv);
  saveCachedInvoices(memoryInvoices);

  res.status(201).json({
    msg: "Invoice save Successfull",
    invoice: newInv,
  });
};

exports.getAllInvoices = async (req, res) => {
  memoryInvoices = loadCachedInvoices();
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
  res.json(normalizeBackendInvoices(memoryInvoices));
};

exports.getInvoiceById = async (req, res) => {
  memoryInvoices = loadCachedInvoices();
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
  memoryInvoices = loadCachedInvoices();
  try {
    if (isDbAvailable()) {
      await Invoice.findByIdAndDelete(req.params.id);
      memoryInvoices = memoryInvoices.filter(
        (i) => String(i._id) !== req.params.id
      );
      saveCachedInvoices(memoryInvoices);
      return res.json({ msg: "Invoice Deleted Successfully" });
    }
  } catch (error) {
    console.log("DB delete failed, using memory fallback:", error.message);
  }

  memoryInvoices = memoryInvoices.filter(
    (i) => String(i._id) !== req.params.id
  );
  saveCachedInvoices(memoryInvoices);
  res.json({ msg: "Invoice Deleted Successfully" });
};

exports.editInvoice = async (req, res) => {
  memoryInvoices = loadCachedInvoices();
  try {
    if (isDbAvailable()) {
      const updated = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (updated) {
        const idx = memoryInvoices.findIndex((i) => String(i._id) === req.params.id);
        if (idx !== -1) {
          memoryInvoices[idx] = updated.toObject();
        }
        saveCachedInvoices(memoryInvoices);
        return res.json(updated);
      }
    }
  } catch (error) {
    console.log("DB edit failed, using memory fallback:", error.message);
  }

  const idx = memoryInvoices.findIndex((i) => String(i._id) === req.params.id);
  if (idx !== -1) {
    memoryInvoices[idx] = { ...memoryInvoices[idx], ...req.body };
    saveCachedInvoices(memoryInvoices);
    return res.json(memoryInvoices[idx]);
  }

  res.status(404).json({ message: "Invoice not found" });
};

exports.getTotalCustomers = async (req, res) => {
  memoryInvoices = loadCachedInvoices();
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
