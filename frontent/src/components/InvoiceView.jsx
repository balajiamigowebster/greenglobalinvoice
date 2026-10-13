import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useDispatch, useSelector } from "react-redux";
import { getSettings } from "../redux/Slices/settingsSlice";
import { numberToWordsIndian } from "../utils/numberToWords";
import { getInvoiceByIdLocally } from "../services/invoiceStorage";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatCurrency = (val) => {
  const num = Number(val || 0);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const InvoiceView = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(() => getInvoiceByIdLocally(id));
  const [setting, setSetting] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef();
  const dispatch = useDispatch();

  const { items } = useSelector((state) => state.settings);

  useEffect(() => {
    if (!items || items.length === 0) {
      dispatch(getSettings());
    }
  }, [dispatch, items]);

  useEffect(() => {
    if (items && items.length > 0) {
      setSetting(items[0]);
    }
  }, [items]);

  useEffect(() => {
    const local = getInvoiceByIdLocally(id);
    if (local) {
      setInvoice(local);
    }

    const fetchInvoice = async () => {
      try {
        const res = await API.get(`/api/invoices/${id}`);
        if (res.data) {
          setInvoice(res.data);
        }
      } catch (error) {
        if (!local) {
          alert("Invoice not found");
        }
      }
    };

    fetchInvoice();
  }, [id]);

  // Guaranteed single-page PDF generator using html2canvas + jsPDF
  const generateSinglePagePDF = async () => {
    const element = printRef.current;
    if (!element) return null;

    // 1. Wait for images to load
    const images = element.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    // 2. Temporarily fix element width to 900px desktop format for crisp render
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    const originalOverflow = element.style.overflowX;

    element.style.width = "900px";
    element.style.maxWidth = "900px";
    element.style.overflowX = "visible";

    // 3. Capture high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1024,
    });

    // Restore styling
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.overflowX = originalOverflow;

    // 4. Create single-page A4 PDF (210mm x 297mm)
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const margin = 8; // 8mm margins
    const usableWidth = pdfWidth - margin * 2; // 194mm
    const usableHeight = pdfHeight - margin * 2; // 281mm

    // Proportional dimensions
    let imgWidth = usableWidth;
    let imgHeight = (canvas.height * usableWidth) / canvas.width;

    // STRICT SINGLE PAGE: If content exceeds usable page height, scale down to fit 1 page
    if (imgHeight > usableHeight) {
      const scale = usableHeight / imgHeight;
      imgHeight = usableHeight;
      imgWidth = usableWidth * scale;
    }

    // Center horizontally on page
    const x = (pdfWidth - imgWidth) / 2;
    const y = margin;

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight, undefined, "FAST");

    return pdf;
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      const pdf = await generateSinglePagePDF();
      if (!pdf) return;
      pdf.save(`Invoice-${invoice.invoiceNumber || id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsGenerating(true);
      const pdf = await generateSinglePagePDF();
      if (!pdf) return;
      const pdfBlobUrl = pdf.output("bloburl");

      if (window.innerWidth > 768) {
        const win = window.open(pdfBlobUrl, "_blank");
        if (win) win.focus();
      } else {
        const link = document.createElement("a");
        link.href = pdfBlobUrl;
        link.download = `Invoice-${invoice.invoiceNumber || id}.pdf`;
        link.click();
      }
    } catch (err) {
      console.error("Print generation failed:", err);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  if (!invoice) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
          <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
          <div className="h-64 bg-gray-200 w-full rounded"></div>
        </div>
      </div>
    );
  }

  // Company details with fallbacks
  const business = setting || {
    businessName: "Green Global Landscape",
    businessNumber: "GGL-2026",
    address: "Solipalayam, Solavaram, Chennai, Tamil Nadu 600067, India",
    phone: "+91 76038 92417",
    email: "greengloballandscape@gmail.com",
    logo: "",
  };

  const totalCGST = invoice.products.reduce(
    (sum, item) =>
      sum + ((item.rate || 0) * (item.quantity || 0) * (item.cgst || 0)) / 100,
    0
  );
  const totalSGST = invoice.products.reduce(
    (sum, item) =>
      sum + ((item.rate || 0) * (item.quantity || 0) * (item.sgst || 0)) / 100,
    0
  );
  const totalAmount = invoice.products.reduce(
    (sum, item) => sum + (item.rate || 0) * (item.quantity || 0),
    0
  );
  const shippingCharge = Number(invoice.shippingCharge || 0);
  const grandTotal = totalAmount + totalCGST + totalSGST + shippingCharge;
  const balanceDue = Number(
    invoice.balanceAmount !== undefined && invoice.balanceAmount !== null
      ? invoice.balanceAmount
      : grandTotal - (Number(invoice.paidAmount) || 0)
  );
  const totalInWords = numberToWordsIndian(grandTotal);

  const hasImages = invoice.products.some((p) => Boolean(p.image));

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Top Action Bar */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Invoice #{invoice.invoiceNumber}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isGenerating ? "Preparing..." : "Print"}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Download PDF (Single Page)"}
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        ref={printRef}
        id="printable-invoice"
        className="print-container bg-white p-6 md:p-8 shadow-sm rounded-lg border border-gray-200"
        style={{
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: "#1f2937",
        }}
      >
        {/* --- HEADER SECTION --- */}
        <div className="flex justify-between items-start pb-4 border-b border-gray-200">
          {/* Company Details (Left) */}
          <div className="max-w-[55%]">
            {business.logo && (
              <img
                src={business.logo}
                alt={business.businessName}
                className="mb-2"
                style={{
                  maxHeight: "70px",
                  maxWidth: "180px",
                  objectFit: "contain",
                }}
              />
            )}
            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-snug">
              {business.businessName}
            </h1>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {business.address}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              <span>{business.phone}</span>
              {business.email && <span> • {business.email}</span>}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              GSTIN: 33HDWPK4367L1ZO
            </p>
          </div>

          {/* Invoice & Customer Details (Right) */}
          <div className="text-right max-w-[42%] text-xs">
            <h2 className="text-2xl font-black text-gray-800 tracking-wider uppercase mb-1">
              INVOICE
            </h2>
            <p className="text-gray-700 font-semibold text-sm">
              #{invoice.invoiceNumber}
            </p>
            <div className="mt-2 space-y-0.5 text-gray-600">
              <p>
                <span className="font-semibold text-gray-700">Invoice Date: </span>
                {formatDate(invoice.invoiceDate)}
              </p>
              <p>
                <span className="font-semibold text-gray-700">Due Date: </span>
                {formatDate(invoice.dueDate || invoice.invoiceDate)}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="font-bold text-gray-800 uppercase text-[11px] tracking-wide mb-0.5">
                Bill To:
              </p>
              <p className="font-semibold text-gray-900 text-sm">
                {invoice.customerName}
              </p>
              {invoice.phone && <p className="text-gray-600">{invoice.phone}</p>}
              {invoice.address && (
                <p className="text-gray-600 leading-snug">{invoice.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* --- PRODUCTS TABLE WITH CGST & SGST FOR EACH LINE ITEM --- */}
        <div className="mt-4">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white font-semibold">
                <th className="py-2 px-1 text-center w-7">#</th>
                {hasImages && (
                  <th className="py-2 px-2 text-center w-12">Image</th>
                )}
                <th className="py-2 px-2.5 text-left">Item & Description</th>
                <th className="py-2 px-2 text-right w-16">Qty</th>
                <th className="py-2 px-2 text-right w-20">Rate</th>
                <th className="py-2 px-1.5 text-right w-14">CGST %</th>
                <th className="py-2 px-2 text-right w-20">CGST Amt</th>
                <th className="py-2 px-1.5 text-right w-14">SGST %</th>
                <th className="py-2 px-2 text-right w-20">SGST Amt</th>
                <th className="py-2 px-2.5 text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.products.map((item, index) => {
                const baseAmount = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
                const cgstPercent = Number(item.cgst || 0);
                const sgstPercent = Number(item.sgst || 0);
                const cgstAmount = (baseAmount * cgstPercent) / 100;
                const sgstAmount = (baseAmount * sgstPercent) / 100;
                const totalItemAmount = baseAmount + cgstAmount + sgstAmount;

                return (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-1 px-1 text-center text-gray-500 font-medium">
                      {index + 1}
                    </td>
                    {hasImages && (
                      <td className="py-1 px-2 text-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-8 h-8 object-cover mx-auto rounded border"
                          />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    )}
                    <td className="py-1 px-2.5 text-left">
                      <div className="font-semibold text-gray-900 leading-snug">
                        {item.title}
                      </div>
                      {item.description && item.description !== item.title && (
                        <div className="text-[10px] text-gray-500 leading-tight">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-1 px-2 text-right font-medium text-gray-800">
                      {Number(item.quantity).toLocaleString("en-IN")}
                    </td>
                    <td className="py-1 px-2 text-right text-gray-700">
                      ₹{formatCurrency(item.rate)}
                    </td>
                    <td className="py-1 px-1.5 text-right text-gray-600">
                      {cgstPercent}%
                    </td>
                    <td className="py-1 px-2 text-right text-gray-600">
                      ₹{formatCurrency(cgstAmount)}
                    </td>
                    <td className="py-1 px-1.5 text-right text-gray-600">
                      {sgstPercent}%
                    </td>
                    <td className="py-1 px-2 text-right text-gray-600">
                      ₹{formatCurrency(sgstAmount)}
                    </td>
                    <td className="py-1 px-2.5 text-right font-semibold text-gray-900">
                      ₹{formatCurrency(totalItemAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-gray-300 font-semibold text-gray-800 bg-gray-50">
              <tr>
                <td
                  colSpan={hasImages ? 5 : 4}
                  className="py-1.5 px-2.5 text-right font-bold text-gray-700"
                >
                  Total:
                </td>
                <td className="py-1.5 px-1.5 text-right text-gray-400"></td>
                <td className="py-1.5 px-2 text-right font-semibold text-gray-800">
                  ₹{formatCurrency(totalCGST)}
                </td>
                <td className="py-1.5 px-1.5 text-right text-gray-400"></td>
                <td className="py-1.5 px-2 text-right font-semibold text-gray-800">
                  ₹{formatCurrency(totalSGST)}
                </td>
                <td className="py-1.5 px-2.5 text-right font-bold text-gray-900">
                  ₹{formatCurrency(totalAmount + totalCGST + totalSGST)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* --- BOTTOM SECTION: TERMS / BANK DETAILS (LEFT) & SUMMARY (RIGHT) --- */}
        <div className="mt-4 pt-3 border-t border-gray-300 flex flex-row justify-between items-start gap-4">
          {/* Left Column: Terms & Bank Info */}
          <div className="w-[58%] text-[11px] text-gray-700 space-y-3">
            {/* Terms and Conditions */}
            <div>
              <h4 className="font-bold text-xs text-blue-900 mb-1 tracking-wide uppercase">
                Terms and Conditions:
              </h4>
              <ul className="list-disc ml-4 space-y-0.5 text-gray-600 leading-snug">
                <li>Delivery: Immediate depending on stock and other order in prior.</li>
                <li>Quoted price may increase depend upon the customer specification.</li>
                <li>Quoted price are valid for 15 days from the date of quotation.</li>
                <li>
                  80% advance should be paid before unloading materials, and the final 20% balance is due after the work is completed.
                </li>
              </ul>
            </div>

            {/* Bank Details */}
            <div className="p-2.5 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-800">
              <h4 className="font-bold text-xs text-blue-900 uppercase tracking-wide mb-1">
                Bank Account Details:
              </h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-gray-700">
                <p>
                  <strong>Bank:</strong> STATE BANK OF INDIA
                </p>
                <p>
                  <strong>A/C No:</strong> 44758412507
                </p>
                <p>
                  <strong>A/C Name:</strong> GREEN GLOBAL LANDSCAPE
                </p>
                <p>
                  <strong>A/C Type:</strong> CURRENT A/C
                </p>
                <p>
                  <strong>Branch:</strong> PADIYANALLUR (14160)
                </p>
                <p>
                  <strong>IFSC:</strong> SBIN0014160
                </p>
              </div>
              <p className="mt-1 text-[10px] text-gray-500">
                <strong>Address:</strong> 159/2, A/A, Padiyanallur, Chennai 600052
              </p>
            </div>
          </div>

          {/* Right Column: Totals & Balance Due */}
          <div className="w-[40%] text-right text-xs">
            <div className="space-y-1.5 pb-2 border-b border-gray-200">
              <p className="flex justify-between">
                <span className="font-medium text-gray-600">Sub Total:</span>
                <span className="font-semibold text-gray-900">
                  ₹{formatCurrency(totalAmount)}
                </span>
              </p>

              <p className="flex justify-between text-gray-600 text-[11px]">
                <span>Total CGST:</span>
                <span className="font-medium text-gray-900">
                  ₹{formatCurrency(totalCGST)}
                </span>
              </p>

              <p className="flex justify-between text-gray-600 text-[11px]">
                <span>Total SGST:</span>
                <span className="font-medium text-gray-900">
                  ₹{formatCurrency(totalSGST)}
                </span>
              </p>

              {shippingCharge > 0 && (
                <p className="flex justify-between text-gray-700">
                  <span className="font-medium text-gray-600">Shipping charge:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{formatCurrency(shippingCharge)}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-1.5 mt-2">
              <p className="flex justify-between font-bold text-sm text-gray-900">
                <span>Total:</span>
                <span>₹{formatCurrency(grandTotal)}</span>
              </p>

              {Number(invoice.paidAmount) > 0 && (
                <p className="flex justify-between text-green-700 font-medium">
                  <span>Amount Paid:</span>
                  <span>₹{formatCurrency(invoice.paidAmount)}</span>
                </p>
              )}

              <div className="bg-gray-100 px-3 py-1.5 rounded flex justify-between font-bold text-sm text-gray-900">
                <span>Balance Due:</span>
                <span>₹{formatCurrency(balanceDue)}</span>
              </div>
            </div>

            {/* Total In Words */}
            <div className="mt-3 pt-1.5 text-right">
              <p className="text-[11px] leading-tight text-gray-800">
                <span className="font-normal text-gray-600">Total In Words: </span>
                <br />
                <span className="italic font-bold text-gray-900">
                  {totalInWords}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
