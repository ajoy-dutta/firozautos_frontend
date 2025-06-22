"use client";

import { useState } from "react";

export default function ProductEntryForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    productCategory: "",
    productName: "",
    partNo: "",
    brandName: "",
    modelNo: "",
    netWeight: "",
    remarks: "",
    productImage: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "productImage") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
    alert("Form submitted!");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Product Entry</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block font-medium">
              Company Name:<span className="text-red-500">*</span>
            </label>
            <select
              name="companyName"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            >
              <option>--Select--</option>
              <option value="Company A">Company A</option>
              <option value="Company B">Company B</option>
            </select>
          </div>
          <div>
            <label className="block font-medium">
              Product Category:<span className="text-red-500">*</span>
            </label>
            <select
              name="productCategory"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            >
              <option>--Select--</option>
              <option value="Engine">Engine</option>
              <option value="Body">Body</option>
            </select>
          </div>
          <div>
            <label className="block font-medium">
              Product Name:<span className="text-red-500">*</span>
            </label>
            <input
              name="productName"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block font-medium">
              Part No:<span className="text-red-500">*</span>
            </label>
            <input
              name="partNo"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block font-medium">Product Code</label>
            <input
              value="AUTO GENERATE"
              readOnly
              className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-500"
            />
          </div>
       
          <div>
            <label className="block font-medium">Product Image:</label>
            <input
              type="file"
              name="productImage"
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block font-medium">Brand Name:</label>
            <input
              name="brandName"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block font-medium">Model No:</label>
            <input
              name="modelNo"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block font-medium">Net Weight:</label>
            <input
              name="netWeight"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div></div>
      
        {/* Remarks */}
        <div>
          <label className="block font-medium">Remarks:</label>
          <textarea
            name="remarks"
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            rows="1"
          />
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-3 py-1 w-1/2 rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            type="reset"
            className="bg-blue-600 text-white px-3 py-1 w-1/2 rounded hover:bg-blue-700"
          >
            Reset
          </button>
        </div>
          </div>

      </form>
    </div>
  );
}
