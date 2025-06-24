"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import Image from "next/image";
import { useUser } from "../provider/UserProvider";

function SidebarContent() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const pathname = usePathname();
  const Router = useRouter();
  const { signOut } = useUser();

  const toggleSidebar = () => setIsMinimized((prev) => !prev);
  const toggleSubmenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    signOut();
    Router.push("/");
  };

  const links = [
    { label: "Shop Profile", icon: "👤", href: "/shop-profile" },
    { label: "Dashboard", icon: "📊", href: "/dashboard" },
    {
      label: "Employee Manage",
      icon: "⚙️",
      children: [
        { label: "Add-Edit Employee", href: "/employee/add" },
        { label: "Employee List", href: "/employee/list" }
      ]
    },
    {
      label: "Product",
      icon: "⚙️",
      children: [
        { label: "Add Product", href: "/products/addproducts" },
        { label: "Product List", href: "/products/productslist" }
      ]
    },
    {
      label: "Exporter",
      icon: "⚙️",
      children: [
        { label: "Add Exporter", href: "/exporter/add" },
        { label: "Exporter List", href: "/exporter/list" }
      ]
    },
    { label: "Product Purchase", icon: "📈", href: "/purchase" },
    { label: "Product Purchase From Supplier", icon: "📈", href: "/supplier-purchase" },
    { label: "Supplier Purchase List", icon: "📈", href: "/supplier-purchase/list" },
    {
      label: "Stock",
      icon: "⚙️",
      children: [{ label: "Stock List", href: "/stock/list" }]
    },
    {
      label: "Product Order",
      icon: "⚙️",
      children: [
        { label: "Order Form", href: "/order/form" },
        { label: "Order List", href: "/order/list" }
      ]
    },
    {
      label: "Customer",
      icon: "⚙️",
      children: [
        { label: "Add Customer", href: "/customer/add" },
        { label: "Customer List", href: "/customer/list" }
      ]
    },
    {
      label: "Supplier",
      icon: "⚙️",
      children: [
        { label: "Add Supplier", href: "/supplier/add" },
        { label: "Supplier List", href: "/supplier/list" }
      ]
    },
    {
      label: "Sale",
      icon: "⚙️",
      children: [
        { label: "Sale", href: "/sale" },
        { label: "Sale List", href: "/sale/list" }
      ]
    },
    {
      label: "Borrower",
      icon: "⚙️",
      children: [
        { label: "Add Borrower", href: "/borrower/add" },
        { label: "Borrower List", href: "/borrower/list" }
      ]
    },
    {
      label: "Owed",
      icon: "⚙️",
      children: [
        { label: "Add Owed", href: "/owed/add" },
        { label: "Owed List", href: "/owed/list" }
      ]
    },
    {
      label: "Loan",
      icon: "⚙️",
      children: [
        { label: "Add Loan", href: "/loan/add" },
        { label: "Loan List", href: "/loan/list" },
        { label: "Loan Statement", href: "/loan/statement" }
      ]
    },
    {
      label: "Bank Account",
      icon: "⚙️",
      children: [
        { label: "Account Category Master", href: "/bank/account-category" },
        { label: "Bank Account Master", href: "/bank/account-master" },
        { label: "Bank Account List", href: "/bank/account-list" }
      ]
    },
    {
      label: "Transaction",
      icon: "⚙️",
      children: [
        { label: "Add PayReceipt", href: "/transaction/payreceipt" },
        { label: "Daily Expenses", href: "/transaction/expenses" },
        { label: "Add ReceivedReceipt", href: "/transaction/received" },
        { label: "Daily Income", href: "/transaction/income" },
        { label: "Cost Category Ledger Report", href: "/transaction/cost-ledger" },
        { label: "Sale Statement Report", href: "/transaction/sale-statement" },
        { label: "Brand Wise Sale Statement Report", href: "/transaction/brand-sale" },
        { label: "Purchase Statement Report", href: "/transaction/purchase-statement" },
        { label: "Part No wise Purchase Statement Report", href: "/transaction/partwise" },
        { label: "Income/Expenses", href: "/transaction/income-expense" }
      ]
    },
    {
      label: "Settings",
      icon: "⚙️",
      children: [
        { label: "Company Master", href: "/settings/company" },
        { label: "Product Category Master", href: "/settings/productcategory" },
        { label: "Cost Category Master", href: "/settings/costcategory" },
        { label: "Source Category Master", href: "/settings/sourcecategory" },
        { label: "Payment Mode Master", href: "/settings/paymentmode" },
        { label: "District Master", href: "/settings/district" },
        { label: "Country Master", href: "/settings/country" },
        { label: "Supplier Type Master", href: "/settings/suppliertype" },
        { label: "Bank Category Master", href: "/settings/bankcategory" },
        { label: "Bank Master", href: "/settings/bank" }
      ]
    }
  ];

  return (
    <div className="flex h-screen">
      <aside className={`bg-sky-900 text-white transition-all duration-300 ${isMinimized ? "w-14" : "w-72"} shadow-lg`}>
        <div className="flex flex-col h-full px-2 py-4">
          <div className="relative flex justify-between items-center border-b border-gray-700 pb-2">
            {!isMinimized && (
              <Link href="/" className="flex items-center gap-3 p-2">
                <Image src="/Feroz_logo.jpg" alt="Logo" width={32} height={32} />
                <span className="text-sm font-semibold">Feroz Autos</span>
              </Link>
            )}
            <button onClick={toggleSidebar} className="p-2 text-white">
              {isMinimized ? <MdChevronRight /> : <MdChevronLeft />}
            </button>
          </div>

          <nav className="flex-1 mt-2 space-y-2 text-xs overflow-y-auto">
            {links.map((item, index) => {
              const isChildActive = item.children?.some(child => pathname === child.href);
              const isActive = item.href && pathname === item.href;

              useEffect(() => {
                if (isChildActive) {
                  setOpenMenus((prev) => ({ ...prev, [item.label]: true }));
                }
              }, [pathname]);

              return (


                <div key={index}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className={`flex items-center justify-between w-full p-2 text-left rounded-lg transition duration-200 ${openMenus[item.label] || isChildActive ? "bg-lime-100 text-black" : "hover:bg-white hover:text-black"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span>{item.icon}</span>
                          {!isMinimized && <span>{item.label}</span>}
                        </div>
                        {!isMinimized && (
                          <span className={`transition-transform duration-200 ${openMenus[item.label] ? "rotate-180" : ""}`}>
                            &#9662; {/* Unicode for down arrow ▾ */}
                          </span>
                        )}
                      </button>

                      {openMenus[item.label] && !isMinimized && (
                        <div className="pl-6 py-2">
                          {item.children.map((sub, idx) => (
                            <Link
                              key={idx}
                              href={sub.href}
                              className={`block p-2 mb-1 rounded-md text-sm transition ${pathname === sub.href ? "bg-lime-100 text-black" : "hover:bg-white hover:text-black"}`}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 ${isActive ? "bg-lime-100 text-black" : "hover:bg-white hover:text-black"} ${isMinimized ? "justify-center" : ""}`}
                    >
                      <span>{item.icon}</span>
                      {!isMinimized && <span>{item.label}</span>}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mt-auto p-2 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className={`flex items-center text-xs gap-3 p-2 w-full rounded-lg transition cursor-pointer duration-200 ${pathname === "/authentication" ? "bg-white text-black" : "hover:bg-white hover:text-black"} ${isMinimized ? "justify-center" : ""}`}
            >
              <FaSignOutAlt />
              {!isMinimized && <span>Log Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SidebarContent;