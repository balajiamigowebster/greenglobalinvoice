import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";

const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);
  //console.log(invoices);

  const fetchInvoices = async (date) => {
    setLoading(true);
    try {
      let url = "/api/invoices";
      if (date) {
        //const isoDate = date.toISOString().split("T")[0];
        const localDate = date.toLocaleDateString("en-CA");
        url += `?date=${localDate}`;
      }

      const res = await API.get(url);
      if (Array.isArray(res.data)) {
        setInvoices(res.data);
      } else {
        setInvoices([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading invoices:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await API.delete(`/api/invoices/${id}`);
        //toast.success("Invoice deleted");
        setTimeout(() => {
          fetchInvoices();
        }, 1300);
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  const onDateChange = (date) => {
    setSelectedDate(date);
    fetchInvoices(date);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-2xl">Loading...</p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        All Invoices
      </h2>

      <div className="flex justify-center mb-6">
        <DatePicker
          placeholderText="Select a Date"
          className="border px-3 py-2 rounded"
          isClearable
          selected={selectedDate}
          onChange={onDateChange}
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto shadow-md rounded-lg border border-gray-200">
        {invoices.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No invoices found.
          </div>
        ) : (
          <table className="min-w-[700px] w-full bg-white text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs sticky top-0">
              <tr>
                <th className="p-3 border">Invoice</th>
                <th className="p-3 border">Customer</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Total</th>
                <th className="p-3 border">Paid</th>
                <th className="p-3 border">Balance</th>
                <th className="p-3 border">Date</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice._id}
                  className="border-b hover:bg-gray-50 transition duration-200">
                  <td className="p-3 border">{invoice.invoiceNumber}</td>
                  <td className="p-3 border">{invoice.customerName}</td>
                  <td className="p-3 border">{invoice.phone}</td>
                  <td className="p-3 border text-green-600 font-semibold">
                    ₹{invoice.totalAmount}
                  </td>
                  <td className="p-3 border text-blue-600 font-medium">
                    ₹{invoice.paidAmount}
                  </td>
                  <td className="p-3 border text-red-600 font-medium">
                    ₹{invoice.balanceAmount}
                  </td>
                  <td className="p-3 border">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 border text-center space-x-5">
                    <button
                      onClick={() => navigate(`/new/${invoice._id}`)}
                      className="text-blue-600 border px-5 py-1 hover:bg-blue-50 rounded">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(invoice._id)}
                      className="text-red-600 border px-5 py-1 hover:bg-red-50 rounded">
                      Delete
                    </button>
                    <Link
                      to={`/invoice/${invoice._id}`}
                      className="text-indigo-600 font-medium hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden mb-20  space-y-4">
        {invoices.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No invoices found.
          </div>
        ) : (
          invoices.map((invoice) => (
            <div
              key={invoice._id}
              className="bg-white shadow rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-gray-700">Invoice:</span>
                <span>{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-gray-700">Customer:</span>
                <span>{invoice.customerName}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-gray-700">Phone:</span>
                <span>{invoice.phone}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-green-600">Total:</span>
                <span>₹{invoice.totalAmount}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-blue-600">Paid:</span>
                <span>₹{invoice.paidAmount}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-red-600">Balance:</span>
                <span>₹{invoice.balanceAmount}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-gray-700">Date:</span>
                <span>
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between mt-3 space-x-2">
                <button
                  onClick={() => navigate(`/new/${invoice._id}`)}
                  className="flex-1 text-blue-600 border px-4 py-2 hover:bg-blue-50 rounded">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(invoice._id)}
                  className="flex-1 text-red-600 border px-4 py-2 hover:bg-red-50 rounded">
                  Delete
                </button>
                <Link
                  to={`/invoice/${invoice._id}`}
                  className="flex-1 mt-3 text-indigo-600 font-medium text-center hover:underline">
                  View
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InvoicesList;
