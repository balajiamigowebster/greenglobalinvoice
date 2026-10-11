import React, { useEffect, useState } from "react";
import {
  FaFileInvoiceDollar,
  FaUsers,
  FaShoppingCart,
  FaChartLine,
} from "react-icons/fa";
import API from "../api";

const Dashboard = () => {
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          invoiceRes,
          customerRes,
          amountRes,
          totalPaidRes,
          balanceRes,
        ] = await Promise.allSettled([
          API.get("/api/invoices"),
          API.get("/api/invoices/total-customers"),
          API.get("/api/analytics/total-amount"),
          API.get("/api/analytics/total-paid-amount"),
          API.get("/api/analytics/total-balance"),
        ]);

        if (invoiceRes.status === "fulfilled" && Array.isArray(invoiceRes.value?.data)) {
          setInvoiceCount(invoiceRes.value.data.length);
        }
        if (customerRes.status === "fulfilled") {
          setTotalCustomers(customerRes.value?.data?.totalCustomers || 0);
        }
        if (amountRes.status === "fulfilled") {
          setTotalAmount(amountRes.value?.data?.totalAmount || 0);
        }
        if (totalPaidRes.status === "fulfilled") {
          setTotalPaidAmount(totalPaidRes.value?.data?.totalPaid || 0);
        }
        if (balanceRes.status === "fulfilled") {
          setBalanceAmount(balanceRes.value?.data?.totalBalanceAmount || 0);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
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
