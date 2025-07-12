"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import axiosInstance from "../../components/AxiosInstance";

export default function SalesList() {
  const [allSales, setAllSales] = useState([]);
  const [sales, setSales] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const [filters, setFilters] = useState({
    customer: null,
    district: null,
    billNo: "",
  });

  const itemsPerPage = 5;

  // Toggle row expansion
  const toggleRow = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // Load districts
  useEffect(() => {
    axiosInstance
      .get("/districts/")
      .then((res) => {
        const options = res.data.map((d) => ({ value: d.id, label: d.name }));
        setDistricts(options);
      })
      .catch((err) => console.error("Failed to load districts:", err));
  }, []);

  // Load customers
  useEffect(() => {
    axiosInstance
      .get("/customers/")
      .then((res) => {
        const options = res.data.map((c) => ({
          value: c.id,
          label: c.customer_name,
        }));
        setCustomers(options);
      })
      .catch((err) => console.error("Failed to load customers:", err));
  }, []);

  // Fetch all sales
  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/sales/");
      setAllSales(res.data);
      setSales(res.data);
    } catch (err) {
      console.error("Failed to load sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = allSales;

    if (filters.customer) {
      filtered = filtered.filter(
        (s) => s.customer?.id === filters.customer.value
      );
    }

    if (filters.district) {
      filtered = filtered.filter(
        (s) => s.customer?.district_detail?.id === filters.district.value
      );
    }

    if (filters.billNo.trim() !== "") {
      filtered = filtered.filter((s) =>
        s.invoice_no?.toLowerCase().includes(filters.billNo.trim().toLowerCase())
      );
    }

    setSales(filtered);
    setCurrentPage(1);
  }, [filters, allSales]);

  const handleCustomerChange = (selectedOption) => {
    setFilters((prev) => ({ ...prev, customer: selectedOption }));
  };

  const handleDistrictChange = (selectedOption) => {
    setFilters((prev) => ({ ...prev, district: selectedOption }));
  };

  const handleBillNoChange = (e) => {
    setFilters((prev) => ({ ...prev, billNo: e.target.value }));
  };

  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const paginatedSales = sales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 space-y-4">
      {/* 🔍 Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium mb-1">Customer Name</label>
          <Select
            options={customers}
            isClearable
            onChange={handleCustomerChange}
            placeholder="Select Customer"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">District</label>
          <Select
            options={districts}
            isClearable
            onChange={handleDistrictChange}
            placeholder="Select District"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Bill No</label>
          <input
            type="text"
            value={filters.billNo}
            onChange={handleBillNoChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter Bill No"
          />
        </div>
      </div>

      {/* 🧾 Table */}
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table text-sm">
          <thead className="bg-sky-800 text-white">
            <tr>
              <th className="w-12"></th>
              <th className="max-w-[200px]">Customer Details</th>
              <th>Bill No</th>
              <th>Bill Date</th>
              <th className="text-center">Total</th>
              <th className="text-center">Discount</th>
              <th className="text-center">Payable</th>
              <th className="text-center">Paid</th>
              <th className="text-center">Due</th>
              <th className="text-center">Invoice</th>
              <th className="text-center">Pay Due</th>
              <th className="text-center">Return</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSales.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-6 text-gray-500">
                  {loading ? "Loading..." : "No sales found"}
                </td>
              </tr>
            ) : (
              paginatedSales.map((sale) => {
                const isExpanded = expandedRows.has(sale.id);
                const paidAmount =
                  sale.payments?.reduce(
                    (acc, p) => acc + parseFloat(p.paid_amount || 0),
                    0
                  ) || 0;
                const dueAmount =
                  parseFloat(sale.total_payable_amount || 0) - paidAmount;
                const returnAmount = 0;

                return (
                  <React.Fragment key={sale.id}>
                    <tr className="hover:bg-gray-50">
                      <td
                        className="text-center cursor-pointer select-none"
                        onClick={() => toggleRow(sale.id)}
                      >
                        {isExpanded ? (
                          <span className="inline-block w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center font-bold text-xs">
                            −
                          </span>
                        ) : (
                          <span className="inline-block w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center font-bold text-xs">
                            +
                          </span>
                        )}
                      </td>
                      <td className="max-w-[250px]">
                        <div className="font-medium">
                          {sale.customer?.customer_name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-600">
                          Contact: {sale.customer?.phone1 || "N/A"}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          Address:{" "}
                          {sale.customer?.address?.replace(/\r\n/g, ", ") ||
                            "N/A"}
                        </div>
                        <div className="text-xs text-gray-600">
                          District: {sale.customer?.district || "N/A"}
                        </div>
                      </td>
                      <td>{sale.invoice_no}</td>
                      <td>{sale.sale_date}</td>
                      <td className="text-center">
                        {parseFloat(sale.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="text-center">
                        {parseFloat(sale.discount_amount || 0).toFixed(2)}
                      </td>
                      <td className="text-center">
                        {parseFloat(sale.total_payable_amount || 0).toFixed(2)}
                      </td>
                      <td className="text-center">{paidAmount.toFixed(2)}</td>
                      <td className="text-center">{dueAmount.toFixed(2)}</td>
                      <td className="text-center">
                        <button className="text-blue-600 hover:underline text-sm">
                          Invoice
                        </button>
                      </td>
                      <td className="text-center">
                        <button className="text-blue-600 hover:underline text-sm">
                          Pay
                        </button>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-md rounded-lg bg-red-500 text-sm text-white">
                          Return
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={12} className="p-0">
                          <div className="flex justify-start">
                            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-full max-w-6xl">
                              <table className="table text-sm">
                                <thead className="bg-sky-700 h-5 text-white">
                                  <tr>
                                    <th className="text-center">Item</th>
                                    <th className="text-center">Quantity</th>
                                    <th className="text-center">Price</th>
                                    <th className="text-center">Percentage</th>
                                    <th className="text-center">
                                      Price with %
                                    </th>
                                    <th className="text-center">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sale.products && sale.products.length > 0 ? (
                                    sale.products.map((prod) => (
                                      <tr key={prod.id} className="bg-white">
                                        <td className="truncate">
                                          {prod.product?.category_detail
                                            ?.category_name || ""}{" "}
                                          ({prod.part_no || ""})
                                        </td>
                                        <td className="text-center">
                                          {parseFloat(
                                            prod.sale_quantity || 0
                                          ).toFixed(2)}
                                        </td>
                                        <td className="text-center">
                                          {parseFloat(
                                            prod.sale_price || 0
                                          ).toFixed(2)}
                                        </td>
                                        <td className="text-center">
                                          {parseFloat(
                                            prod.percentage || 0
                                          ).toFixed(2)}%
                                        </td>
                                        <td className="text-center">
                                          {parseFloat(
                                            prod.sale_price_with_percentage || 0
                                          ).toFixed(2)}
                                        </td>
                                        <td className="text-center">
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
                            </div>
                          </div>
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