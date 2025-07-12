"use client";

import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import axiosInstance from "../../components/AxiosInstance";
import toast from "react-hot-toast";

export default function SalesList() {
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "30px",
      height: "30px",
      fontSize: "0.875rem",
      border: "1px solid #000000",
      borderRadius: "0.275rem",
      borderColor: state.isFocused ? "#000000" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #000000" : "none",
      // Remove default padding
      paddingTop: "0px",
      paddingBottom: "0px",
      // Ensure flex alignment
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
      fontSize: "0.875rem",
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
      height: "16px", // Shorter separator
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

  // State declarations
  const [allSales, setAllSales] = useState([]);
  const [sales, setSales] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [returnModalSale, setReturnModalSale] = useState(null);
  const [returnData, setReturnData] = useState([]);
  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().slice(0, 10),
    productName: "",
    saleQty: "",
    currentQty: "",
    price: "",
    dueAmount: "",
    alreadyReturnQty: "",
    returnQty: "",
    returnAmount: "",
    returnRemarks: "",
    selectedProductIndex: 0,
  });
  const [errors, setErrors] = useState({});

  const [filters, setFilters] = useState({
    customer: null,
    district: null,
    billNo: "",
  });

  const itemsPerPage = 5;
  const returnModalRef = useRef(null);

  // Data fetching functions
  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/sales/");
      setAllSales(res.data);
      setSales(res.data);
    } catch (err) {
      console.error("Failed to load sales:", err);
      toast.error("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStockData = async () => {
    try {
      const response = await axiosInstance.get("/stocks/");
      setStockData(response.data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      toast.error("Failed to load stock data");
    }
  };

  // Add this function to fetch return data
  const fetchReturnData = async () => {
    try {
      const response = await axiosInstance.get("/sale-returns/");
      setReturnData(response.data);
    } catch (error) {
      console.error("Error fetching return data:", error);
      toast.error("Failed to load return data");
    }
  };

  // Initial data loading
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchSales(),
          fetchStockData(),
          fetchReturnData(), // Add return data fetching to initial load
          axiosInstance.get("/districts/").then((res) => {
            setDistricts(res.data.map((d) => ({ value: d.id, label: d.name })));
          }),
          axiosInstance.get("/customers/").then((res) => {
            setCustomers(
              res.data.map((c) => ({
                value: c.id,
                label: c.customer_name,
              }))
            );
          }),
        ]);
      } catch (error) {
        console.error("Initial data loading failed:", error);
      }
    };

    fetchInitialData();
  }, []);

  // Toggle row expansion
  const toggleRow = (id) => {
    const newExpandedRows = new Set(expandedRows);
    newExpandedRows.has(id)
      ? newExpandedRows.delete(id)
      : newExpandedRows.add(id);
    setExpandedRows(newExpandedRows);
  };

  // Filtering logic
  useEffect(() => {
    let filtered = [...allSales];

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
        s.invoice_no
          ?.toLowerCase()
          .includes(filters.billNo.trim().toLowerCase())
      );
    }

    setSales(filtered);
    setCurrentPage(1);
  }, [filters, allSales]);

  // Filter handlers
  const handleCustomerChange = (selectedOption) => {
    setFilters((prev) => ({ ...prev, customer: selectedOption }));
  };

  const handleDistrictChange = (selectedOption) => {
    setFilters((prev) => ({ ...prev, district: selectedOption }));
  };

  const handleBillNoChange = (e) => {
    setFilters((prev) => ({ ...prev, billNo: e.target.value }));
  };

  const handleOpenReturnModal = (sale) => {
    if (!sale || !sale.products || sale.products.length === 0) {
      toast.error("Invalid sale data");
      return;
    }

    const firstProduct = sale.products[0];
    const matchedStock = stockData.find(
      (stock) => stock.product?.id === firstProduct.product?.id
    );

    const alreadyReturnedQty = returnData
      .filter((returnItem) => returnItem.sale_product?.id === firstProduct.id)
      .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

    const dueAmount = (
      parseFloat(sale.total_payable_amount || 0) -
      (sale.payments?.reduce(
        (acc, p) => acc + parseFloat(p.paid_amount || 0),
        0
      ) || 0)
    ).toFixed(2);

    setReturnModalSale(sale);

    // Initialize all fields immediately
    setFormData({
      returnDate: new Date().toISOString().slice(0, 10),
      productName: firstProduct.product?.product_name || "",
      saleQty: firstProduct.sale_quantity || "",
      currentQty: matchedStock?.current_stock_quantity || "0",
      price: firstProduct.sale_price || "",
      dueAmount: dueAmount,
      alreadyReturnQty: alreadyReturnedQty.toString(),
      returnQty: "",
      returnAmount: "",
      returnRemarks: "",
      selectedProductIndex: 0,
    });

    setErrors({});
    returnModalRef.current?.showModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReturnQtyChange = (e) => {
    const inputValue = e.target.value;
    const price = parseFloat(formData.price) || 0;
    const returnQty = Math.max(0, parseFloat(inputValue) || 0);
    const returnAmount = (returnQty * price).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      returnQty: inputValue,
      returnAmount,
    }));

    setErrors((prev) => ({ ...prev, returnQty: "" }));
  };

  const handleProductSelectChange = (e) => {
    const selectedIndex = parseInt(e.target.value);
    const selectedProduct = returnModalSale.products[selectedIndex];

    const matchedStock = stockData.find(
      (stock) => stock.product?.id === selectedProduct.product?.id
    );

    const alreadyReturnedQty = returnData
      .filter(
        (returnItem) => returnItem.sale_product?.id === selectedProduct.id
      )
      .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

    setFormData((prev) => ({
      ...prev,
      productName: selectedProduct.product?.product_name || "",
      saleQty: selectedProduct.sale_quantity || "",
      currentQty: matchedStock?.current_stock_quantity || "0",
      price: selectedProduct.sale_price || "",
      alreadyReturnQty: alreadyReturnedQty.toString(),
      selectedProductIndex: selectedIndex,
      returnQty: "",
      returnAmount: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalReturnQty = parseFloat(formData.returnQty) || 0;
    const saleQty = parseFloat(formData.saleQty) || 0;
    const alreadyReturnedQty = parseFloat(formData.alreadyReturnQty) || 0;

    // Validation
    if (finalReturnQty <= 0) {
      setErrors({ ...errors, returnQty: "Please enter a valid quantity" });
      return;
    }

    if (finalReturnQty + alreadyReturnedQty > saleQty) {
      toast.error("Total return quantity cannot exceed sale quantity!");
      return;
    }

    const saleProductId =
      returnModalSale.products[formData.selectedProductIndex]?.id;
    if (!saleProductId) {
      toast.error("Invalid product selected!");
      return;
    }

    try {
      const response = await axiosInstance.post("/sale-returns/", {
        sale_product_id: saleProductId,
        quantity: finalReturnQty,
        return_date: formData.returnDate,
        remarks: formData.returnRemarks,
      });

      toast.success("Return created successfully");

      // Refresh all three datasets after successful return submission
      await Promise.all([
        fetchStockData(),
        fetchSales(),
        fetchReturnData(), // Add this line to refresh return data
      ]);

      // Close modal and reset
      returnModalRef.current?.close();
      setReturnModalSale(null);
      setFormData({
        returnDate: new Date().toISOString().slice(0, 10),
        productName: "",
        saleQty: "",
        currentQty: "",
        price: "",
        dueAmount: "",
        alreadyReturnQty: "",
        returnQty: "",
        returnAmount: "",
        returnRemarks: "",
        selectedProductIndex: 0,
      });
      setErrors({});
    } catch (error) {
      console.error("Error posting return:", error);
      toast.error("Failed to create return");
    }
  };

  // Pagination
  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const paginatedSales = sales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 max-w-3xl md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Customer</label>
          <Select
            options={customers}
            isClearable
            onChange={handleCustomerChange}
            placeholder="Select Customer"
            className="text-sm"
            styles={customSelectStyles}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">District</label>
          <Select
            options={districts}
            isClearable
            onChange={handleDistrictChange}
            placeholder="Select District"
            className="text-sm"
            styles={customSelectStyles}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bill No</label>
          <input
            type="text"
            value={filters.billNo}
            onChange={handleBillNoChange}
            className="w-full border  px-3 py-1 rounded text-sm "
            placeholder="Enter Bill No"
          />
        </div>
      </div>

      {/* Table */}
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
                        <button
                          className="btn btn-md rounded-lg bg-red-500 text-sm text-white"
                          onClick={() => handleOpenReturnModal(sale)}
                        >
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
                                  {sale.products?.length > 0 ? (
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
                                          ).toFixed(2)}
                                          %
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

      {/* Return Modal */}
      <dialog ref={returnModalRef} className="modal">
        {returnModalSale && (
          <div className="modal-box bg-white rounded-lg shadow-lg max-w-4xl w-full p-4">
            <form method="dialog">
              <button
                type="button"
                onClick={() => {
                  returnModalRef.current?.close();
                  setReturnModalSale(null);
                  setFormData({
                    returnDate: new Date().toISOString().slice(0, 10),
                    productName: "",
                    saleQty: "",
                    currentQty: "",
                    price: "",
                    dueAmount: "",
                    alreadyReturnQty: "",
                    returnQty: "",
                    returnAmount: "",
                    returnRemarks: "",
                    selectedProductIndex: 0,
                  });
                  setErrors({});
                }}
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              >
                ✕
              </button>
            </form>

            <h3 className="font-bold text-lg mb-4">
              Add Product Return for Invoice: {returnModalSale.invoice_no}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="space-y-3 text-sm grid gap-2 grid-cols-5"
            >
              <div>
                <label className="block font-medium mb-1">Return Date:</label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>

              {/* Product Selection */}
              <div className="col-span-1">
                <label className="block font-medium mb-1">Product Name:</label>

                {/* For single product, show as read-only input */}
                {returnModalSale.products.length === 1 ? (
                  <input
                    type="text"
                    value={
                      returnModalSale.products[0]?.product?.product_name || ""
                    }
                    readOnly
                    className="w-full border rounded px-2 py-1 bg-gray-100"
                  />
                ) : (
                  <select
                    name="selectedProductIndex"
                    value={formData.selectedProductIndex}
                    className="w-full border rounded px-2 py-1"
                    onChange={handleProductSelectChange}
                    required
                  >
                    {returnModalSale.products.map((product, index) => (
                      <option key={index} value={index}>
                        {product.product?.product_name || "Unknown Product"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-medium mb-1">Sale Quantity:</label>
                <input
                  type="number"
                  name="saleQty"
                  value={
                    formData.saleQty ||
                    (returnModalSale.products.length === 1
                      ? returnModalSale.products[0]?.sale_quantity
                      : "")
                  }
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Current Stock:</label>
                <input
                  type="number"
                  name="currentQty"
                  value={formData.currentQty || ""}
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Price:</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  value={
                    formData.price ||
                    (returnModalSale.products.length === 1
                      ? returnModalSale.products[0]?.sale_price
                      : "")
                  }
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Due Amount:</label>
                <input
                  type="number"
                  name="dueAmount"
                  step="0.01"
                  value={(
                    parseFloat(returnModalSale.total_payable_amount || 0) -
                    (returnModalSale.payments?.reduce(
                      (acc, p) => acc + parseFloat(p.paid_amount || 0),
                      0
                    ) || 0)
                  ).toFixed(2)}
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Already Return Quantity:
                </label>
                <input
                  type="number"
                  name="alreadyReturnQty"
                  value={formData.alreadyReturnQty || ""}
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Return Quantity:*
                </label>
                <input
                  type="number"
                  name="returnQty"
                  value={formData.returnQty}
                  onChange={handleReturnQtyChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                {errors.returnQty && (
                  <p className="text-red-500 text-xs">{errors.returnQty}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Return Amount:*
                </label>
                <input
                  type="text"
                  name="returnAmount"
                  value={formData.returnAmount}
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                  required
                />
              </div>

              <div className="">
                <label className="block font-medium mb-1">
                  Return Remarks:
                </label>
                <input
                  name="returnRemarks"
                  value={formData.returnRemarks}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div className="col-span-5 flex justify-center space-x-2 pt-3">
                <button
                  type="reset"
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => {
                    const selectedProduct =
                      returnModalSale.products[formData.selectedProductIndex];
                    const matchedStock = stockData.find(
                      (stock) =>
                        stock.product?.id === selectedProduct.product?.id
                    );
                    const alreadyReturnedQty = returnData
                      .filter(
                        (returnItem) =>
                          returnItem.sale_product?.id === selectedProduct.id
                      )
                      .reduce(
                        (sum, item) => sum + (parseFloat(item.quantity) || 0),
                        0
                      );
                    const dueAmount = (
                      parseFloat(returnModalSale.total_payable_amount || 0) -
                      (returnModalSale.payments?.reduce(
                        (acc, p) => acc + parseFloat(p.paid_amount || 0),
                        0
                      ) || 0)
                    ).toFixed(2);

                    setFormData({
                      returnDate: new Date().toISOString().slice(0, 10),
                      productName: selectedProduct.product?.product_name || "",
                      saleQty: selectedProduct.sale_quantity || "",
                      currentQty: matchedStock?.current_stock_quantity || "0",
                      price: selectedProduct.sale_price || "",
                      dueAmount: dueAmount,
                      alreadyReturnQty: alreadyReturnedQty.toString(),
                      returnQty: "",
                      returnAmount: "",
                      returnRemarks: "",
                      selectedProductIndex: formData.selectedProductIndex,
                    });
                    setErrors({});
                  }}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="bg-sky-800 text-white px-4 py-2 rounded hover:bg-sky-700"
                >
                  Save
                </button>
              </div>
            </form>

            <div className="mt-2">
              {/* <h4 className="font-semibold text-md mb-3">
                Previous Returns for This Sale
              </h4> */}

              <div className="overflow-x-auto">
                {/* Check if there's any return data matching this sale */}
                {returnData?.some((item) =>
                  returnModalSale?.products?.some(
                    (product) => product.id === item.sale_product?.id
                  )
                ) ? (
                  // Show table if matching returns exist
                  <table className="table table-zebra text-sm w-full">
                    <thead className="bg-sky-800 text-sm text-white">
                      <tr>
                        <th className="text-center">SL</th>
                        <th className="text-center">Return Date</th>
                        <th className="text-center">Product Name</th>
                        <th className="text-center">Part No</th>
                        <th className="text-center">Company</th>
                        <th className="text-center">Sold Qty</th>
                        <th className="text-center">Returned Qty</th>
                        <th className="text-center">Returned Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnData
                        .filter((item) =>
                          returnModalSale?.products?.some(
                            (product) => product.id === item.sale_product?.id
                          )
                        )
                        .map((item, index) => (
                          <tr key={item.id}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">
                              {item.return_date
                                ? new Date(item.return_date).toLocaleString(
                                    "en-GB",
                                    {
                                      dateStyle: "short",
                                    }
                                  )
                                : "N/A"}
                            </td>
                            <td className="text-center">
                              {item.sale_product?.product?.product_name ||
                                "N/A"}
                            </td>
                            <td className="text-center">
                              {item.sale_product?.part_no || "N/A"}
                            </td>
                            <td className="text-center">
                              {item.sale_product?.product?.category_detail
                                ?.company_detail?.company_name || "N/A"}
                            </td>
                            <td className="text-center">
                              {item.sale_product?.sale_quantity || 0}
                            </td>
                            <td className="text-center">
                              {item.quantity || 0}
                            </td>
                            <td className="text-center">
                              {(
                                parseFloat(item.sale_product?.sale_price || 0) *
                                parseFloat(item.quantity || 0)
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center  text-gray-500"></div>
                )}
              </div>
            </div>
          </div>
        )}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

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
