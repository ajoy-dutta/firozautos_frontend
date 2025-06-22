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
        mrp: "",
        percentage: "",
        bdt: "",
        hscode: "",
  });

const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "productImage") {
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
    return;
  }

  if (name === "mrp" || name === "percentage") {
    const updatedForm = {
      ...formData,
      [name]: value,
    };

    const mrp = parseFloat(updatedForm.mrp) || 0;
    const percentage = parseFloat(updatedForm.percentage) || 0;
    const mrpAmount = ((mrp * percentage) / 100).toFixed(2);
    const bdt = (mrp + (mrpAmount*mrp)).toFixed(2);

    setFormData({
      ...updatedForm,
      bdt,
    });
    return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};



const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const submitData = new FormData();
    for (const key in formData) {
      submitData.append(key, formData[key]);
    }

    const res = await AxiosInstance.post("/products/", submitData); // Replace with your API endpoint

    if (res.status === 201 || res.status === 200) {
      alert("Product submitted successfully!");

      // Reset form
      setFormData({
        companyName: "",
        productCategory: "",
        productName: "",
        partNo: "",
        brandName: "",
        modelNo: "",
        netWeight: "",
        remarks: "",
        productImage: null,
        mrp: "",
        bdt: "",
        hscode: "",
      });

      // Optionally reset file input manually if needed
      document.querySelector('input[name="productImage"]').value = "";
    } else {
      alert("Something went wrong during submission.");
    }
  } catch (error) {
    console.error("Submission error:", error);
    alert("Error submitting product.");
  }
};


  return (
    <div className="max-w-7xl mx-auto p-6 text-sm bg-slate-50 rounded shadow">
      <h2 className="text-xl  mb-4 pb-3 border-slate-300 border-b-[1px]">
        Products Entry
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Rows */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8 place-items-start">
          <div>
            <label className="block ">
              Company Name:<span className="text-red-500">*</span>
            </label>
            <select
              name="companyName"
              onChange={handleChange}
              className="w-[190px] border rounded px-2 py-[6px]"
            >
              <option>--Select--</option>
              <option value="Company A">Company A</option>
              <option value="Company B">Company B</option>
            </select>
          </div>
          <div>
            <label className="block ">
              Product Category:<span className="text-red-500">*</span>
            </label>
            <select
              name="productCategory"
              onChange={handleChange}
              className="w-[190px] border rounded px-2 py-[6px]"
            >
              <option>--Select--</option>
              <option value="Engine">Engine</option>
              <option value="Body">Body</option>
            </select>
          </div>
          <div>
            <label className="block ">
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
            <label className="block ">
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
            <label className="block ">Product Code</label>
            <input
              value="AUTO GENERATE"
              readOnly
              className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block ">Product Image:</label>
            <input
              type="file"
              name="productImage"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block ">Brand Name:</label>
            <input
              name="brandName"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block ">Model No:</label>
            <input
              name="modelNo"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block ">Net Weight:</label>
            <input
              name="netWeight"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          

          {/* Remarks */}
          <div>
            <label className="block ">Remarks:</label>
            <textarea
              name="remarks"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              rows="1"
            />
          </div>

           <div>
            <label className="block ">MRP:</label>
            <input
              name="mrp"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>

           <div>
            <label className="block ">Percentage:</label>
            <input
              name="percentage"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>

           <div>
            <label className="block ">BDT:</label>
            <input
              name="bdt"
              type="text"
              onChange={handleChange}
                value={formData.bdt}
                readOnly
              className="w-full border rounded px-2 py-1"
            />
          </div>

           <div>
            <label className="block ">HS Code:</label>
            <input
              name="hscode"
              type="number"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>

        
        </div>
          {/* Buttons */}
          <div className="">
            <button
              type="submit"
              className="bg-sky-950 text-white px-3 py-1 h-1/2  rounded hover:bg-sky-700"
            >
              Submit
            </button>
          </div>
      </form>
    </div>
  );
}
