"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../components/AxiosInstance";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { useRouter } from "next/navigation";

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null); // object {value, label}
  const [selectedType, setSelectedType] = useState(null);

  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const customerTypes = [
    { value: "Buyer", label: "Buyer" },
    { value: "Seller", label: "Seller" },
    { value: "Wholeseller", label: "Wholeseller" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, distRes] = await Promise.all([
        axiosInstance.get("/customers/"),
        axiosInstance.get("/districts/"),
      ]);
      setCustomers(custRes.data);
      setDistricts(
        distRes.data.map((d) => ({ value: d.id.toString(), label: d.name }))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      await axiosInstance.delete(`/customers/${id}/`);
      toast.success("Customer deleted successfully!");
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete customer");
    }
  };

  const handleEdit = (customer) => {
    // Store customer data in localStorage to pass to edit page
    localStorage.setItem("editCustomerData", JSON.stringify(customer));
    // Navigate to addEditCustomer page with edit mode
    router.push("/customer/addEditCustomer");
  };

  // Filtered data logic
  const filtered = customers.filter((c) => {
    const matchesDistrict = selectedDistrict
      ? c.district.toString() === selectedDistrict.value
      : true;
    const matchesType = selectedType
      ? c.customer_type === selectedType.value
      : true;
    const matchesSearch = search
      ? c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        (c.shop_name &&
          c.shop_name.toLowerCase().includes(search.toLowerCase()))
      : true;

    return matchesDistrict && matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Helper to get district name by id
  const getDistrictName = (id) => {
    const dist = districts.find((d) => d.value === id.toString());
    return dist ? dist.label : "-";
  };

  return (
    <div className=" max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">Customer List</h2>

      {/* Add Customer Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => router.push("/customer/addEditCustomer")}
          className="bg-sky-800 text-white px-4 py-2 rounded hover:bg-sky-700 transition-colors"
        >
          Add New Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 justify-center">
        <Select
          options={districts}
          value={selectedDistrict}
          onChange={(selected) => {
            setSelectedDistrict(selected);
            setCurrentPage(1);
          }}
          isClearable
          placeholder="Select District"
          className="w-48"
        />
        <Select
          options={customerTypes}
          value={selectedType}
          onChange={(selected) => {
            setSelectedType(selected);
            setCurrentPage(1);
          }}
          isClearable
          placeholder=" Customer Type"
          className="w-48"
        />
        <input
          type="text"
          placeholder="Search by name or shop..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-1 rounded w-64"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-ring loading-xl"></span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-300 rounded">
            <table className="min-w-full border-collapse text-center">
              <thead className="bg-sky-800 text-white">
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Customer Name</th>
                  <th className="p-2 border">Shop Name</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">District</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Previous Due</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((c, idx) => (
                    <tr key={c.id} className="border-t">
                      <td className="p-2 border">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="p-2 border">{c.customer_name}</td>
                      <td className="p-2 border">{c.shop_name || "-"}</td>
                      <td className="p-2 border">{c.phone1}</td>
                      <td className="p-2 border">
                        {getDistrictName(c.district)}
                      </td>
                      <td className="p-2 border">{c.customer_type}</td>
                      <td className="p-2 border">
                        {c.previous_due_amount
                          ? Number(c.previous_due_amount).toFixed(2)
                          : "0.00"}
                      </td>
                      <td className="p-2 border space-x-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
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
                    <td className="p-2" colSpan={8}>
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="flex justify-center mt-4 space-x-2"
              aria-label="Pagination"
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded border ${
                  currentPage === totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
