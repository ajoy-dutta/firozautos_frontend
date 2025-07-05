"use client";

import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../components/AxiosInstance";
import Select from "react-select";

export default function PurchaseList() {
  const [allPurchases, setAllPurchases] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    supplier: null,
    district: null,
    billNo: "",
  });

  const itemsPerPage = 6;

  // Load districts once
useEffect(() => {
  axiosInstance
    .get("/districts/")
    .then(res => {
      const options = res.data.map(d => ({
        value: d.id,
        label: d.name,
      }));
      setDistricts(options);
    })
    .catch(err => console.error("Failed to load districts:", err));
}, []);


  // Load suppliers once
  useEffect(() => {
    axiosInstance
      .get("/suppliers/")
      .then((res) => {
        const options = res.data.map((s) => ({
          value: s.id,
          label: s.supplier_name,
        }));
        setSuppliers(options);
      })
      .catch((err) => console.error("Failed to load suppliers:", err));
  }, []);

  // Initial load: load all purchases
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/supplier-purchases/")
      .then((res) => {
        setAllPurchases(res.data);
        setPurchases(res.data); // default দেখানোর জন্য
      })
      .catch((err) => console.error("Failed to load purchases:", err))
      .finally(() => setLoading(false));
  }, []);

  // Local filter logic
  useEffect(() => {
    let filtered = allPurchases;

    if (filters.supplier) {
      filtered = filtered.filter(
        (p) => p.supplier?.id === filters.supplier.value
      );
    }

    if (filters.district) {
      filtered = filtered.filter(
        (p) => p.supplier?.district_detail?.id === filters.district.value
      );
    }

    if (filters.billNo.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.invoice_no
          ?.toLowerCase()
          .includes(filters.billNo.trim().toLowerCase())
      );
    }

    setPurchases(filtered);
    setCurrentPage(1);
  }, [filters, allPurchases]);

  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const paginatedPurchases = purchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleSupplierChange = (selectedOption) => {
    setFilters((prev) => ({ ...prev, supplier: selectedOption }));
  };

  const handleDistrictChange = (selectedOption) => {
    setFilters((prev) => ({ ...prev, district: selectedOption }));
  };

  const handleBillNoChange = (e) => {
    setFilters((prev) => ({ ...prev, billNo: e.target.value }));
  };

  const clearAllFilters = () => {
    setFilters({ supplier: null, district: "", billNo: "" });
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-2xl font-semibold ">Purchase List</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-2 items-end">
        <div className="flex flex-col w-64">
          <label className="font-medium mb-1">Supplier Name</label>
          <Select
            options={suppliers}
            value={filters.supplier}
            onChange={handleSupplierChange}
            isClearable
            placeholder="Select supplier"
          />
        </div>

        <div className="flex flex-col w-48">
          <label className="font-medium mb-1">District</label>
          <Select
            options={districts}
            value={filters.district}
            onChange={handleDistrictChange}
            isClearable
            placeholder="Select district"
            className="text-sm"
          />
        </div>

        <div className="flex flex-col w-48">
          <label className="font-medium mb-1">Bill No</label>
          <input
            type="text"
            value={filters.billNo}
            onChange={handleBillNoChange}
            className="border px-3 py-2 rounded text-sm"
            placeholder="Search bill no"
          />
        </div>
        {/* 
        <button
          onClick={clearAllFilters}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
        >
          Clear All
        </button> */}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm border-collapse">
          <thead className="bg-sky-800 text-white top-0 ">
            <tr>
              <th className="border px-3 py-2 w-12">#</th>
              <th className="border px-3 py-2 w-12"></th>
              <th className="border px-3 py-2 max-w-[250px]">
                Supplier Details
              </th>
              <th className="border px-3 py-2">Bill No</th>
              <th className="border px-3 py-2">Bill Date</th>
              <th className="border px-3 py-2 text-right">Total</th>
              <th className="border px-3 py-2 text-right">Discount</th>
              <th className="border px-3 py-2 text-right">Payable</th>
              <th className="border px-3 py-2 text-right">Paid</th>
              <th className="border px-3 py-2 text-right">Due</th>
              <th className="border px-3 py-2 text-center">Invoice</th>
              <th className="border px-3 py-2 text-center">Pay Due</th>
              <th className="border px-3 py-2 text-center">Return</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPurchases.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-6 text-gray-500">
                  {loading ? "Loading..." : "No purchases found"}
                </td>
              </tr>
            ) : (
              paginatedPurchases.map((purchase, index) => {
                const isExpanded = expandedRows.has(purchase.id);
                const paidAmount =
                  purchase.payments?.reduce(
                    (acc, p) => acc + parseFloat(p.paid_amount || 0),
                    0
                  ) || 0;
                const dueAmount =
                  parseFloat(purchase.total_payable_amount || 0) - paidAmount;
                const returnAmount = 0;

                return (
                  <React.Fragment key={purchase.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="border px-3 py-2 text-center">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td
                        className="border px-3 py-2 text-center cursor-pointer select-none"
                        onClick={() => toggleRow(purchase.id)}
                      >
                        {isExpanded ? (
                          <span className="inline-block w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center font-bold">
                            −
                          </span>
                        ) : (
                          <span className="inline-block w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center font-bold">
                            +
                          </span>
                        )}
                      </td>
                      <td className="border px-3 py-2 max-w-[250px]">
                        <div className="font-medium">
                          {purchase.supplier?.supplier_name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-600">
                          Contact: {purchase.supplier?.phone1 || "N/A"}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          Address:{" "}
                          {purchase.supplier?.address?.replace(/\r\n/g, ", ") ||
                            "N/A"}
                        </div>
                        <div className="text-xs text-gray-600">
                          District:{" "}
                          {purchase.supplier?.district_detail?.name || "N/A"}
                        </div>
                      </td>
                      <td className="border px-3 py-2">
                        {purchase.invoice_no}
                      </td>
                      <td className="border px-3 py-2">
                        {purchase.purchase_date}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        ৳{parseFloat(purchase.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        ৳{parseFloat(purchase.discount_amount || 0).toFixed(2)}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        ৳
                        {parseFloat(purchase.total_payable_amount || 0).toFixed(
                          2
                        )}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        ৳{paidAmount.toFixed(2)}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        ৳{dueAmount.toFixed(2)}
                      </td>
                      <td className="border px-3 py-2 text-center">
                        <button className="text-blue-600 hover:underline text-sm">
                          View
                        </button>
                      </td>
                      <td className="border px-3 py-2 text-center">
                        <button className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm">
                          Pay
                        </button>
                      </td>
                      <td className="border px-3 py-2 text-center">
                        <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm">
                          Return
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gray-50 border border-gray-900">
                        <td colSpan={14} className="">
                          <table className="min-w-full text-sm border-collapse">
                            <thead className="bg-sky-800 text-white">
                              <tr>
                                <th className="border px-2 py-1">Item</th>
                                <th className="border px-2 py-1">Quantity</th>
                                <th className="border px-2 py-1">Price</th>
                                <th className="border px-2 py-1">%</th>
                                <th className="border px-2 py-1">
                                  Price with %
                                </th>
                                <th className="border px-2 py-1 text-center">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {purchase.products &&
                              purchase.products.length > 0 ? (
                                purchase.products.map((prod) => (
                                  <tr key={prod.id}>
                                    <td className="px-2 py-1 truncate">
                                      {prod.product?.category_detail
                                        ?.category_name || ""}{" "}
                                      ({prod.product?.part_no || ""})
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                      {parseFloat(
                                        prod.purchase_quantity || 0
                                      ).toFixed(2)}
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                      {parseFloat(
                                        prod.purchase_price || 0
                                      ).toFixed(2)}
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                      {parseFloat(prod.percentage || 0).toFixed(
                                        2
                                      )}
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                      {parseFloat(
                                        prod.purchase_price_with_percentage || 0
                                      ).toFixed(2)}
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                      {parseFloat(
                                        prod.total_price || 0
                                      ).toFixed(2)}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="text-center py-2 text-gray-500"
                                  >
                                    No products found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded"
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
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
