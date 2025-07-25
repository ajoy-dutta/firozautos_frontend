"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import axiosInstance from "../../components/AxiosInstance";
import { toast } from "react-hot-toast";

export default function AddLoanPage() {
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

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    sourceCategory: "", // id
    bankCategory: "", // id
    bankName: "", // id
    loanType: "",
    transactionType: "",
    principalAmount: "",
    ratePercent: "",
    numberOfMonths: "",
    interestAmount: "",
    totalPayableAmount: "",
    installmentPerMonth: "",
    remarks: "",
  });

  const [sourceCategories, setSourceCategories] = useState([]);
  const [bankCategories, setBankCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loanTypes = ["CC", "CD"];
  // Fetch all dropdown data on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [srcRes, bankCatRes, bankRes, paymentModeRes] = await Promise.all(
          [
            axiosInstance.get("/source-categories/"),
            axiosInstance.get("/bank-categories/"),
            axiosInstance.get("/banks/"),
            axiosInstance.get("/payment-mode/"),
          ]
        );

        setSourceCategories(
          srcRes.data.map((item) => ({
            label: item.category_name,
            value: item.id,
          }))
        );
        setBankCategories(
          bankCatRes.data.map((item) => ({ label: item.name, value: item.id }))
        );
        setBanks(bankRes.data); // keep raw data for filter

        setPaymentModes(
          paymentModeRes.data.map((item) => ({
            label: item.name,
            value: item.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
        toast.error("Failed to load dropdown options");
      }
    };
    fetchOptions();
  }, []);

  // Filter banks based on selected bankCategory
  useEffect(() => {
    if (formData.bankCategory) {
      const filtered = banks
        .filter((bank) => bank.bank_category === formData.bankCategory)
        .map((bank) => ({ value: bank.id, label: bank.name }));
      setFilteredBanks(filtered);
    } else {
      setFilteredBanks([]);
    }
    // Reset selected bank when category changes
    setFormData((prev) => ({ ...prev, bankName: "" }));
  }, [formData.bankCategory, banks]);

  // Auto calculate
  const autoCalculate = (updated) => {
    const principal = parseFloat(updated.principalAmount) || 0;
    const rate = parseFloat(updated.ratePercent) || 0;
    const months = parseInt(updated.numberOfMonths) || 0;

    const interestAmount = ((principal * rate * months) / (12 * 100)).toFixed(
      2
    );
    const totalPayableAmount = (principal + parseFloat(interestAmount)).toFixed(
      2
    );
    const installmentPerMonth =
      months > 0 ? (totalPayableAmount / months).toFixed(2) : "0.00";

    return {
      ...updated,
      interestAmount,
      totalPayableAmount,
      installmentPerMonth,
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (["principalAmount", "ratePercent", "numberOfMonths"].includes(name)) {
      setFormData(autoCalculate(updated));
    } else {
      setFormData(updated);
    }
  };

  const handleSelectChange = (name, selected) => {
    setFormData({ ...formData, [name]: selected ? selected.value : "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const sourceCategoryLabel =
        sourceCategories.find((opt) => opt.value === formData.sourceCategory)
          ?.label || "";

      const bankCategoryLabel =
        bankCategories.find((opt) => opt.value === formData.bankCategory)
          ?.label || "";

      const bankNameLabel =
        filteredBanks.find((opt) => opt.value === formData.bankName)?.label ||
        "";

      const payload = {
        date: formData.date,
        source_category: sourceCategoryLabel, // ✅ label পাঠাচ্ছি
        bank_category: bankCategoryLabel, // ✅ label পাঠাচ্ছি
        bank_name: bankNameLabel, // ✅ label পাঠাচ্ছি
        loan_type: formData.loanType,
        transaction_type: formData.transactionType,
        principal_amount: parseFloat(formData.principalAmount),
        rate_percent: parseFloat(formData.ratePercent),
        number_of_months: parseInt(formData.numberOfMonths),
        interest_amount: parseFloat(formData.interestAmount),
        total_payable_amount: parseFloat(formData.totalPayableAmount),
        installment_per_month: parseFloat(formData.installmentPerMonth),
        remarks: formData.remarks,
      };

      await axiosInstance.post("/loans/", payload);
      toast.success("Loan added successfully!");

      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        sourceCategory: "",
        bankCategory: "",
        bankName: "",
        loanType: "",
        transactionType: "",
        principalAmount: "",
        ratePercent: "",
        numberOfMonths: "",
        interestAmount: "",
        totalPayableAmount: "",
        installmentPerMonth: "",
        remarks: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Error adding loan. Please check your data.");
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="max-w-6xl mx-auto  ">
      <h2 className="text-xl font-semibold mb-4 text-center">Add Loan</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <div>
          <label className="block text-sm mb-1 font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border input-md px-2 py-1 rounded"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">
            Source Category *
          </label>
          <Select
            options={sourceCategories}
            value={
              sourceCategories.find(
                (opt) => opt.value === formData.sourceCategory
              ) || null
            }
            onChange={(selected) =>
              handleSelectChange("sourceCategory", selected)
            }
            placeholder="Select"
            onKeyDown={handleKeyDown}
            styles={customSelectStyles}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">
            Bank Category *
          </label>
          <Select
            options={bankCategories}
            value={
              bankCategories.find(
                (opt) => opt.value === formData.bankCategory
              ) || null
            }
            onChange={(selected) =>
              handleSelectChange("bankCategory", selected)
            }
            placeholder="Select"
            onKeyDown={handleKeyDown}
            styles={customSelectStyles}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Bank Name *</label>
          <Select
            options={filteredBanks}
            value={
              filteredBanks.find((opt) => opt.value === formData.bankName) ||
              null
            }
            onChange={(selected) =>
              setFormData({
                ...formData,
                bankName: selected ? selected.value : "",
              })
            }
            placeholder="Select bank"
            isDisabled={!formData.bankCategory}
            onKeyDown={handleKeyDown}
            styles={customSelectStyles}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Loan Type *</label>
          <Select
            options={loanTypes.map((v) => ({ label: v, value: v }))}
            value={
              loanTypes.find((v) => v === formData.loanType)
                ? { label: formData.loanType, value: formData.loanType }
                : null
            }
            onChange={(selected) => handleSelectChange("loanType", selected)}
            placeholder="Select"
            onKeyDown={handleKeyDown}
            styles={customSelectStyles}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">
            Transaction Type *
          </label>
          <Select
            options={paymentModes}
            value={
              formData.transactionType
                ? {
                    label: formData.transactionType,
                    value: formData.transactionType,
                  }
                : null
            }
            onChange={(selected) =>
              handleSelectChange("transactionType", selected)
            }
            placeholder="Select"
            onKeyDown={handleKeyDown}
            styles={customSelectStyles}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">
            Principal Amount *
          </label>
          <input
            type="number"
            name="principalAmount"
            value={formData.principalAmount}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full input-md border px-2 py-1 rounded"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Rate in % *</label>
          <input
            type="number"
            name="ratePercent"
            value={formData.ratePercent}
            onChange={handleChange}
            placeholder="e.g., 12"
            className="w-full border input-md px-2 py-1 rounded"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">
            Number of Months *
          </label>
          <input
            type="number"
            name="numberOfMonths"
            value={formData.numberOfMonths}
            onChange={handleChange}
            placeholder="e.g., 12"
            className="w-full border input-md px-2 py-1 rounded"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">
            Interest Amount
          </label>
          <input
            type="text"
            name="interestAmount"
            value={formData.interestAmount}
            readOnly
            className="w-full input-md border px-2 py-1 bg-gray-100 rounded"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">
            Total Payable Amount
          </label>
          <input
            type="text"
            name="totalPayableAmount"
            value={formData.totalPayableAmount}
            readOnly
            className="w-full input-md border px-2 py-1 bg-gray-100 rounded"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">
            Installment per month
          </label>
          <input
            type="text"
            name="installmentPerMonth"
            value={formData.installmentPerMonth}
            readOnly
            className="w-full input-md border px-2 py-1 bg-gray-100 rounded"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm mb-1 font-medium">Remarks</label>
          <input
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Any remarks..."
            className="w-full input-md border px-2 py-1 rounded"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className=" flex justify-center mt-4">
          <button
            type="submit"
            className={`px-6 py-2 rounded text-white transition-colors ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
