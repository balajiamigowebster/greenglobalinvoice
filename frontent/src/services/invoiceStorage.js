// Client-side storage manager for invoices
// Ensures all invoices created by the user persist permanently in the browser
// even if the backend is running in stateless serverless mode without a persistent database.

const STORAGE_KEY = "greenglobal_invoices";

// Default seed invoice (INV0002 - Ramesh)
export const DEFAULT_INVOICES = [
  {
    _id: "6acafd231ce92908f04a3ccb",
    invoiceNumber: "INV0002",
    customerName: "Ramesh",
    phone: "7603892417",
    invoiceDate: "2026-09-01T00:00:00.000Z",
    dueDate: "2026-09-01T00:00:00.000Z",
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
    createAt: "2026-10-11T02:49:07.542Z",
  },
];

// Helper to extract numeric part of invoice number (e.g. "INV0002" -> 2)
export const parseInvoiceNumber = (invNum) => {
  if (!invNum) return 0;
  const match = String(invNum).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

// Generate next invoice number based on current list
export const generateNextInvoiceNumber = (invoices) => {
  let max = 2; // Default baseline is INV0002
  const list = Array.isArray(invoices) && invoices.length > 0 ? invoices : DEFAULT_INVOICES;
  for (const inv of list) {
    const num = parseInvoiceNumber(inv.invoiceNumber);
    if (num > max) max = num;
  }
  const next = max + 1;
  return `INV${next.toString().padStart(4, "0")}`;
};

// Read invoices stored in localStorage
export const getStoredInvoices = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time loading: initialize with default invoices
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INVOICES));
      return [...DEFAULT_INVOICES];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [...DEFAULT_INVOICES];
  } catch (err) {
    console.error("Error reading localStorage invoices:", err);
    return [...DEFAULT_INVOICES];
  }
};

// Save invoice array to localStorage
export const setStoredInvoices = (invoices) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  } catch (err) {
    console.error("Error writing localStorage invoices:", err);
  }
};

// Merge server invoices with local invoices
// Preserves locally created/updated invoices even if server is stateless
export const syncWithServer = (serverInvoices) => {
  const localList = getStoredInvoices();
  if (!Array.isArray(serverInvoices) || serverInvoices.length === 0) {
    return localList;
  }

  // Create a map keyed by _id and invoiceNumber
  const mergedMap = new Map();

  // First add all server invoices
  for (const inv of serverInvoices) {
    if (inv._id) mergedMap.set(String(inv._id), inv);
    if (inv.invoiceNumber) mergedMap.set(String(inv.invoiceNumber), inv);
  }

  // Then add/overwrite with local invoices so local additions/updates are never lost
  for (const inv of localList) {
    const key = inv._id ? String(inv._id) : (inv.invoiceNumber ? String(inv.invoiceNumber) : null);
    if (key) {
      mergedMap.set(key, inv);
    }
  }

  // Convert map values to array (deduplicated by _id)
  const seenIds = new Set();
  const result = [];
  for (const inv of mergedMap.values()) {
    const id = inv._id || inv.invoiceNumber;
    if (id && !seenIds.has(id)) {
      seenIds.add(id);
      result.push(inv);
    }
  }

  // Sort by invoiceDate or createAt descending
  result.sort((a, b) => {
    const dateA = new Date(a.invoiceDate || a.createAt || 0).getTime();
    const dateB = new Date(b.invoiceDate || b.createAt || 0).getTime();
    return dateB - dateA;
  });

  setStoredInvoices(result);
  return result;
};

// Save a newly created invoice locally
export const saveInvoiceLocally = (invoiceData) => {
  const currentList = getStoredInvoices();
  const invoiceNumber = invoiceData.invoiceNumber || generateNextInvoiceNumber(currentList);
  const _id = invoiceData._id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newInvoice = {
    ...invoiceData,
    _id,
    invoiceNumber,
    createAt: invoiceData.createAt || new Date().toISOString(),
    totalAmount: Number(invoiceData.totalAmount || 0),
    paidAmount: Number(invoiceData.paidAmount || 0),
    balanceAmount: Number(invoiceData.balanceAmount || 0),
    shippingCharge: Number(invoiceData.shippingCharge || 0),
  };

  // Add to top of list
  const updatedList = [newInvoice, ...currentList.filter((inv) => String(inv._id) !== String(_id) && inv.invoiceNumber !== invoiceNumber)];
  setStoredInvoices(updatedList);
  return newInvoice;
};

// Update an existing invoice locally
export const updateInvoiceLocally = (id, updatedData) => {
  const currentList = getStoredInvoices();
  const index = currentList.findIndex(
    (inv) => String(inv._id) === String(id) || inv.invoiceNumber === String(id)
  );

  if (index !== -1) {
    const updated = {
      ...currentList[index],
      ...updatedData,
      totalAmount: Number(updatedData.totalAmount ?? currentList[index].totalAmount ?? 0),
      paidAmount: Number(updatedData.paidAmount ?? currentList[index].paidAmount ?? 0),
      balanceAmount: Number(updatedData.balanceAmount ?? currentList[index].balanceAmount ?? 0),
      shippingCharge: Number(updatedData.shippingCharge ?? currentList[index].shippingCharge ?? 0),
    };
    currentList[index] = updated;
    setStoredInvoices(currentList);
    return updated;
  } else {
    return saveInvoiceLocally({ ...updatedData, _id: id });
  }
};

// Delete an invoice locally
export const deleteInvoiceLocally = (id) => {
  const currentList = getStoredInvoices();
  const filtered = currentList.filter(
    (inv) => String(inv._id) !== String(id) && inv.invoiceNumber !== String(id)
  );
  setStoredInvoices(filtered);
  return filtered;
};

// Retrieve a single invoice by id or invoiceNumber
export const getInvoiceByIdLocally = (id) => {
  const currentList = getStoredInvoices();
  return (
    currentList.find(
      (inv) => String(inv._id) === String(id) || inv.invoiceNumber === String(id)
    ) || null
  );
};
