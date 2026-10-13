import React, { useEffect, useState } from "react";
import {
  FaFileInvoiceDollar,
  FaUsers,
  FaShoppingCart,
  FaChartLine,
} from "react-icons/fa";
import API from "../api";
import { getStoredInvoices, syncWithServer } from "../services/invoiceStorage";

const Dashboard = () => {
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);

  const calculateStats = (invoices) => {
    if (!Array.isArray(invoices) || invoices.length === 0) return;
    setInvoiceCount(invoices.length);
    const uniqueCustomers = new Set(
      invoices.map((i) => i.customerName?.trim().toLowerCase()).filter(Boolean)
    );
    setTotalCustomers(uniqueCustomers.size);
    const total = invoices.reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0);
    const paid = invoices.reduce((acc, i) => acc + (Number(i.paidAmount) || 0), 0);
    const balance = invoices.reduce(
      (acc, i) => acc + (Number(i.balanceAmount ?? (Number(i.totalAmount || 0) - Number(i.paidAmount || 0))) || 0),
      0
    );
    setTotalAmount(total);
    setTotalPaidAmount(paid);
    setBalanceAmount(balance);
  };

  useEffect(() => {
    // 1. Immediately calculate from stored invoices so dashboard loads with 0 delay
    const initialList = getStoredInvoices();
    calculateStats(initialList);
    setLoading(false);

    // 2. Fetch latest from backend and merge
    const fetchData = async () => {
      try {
        const res = await API.get("/api/invoices");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const merged = syncWithServer(res.data);
          calculateStats(merged);
        }
      } catch (error) {
        console.log("Server sync notice, using local stats:", error.message);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      title: "Total Invoices",
      value: invoiceCount,
      icon: <FaFileInvoiceDollar size={20} />,
      color: "bg-blue-500",
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: <FaUsers size={20} />,
      color: "bg-green-500",
    },
    {
      title: "Total Revenue",
      value: totalAmount,
      icon: <FaShoppingCart size={20} />,
      color: "bg-yellow-500",
      isCurrency: true,
    },
    {
      title: "Total Paid",
      value: totalPaidAmount,
      icon: <FaChartLine size={60} className="px-5" />,
      color: "bg-purple-500 text-[15px]",
      isCurrency: true,
    },
    {
      title: "Balance Amount",
      value: balanceAmount,
      icon: <FaChartLine size={60} className="px-5" />,
      color: "bg-orange-500 text-[15px]",
      isCurrency: true,
    },
  ];

  if (loading) return <p className="text-lg text-center mt-20">Loading...</p>;

  return (
    <div className="p-5 ">
      <h1 className="text-2xl font-bold mb-5">📊 Analytics Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`text-white  p-5 md:py-12 rounded-xl shadow-lg flex flex-col md:flex md:justify-between md:flex-col items-center justify-center ${stat.color}`}
          >
            <h2 className="text-lg font-semibold">{stat.title}</h2>
            <p className=" font-extrabold text-xl py-2">
              {" "}
              {stat.isCurrency
                ? `₹${stat.value.toLocaleString("en-IN")}`
                : stat.value.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
