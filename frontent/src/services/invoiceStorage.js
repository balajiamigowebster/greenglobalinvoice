// Client-side storage manager for invoices
// Ensures all invoices created by the user persist permanently in the browser
// and strictly guarantees UNIQUE, sequential invoice numbers across all sessions.

const STORAGE_KEY = "greenglobal_invoices";

// Default seed invoices
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
  {
    _id: "6ace33fce22acf7e9aa21bd0",
    invoiceNumber: "INV0003",
    customerName: "Suresh Kumar",
    phone: "9845123456",
    invoiceDate: "2026-10-13T00:00:00.000Z",
    dueDate: "2026-10-13T00:00:00.000Z",
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
    createAt: "2026-10-13T13:37:00.490Z",
  },
];

// Helper to extract numeric part of invoice number (e.g. "INV0002" -> 2)
export const parseInvoiceNumber = (invNum) => {
  if (!invNum) return 0;
  const match = String(invNum).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

// Automatic sanitizer: guarantees every invoice has a UNIQUE sequential number
// and rounds monetary amounts to 2 decimal places to avoid floating point issues
export const normalizeInvoiceList = (invoices) => {
  if (!Array.isArray(invoices) || invoices.length === 0) {
    return [...DEFAULT_INVOICES];
  }

  // Deduplicate entries by _id
  const seenIds = new Set();
  const deduped = [];
  for (const inv of invoices) {
    const id = inv._id ? String(inv._id) : (inv.invoiceNumber ? String(inv.invoiceNumber) : Math.random().toString());
    if (!seenIds.has(id)) {
      seenIds.add(id);
      deduped.push(inv);
    }
  }

  // Sort ascending by date to preserve sequence and assign numbers chronologically
  deduped.sort((a, b) => {
    const timeA = new Date(a.invoiceDate || a.createAt || 0).getTime();
    const timeB = new Date(b.invoiceDate || b.createAt || 0).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return parseInvoiceNumber(a.invoiceNumber) - parseInvoiceNumber(b.invoiceNumber);
  });

  const usedNumbers = new Set();
  const result = [];

  for (const inv of deduped) {
    let num = parseInvoiceNumber(inv.invoiceNumber);

    // If number is missing, < 2, or already used by another invoice, allocate next available number
    if (!num || num < 2 || usedNumbers.has(num)) {
      let candidate = 2;
      while (usedNumbers.has(candidate)) {
        candidate++;
      }
      num = candidate;
    }

    usedNumbers.add(num);

    const tot = Math.round(Number(inv.totalAmount || 0) * 100) / 100;
    const paid = Math.round(Number(inv.paidAmount || 0) * 100) / 100;
    const bal = Math.round(Number(inv.balanceAmount ?? (tot - paid)) * 100) / 100;
    const ship = Math.round(Number(inv.shippingCharge || 0) * 100) / 100;

    result.push({
      ...inv,
      invoiceNumber: `INV${num.toString().padStart(4, "0")}`,
      totalAmount: tot,
      paidAmount: paid,
      balanceAmount: bal,
      shippingCharge: ship,
    });
  }

  // Sort descending by numeric invoice number (newest at top)
  result.sort((a, b) => parseInvoiceNumber(b.invoiceNumber) - parseInvoiceNumber(a.invoiceNumber));
  return result;
};

// Generate next unique invoice number based on current list
export const generateNextInvoiceNumber = (invoices) => {
  const list = normalizeInvoiceList(invoices || getStoredInvoices());
  let max = 3; // Default baseline is INV0003
  for (const inv of list) {
    const num = parseInvoiceNumber(inv.invoiceNumber);
    if (num > max) max = num;
  }
  const next = max + 1;
  return `INV${next.toString().padStart(4, "0")}`;
};

// Read invoices stored in localStorage (automatically self-healing)
export const getStoredInvoices = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INVOICES));
      return [...DEFAULT_INVOICES];
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_INVOICES;
    const normalized = normalizeInvoiceList(list);

    // If normalization fixed duplicates or numbers, persist back
    if (JSON.stringify(normalized) !== raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch (err) {
    console.error("Error reading localStorage invoices:", err);
    return [...DEFAULT_INVOICES];
  }
};

