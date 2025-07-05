"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import axiosInstance from "../components/AxiosInstance";
import { toast } from "react-hot-toast";

export default function SupplierProductPurchase() {
  // Custom styles for react-select with vertical centering
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

  // Supplier section states
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierData, setSupplierData] = useState({
    supplierName: "",
    district: "",
    country: "",
    supplierType: "",
    shopName: "",
    phone1: "",
    phone2: "",
    email: "",
    address: "",
    dob: "",
    nidNo: "",
  });

  // Product section states
  const [companyList, setCompanyList] = useState([]);
  const [productList, setProductList] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProductName, setSelectedProductName] = useState(null);
  const [selectedPartNumber, setSelectedPartNumber] = useState(null);

  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [currentStock, setCurrentStock] = useState(0);
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [percentage, setPercentage] = useState("");
  const [purchasePriceWithPercentage, setPurchasePriceWithPercentage] =
    useState("0.00");
  const [totalPrice, setTotalPrice] = useState("0.00");

  const [addedProducts, setAddedProducts] = useState([]);

  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState("");
  const [totalPayableAmount, setTotalPayableAmount] = useState(0);

  // Fetch suppliers, companies and products on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axiosInstance.get("/suppliers/");
        setSuppliers(res.data);
      } catch (error) {
        toast.error("Failed to load suppliers");
      }
    };

    const fetchCompanies = async () => {
      try {
        const res = await axiosInstance.get("/companies/");
        setCompanyList(res.data);
      } catch (err) {
        toast.error("Failed to load companies");
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get("/products/");
        setProductList(res.data);
      } catch (err) {
        toast.error("Failed to load products");
      }
    };

    fetchSuppliers();
    fetchCompanies();
    fetchProducts();
  }, []);

  // Supplier select options
  const supplierOptions = suppliers.map((sup) => ({
    label: sup.supplier_name,
    value: sup.id,
  }));

  // Handle supplier selection + autofill supplier form
  const handleSupplierSelect = (selected) => {
    setSelectedSupplier(selected);
    if (selected) {
      const sup = suppliers.find((s) => s.id === selected.value);
      if (sup) {
        setSupplierData({
          supplierName: sup.supplier_name || "",
          district: sup.district_detail?.name || "",
          country: sup.country || "",
          supplierType: sup.supplier_type_detail?.name || "",
          shopName: sup.shop_name || "",
          phone1: sup.phone1 || "",
          phone2: sup.phone2 || "",
          email: sup.email || "",
          address: sup.address || "",
          dob: sup.date_of_birth || "",
          nidNo: sup.nid_no || "",
        });
      }
    } else {
      setSupplierData({
        supplierName: "",
        district: "",
        country: "",
        supplierType: "",
        shopName: "",
        phone1: "",
        phone2: "",
        email: "",
        address: "",
        dob: "",
        nidNo: "",
      });
    }
  };

  // Supplier input change handler
  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setSupplierData((prev) => ({ ...prev, [name]: value }));
  };

  // Filter products by selected company
  const filteredProducts = selectedCompany
    ? productList.filter((p) => p.company === selectedCompany.value)
    : [];

  // Product name and part no options for selects
  const productNameOptions = filteredProducts.map((p) => ({
    label: p.product_name,
    value: p.id,
    part_no: p.part_no,
    current_stock_quantity: p.current_stock_quantity || 0,
  }));

  const partNumberOptions = filteredProducts.map((p) => ({
    label: p.part_no,
    value: p.part_no,
    product_id: p.id,
    product_name: p.product_name,
    current_stock_quantity: p.current_stock_quantity || 0,
  }));

  // When company changes, reset product selection and fields
  useEffect(() => {
    setSelectedProductName(null);
    setSelectedPartNumber(null);
    setCurrentStock(0);
    setPurchaseQuantity("");
    setPurchasePrice("");
    setPercentage("");
    setPurchasePriceWithPercentage("0.00");
    setTotalPrice("0.00");
  }, [selectedCompany]);

  // Clear related fields when product name or part number clears
  const handleProductNameChange = (val) => {
    if (!val) {
      setSelectedProductName(null);
      setSelectedPartNumber(null);
      setCurrentStock(0);
    } else {
      setSelectedProductName(val);

      // যেহেতু এখন আর useEffect নাই, তাই এইখানে manually set করে দিব
      const prod = filteredProducts.find((p) => p.id === val.value);
      if (prod) {
        setSelectedPartNumber({ label: prod.part_no, value: prod.part_no });
        setCurrentStock(prod.current_stock_quantity || 0);
      }
    }
  };

  const handlePartNumberChange = (val) => {
    if (!val) {
      setSelectedPartNumber(null);
      setSelectedProductName(null);
      setCurrentStock(0);
    } else {
      setSelectedPartNumber(val);

      const prod = filteredProducts.find((p) => p.part_no === val.value);
      if (prod) {
        setSelectedProductName({ label: prod.product_name, value: prod.id });
        setCurrentStock(prod.current_stock_quantity || 0);
      }
    }
  };

  // Auto calculate purchase price with percentage and total price
  useEffect(() => {
    const pPrice = parseFloat(purchasePrice) || 0;
    const perc = parseFloat(percentage) || 0;
    const qty = parseInt(purchaseQuantity) || 0;

    const priceWithPerc = pPrice + (pPrice * perc) / 100;
    setPurchasePriceWithPercentage(priceWithPerc.toFixed(2));

    const tPrice = priceWithPerc * qty;
    setTotalPrice(tPrice.toFixed(2));
  }, [purchasePrice, percentage, purchaseQuantity]);

  // Calculate totals when products or discount change
  useEffect(() => {
    const total = addedProducts.reduce(
      (acc, p) => acc + parseFloat(p.totalPrice),
      0
    );
    setTotalAmount(total);

    const discount = parseFloat(discountAmount) || 0;
    const payable = total - discount;
    setTotalPayableAmount(payable > 0 ? payable : 0);
  }, [addedProducts, discountAmount]);

  // Add product to table
  const addProduct = () => {
    if (!selectedProductName || !purchaseQuantity || !purchasePrice) {
      toast.error("Please select product and enter quantity & price");
      return;
    }

    const newProd = {
      id: selectedProductName.value,
      productName: selectedProductName.label,
      partNumber: selectedPartNumber ? selectedPartNumber.value : "",
      currentStock,
      purchaseQuantity,
      purchasePrice,
      percentage,
      purchasePriceWithPercentage,
      totalPrice,
    };

    setAddedProducts((prev) => [...prev, newProd]);

    // Reset product fields but keep company
    setSelectedProductName(null);
    setSelectedPartNumber(null);
    setCurrentStock(0);
    setPurchaseQuantity("");
    setPurchasePrice("");
    setPercentage("");
    setPurchasePriceWithPercentage("0.00");
    setTotalPrice("0.00");
  };

  // Remove product from table
  const removeProduct = (idx) => {
    setAddedProducts((prev) => prev.filter((_, i) => i !== idx));
  };

  const [paymentModes, setPaymentModes] = useState([]);
  const [banks, setBanks] = useState([]);
  const [paymentData, setPaymentData] = useState({
    paymentMode: "",
    bankName: "",
    accountNo: "",
    chequeNo: "",
    paidAmount: "",
  });
  const [addedPayments, setAddedPayments] = useState([]);

  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pmRes, bankRes] = await Promise.all([
          axiosInstance.get("/payment-mode/"),
          axiosInstance.get("/banks/"),
        ]);
        setPaymentModes(
          pmRes.data.map((pm) => ({
            value: pm.id,
            label: pm.name,
          }))
        );
        setBanks(
          bankRes.data.map((bank) => ({
            value: bank.id,
            label: bank.name,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load payment data");
      }
    };
    fetchData();
  }, []);

  const handlePaymentChange = (name, value) => {
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPayment = () => {
    if (!paymentData.paymentMode || !paymentData.paidAmount) {
      toast.error("Payment Mode and Paid Amount are required");
      return;
    }

    setPayments((prev) => [...prev, paymentData]);

    // reset paymentData
    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: "",
    });
  };

  const selectedPaymentModeLabel = paymentModes.find(
    (pm) => pm.value === paymentData.paymentMode
  )?.label;

  const isCheque = selectedPaymentModeLabel === "Cheque";
  const isBank = selectedPaymentModeLabel === "Bank";

  const handleRemovePayment = (index) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const [totalPaidAmount, setTotalPaidAmount] = useState(0);

  useEffect(() => {
    const total = payments.reduce(
      (sum, payment) => sum + parseFloat(payment.paidAmount || 0),
      0
    );
    setTotalPaidAmount(total);
  }, [payments]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }

    if (addedProducts.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    if (payments.length === 0) {
      toast.error("Please add at least one payment");
      return;
    }

    // Calculate total paid amount
    const totalPaid = payments.reduce(
      (sum, payment) => sum + parseFloat(payment.paidAmount || 0),
      0
    );

    // Prepare the payload
    const payload = {
      invoice_no: "1000",
      supplier_id: selectedSupplier.value,
      company_name: selectedCompany ? selectedCompany.value : null,
      purchase_date: purchaseDate,
      total_amount: totalAmount,
      discount_amount: parseFloat(discountAmount) || 0,
      total_payable_amount: totalPayableAmount,
      total_paid_amount: totalPaid,
      products: addedProducts.map((product) => ({
        product_id: product.id,
        part_no: product.partNumber,
        purchase_quantity: parseInt(product.purchaseQuantity),
        purchase_price: parseFloat(product.purchasePrice),
        percentage: parseFloat(product.percentage) || 0,
        purchase_price_with_percentage: parseFloat(
          product.purchasePriceWithPercentage
        ),
        total_price: parseFloat(product.totalPrice),
      })),
      payments: payments.map((payment) => ({
        payment_mode: payment.paymentMode,
        bank_name: payment.bankName || null,
        account_no: payment.accountNo || null,
        cheque_no: payment.chequeNo || null,
        paid_amount: parseFloat(payment.paidAmount),
      })),
    };
    console.log(payload);

    try {
      const response = await axiosInstance.post(
        "/supplier-purchases/",
        payload
      );
      console.log("Response:", response.data);
      toast.success("Purchase submitted successfully!");

      // Reset fields here after successful post
      setSelectedSupplier(null);
      setSupplierData({
        supplierName: "",
        district: "",
        country: "",
        supplierType: "",
        shopName: "",
        phone1: "",
        phone2: "",
        email: "",
        address: "",
        dob: "",
        nidNo: "",
      });
      setSelectedCompany(null);
      setPurchaseDate("");
      setTotalAmount("");
      setDiscountAmount("");
      setTotalPayableAmount("");
      setAddedProducts([]);
      setPayments([]);
      setTotalPaidAmount(""); // যদি alada state থাকে
    } catch (error) {
      console.error("Error submitting purchase:", error);
      toast.error("Failed to submit purchase");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 ">
      {/* Supplier Section */}
      <section>
        <h2 className="font-semibold text-lg my-2">Supplier Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div>
            <label className="block mb-1 font-medium text-sm">
              Select Supplier
            </label>
            <Select
              options={supplierOptions}
              value={selectedSupplier}
              onChange={handleSupplierSelect}
              isClearable
              placeholder="Select..."
              className="text-sm"
              styles={customSelectStyles}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">District</label>
            <input
              type="text"
              name="district"
              value={supplierData.district}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="District..."
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Country</label>
            <input
              type="text"
              name="country"
              value={supplierData.country}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Country..."
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Supplier Type
            </label>
            <input
              type="text"
              name="supplierType"
              value={supplierData.supplierType}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Type..."
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Shop Name</label>
            <input
              type="text"
              name="shopName"
              value={supplierData.shopName}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Shop..."
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Phone 1</label>
            <input
              type="text"
              name="phone1"
              value={supplierData.phone1}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Phone..."
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Phone 2</label>
            <input
              type="text"
              name="phone2"
              value={supplierData.phone2}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Alt phone..."
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">E-mail</label>
            <input
              type="email"
              name="email"
              value={supplierData.email}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Email..."
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Address</label>
            <input
              type="text"
              name="address"
              value={supplierData.address}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Address..."
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={supplierData.dob}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">NID No.</label>
            <input
              type="text"
              name="nidNo"
              value={supplierData.nidNo}
              onChange={handleSupplierChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="NID number..."
            />
          </div>
        </div>
      </section>

      {/* Product Purchase Section */}
      <section>
        <h2 className="font-semibold text-lg my-2">Product Purchase</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
          <div>
            <label className="block text-sm mb-1 font-medium">
              Purchase Date *
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full text-sm border px-2 py-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Company Name *
            </label>
            <Select
              options={companyList.map((c) => ({
                label: c.company_name,
                value: c.id,
              }))}
              value={selectedCompany}
              onChange={setSelectedCompany}
              isClearable
              placeholder="Select company"
                  className="text-sm"
              styles={customSelectStyles}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Product Name *
            </label>
            <Select
              options={productNameOptions}
              value={selectedProductName}
              onChange={handleProductNameChange}
              isClearable
              placeholder="Select product name"
              isDisabled={!selectedCompany}
                  className="text-sm"
              styles={customSelectStyles}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Part Number *
            </label>
            <Select
              options={partNumberOptions}
              value={selectedPartNumber}
              onChange={handlePartNumberChange}
              isClearable
              placeholder="Select part number"
              isDisabled={!selectedCompany}
                  className="text-sm"
              styles={customSelectStyles}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Current Stock Quantity
            </label>
            <input
              type="number"
              value={currentStock}
              disabled
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Purchase Quantity *
            </label>
            <input
              type="number"
              value={purchaseQuantity}
              onChange={(e) => setPurchaseQuantity(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Enter purchase quantity"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Purchase Price *
            </label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Enter purchase price"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Percentage *
            </label>
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Enter percentage"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Purchase Price with Percentage
            </label>
            <input
              type="text"
              value={purchasePriceWithPercentage}
              readOnly
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Total Price
            </label>
            <input
              type="text"
              value={totalPrice}
              readOnly
             className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
            />
          </div>

          <div className="flex items-center ">
            <button
              className="px-4 py-2 bg-sky-800 text-sm text-white rounded hover:bg-sky-700"
              onClick={(e) => {
                e.preventDefault();
                addProduct();
              }}
              disabled={!selectedCompany}
            >
              Add Product
            </button>
          </div>
        </div>

        {addedProducts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1">Product Name</th>
                  <th className="border px-2 py-1">Part Number</th>
                  <th className="border px-2 py-1">Current Stock</th>
                  <th className="border px-2 py-1">Purchase Qty</th>
                  <th className="border px-2 py-1">Purchase Price</th>
                  <th className="border px-2 py-1">Percentage</th>
                  <th className="border px-2 py-1">Price w/ %</th>
                  <th className="border px-2 py-1">Total Price</th>
                  <th className="border px-2 py-1">Remove</th>
                </tr>
              </thead>
              <tbody>
                {addedProducts.map((prod, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{prod.productName}</td>
                    <td className="border px-2 py-1">{prod.partNumber}</td>
                    <td className="border px-2 py-1">{prod.currentStock}</td>
                    <td className="border px-2 py-1">
                      {prod.purchaseQuantity}
                    </td>
                    <td className="border px-2 py-1">{prod.purchasePrice}</td>
                    <td className="border px-2 py-1">{prod.percentage}</td>
                    <td className="border px-2 py-1">
                      {prod.purchasePriceWithPercentage}
                    </td>
                    <td className="border px-2 py-1">{prod.totalPrice}</td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        onClick={() => removeProduct(idx)}
                        className="px-2 py-1 text-white bg-red-600 hover:bg-red-700 rounded text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-2 max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-2">
            {/* Total Amount */}
            <div className="flex items-center flex-1">
              <label className="block mb-1 font-medium text-sm">
                Total Amount:
              </label>
              <input
                type="text"
                value={isNaN(Number(totalAmount)) ? "0.00" : Number(totalAmount).toFixed(2)}
                readOnly
                className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              />
            </div>

            {/* Discount Amount */}
            <div className="flex items-center flex-1">
              <label
                htmlFor="discount"
                className="block mb-1 font-medium text-sm"
              >
                Discount Amount:
              </label>
              <input
                id="discount"
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
                placeholder="0.00"
              />
            </div>

            {/* Total Payable Amount */}
            <div className="flex items-center flex-1">
              <label className="block mb-1 font-medium text-sm">
                Total Payable Amount:
              </label>
              <input
                type="text"
                value={isNaN(Number(totalPayableAmount)) ? "0.00" : Number(totalPayableAmount).toFixed(2)}
                readOnly
                className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="">
        <h3 className="font-semibold text-lg my-2">Payment</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          {/* Payment Mode */}
          <div>
            <label className="block text-sm mb-1 font-medium">
              Payment Mode*
            </label>
            <Select
              options={paymentModes}
              value={
                paymentModes.find(
                  (opt) => opt.value === paymentData.paymentMode
                ) || null
              }
              onChange={(selected) =>
                handlePaymentChange(
                  "paymentMode",
                  selected ? selected.value : ""
                )
              }
              placeholder="Select"
              className="text-sm"
              styles={customSelectStyles}
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-sm mb-1 font-medium">Bank Name</label>
            <Select
              options={banks}
              value={
                banks.find((opt) => opt.value === paymentData.bankName) || null
              }
              onChange={(selected) =>
                handlePaymentChange("bankName", selected ? selected.value : "")
              }
              placeholder="Select"
              isClearable
              isDisabled={!isBank}
              className="text-sm"
              styles={customSelectStyles}
            />
          </div>

          {/* Account No */}
          <div>
            <label className="block text-sm mb-1 font-medium">Account No</label>
            <input
              type="text"
              value={paymentData.accountNo}
              onChange={(e) => handlePaymentChange("accountNo", e.target.value)}
              disabled={!isBank}
              className={`w-full border text-sm px-2 py-1 rounded ${
                !isBank ? "bg-gray-100 text-gray-500" : ""
              }`}
              placeholder="Account No"
            />
          </div>

          {/* Cheque No */}
          <div>
            <label className="block text-sm mb-1 font-medium">Cheque No</label>
            <input
              type="text"
              value={paymentData.chequeNo}
              onChange={(e) => handlePaymentChange("chequeNo", e.target.value)}
              disabled={!isCheque}
              className={`w-full border px-2 py-1 rounded ${
                !isCheque ? "bg-gray-100 text-sm text-gray-400" : ""
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

          {/* Add Button */}
          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={handleAddPayment}
              className="px-4 py-2 bg-sky-800 text-sm text-white rounded hover:bg-sky-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {payments.length > 0 && (
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full border text-center text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Payment Mode</th>
                <th className="border px-2 py-1">Bank Name</th>
                <th className="border px-2 py-1">Account No</th>
                <th className="border px-2 py-1">Cheque No</th>
                <th className="border px-2 py-1">Paid Amount</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">{pay.paymentMode}</td>
                  <td className="border px-2 py-1">{pay.bankName}</td>
                  <td className="border px-2 py-1">{pay.accountNo}</td>
                  <td className="border px-2 py-1">{pay.chequeNo}</td>
                  <td className="border px-2 py-1">
                    {parseFloat(pay.paidAmount).toFixed(2)}
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      type="button"
                      onClick={() => handleRemovePayment(idx)}
                      className="px-2 py-1 text-white bg-red-600 hover:bg-red-700 rounded text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <label className="block text-sm mb-1 font-medium">
          Total Paid Amount:
        </label>
        <input
          type="number"
         value={isNaN(Number(totalPaidAmount)) ? "0.00" : Number(totalPaidAmount).toFixed(2)}
          readOnly
          className="border rounded px-2 py-1 text-sm placeholder-gray-400"
        />
      </div>

      <div className=" flex justify-center">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 text-sm bg-sky-800 text-white rounded hover:bg-sky-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
