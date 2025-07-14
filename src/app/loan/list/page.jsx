"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../../components/AxiosInstance";
import { toast } from "react-hot-toast";
import Select from "react-select";

export default function LoanListPage() {
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

  const [loans, setLoans] = useState([]);
  const [banks, setBanks] = useState([]);
  const [bankCategories, setBankCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBankCategoryName, setSelectedBankCategoryName] =
    useState(null);
  const [selectedBankName, setSelectedBankName] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loansRes, banksRes, bankCategoriesRes] = await Promise.all([
        axiosInstance.get("/loans/"),
        axiosInstance.get("/banks/"),
        axiosInstance.get("/bank-categories/"),
      ]);
      setLoans(loansRes.data);
      setBanks(banksRes.data);
      setBankCategories(bankCategoriesRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get bank name by id (from banks array)
  const getBankNameById = (id) => {
    const bank = banks.find((b) => b.id === Number(id));
    return bank ? bank.name : "-";
  };

  // Helper to get bank category name by id
  const getBankCategoryNameById = (id) => {
    const cat = bankCategories.find((c) => c.id === Number(id));
    return cat ? cat.name : "-";
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this loan?")) return;
    try {
      await axiosInstance.delete(`/loans/${id}/`);
      toast.success("Loan deleted successfully!");
      setLoans(loans.filter((loan) => loan.id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete loan");
    }
  };

  // Filter banks based on selected bank category name (not id)
  const filteredBanks = selectedBankCategoryName
    ? banks.filter(
        (b) =>
          getBankCategoryNameById(b.bank_category) === selectedBankCategoryName
      )
    : banks;

  // Filter loans: first by bank category name if selected
  let filteredLoans = selectedBankCategoryName
    ? loans.filter((loan) => loan.bank_category === selectedBankCategoryName)
    : loans;

  // Then by bank name if selected
  if (selectedBankName) {
    filteredLoans = filteredLoans.filter(
      (loan) => loan.bank_name === selectedBankName
    );
  }

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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLoans = filteredLoans.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Loan List</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Bank Category Filter */}
        <div>
          <label className="block mb-1 font-medium">Bank Category</label>
          <Select
            options={bankCategories.map((cat) => ({
              label: cat.name,
              value: cat.name,
            }))}
            styles={customSelectStyles}
            onKeyDown={handleKeyDown}
            value={
              selectedBankCategoryName
                ? {
                    label: selectedBankCategoryName,
                    value: selectedBankCategoryName,
                  }
                : null
            }
            onChange={(selected) => {
              setSelectedBankCategoryName(selected ? selected.value : null);
              setSelectedBankName(null); // reset bank name on category change
              setCurrentPage(1);
            }}
            isClearable
            placeholder="Select Bank Category"
          />
        </div>

        {/* Bank Name Filter */}
        <div>
          <label className="block mb-1 font-medium">Bank Name</label>
          <Select
            options={filteredBanks.map((bank) => ({
              label: bank.name,
              value: bank.name, 
            }))}
            styles={customSelectStyles}
            onKeyDown={handleKeyDown}
            value={
              selectedBankName
                ? { label: selectedBankName, value: selectedBankName }
                : null
            }
            onChange={(selected) => {
              setSelectedBankName(selected ? selected.value : null);
              setCurrentPage(1);
            }}
            isClearable
            placeholder="Select Bank Name"
          />
        </div>
      </div>

      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <span className="loading loading-ring loading-xl"></span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-sky-800 text-white">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Bank Category</th>
                <th className="p-2 border">Bank Name</th>
                <th className="p-2 border">Principal Amount</th>
                <th className="p-2 border">Total Payable Amount</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLoans.length > 0 ? (
                currentLoans.map((loan, idx) => (
                  <tr key={loan.id} className="text-center">
                    <td className="p-2 border">{indexOfFirstItem + idx + 1}</td>
                    <td className="p-2 border">{loan.date}</td>
                    <td className="p-2 border">{loan.bank_category}</td>
                    <td className="p-2 border">{loan.bank_name}</td>
                    <td className="p-2 border">{loan.principal_amount}</td>
                    <td className="p-2 border">{loan.total_payable_amount}</td>
                    <td className="p-2 border space-x-2">
                      <button className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDelete(loan.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2 border text-center" colSpan="7">
                    No loans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredLoans.length > itemsPerPage && (
        <nav aria-label="Page navigation" className="flex justify-center mt-6">
          <ul className="inline-flex -space-x-px">
            {/* Previous */}
            <li>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className={`px-3 py-1 border rounded-l-md ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-blue-600 hover:bg-blue-100"
                }`}
                aria-disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>

            {/* Page numbers */}
            {Array.from(
              { length: Math.ceil(filteredLoans.length / itemsPerPage) },
              (_, i) => (
                <li key={i}>
                  <button
                    onClick={() => setCurrentPage(i + 1)}
                    aria-current={currentPage === i + 1 ? "page" : undefined}
                    className={`px-3 py-1 border-t border-b ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    {i + 1}
                    {currentPage === i + 1 && (
                      <span className="sr-only"> (current)</span>
                    )}
                  </button>
                </li>
              )
            )}

            {/* Next */}
            <li>
              <button
                disabled={
                  currentPage === Math.ceil(filteredLoans.length / itemsPerPage)
                }
                onClick={() => setCurrentPage(currentPage + 1)}
                className={`px-3 py-1 border rounded-r-md ${
                  currentPage === Math.ceil(filteredLoans.length / itemsPerPage)
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-blue-600 hover:bg-blue-100"
                }`}
                aria-disabled={
                  currentPage === Math.ceil(filteredLoans.length / itemsPerPage)
                }
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