// Save invoice array to localStorage
export const setStoredInvoices = (invoices) => {
  try {
    const normalized = normalizeInvoiceList(invoices);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (err) {
    console.error("Error writing localStorage invoices:", err);
  }
};

// Merge server invoices with local invoices while strictly maintaining unique numbers
export const syncWithServer = (serverInvoices) => {
  const localList = getStoredInvoices();
  if (!Array.isArray(serverInvoices) || serverInvoices.length === 0) {
    return localList;
  }

  const mergedMap = new Map();

  // First add server invoices
  for (const inv of serverInvoices) {
    const key = inv._id ? String(inv._id) : (inv.invoiceNumber ? String(inv.invoiceNumber) : null);
    if (key) mergedMap.set(key, inv);
  }

  // Overwrite or merge with local invoices, preserving local unique invoice numbers
  for (const inv of localList) {
    const key = inv._id ? String(inv._id) : (inv.invoiceNumber ? String(inv.invoiceNumber) : null);
    if (key) {
      mergedMap.set(key, inv);
    }
  }

  const combined = Array.from(mergedMap.values());
  const normalized = normalizeInvoiceList(combined);
  setStoredInvoices(normalized);
  return normalized;
};

// Save a newly created invoice locally with guaranteed unique invoice number
export const saveInvoiceLocally = (invoiceData) => {
  const currentList = getStoredInvoices();
  const invoiceNumber = invoiceData.invoiceNumber || generateNextInvoiceNumber(currentList);
  const _id = invoiceData._id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const tot = Math.round(Number(invoiceData.totalAmount || 0) * 100) / 100;
  const paid = Math.round(Number(invoiceData.paidAmount || 0) * 100) / 100;
  const bal = Math.round(Number(invoiceData.balanceAmount ?? (tot - paid)) * 100) / 100;
  const ship = Math.round(Number(invoiceData.shippingCharge || 0) * 100) / 100;

  const newInvoice = {
    ...invoiceData,
    _id,
    invoiceNumber,
    createAt: invoiceData.createAt || new Date().toISOString(),
    totalAmount: tot,
    paidAmount: paid,
    balanceAmount: bal,
    shippingCharge: ship,
  };

  const updatedList = [newInvoice, ...currentList.filter((inv) => String(inv._id) !== String(_id))];
  const normalized = normalizeInvoiceList(updatedList);
  setStoredInvoices(normalized);

  return (
    normalized.find((inv) => String(inv._id) === String(_id)) || newInvoice
  );
};

// Update an existing invoice locally
export const updateInvoiceLocally = (id, updatedData) => {
  const currentList = getStoredInvoices();
  const index = currentList.findIndex(
    (inv) => String(inv._id) === String(id) || inv.invoiceNumber === String(id)
  );

  if (index !== -1) {
    const current = currentList[index];
    const tot = Math.round(Number(updatedData.totalAmount ?? current.totalAmount ?? 0) * 100) / 100;
    const paid = Math.round(Number(updatedData.paidAmount ?? current.paidAmount ?? 0) * 100) / 100;
    const bal = Math.round(Number(updatedData.balanceAmount ?? (tot - paid)) * 100) / 100;
    const ship = Math.round(Number(updatedData.shippingCharge ?? current.shippingCharge ?? 0) * 100) / 100;

    const updated = {
      ...current,
      ...updatedData,
      _id: current._id, // Retain original ID
      invoiceNumber: current.invoiceNumber, // Preserve authoritative unique number!
      totalAmount: tot,
      paidAmount: paid,
      balanceAmount: bal,
      shippingCharge: ship,
    };

    currentList[index] = updated;
    const normalized = normalizeInvoiceList(currentList);
    setStoredInvoices(normalized);
    return normalized.find((inv) => String(inv._id) === String(current._id)) || updated;
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
  const normalized = normalizeInvoiceList(filtered);
  setStoredInvoices(normalized);
  return normalized;
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
