"use client";

import { useState } from "react";
import Select from "react-select";
import axiosInstance from "../../components/AxiosInstance";
import { toast } from "react-hot-toast";

export default function AddLoanPage() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0], // default today
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const sourceCategories = ["Own Fund", "External Fund"];
  const bankCategories = ["Public", "Private"];
  const loanTypes = ["Short Term", "Long Term"];
  const transactionTypes = ["Cash", "Transfer"];

  // Auto calculate when principalAmount, ratePercent, or numberOfMonths change
  const autoCalculate = (updated) => {
    const principal = parseFloat(updated.principalAmount) || 0;
    const rate = parseFloat(updated.ratePercent) || 0;
    const months = parseInt(updated.numberOfMonths) || 0;

    const interestAmount = ((principal * rate * months) / (12 * 100)).toFixed(2);
    const totalPayableAmount = (principal + parseFloat(interestAmount)).toFixed(2);
    const installmentPerMonth = months > 0 ? (totalPayableAmount / months).toFixed(2) : "0.00";

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
    setFormData({ ...formData, [name]: selected?.value || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const payload = {
        date: formData.date,
        source_category: formData.sourceCategory,
        bank_category: formData.bankCategory,
        bank_name: formData.bankName,
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

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Add Loan</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Source Category *</label>
          <Select
            options={sourceCategories.map((v) => ({ label: v, value: v }))}
            value={formData.sourceCategory ? { label: formData.sourceCategory, value: formData.sourceCategory } : null}
            onChange={(selected) => handleSelectChange("sourceCategory", selected)}
            placeholder="Select"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bank Category *</label>
          <Select
            options={bankCategories.map((v) => ({ label: v, value: v }))}
            value={formData.bankCategory ? { label: formData.bankCategory, value: formData.bankCategory } : null}
            onChange={(selected) => handleSelectChange("bankCategory", selected)}
            placeholder="Select"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bank Name</label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            placeholder="Enter bank name"
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Loan Type *</label>
          <Select
            options={loanTypes.map((v) => ({ label: v, value: v }))}
            value={formData.loanType ? { label: formData.loanType, value: formData.loanType } : null}
            onChange={(selected) => handleSelectChange("loanType", selected)}
            placeholder="Select"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Transaction Type *</label>
          <Select
            options={transactionTypes.map((v) => ({ label: v, value: v }))}
            value={formData.transactionType ? { label: formData.transactionType, value: formData.transactionType } : null}
            onChange={(selected) => handleSelectChange("transactionType", selected)}
            placeholder="Select"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Principal Amount *</label>
          <input
            type="number"
            name="principalAmount"
            value={formData.principalAmount}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rate in % *</label>
          <input
            type="number"
            name="ratePercent"
            value={formData.ratePercent}
            onChange={handleChange}
            placeholder="e.g., 12"
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Number of Months *</label>
          <input
            type="number"
            name="numberOfMonths"
            value={formData.numberOfMonths}
            onChange={handleChange}
            placeholder="e.g., 12"
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Interest Amount</label>
          <input
            type="text"
            name="interestAmount"
            value={formData.interestAmount}
            readOnly
            className="w-full border px-2 py-1 bg-gray-100 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Total Payable Amount</label>
          <input
            type="text"
            name="totalPayableAmount"
            value={formData.totalPayableAmount}
            readOnly
            className="w-full border px-2 py-1 bg-gray-100 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Installment per month</label>
          <input
            type="text"
            name="installmentPerMonth"
            value={formData.installmentPerMonth}
            readOnly
            className="w-full border px-2 py-1 bg-gray-100 rounded"
          />
        </div>

        <div className="">
          <label className="block text-sm font-medium mb-1">Remarks</label>
          <input
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Any remarks..."
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div className="2x\ flex justify-center mt-4">
          <button
            type="submit"
            className={`px-6 py-2 rounded text-white transition-colors ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
