"use client";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../components/AxiosInstance";
import Select from "react-select";
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';




export default function StockList() {
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "32px",
      height: "32px",
      fontSize: "0.875rem",
      border: "1px solid #000000",
      borderRadius: "0.275rem",
      borderColor: state.isFocused ? "#000000" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #000000" : "none",
      paddingTop: "0px",
      paddingBottom: "0px",
      display: "flex",
      alignItems: "center",
    }),
    valueContainer: (base) => ({
      ...base,
      height: "30px",
      padding: "0 6px",
      display: "flex",
      alignItems: "center",
      flexWrap: "nowrap",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "14px",
      color: "#9ca3af",
      margin: "0",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#000000",
      margin: "0",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),
    input: (base) => ({
      ...base,
      fontSize: "0.875rem",
      margin: "0",
      padding: "0",
      color: "#000000",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "30px",
      display: "flex",
      alignItems: "center",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "#d1d5db",
      height: "16px",
      marginTop: "auto",
      marginBottom: "auto",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": {
        color: "#000000",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": {
        color: "#000000",
      },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#000000"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#000000",
      "&:hover": {
        backgroundColor: state.isSelected ? "#000000" : "#f3f4f6",
      },
    }),
    menu: (base) => ({
      ...base,
      fontSize: "0.875rem",
    }),
    menuList: (base) => ({
      ...base,
      fontSize: "0.875rem",
    }),
  };

  const [stocks, setStocks] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [damageQty, setDamageQty] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(stocks.length / itemsPerPage);

  // Pagination slice
  const currentStocks = stocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [filters, setFilters] = useState({
    company: null,
    partNo: "",
  });

  // Load stock data
  useEffect(() => {
    axiosInstance
      .get("/stocks/")
      .then((res) => {
        setStocks(res.data);
        setAllStocks(res.data);
      })
      .catch((err) => console.error("Error loading stocks:", err));
  }, []);

  // Load companies
  useEffect(() => {
    axiosInstance
      .get("/companies/")
      .then((res) => {
        const options = res.data.map((c) => ({
          value: c.id,
          label: c.company_name,
        }));
        setCompanies(options);
      })
      .catch((err) => console.error("Error loading companies:", err));
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = allStocks;

    if (filters.company) {
      filtered = filtered.filter(
        (stock) =>
          stock.product?.category_detail?.company_detail?.id ===
          filters.company.value
      );
    }

    if (filters.partNo.trim() !== "") {
      filtered = filtered.filter((stock) =>
        stock.part_no
          ?.toLowerCase()
          .includes(filters.partNo.trim().toLowerCase())
      );
    }

    setStocks(filtered);
    setCurrentPage(1); // Reset to first page after filter change
  }, [filters, allStocks]);



