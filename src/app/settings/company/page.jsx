"use client";

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function CompanyPage() {
  const [formData, setFormData] = useState({
    company_name: "",
    incharge_name: "",
    phone_no: "",
    email: "",
    address: "",
    country: "",
  });

  const [companies, setCompanies] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Fetch all companies
  const fetchCompanies = async () => {
    const res = await fetch("/companies/");
    const data = await res.json();
    setCompanies(data);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create or update company
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId ? `/api/companies/${editingId}/` : "/companies/";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert(editingId ? "Updated successfully!" : "Saved successfully!");
      setFormData({
        company_name: "",
        incharge_name: "",
        phone_no: "",
        email: "",
        address: "",
        country: "",
      });
      setEditingId(null);
      fetchCompanies();
    } else {
      alert("Something went wrong.");
    }
  };

  // Delete company
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete?")) return;

    const res = await fetch(`/api/companies/${id}/`, { method: "DELETE" });
    if (res.ok) {
      fetchCompanies();
    } else {
      alert("Delete failed.");
    }
  };

  // Fill form for editing
  const handleEdit = (company) => {
    setFormData(company);
    setEditingId(company.id);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Company Master</h2>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Company Name:<span className="text-red-600">*</span>
            </label>
            <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required className="border rounded-md p-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Incharge Name:<span className="text-red-600">*</span>
            </label>
            <input type="text" name="incharge_name" value={formData.incharge_name} onChange={handleChange} required className="border rounded-md p-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone No:<span className="text-red-600">*</span>
            </label>
            <input type="text" name="phone_no" value={formData.phone_no} onChange={handleChange} required className="border rounded-md p-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              E-mail ID:<span className="text-red-600">*</span>
            </label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="border rounded-md p-1 w-full" />
          </div>
          <div className="">
            <label className="block text-sm font-medium mb-1">
              Address:<span className="text-red-600">*</span>
            </label>
            <textarea name="address" value={formData.address} onChange={handleChange} required className="border rounded-md p-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Country:<span className="text-red-600">*</span>
            </label>
            <input type="text" name="country" value={formData.country} onChange={handleChange} required className="border rounded-md p-1 w-full" />
          </div>
          <div className="flex items-end col-span-1">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
              {editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead className="bg-sky-900 text-white">
            <tr>
              <th className="border px-2 py-1">SL</th>
              <th className="border px-2 py-1">Company Name</th>
              <th className="border px-2 py-1">Incharge Name</th>
              <th className="border px-2 py-1">Phone No</th>
              <th className="border px-2 py-1">Email Id</th>
              <th className="border px-2 py-1">Address</th>
              <th className="border px-2 py-1">Country</th>
              <th className="border px-2 py-1">Edit</th>
              <th className="border px-2 py-1">Delete</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c, index) => (
              <tr key={c.id} className="text-center">
                <td className="border px-2 py-1">{index + 1}</td>
                <td className="border px-2 py-1">{c.company_name}</td>
                <td className="border px-2 py-1">{c.incharge_name}</td>
                <td className="border px-2 py-1">{c.phone_no}</td>
                <td className="border px-2 py-1">{c.email}</td>
                <td className="border px-2 py-1">{c.address}</td>
                <td className="border px-2 py-1">{c.country}</td>
                <td className="border px-2 py-1 text-yellow-600 cursor-pointer" onClick={() => handleEdit(c)}>
                  <FaEdit />
                </td>
                <td className="border px-2 py-1 text-red-600 cursor-pointer" onClick={() => handleDelete(c.id)}>
                  <FaTrash />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
