import React, { useEffect } from "react";
import { FaBell, FaUserCircle, FaSearch, FaMoon, FaSun } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getSettings } from "../redux/Slices/settingsSlice";

const DashboardNavbar = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.settings);

  useEffect(() => {
    dispatch(getSettings());
    //console.log(items);
  }, []);

  const setting = items?.[0];
  //console.log(setting);

  return (
    <div className="bg-neutral-800 text-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left - Logo */}
        {loading ? (
          <>
            <div className="w-10 h-10 bg-gray-600 rounded-full animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-600 rounded-md animate-pulse"></div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            {setting?.logo && (
              <img
                src={setting.logo}
                alt="Logo"
                className="h-9 w-auto max-w-[120px] rounded object-contain bg-white/10 p-0.5"
              />
            )}
            <span className="font-extrabold text-xl">
              {setting?.businessName || "MyInvoiceApp"}
            </span>
          </div>
        )}

        {/* Center - Search + Links */}
        {/* <div className="hidden md:flex items-center gap-6">
          <input
            type="text"
            placeholder="Search invoices..."
            className="px-3 py-1 rounded-md text-black"
          />
          <a href="/dashboard" className="hover:text-green-400">
            Dashboard
          </a>
          <a href="/invoices" className="hover:text-green-400">
            Invoices
          </a>
          <a href="/customers" className="hover:text-green-400">
            Customers
          </a>
          <a href="/settings" className="hover:text-green-400">
            Settings
          </a>
        </div> */}

        {/* Right - Icons */}
        {/* <div className="flex items-center gap-4">
         
          <button className="hover:text-yellow-400">
            <FaMoon />
          </button>

        
          <button className="relative hover:text-green-400">
            <FaBell />
            <span className="absolute -top-1 -right-2 bg-red-500 text-xs px-1 rounded-full">
              3
            </span>
          </button>

      
          <div className="flex items-center gap-2 cursor-pointer hover:text-green-400">
            <FaUserCircle size={24} />
            <span className="hidden md:block">Admin</span>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default DashboardNavbar;
