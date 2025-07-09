"use client";
import React, { useState } from "react";

export default function AddEditExporter() {
  const [formData, setFormData] = useState({
    companyName: "",
    exporterName: "",
    mailAddress: "",
    whatsappNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Exporter Entry:", formData);
    // এখানে চাইলে API call করতে পারেন
  };

  const handleReset = () => {
    setFormData({
      companyName: "",
      exporterName: "",
      mailAddress: "",
      whatsappNumber: "",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 rounded-md">
      <h2 className="text-lg font-semibold mb-4">Exporter Entry</h2>

      <div className=" grid grid-cols-4 gap-4">
        {/* Company Name */}
        <div>
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
          />
        </div>

        {/* Exporter Name */}
        <div>
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
          />
        </div>

        {/* Mail Address */}
        <div>
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
          />
        </div>

        {/* WhatsApp Number */}
        <div>
          <label className="block font-medium mb-1">WhatsApp Number</label>
          <input
            type="text"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
           className="border px-3 py-2 rounded text-sm"
            placeholder="Enter WhatsApp number"
          />
        </div>
      </div>

         {/* Buttons */}
        <div className="flex gap-3 justify-center mt-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-500 rounded hover:bg-gray-100"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-800"
          >
            Save
          </button>
        </div>
    </div>
  );
}
