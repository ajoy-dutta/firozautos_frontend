"use client";

import AxiosInstance from "@/app/components/AxiosInstance";
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
    const res = await AxiosInstance.get("/companies/");
    setCompanies(res.data);
    console.log("Fetched companies:", res.data);
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

    try {
      if (editingId) {
        await AxiosInstance.put(`/companies/${editingId}/`, formData);
        alert("Updated successfully!");
      } else {
        await AxiosInstance.post("/companies/", formData);
        alert("Saved successfully!");
      }

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
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Something went wrong.");
    }
  };

  // ✅ Delete company
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete?")) return;

    try {
      await AxiosInstance.delete(`/companies/${id}/`);
      fetchCompanies();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed.");
    }
  };

  // ✅ Fill form for editing
  const handleEdit = (company) => {
    setFormData(company);
    setEditingId(company.id);
  };

  // Delete company

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
    <div className="">
      <h2 className="text-xl font-semibold mb-4">Company Master</h2>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Company Name:<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
              className="border input-md rounded-sm p-1 w-full"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Incharge Name:<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="incharge_name"
              value={formData.incharge_name}
              onChange={handleChange}
              required
              className="border  input-md  rounded-sm p-1 w-full"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Phone No:<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="phone_no"
              value={formData.phone_no}
              onChange={handleChange}
              required
              className="border  input-md  rounded-sm p-1 w-full"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              E-mail ID:<span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border  input-md rounded-sm p-1 w-full"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Address:<span className="text-red-600">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              rows={1}
              onChange={handleChange}
              required
              className="border  input-md  rounded-sm px-2 py-[3px]  w-full"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold ">
              Country:<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="border  input-md  rounded-sm p-1 w-full"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Button */}
          <div className="col-span-1 flex self-end">
            <button
              type="submit"
              onKeyDown={handleKeyDown}
              className="bg-blue-950 hover:bg-blue-700 text-white px-2 py-[6px] rounded-md w-1/3 cursor-pointer"
            >
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
              <th className="border border-gray-400 px-2 py-1">SL</th>
              <th className="border border-gray-400 px-2 py-1">Company Name</th>
              <th className="border border-gray-400 px-2 py-1">
                Incharge Name
              </th>
              <th className="border border-gray-400 px-2 py-1">Phone No</th>
              <th className="border border-gray-400 px-2 py-1">Email Id</th>
              <th className="border border-gray-400 px-2 py-1">Address</th>
              <th className="border border-gray-400 px-2 py-1">Country</th>
              <th className="border border-gray-400 px-2 py-1">Edit</th>
              <th className="border border-gray-400 px-2 py-1">Delete</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c, index) => (
              <tr key={c.id} className="text-center">
                <td className="border border-gray-400 px-2 py-1">
                  {index + 1}
                </td>
                <td className="border border-gray-400 px-2 py-1">
                  {c.company_name}
                </td>
                <td className="border border-gray-400 px-2 py-1">
                  {c.incharge_name}
                </td>
                <td className="border border-gray-400 px-2 py-1">
                  {c.phone_no}
                </td>
                <td className="border border-gray-400 px-2 py-1">{c.email}</td>
                <td className="border border-gray-400 px-2 py-1">
                  {c.address}
                </td>
                <td className="border border-gray-400 px-2 py-1">
                  {c.country}
                </td>
                <td
                  className="border border-gray-400 px-2 py-1 text-yellow-600 cursor-pointer"
                  onClick={() => handleEdit(c)}
                >
                  <div className="flex justify-center items-center">
                    <FaEdit />
                  </div>
                </td>
                <td
                  className="border border-gray-400 px-2 py-1 text-red-600 cursor-pointer"
                  onClick={() => handleDelete(c.id)}
                >
                  <div className="flex justify-center items-center">
                    <FaTrash />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
