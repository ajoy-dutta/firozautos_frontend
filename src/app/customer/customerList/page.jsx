"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../components/AxiosInstance";
import { toast } from "react-hot-toast";

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get("/customers/");
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await axiosInstance.delete(`/customers/${id}/`);
      toast.success("Customer deleted successfully!");
      fetchCustomers(); // refresh list
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete customer");
    }
  };

  // filtered data
  const filtered = customers.filter(
    (c) =>
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone1.includes(search) ||
      (c.shop_name && c.shop_name.toLowerCase().includes(search.toLowerCase()))
  );

  // pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6 max-w-7xl mx-auto ">
      <h2 className="text-2xl font-semibold mb-4 text-center">Customer List</h2>

      {/* Search */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset to first page on search
          }}
          placeholder="Search by name, phone, shop..."
          className="border px-2 py-1 rounded w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-sky-800 text-white">
            <tr>
              <th className="px-3 py-2 border">#</th>
              <th className="px-3 py-2 border">Customer Name</th>
              <th className="px-3 py-2 border">Shop Name</th> {/* new */}
              <th className="px-3 py-2 border">Phone</th>
              <th className="px-3 py-2 border">District</th>
              <th className="px-3 py-2 border">Type</th>
              <th className="px-3 py-2 border">Previous Due</th> {/* new */}
              <th className="px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((c, idx) => (
                <tr key={c.id} className="text-center">
                  <td className="px-3 py-2 border">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-3 py-2 border">{c.customer_name}</td>
                  <td className="px-3 py-2 border">
                    {c.shop_name || "-"}
                  </td>{" "}
                  {/* new */}
                  <td className="px-3 py-2 border">{c.phone1}</td>
                  <td className="px-3 py-2 border">{c.district}</td>
                  <td className="px-3 py-2 border">{c.customer_type}</td>
                  <td className="px-3 py-2 border">
                    {c.previous_due_amount
                      ? Number(c.previous_due_amount).toFixed(2)
                      : "0.00"}
                  </td>{" "}
                  {/* new */}
                  <td className="px-3 py-2 border">
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                      onClick={() => {
                        // TODO: implement edit navigation
                        toast("Edit clicked!");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-4 border text-center" colSpan={6}>
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`px-3 py-1 rounded border ${
                currentPage === num
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
