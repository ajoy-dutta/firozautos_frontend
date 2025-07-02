"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../components/AxiosInstance";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SupplierListPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [districts, setDistricts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [supplierTypes, setSupplierTypes] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [supplierNameSearch, setSupplierNameSearch] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetchData();
    fetchFilterOptions();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("suppliers/");
      setSuppliers(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [districtRes, supplierTypeRes] = await Promise.all([
        axiosInstance.get("districts/"),
        axiosInstance.get("supplier-types/"),
      ]);

      setDistricts(
        districtRes.data.map((d) => ({ value: d.id.toString(), label: d.name }))
      );

      setSupplierTypes(
        supplierTypeRes.data.map((t) => ({ value: t.id.toString(), label: t.name }))
      );

      setCountries([
        { value: "Bangladesh", label: "Bangladesh" },
        { value: "India", label: "India" },
        { value: "Other", label: "Other" },
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await axiosInstance.delete(`suppliers/${id}/`);
      toast.success("Supplier deleted!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete supplier");
    }
  };

  // Filtering
  const filteredSuppliers = suppliers.filter((s) => {
    const matchDistrict = selectedDistrict
      ? s.district_detail?.id.toString() === selectedDistrict.value
      : true;
    const matchCountry = selectedCountry
      ? s.country?.toLowerCase() === selectedCountry.value.toLowerCase()
      : true;
    const matchType = selectedType
      ? s.supplier_type_detail?.id.toString() === selectedType.value
      : true;
    const matchName = supplierNameSearch
      ? s.supplier_name?.toLowerCase().includes(supplierNameSearch.toLowerCase())
      : true;

    return matchDistrict && matchCountry && matchType && matchName;
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Supplier List</h2>

      {/* FILTERS */}
      <div className="bg-white border border-gray-300 p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 justify-center">
        <Select
          options={districts}
          value={selectedDistrict}
          onChange={setSelectedDistrict}
          isClearable
          placeholder="District*"
          className="w-48 text-sm"
        />
        <Select
          options={countries}
          value={selectedCountry}
          onChange={setSelectedCountry}
          isClearable
          placeholder="Country*"
          className="w-48 text-sm"
        />
        <Select
          options={supplierTypes}
          value={selectedType}
          onChange={setSelectedType}
          isClearable
          placeholder="Supplier Type*"
          className="w-48 text-sm"
        />
        <input
          type="text"
          placeholder="Supplier Name"
          value={supplierNameSearch}
          onChange={(e) => setSupplierNameSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-64 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-ring loading-lg"></span>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-sky-900 text-white">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Supplier Name</th>
                <th className="p-2 border">District</th>
                <th className="p-2 border">Country</th>
                <th className="p-2 border">Supplier Type</th>
                <th className="p-2 border">Shop Name</th>
                <th className="p-2 border">Phone 1</th>
                <th className="p-2 border">Phone 2</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Address</th>
                <th className="p-2 border">Due</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((s, i) => (
                  <tr key={s.id} className="odd:bg-white even:bg-sky-50">
                    <td className="p-2 border text-center">{i + 1}</td>
                    <td className="p-2 border">{s.supplier_name}</td>
                    <td className="p-2 border">{s.district_detail?.name}</td>
                    <td className="p-2 border">{s.country}</td>
                    <td className="p-2 border">{s.supplier_type_detail?.name}</td>
                    <td className="p-2 border">{s.shop_name || "-"}</td>
                    <td className="p-2 border">{s.phone1}</td>
                    <td className="p-2 border">{s.phone2}</td>
                    <td className="p-2 border">{s.email}</td>
                    <td className="p-2 border">{s.address}</td>
                    <td className="p-2 border text-right">
                      {s.previous_due_amount ?? "0.00"}
                    </td>
                    <td className="p-2 border">
                      {s.created_at?.split("T")[0] ?? "-"}
                    </td>
                    <td className="p-2 border space-x-2 text-center">
                      <button
                        onClick={() => router.push(`/addEditSupplier?id=${s.id}`)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2 border text-center" colSpan={13}>
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
