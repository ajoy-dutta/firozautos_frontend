"use client";

import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../components/AxiosInstance";
import Select from "react-select";
import { jsPDF } from "jspdf";
import AxiosInstance from "../components/AxiosInstance";
import { toast } from "react-hot-toast";

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

  const itemsPerPage = 5;

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
  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/supplier-purchases/");
      setAllPurchases(res.data);
      setPurchases(res.data);
    } catch (err) {
      console.error("Failed to load purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
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
          <div><strong>Address:</strong> ${
            purchase.supplier?.address || "N/A"
          }</div>
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
          <div><strong>Mobile No:</strong> ${
            purchase.supplier?.phone1 || "N/A"
          }</div>
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

  const [banks, setBanks] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [editingPayment, setEditingPayment] = useState(null);

  const [paymentData, setPaymentData] = useState({
    paymentMode: "",
    bankName: "",
    accountNo: "",
    chequeNo: "",
    paidAmount: "",
  });

  const [isBank, setIsBank] = useState(false);
  const [isCheque, setIsCheque] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axiosInstance.get("/banks/");
        const options = res.data.map((bank) => ({
          value: bank.id,
          label: bank.name,
        }));
        setBanks(options);
      } catch (error) {
        console.error("Error fetching banks:", error);
        toast.error("Failed to load banks");
      }
    };

    const fetchPaymentModes = async () => {
      try {
        const res = await axiosInstance.get("/payment-mode/");
        const options = res.data.map((mode) => ({
          value: mode.id,
          label: mode.name,
        }));
        setPaymentModes(options);
      } catch (error) {
        console.error("Error fetching payment modes:", error);
        toast.error("Failed to load payment modes");
      }
    };

    fetchBanks();
    fetchPaymentModes();
  }, []);

  const getBankName = (bankId) => {
    if (!bankId) return "N/A";
    const bank = banks.find((b) => b.value === Number(bankId));
    return bank?.label || "N/A";
  };

  // Handle input changes এ debug logs add করুন
  const handlePaymentChange = (field, value) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));

    if (field === "paymentMode") {
      const selectedMode = paymentModes.find((opt) => opt.value === value);
      const modeLabel = selectedMode ? selectedMode.label.toLowerCase() : "";

      const bankStatus = modeLabel === "bank";
      const chequeStatus = modeLabel === "cheque";

      setIsBank(bankStatus);
      setIsCheque(chequeStatus);
    }
  };

  const handleSavePayment = () => {
    const newPaymentData = {
      payment_mode: paymentData.paymentMode || "",
      bank_name: paymentData.bankName || "",
      account_no: paymentData.accountNo || "",
      cheque_no: paymentData.chequeNo || "",
      paid_amount: paymentData.paidAmount || "0.00",
    };

    console.log("Payment data submitted:", newPaymentData);

    // reset form data
    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: "",
    });
  };

  const handleResetPaymentForm = () => {
    setEditingPayment(null);
    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: "",
    });
  };

  // Updated handleEditClick function with debug logs
  const handleEditClick = (payment) => {
    console.log("Original payment data:", payment);

    const editData = {
      paymentMode: payment.payment_mode ? Number(payment.payment_mode) : "",
      bankName: payment.bank_name ? Number(payment.bank_name) : "",
      accountNo: payment.account_no || "",
      chequeNo: payment.cheque_no || "",
      paidAmount: payment.paid_amount ? String(payment.paid_amount) : "",
    };

    console.log("Setting form data:", editData);
    setPaymentData(editData);

    if (payment.payment_mode && paymentModes.length > 0) {
      const selectedMode = paymentModes.find(
        (opt) => opt.value === Number(payment.payment_mode)
      );
      if (selectedMode) {
        const modeLabel = selectedMode.label.toLowerCase();
        setIsBank(modeLabel === "bank");
        setIsCheque(modeLabel === "cheque");
      } else {
        setIsBank(false);
        setIsCheque(false);
      }
    } else {
      setIsBank(false);
      setIsCheque(false);
    }

    setEditingPayment(payment.id);
    console.log("Edit mode set for payment ID:", payment.id);
  };

  const getPaymentModeName = (id) => {
    const mode = paymentModes.find((pm) => pm.value === Number(id));
    return mode?.label || "N/A";
  };

  const handleUpdatePayment = () => {
    const updatedData = {
      payment_mode: paymentData.paymentMode || "",
      bank_name: paymentData.bankName || "",
      account_no: paymentData.accountNo || "",
      cheque_no: paymentData.chequeNo || "",
      paid_amount: paymentData.paidAmount || "0.00",
    };

    console.log("Update Payment Data:", updatedData);
    console.log("Editing Payment ID:", editingPayment);

    // Reset state
    setEditingPayment(null);
    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: "",
    });
  };

  const [stockData, setStockData] = useState([]);
  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().slice(0, 10),
    productName: "",
    purchaseQty: "",
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
  const [returnModalPurchase, setReturnModalPurchase] = useState(null);

  const fetchStockData = async () => {
    try {
      const response = await axiosInstance.get("/stocks/");
      setStockData(response.data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  useEffect(() => {
    if (returnModalPurchase && returnModalPurchase.products.length === 1) {
      const product = returnModalPurchase.products[0];
      handleProductSelect(product);
      setFormData((prev) => ({
        ...prev,
        selectedProductIndex: 0,
        productName: product.product?.product_name || "",
        purchaseQty: product.purchase_quantity || "",
        price: product.purchase_price || "",
      }));
    }
  }, [returnModalPurchase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReturnQtyChange = (e) => {
    const inputValue = e.target.value;
    const price = parseFloat(formData.price) || 0;

    const returnQty = isNaN(parseFloat(inputValue))
      ? 0
      : Math.max(0, parseFloat(inputValue));
    const returnAmount = (returnQty * price).toFixed(2);

    setFormData({
      ...formData,
      returnQty: inputValue,
      returnAmount,
    });

    setErrors({ ...errors, returnQty: "" });
  };

  const handleProductSelect = (selectedProduct) => {
    const matchedStock = stockData.find(
      (stock) => stock.product?.id === selectedProduct.product?.id
    );
    console.log(selectedProduct);

    setFormData((prev) => ({
      ...prev,
      productName: selectedProduct.product?.product_name || "",
      purchaseQty: selectedProduct.purchase_quantity || "",
      price: selectedProduct.purchase_price || "",
      partNo: selectedProduct.part_no || "",
      currentQty: matchedStock?.current_stock_quantity || "0",
      alreadyReturnQty: selectedProduct.returned_quantity || "0",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Parse numbers safely
    const finalReturnQty = parseFloat(formData.returnQty) || 0;
    const purchaseQty = parseFloat(formData.purchaseQty) || 0;
    const alreadyReturnedQty =
      parseFloat(returnModalPurchase.total_returned_quantity) || 0;

    // Validation: return qty > 0
    if (finalReturnQty <= 0) {
      setErrors({ ...errors, returnQty: "Please enter a valid quantity" });
      return;
    }

    // Validation: total returned can't exceed purchase quantity
    if (finalReturnQty + alreadyReturnedQty > purchaseQty) {
      toast.error("Total return quantity cannot exceed purchase quantity!");
      return;
    }

    // Get purchase_product id
    const purchaseProductId =
      returnModalPurchase.products[formData.selectedProductIndex]?.id;

    if (!purchaseProductId) {
      toast.error("Invalid product selected!");
      return;
    }

    // Prepare data (exact field name as model expects)
    const dataToPost = {
      purchase_product_id: purchaseProductId,
      quantity: finalReturnQty,
    };

    try {
      const response = await axiosInstance.post(
        "supplier-purchase-returns/",
        dataToPost
      );
      console.log("Posted successfully:", response.data);

      toast.success("Return created successfully");

      await fetchStockData();
      await fetchPurchases();

      // Reset modal & form
      document.getElementById("return_modal").close();
      setReturnModalPurchase(null);
      setFormData({
        returnDate: new Date().toISOString().slice(0, 10),
        productName: "",
        purchaseQty: "",
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

  const [returnData, setReturnData] = useState([]);

  useEffect(() => {
    const fetchReturnData = async () => {
      if (returnModalPurchase?.invoice_no) {
        try {
          const response = await axiosInstance.get(
            `/supplier-purchase-returns/?invoice_no=${returnModalPurchase.invoice_no}`
          );
          console.log("Return data:", response.data);
          setReturnData(response.data); // optional: use it in UI
        } catch (error) {
          console.error("Error fetching return data:", error);
        }
      }
    };

    fetchReturnData();
  }, [returnModalPurchase?.invoice_no]);

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
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table text-sm">
          <thead className="bg-sky-800 text-white">
            <tr>
              {/* <th className="w-12">#</th> */}
              <th className="w-12"></th>
              <th className="max-w-[200px]">Supplier Details</th>
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
                      {/* <td className="text-center">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td> */}
                      <td
                        className="text-center cursor-pointer select-none"
                        onClick={() => toggleRow(purchase.id)}
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
                      <td>{purchase.invoice_no}</td>
                      <td>{purchase.purchase_date}</td>
                      <td className="text-center">
                        {parseFloat(purchase.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="text-center">
                        {parseFloat(purchase.discount_amount || 0).toFixed(2)}
                      </td>
                      <td className="text-center">
                        {parseFloat(purchase.total_payable_amount || 0).toFixed(
                          2
                        )}
                      </td>
                      <td className="text-center">{paidAmount.toFixed(2)}</td>
                      <td className="text-center">{dueAmount.toFixed(2)}</td>
                      <td className="text-center">
                        <button
                          className="text-blue-600 hover:underline text-sm"
                          onClick={() => handleGeneratePdf(purchase)}
                        >
                          Invoice
                        </button>
                      </td>
                      <td className="text-center">
                        <button
                          className="text-blue-600 hover:underline text-sm"
                          onClick={() => setPayModalPurchase(purchase)}
                        >
                          Pay
                        </button>
                      </td>
                      <td className="text-center">
                        {/* Your return button */}
                        <button
                          className="btn btn-md rounded-lg bg-red-500 text-sm text-white"
                          onClick={() => {
                            setReturnModalPurchase(purchase);
                            setTimeout(() => {
                              const modal =
                                document.getElementById("return_modal");
                              modal?.showModal();
                            }, 0);
                          }}
                        >
                          Return
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={11} className="p-0">
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
                                  {purchase.products &&
                                  purchase.products.length > 0 ? (
                                    purchase.products.map((prod) => (
                                      <tr key={prod.id} className="bg-white">
                                        <td className="truncate">
                                          {prod.product?.category_detail
                                            ?.category_name || ""}{" "}
                                          ({prod.product?.part_no || ""})
                                        </td>
                                        <td className="text-center">
                                          {parseFloat(
                                            prod.purchase_quantity || 0
                                          ).toFixed(2)}
                                        </td>
                                        <td className="text-center">
                                          {parseFloat(
                                            prod.purchase_price || 0
                                          ).toFixed(2)}
                                        </td>
                                        <td className="text-center">
                                          {parseFloat(
                                            prod.percentage || 0
                                          ).toFixed(2)}
                                        </td>
                                        <td className="text-center">
                                          {parseFloat(
                                            prod.purchase_price_with_percentage ||
                                              0
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

      {payModalPurchase && (
        <dialog id="pay_modal" className="modal modal-open">
          <div className="modal-box max-w-4xl relative">
            {/* Cross (✕) close button in top-right corner */}
            <button
              onClick={() => {
                setPayModalPurchase(null);
                setPaymentData({
                  paymentMode: "",
                  bankName: "",
                  accountNo: "",
                  chequeNo: "",
                  paidAmount: "",
                });
              }}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>

            <h3 className="font-bold text-lg mb-4">
              Payment Details for Invoice: {payModalPurchase.invoice_no}
            </h3>

            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {/* Payment Mode */}

                <div>
                  <label className="block text-sm mb-1 font-medium">
                    Payment Mode*
                  </label>
                  <Select
                    options={paymentModes}
                    value={
                      paymentData.paymentMode
                        ? paymentModes.find(
                            (opt) =>
                              opt.value === Number(paymentData.paymentMode)
                          ) || null
                        : null
                    }
                    onChange={(selected) =>
                      handlePaymentChange("paymentMode", selected?.value || "")
                    }
                    placeholder="Select"
                    className="text-sm"
                    styles={customSelectStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 font-medium">
                    Bank Name
                  </label>

                  <Select
                    options={banks}
                    value={
                      paymentData.bankName
                        ? banks.find(
                            (opt) => opt.value === Number(paymentData.bankName)
                          ) || null
                        : null
                    }
                    onChange={(selected) => {
                      console.log("Bank selected:", selected); // Debug log
                      handlePaymentChange(
                        "bankName",
                        selected ? selected.value : ""
                      );
                    }}
                    placeholder="Select"
                    isClearable
                    isDisabled={!isBank}
                    className="text-sm"
                    styles={customSelectStyles}
                    // Add these props for better debugging
                    onMenuOpen={() => console.log("Menu opened")}
                    onMenuClose={() => console.log("Menu closed")}
                    noOptionsMessage={() => "No banks found"}
                  />
                </div>

                {/* Account No */}
                <div>
                  <label className="block text-sm mb-1 font-medium">
                    Account No
                  </label>
                  <input
                    type="text"
                    value={paymentData.accountNo}
                    onChange={(e) =>
                      handlePaymentChange("accountNo", e.target.value)
                    }
                    disabled={!isBank}
                    className={`w-full border text-sm px-2 py-1 rounded ${
                      !isBank ? "bg-gray-100 text-gray-500" : ""
                    }`}
                    placeholder="Account No"
                  />
                </div>

                {/* Cheque No */}
                <div>
                  <label className="block text-sm mb-1 font-medium">
                    Cheque No
                  </label>
                  <input
                    type="text"
                    value={paymentData.chequeNo}
                    onChange={(e) =>
                      handlePaymentChange("chequeNo", e.target.value)
                    }
                    disabled={!isCheque}
                    className={`w-full border px-2 py-1 text-sm rounded ${
                      !isCheque ? "bg-gray-100 text-gray-400" : ""
                    }`}
                    placeholder="Cheque No"
                  />
                </div>

                {/* Paid Amount */}
                <div>
                  <label className="block text-sm mb-1 font-medium">
                    Paid Amount*
                  </label>
                  <input
                    type="number"
                    value={paymentData.paidAmount}
                    onChange={(e) =>
                      handlePaymentChange("paidAmount", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-5 mt-5">
                {/* Reset Button */}
                <button
                  type="button"
                  onClick={handleResetPaymentForm}
                  className="px-4 py-2 border text-sm rounded hover:bg-gray-100"
                >
                  Reset
                </button>

                {editingPayment ? (
                  // edit mode এ থাকলে Update button
                  <button
                    type="button"
                    onClick={handleUpdatePayment}
                    className="px-4 py-2 bg-green-700 text-sm text-white rounded hover:bg-green-600"
                  >
                    Update
                  </button>
                ) : (
                  // না থাকলে Save button
                  <button
                    type="button"
                    onClick={handleSavePayment}
                    className="px-4 py-2 bg-sky-800 text-sm text-white rounded hover:bg-sky-700"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>

            {/* Existing payment table */}
            <div className="overflow-x-auto rounded-box border border-base-content/5 mt-8 bg-base-100">
              <table className="table text-sm">
                <thead className="bg-sky-800 text-white">
                  <tr>
                    <th className="text-center">SL</th>
                    <th className="text-center">Due Date</th>
                    <th className="text-center">Payment Mode</th>
                    <th className="text-center">Bank Name</th>
                    <th className="text-center">Account Number</th>
                    <th className="text-center">Cheque Number</th>
                    <th className="text-center">Amount</th>
                    <th className="text-center">Create Date</th>
                    <th className="text-center">Due Invoice</th>
                    <th className="text-center">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {payModalPurchase.payments?.length > 0 ? (
                    payModalPurchase.payments.map((payment, idx) => (
                      <tr key={payment.id}>
                        <td className="text-center">{idx + 1}</td>
                        <td className="text-center">
                          {payment.due_date || "N/A"}
                        </td>
                        <td>{getPaymentModeName(payment.payment_mode)}</td>

                        <td className="text-center">
                          {getBankName(payment.bank_name)}
                        </td>
                        <td className="text-center">
                          {payment.account_no || "N/A"}
                        </td>
                        <td className="text-center">
                          {payment.cheque_no || "N/A"}
                        </td>
                        <td className="text-center">
                          {parseFloat(payment.paid_amount || 0).toFixed(2)}
                        </td>
                        <td className="text-center">
                          {payment.created_at?.slice(0, 10) || "N/A"}
                        </td>
                        <td className="text-center">
                          {payment.due_invoice || "N/A"}
                        </td>
                        <td className="text-center">
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => handleEditClick(payment)}
                          >
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
          </div>

          {/* Click outside to close */}
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setPayModalPurchase(null)}>close</button>
          </form>
        </dialog>
      )}

      {/* Modal Dialog */}
      {returnModalPurchase && (
        <dialog id="return_modal" className="modal">
          <div className="modal-box bg-white rounded-lg shadow-lg max-w-4xl w-full p-4">
            <form method="dialog">
              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  setReturnModalPurchase(null);
                  setFormData({
                    returnDate: new Date().toISOString().slice(0, 10),
                    productName: "",
                    purchaseQty: "",
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
              Add Product Return for Invoice: {returnModalPurchase.invoice_no}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="space-y-3 text-sm grid gap-2 grid-cols-5"
            >
              <div>
                <label className="block font-medium mb-1">Return Date:</label>
                <input
                  type="date"
                  name="return_date"
                  value={formData.returnDate}
                  onChange={(e) =>
                    setFormData({ ...formData, returnDate: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>

              {/* Product Selection - Updated */}
              <div className="col-span-1">
                <label className="block font-medium mb-1">Product Name:</label>
                {returnModalPurchase.products.length > 1 ? (
                  <select
                    name="selectedProductIndex"
                    className="w-full border rounded px-2 py-1"
                    onChange={(e) => {
                      const selectedIndex = e.target.value;
                      const selectedProduct =
                        returnModalPurchase.products[selectedIndex];
                      handleProductSelect(selectedProduct);
                      setFormData((prev) => ({
                        ...prev,
                        selectedProductIndex: parseInt(selectedIndex),
                      }));
                    }}
                    required
                  >
                    <option value="">Select a product</option>
                    {returnModalPurchase.products.map((product, index) => (
                      <option key={index} value={index}>
                        {product.product?.product_name || "Unknown Product"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={
                      returnModalPurchase.products[0]?.product?.product_name ||
                      ""
                    }
                    readOnly
                    className="w-full border rounded px-2 py-1 bg-gray-100"
                  />
                )}
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Purchase Quantity:
                </label>
                <input
                  type="number"
                  name="purchaseQty"
                  value={
                    formData.purchaseQty ||
                    (returnModalPurchase.products.length === 1
                      ? returnModalPurchase.products[0]?.purchase_quantity
                      : "")
                  }
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                  required
                />
              </div>
              {/* Current Stock Quantity - Fixed */}
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
                    (returnModalPurchase.products.length === 1
                      ? returnModalPurchase.products[0]?.purchase_price
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
                  name="due_amount"
                  step="0.01"
                  defaultValue={
                    parseFloat(returnModalPurchase.total_payable_amount || 0) -
                    (returnModalPurchase.payments?.reduce(
                      (acc, p) => acc + parseFloat(p.paid_amount || 0),
                      0
                    ) || 0)
                  }
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Already Return Quantity:
                </label>
                <input
                  type="number"
                  name="already_return_qty"
                  value={formData.alreadyReturnQty || ""}
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Return Quantity:
                </label>
                <input
                  type="number"
                  name="returnQty"
                  value={formData.returnQty}
                  onChange={handleReturnQtyChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Return Amount:</label>
                <input
                  type="text"
                  name="returnAmount"
                  value={formData.returnAmount}
                  readOnly
                  className="w-full border rounded px-2 py-1 bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Return Remarks:
                </label>
                <input
                  name="return_remarks"
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div className="col-span-5 flex justify-center space-x-2 pt-3">
                <button
                  type="reset"
                  className="px-4 py-2 border rounded hover:bg-gray-100"
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

              {returnData && returnData.length > 0 ? (
                <table className="table w-full border text-sm mt-4">
                  <thead className="bg-sky-800 text-white">
                    <tr className="text-sm whitespace-nowrap">
                      <th className="border px-2 py-2 text-center">SL</th>
                      <th className="border px-2 py-2 text-center">
                        Return Date
                      </th>
                      <th className="border px-2 py-2 text-center">
                        Product Name
                      </th>
                      <th className="border px-2 py-2 text-center">Part No</th>
                      <th className="border px-2 py-2 text-center">
                        Company Name
                      </th>
                      <th className="border px-2 py-2 text-center">
                        Purchased Qty
                      </th>
                      <th className="border px-2 py-2 text-center">
                        Returned Qty
                      </th>
                      <th className="border px-2 py-2 text-center">
                        Returned Amount
                      </th>
                      <th className="border px-2 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border px-3 py-2 text-center">
                          {index + 1}
                        </td>
                        <td className="border text-center px-3 py-2">
                          {item.return_date
                            ? new Date(item.return_date).toLocaleString(
                                "en-GB",
                                {
                                  dateStyle: "short",
                                }
                              )
                            : "N/A"}
                        </td>
                        <td className="border text-center px-3 py-2">
                          {item.purchase_product?.product?.product_name ||
                            "N/A"}
                        </td>
                        <td className="border text-center px-3 py-2">
                          {item.purchase_product?.product?.part_no || "N/A"}
                        </td>
                        <td className="border text-center px-3 py-2">
                          {item.purchase_product?.product?.category_detail
                            ?.company_detail?.company_name || "N/A"}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {item.purchase_product?.purchase_quantity || 0}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {item.quantity || 0}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {(
                            parseFloat(
                              item.purchase_product?.purchase_price || 0
                            ) * parseFloat(item.quantity || 0)
                          ).toFixed(2)}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => handleEditReturn(item)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center  text-gray-500">
                 
                </div>
              )}
            </form>
          </div>

          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
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