const handleDamageSave = async () => {
  if (!selectedStock?.id || damageQty == null) {
    toast.error("Stock ID or damage quantity missing");
    return;
  }

  try {
    const response = await axiosInstance.patch(
      `/stocks/${selectedStock.id}/set-damage-quantity/`,
      {
        damage_quantity: damageQty,
      }
    );

    toast.success("Damage quantity updated successfully!");
    console.log("Damage quantity updated:", response.data);
    document.getElementById("damage_modal").close();
  } catch (error) {
    console.error("Error updating damage quantity:", error);
    toast.error("Failed to update damage quantity.");
  }
};


  const handleResetDamage = () => {
    setDamageQty("");
  };

    const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    // Skip if react-select menu is open
    const selectMenuOpen = document.querySelector(".react-select__menu");
    if (selectMenuOpen) return;

    e.preventDefault();

    // Select all focusable elements
    const allFocusable = Array.from(
      document.querySelectorAll(
        `input:not([type="hidden"]),
       select,
       textarea,
       button,
       [tabindex]:not([tabindex="-1"])`
      )
    ).filter(
      (el) =>
        el.offsetParent !== null && // visible
        !el.disabled && // not disabled
        !(el.readOnly === true || el.getAttribute("readonly") !== null) // not readonly
    );

    const currentIndex = allFocusable.indexOf(e.target);

    if (currentIndex !== -1) {
      for (let i = currentIndex + 1; i < allFocusable.length; i++) {
        const nextEl = allFocusable[i];
        nextEl.focus();
        break;
      }
    }
  };

  
  return (
    <div className="p-4 max-w-7xl">
      <h2 className="text-lg font-semibold mb-3">Stock List</h2>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <div className="w-52">
          <Select
            options={companies}
            placeholder="Filter by Company"
            value={filters.company}
            onChange={(selected) =>
              setFilters((prev) => ({ ...prev, company: selected }))
            }
            isClearable
            styles={customSelectStyles}
          />
        </div>
        <div className="">
          <input
            type="text"
            placeholder="Filter by Part No"
            className="border px-3 py-2 rounded h-8 text-sm w-full"
            value={filters.partNo}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, partNo: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table text-sm">
          <thead>
            <tr className="bg-sky-800 text-white h-12 text-sm">
              <th className="whitespace-normal leading-tight text-center px-3 py-2">I</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Company</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Part No</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Product Name</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Product Code</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Model No</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Brand</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Purchase Qty</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Sale Qty</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Damage Qty</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Current Stock Qty</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Purchase Price</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Sale Price</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Current Stock Value</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Net Weight</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Damage Product</th>
              <th className="whitespace-normal leading-tight text-center px-3 py-2">Product Sale Summary</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {currentStocks.map((stock, index) => (
              <tr key={stock.id} className="h-12">
                <td className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="text-center">{stock.product?.category_detail?.company_detail?.company_name || "N/A"}</td>
                <td className="text-center">{stock.part_no || "N/A"}</td>
                <td className="text-center">{stock.product?.product_name || "N/A"}</td>
                <td className="text-center">{stock.product?.product_code || "N/A"}</td>
                <td className="text-center">{stock.product?.model_no || "N/A"}</td>
                <td className="text-center">{stock.product?.brand_name || "N/A"}</td>
                <td className="text-center">{stock.purchase_quantity}</td>
                <td className="text-center">{stock.sale_quantity}</td>
                <td className="text-center">{stock.damage_quantity}</td>
                <td className="text-center">{stock.current_stock_quantity}</td>
                <td className="text-center">{parseFloat(stock.purchase_price || 0).toFixed(2)}</td>
                <td className="text-center">{parseFloat(stock.sale_price || 0).toFixed(2)}</td>
                <td className="text-center">{parseFloat(stock.current_stock_value || 0).toFixed(2)}</td>
                <td className="text-center">{stock.product?.net_weight || "N/A"}</td>
                <td
                  className="text-center cursor-pointer text-green-600 font-bold text-2xl"
                  onClick={() => {
                    setSelectedStock(stock);
                    setDamageQty("");
                    document.getElementById("damage_modal").showModal();
                  }}
                >
                  +
                </td>
                <td className="text-center">{stock.product_sale_summary || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Damage Modal */}
      <dialog id="damage_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => document.getElementById("damage_modal").close()}
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-center text-lg mb-2">
            Add Damage Product
          </h3>

          {selectedStock && (
            <div className="space-y-4 grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium mb-1 block">Current Stock:</label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded text-sm w-full bg-gray-100"
                  value={selectedStock.current_stock_quantity}
                  disabled
                />
              </div>

              <div>
                <label className="font-medium mb-1 block">Damage Qty: *</label>
                <input
                  type="number"
                  className="border px-3 py-2 rounded text-sm w-full"
                  value={damageQty}
                  onChange={(e) => setDamageQty(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-center gap-2">
            <button
              type="button"
              className="btn btn-md rounded-md btn-outline"
              onClick={handleResetDamage}
            >
              Reset
            </button>

            <button
              type="button"
              className="btn btn-md rounded-md text-white bg-sky-800"
              onClick={handleDamageSave}
            >
              Save
            </button>
          </div>
        </div>
      </dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
