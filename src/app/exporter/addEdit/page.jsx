"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AxiosInstance from "@/app/components/AxiosInstance";
import { useRouter } from "next/navigation";

export default function AddEditExporter() {
  const [formData, setFormData] = useState({
    companyName: "",
    exporterName: "",
    mailAddress: "",
    whatsappNumber: "",
  });
  const [editId, setEditId] = useState(null);
  const router = useRouter();

  // Check if edit mode
  useEffect(() => {
    const editData = localStorage.getItem("editExporterData");
    if (editData) {
      const parsed = JSON.parse(editData);
      setFormData({
        companyName: parsed.company_name || "",
        exporterName: parsed.exporter_name || "",
        mailAddress: parsed.mail_address || "",
        whatsappNumber: parsed.whatsapp_number || "",
      });
      setEditId(parsed.id);
      localStorage.removeItem("editExporterData"); // Clean up after loading
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveOrUpdate = async () => {
    const payload = {
      company_name: formData.companyName,
      exporter_name: formData.exporterName,
      mail_address: formData.mailAddress,
      whatsapp_number: formData.whatsappNumber,
    };

    try {
      if (editId) {
        // PATCH request for update
        await AxiosInstance.patch(`/exporters/${editId}/`, payload);
        toast.success("Exporter updated successfully!");
      } else {
        // POST request for create
        await AxiosInstance.post("/exporters/", payload);
        toast.success("Exporter added successfully!");
      }

      // Reset form & redirect
      handleReset();
      router.push("/exporter/l");
    } catch (error) {
      console.error("Failed to save/update exporter:", error);
      toast.error("Failed to save exporter.");
    }
  };

  const handleReset = () => {
    setFormData({
      companyName: "",
      exporterName: "",
      mailAddress: "",
      whatsappNumber: "",
    });
    setEditId(null);
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
    <div className="max-w-5xl mx-auto p-4 rounded-md">
      <h2 className="text-lg font-semibold mb-4">
        {editId ? "Update Exporter" : "Add New Exporter"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Company Name */}
        <div className="flex flex-col">
          <label className="block font-medium mb-1">
            Exporter Company Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="border px-3 py-2 rounded text-sm"
            placeholder="Enter company name"
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Exporter Name */}
        <div className="flex flex-col">
          <label className="block font-medium mb-1">
            Exporter Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="exporterName"
            value={formData.exporterName}
            onChange={handleChange}
            className="border px-3 py-2 rounded text-sm"
            placeholder="Enter exporter name"
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Mail Address */}
        <div className="flex flex-col">
          <label className="block font-medium mb-1">
            Mail Address: <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="mailAddress"
            value={formData.mailAddress}
            onChange={handleChange}
            className="border px-3 py-2 rounded text-sm"
            placeholder="Enter mail address"
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* WhatsApp Number */}
        <div className="flex flex-col">
          <label className="block font-medium mb-1">WhatsApp Number</label>
          <input
            type="text"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
            className="border px-3 py-2 rounded text-sm"
            placeholder="Enter WhatsApp number"
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-center mt-6">
        <button
          onClick={handleReset}
          className="px-6 py-2 border border-gray-500 rounded hover:bg-gray-100 transition-colors"
          onKeyDown={handleKeyDown}
        >
          Reset
        </button>
        <button
          onClick={handleSaveOrUpdate}
          className="px-6 py-2 bg-sky-700 text-white rounded hover:bg-sky-800 transition-colors"
          onKeyDown={handleKeyDown}
        >
          {editId ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}
