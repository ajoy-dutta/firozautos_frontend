"use client";

import React, { useEffect, useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { useSearchParams } from "next/navigation";

export default function SupplierForm() {
  const [supplierTypes, setSupplierTypes] = useState([]);
  const [districts, setDistricts] = useState([]);

const searchParams = useSearchParams();
  const editingId = searchParams.get("id");  // will be null if not provided

  const [formData, setFormData] = useState({
    supplier_name: "",
    district: "",
    country: "",
    supplier_type: "",
    shop_name: "",
    phone1: "",
    phone2: "",
    email: "",
    address: "",
    date_of_birth: "",
    nid_no: "",
    remarks: "",
    previous_due_amount: "",
  });

  useEffect(() => {
    fetchSupplierTypes();
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (editingId) {
      fetchSupplier(editingId);
    }
  }, [editingId]);

  const fetchSupplierTypes = async () => {
    try {
      const res = await AxiosInstance.get("/supplier-types/");
      setSupplierTypes(res.data);
    } catch (error) {
      console.error("Error fetching supplier types", error);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await AxiosInstance.get("/districts/");
      setDistricts(res.data);
    } catch (error) {
      console.error("Error fetching districts", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchSupplier = async (id) => {
    try {
      const res = await AxiosInstance.get(`/suppliers/${id}/`);
      const data = res.data;

      setFormData({
        supplier_name: data.supplier_name ?? "",
        district: data.district ?? "",
        country: data.country ?? "",
        supplier_type: data.supplier_type ?? "",
        shop_name: data.shop_name ?? "",
        phone1: data.phone1 ?? "",
        phone2: data.phone2 ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        date_of_birth: data.date_of_birth ?? "",
        nid_no: data.nid_no ?? "",
        remarks: data.remarks ?? "",
        previous_due_amount: data.previous_due_amount ?? "",
      });
    } catch (error) {
      console.error("Error fetching supplier", error);
      alert("❌ Failed to load supplier data for editing.");
    }
  };

  const handleReset = () => {
    setFormData({
      supplier_name: "",
      district: "",
      country: "",
      supplier_type: "",
      shop_name: "",
      phone1: "",
      phone2: "",
      email: "",
      address: "",
      date_of_birth: null,
      nid_no: "",
      remarks: "",
      previous_due_amount: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        district: parseInt(formData.district) || null,
        supplier_type: parseInt(formData.supplier_type) || null,
        previous_due_amount: formData.previous_due_amount
          ? parseFloat(formData.previous_due_amount)
          : 0,
      };
      if (!payload.date_of_birth) payload.date_of_birth = null;

      let res;
      if (editingId) {
        // EDIT
        res = await AxiosInstance.put(`/suppliers/${editingId}/`, payload);
        alert("✅ Supplier updated successfully!");
      } else {
        // CREATE
        res = await AxiosInstance.post("/suppliers/", payload);
        alert("✅ Supplier created successfully!");
      }

      console.log("Response:", res.data);
      handleReset();
    } catch (error) {
      console.error("Error submitting supplier", error);
      alert("❌ Failed to save supplier. See console for details.");
    }
  };

  return (
    <div className="p-4 text-sm text-slate-700">
      <h2 className="text-xl font-semibold mb-4">Supplier Entry</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <div>
          <label className="font-medium">
            Supplier Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="supplier_name"
            value={formData.supplier_name}
            onChange={handleChange}
            required
            className="border border-slate-400 py-1 px-2 rounded-xs w-full"
          />
        </div>

        <div>
          <label className="font-medium">
            District <span className="text-red-500">*</span>
          </label>
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
            className="border border-slate-400 py-1 px-2 rounded-xs w-full"
          >
            <option value="">--Select--</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="border border-slate-400 py-1 px-2 rounded-xs w-full"
          />
        </div>

        <div>
          <label className="font-medium">
            Supplier Type <span className="text-red-500">*</span>
          </label>
          <select
            name="supplier_type"
            value={formData.supplier_type}
            onChange={handleChange}
            required
            className="border border-slate-400 py-1 px-2 rounded-xs w-full"
          >
            <option value="">--Select--</option>
            {supplierTypes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">Shop Name</label>
          <input
            type="text"
            name="shop_name"
            value={formData.shop_name}
            onChange={handleChange}
            className="border border-slate-400 py-1 px-2 rounded-xs w-full"
          />
        </div>

        <div>
          <label className="font-medium">
            Phone 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="phone1"
            value={formData.phone1}
            onChange={handleChange}
            required
            className="border border-slate-400 py-1 px-2 rounded-xs w-full"
          />
        </div>

        <div>
          <label className="font-medium">Phone 2</label>
          <input
            type="text"
            name="phone2"
            value={formData.phone2}
            onChange={handleChange}
            className="border border-slate-400 py-1 px-2 rounded-xs w-full"
          />
        </div>

        <div>
          <label className="font-medium">E-mail Id</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border border-slate-400 py-1 px-2 rounded-xs w-full"
          />
        </div>

        <div>
          <label className="font-medium">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="border border-slate-400 py-1 px-2 rounded-xs w-full"
          />
        </div>

        <div>
          <label className="font-medium">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="border border-slate-400 py-1 px-2 rounded-xs w-full"
          />
        </div>

        {/* 👇 Final ROW - 5 cells in grid 👇 */}
        <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="font-medium">NID No</label>
            <input
              type="text"
              name="nid_no"
              value={formData.nid_no}
              onChange={handleChange}
              className="border border-slate-400 py-1 px-2 rounded-xs w-full"
            />
          </div>

          <div>
            <label className="font-medium">Remarks</label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="border border-slate-400 py-1 px-2 rounded-xs w-full"
            />
          </div>

          <div>
            <label className="font-medium">Previous Due Amount</label>
            <input
              type="number"
              name="previous_due_amount"
              value={formData.previous_due_amount}
              onChange={handleChange}
              className="border border-slate-400 py-1 px-2 rounded-xs w-full"
            />
          </div>

          {/* Buttons in last column */}
          <div className="flex gap-2 cursor-pointer">
            <button
              type="submit"
              className="bg-blue-950 hover:bg-blue-700 text-white px-2 py-[6px] rounded-md w-1/3 cursor-pointer"
            >
              {editingId ? "Update" : "Save"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
