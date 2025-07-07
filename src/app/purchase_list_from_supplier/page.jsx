"use client";

import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../components/AxiosInstance";
import Select from "react-select";
import { jsPDF } from "jspdf";

export default function PurchaseList() {
  const [allPurchases, setAllPurchases] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [payModalPurchase, setPayModalPurchase] = useState(null);
  const [companies, setCompanies] = useState([]);

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
      .then((res) => {
        const options = res.data.map((d) => ({
          value: d.id,
          label: d.name,
        }));
        setDistricts(options);
      })
      .catch((err) => console.error("Failed to load districts:", err));
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

  useEffect(() => {
    axiosInstance
      .get("/companies/")
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error("Failed to load companies:", err));
  }, []);

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

const handleGeneratePdf = (purchase) => {
  // Calculate safely
  const totalQty = purchase.products.reduce(
    (sum, item) => sum + parseFloat(item.purchase_quantity || 0),
    0
  );
  const totalAmount = parseFloat(purchase.total_amount || 0);
  const discount = parseFloat(purchase.discount_amount || 0);
  const grossTotal = totalAmount - discount;
  const paidAmount =
    purchase.payments?.reduce(
      (sum, payment) => sum + parseFloat(payment.paid_amount || 0),
      0
    ) || 0;
  const dueBalance = grossTotal - paidAmount;
  const previousBalance = parseFloat(
    purchase.supplier?.previous_due_amount || 0
  );
  const totalDueBalance = previousBalance + dueBalance;

  // Current date/time for footer
  const now = new Date();
  const printDate = now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const htmlContent = `
  <html>
  <head>
    <style>
      body {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        margin: 0; 
        padding: 15px; 
        padding-bottom:0px;
        font-size: 14px;
        box-sizing: border-box;
        font-family: Arial;
      }
      .header { text-align: center; margin-bottom: 10px; line-height: 1.4; }
      .company-name { font-size: 20px; font-weight: bold; }
      .subtitle { font-size: 16px; font-weight: semibold; }
      .supplier-subtext {
  color: #444444;
  font-size: 12px;
  font-style: normal; 
  margin-top: 2px;
  line-height: 1;
}
      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      th, td { border: 1px solid #000; padding: 6px; }
      .supplier-info {
        display: flex;
        justify-content: space-between;
        margin: 5px 0 10px 0;
        gap: 30px;
      }
      .supplier-info .left-info,
      .supplier-info .right-info {
        flex: 1;
      }
      .supplier-info .left-info {
        text-align: left;
      }
      .supplier-info .right-info {
        text-align: right;
      }
      .supplier-info div div {
        margin-bottom: 4px;
      }
      .calc-table { width: 60%; margin-left: auto; margin-top: 15px; }
      .calc-table td:last-child { text-align: right; }
      .title { font-weight: bold; margin: 10px 0 5px 0; }
      .text-left { text-align: left; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .main-content { flex: 1; }
      .bottom-section { 
        margin-top: auto; 
        padding-top: 20px;
      }
      .signature-container { 
        display: flex; 
        justify-content: space-between; 
        margin: 30px 0 20px 0; 
      }
      .signature { 
        text-align: center; 
        width: 45%; 
      }
      .signature-line { 
        margin-bottom: 2px; 
        border-top: 1px solid #000; 
        width: 100%; 
      }
      .footer-content { 
        display: flex; 
        justify-content: space-between; 
        font-size: 12px; 
        margin: 0;
        padding: 10px 0 0 0;
        border-top: 1px solid #000;
      }
      .footer-left {
        text-align: left;
      }
      .footer-right {
        text-align: right;
      }
    </style>
  </head>
  <body>
    <div class="main-content">
      <div class="header">
        <div class="company-name">Heaven Autos</div>
        <div class="subtitle">A company which fulfill your demands</div>
        <div class="supplier-subtext">Genuine Motorcycle Parts Importer & WholePurchaser.</div>
        <div class="supplier-subtext">77.R.N.Road, Noldanga Road (Heaven Building), Jashore-7400</div>
        <div class="supplier-subtext">Phone:0421-66095, Mob: 01924-331354,01711-355328, 01778-117515</div>
        <div class="supplier-subtext">E-mail : heavenautos77jsr@yahoo.com/heavenautojessore@gmail.com</div>
      </div>

      <div style="text-align: center; font-weight: bold; font-size: 16px; margin: 10px 0;">
        Purchase Invoice
      </div>

      <div class="supplier-info">
        <div class="left-info">
          <div><strong>Bill No:</strong> ${purchase.invoice_no || "N/A"}</div>
          <div><strong>Supplier Name:</strong> ${
            purchase.supplier?.supplier_name || "N/A"
          }</div>
          <div><strong>Address:</strong> ${purchase.supplier?.address || "N/A"}</div>
        </div>
        <div class="right-info">
          <div><strong>Bill Date:</strong> ${
            purchase.purchase_date
              ? new Date(purchase.purchase_date).toLocaleDateString()
              : "N/A"
          }</div>
          <div><strong>Shop Name:</strong> ${
            purchase.supplier?.shop_name || "N/A"
          }</div>
          <div><strong>Mobile No:</strong> ${purchase.supplier?.phone1 || "N/A"}</div>
        </div>
      </div>

      <div class="title">Purchase Info</div>
      <table>
        <thead>
          <tr>
            <th class="text-center">Sl No</th>
            <th class="text-left">Brand Name</th>
            <th class="text-left">Part No</th>
            <th class="text-left">Product Name</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">MRP</th>
            <th class="text-right">Price</th>
            <th class="text-right">Total Taka</th>
          </tr>
        </thead>
        <tbody>
          ${purchase.products
            .map(
              (item, index) => `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td class="text-left">${
                item.product?.category_detail?.company_detail?.company_name ||
                "N/A"
              }</td>
              <td class="text-left">${item.part_no || "N/A"}</td>
              <td class="text-left">${item.product?.product_name || "N/A"}</td>
              <td class="text-right">${parseFloat(
                item.purchase_quantity || 0
              ).toFixed(2)}</td>
              <td class="text-right">${parseFloat(
                item.product?.product_mrp || 0
              ).toFixed(2)}</td>
              <td class="text-right">${parseFloat(
                item.purchase_price || 0
              ).toFixed(2)}</td>
              <td class="text-right">${parseFloat(
                item.total_price || 0
              ).toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
          <tr>
            <td colspan="3" style="border: none;"></td>
            <td class="text-right" style="border: none;"><strong>Total Quantity</strong></td>
            <td class="text-right" style="border: none;"><strong>${totalQty.toFixed(
              2
            )}</strong></td>
            <td colspan="3" style="border: none;"></td>
          </tr>
        </tbody>
      </table>

      <table class="calc-table">
        <tr><td>Total Purchase Amount</td><td>${totalAmount.toFixed(
          2
        )}</td></tr>
        <tr><td>(-) Discount</td><td>${discount.toFixed(2)}</td></tr>
        <tr><td>Gross Total</td><td>${grossTotal.toFixed(2)}</td></tr>
        <tr><td>(+) Previous Balance</td><td>${previousBalance.toFixed(
          2
        )}</td></tr>
        <tr><td>Net Amount</td><td>${grossTotal.toFixed(2)}</td></tr>
        <tr><td>Paid Taka</td><td>${paidAmount.toFixed(2)}</td></tr>
        <tr><td>Returnable Taka</td><td>0.00</td></tr>
        <tr><td>Due Balance</td><td>${dueBalance.toFixed(2)}</td></tr>
        <tr><td>Total Due Balance</td><td>${totalDueBalance.toFixed(
          2
        )}</td></tr>
      </table>
    </div>

    <div class="bottom-section">
      <div class="signature-container">
        <div class="signature">
          <div class="signature-line"></div>
          Supplier Signature
        </div>
        <div class="signature">
          <div class="signature-line"></div>
          Checked, Remarked & Thanked By
          <div style="font-size: 12px; margin-top: 5px;">
            C.E.O & Co - ordinator for Vat and Tax<br/>
            Heaven Autos.
          </div>
        </div>
      </div>
      
      <div class="footer-content">
        <div class="footer-left">
          <div>*Sold goods are not returns (especially Electronics).</div>
          <div>*SAVE TREES, SAVE GENERATIONS.</div>
        </div>
        <div class="footer-right">
          Print : Admin , ${printDate}
        </div>
      </div>
    </div>

    <script>
      setTimeout(() => { window.print(); }, 200);
    </script>
  </body>
  </html>
`;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(htmlContent);
  printWindow.document.close();
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
                        <button
                          className="text-blue-600 hover:underline text-sm"
                          onClick={() => handleGeneratePdf(purchase)}
                        >
                          Invoice
                        </button>
                      </td>
                      <td className="border px-3 py-2 text-center">
                        <button
                          className="text-blue-600 hover:underline text-sm"
                          onClick={() => setPayModalPurchase(purchase)}
                        >
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

      {payModalPurchase && (
        <dialog id="pay_modal" className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">
              Payment Details for Invoice: {payModalPurchase.invoice_no}
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-sm border-collapse">
                <thead className="bg-sky-800 text-white">
                  <tr>
                    <th className="border px-3 py-2">SL</th>
                    <th className="border px-3 py-2">Due Date</th>
                    <th className="border px-3 py-2">Payment Mode</th>
                    <th className="border px-3 py-2">Bank Name</th>
                    <th className="border px-3 py-2">Account Number</th>
                    <th className="border px-3 py-2">Cheque Number</th>
                    <th className="border px-3 py-2 text-right">
                      Transaction Amount
                    </th>
                    <th className="border px-3 py-2">Create Date</th>
                    <th className="border px-3 py-2">Due Invoice</th>
                    <th className="border px-3 py-2">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {payModalPurchase.payments &&
                  payModalPurchase.payments.length > 0 ? (
                    payModalPurchase.payments.map((payment, idx) => (
                      <tr key={payment.id}>
                        <td className="border px-3 py-2 text-center">
                          {idx + 1}
                        </td>
                        <td className="border px-3 py-2">
                          {payment.due_date || "N/A"}
                        </td>
                        <td className="border px-3 py-2">
                          {payment.payment_mode || "N/A"}
                        </td>
                        <td className="border px-3 py-2">
                          {payment.bank_name || "N/A"}
                        </td>
                        <td className="border px-3 py-2">
                          {payment.account_number || "N/A"}
                        </td>
                        <td className="border px-3 py-2">
                          {payment.cheque_number || "N/A"}
                        </td>
                        <td className="border px-3 py-2 text-right">
                          ৳{parseFloat(payment.paid_amount || 0).toFixed(2)}
                        </td>
                        <td className="border px-3 py-2">
                          {payment.created_at?.slice(0, 10) || "N/A"}
                        </td>
                        <td className="border px-3 py-2">
                          {payment.due_invoice || "N/A"}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          <button className="text-blue-600 hover:underline">
                            EDIT
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center py-4 text-gray-500"
                      >
                        No payments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="btn" onClick={() => setPayModalPurchase(null)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

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
