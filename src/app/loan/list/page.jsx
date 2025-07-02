"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../../components/AxiosInstance";
import { toast } from "react-hot-toast";

export default function LoanListPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // pagination (placeholder)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/loans/");
      setLoans(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch loans");
    } finally {
      setLoading(false);
    }
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

  // Filter loans based on searchTerm (simple case-insensitive match on bank name)
  const filteredLoans = loans.filter((loan) =>
    loan.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLoans = filteredLoans.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Loan List</h2>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search by bank name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-2 py-1 rounded w-64"
        />
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Bank Name</th>
                <th className="p-2 border">Principal Amount</th>
                <th className="p-2 border">Total Payable Amount</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLoans.map((loan, idx) => (
                <tr key={loan.id} className="text-center">
                  <td className="p-2 border">{indexOfFirstItem + idx + 1}</td>
                  <td className="p-2 border">{loan.date}</td>
                  <td className="p-2 border">{loan.bank_name || "-"}</td>
                  <td className="p-2 border">{loan.principal_amount}</td>
                  <td className="p-2 border">{loan.total_payable_amount}</td>
                  <td className="p-2 border space-x-2">
                    <button className="text-blue-600 hover:underline">Edit</button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(loan.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {currentLoans.length === 0 && (
                <tr>
                  <td className="p-2 border text-center" colSpan="6">
                    No loans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: Math.ceil(filteredLoans.length / itemsPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
