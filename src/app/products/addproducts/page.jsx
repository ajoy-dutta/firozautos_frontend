"use client";

import AxiosInstance from "@/app/components/AxiosInstance";
import { useEffect, useState } from "react";

export default function ProductEntryForm() {
  const [categoryList, setCategoryList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    category: "",
    product_name: "",
    part_no: "",
    hs_code: "",
    image: null,
    brand_name: "",
    model_no: "",
    net_weight: "",
    remarks: "",
    product_mrp: "",
    percentage: "",
    product_bdt: "",
  });

  const fetchCompanyNames = async () => {
    try {
      const response = await AxiosInstance.get("companies/");
      setCompanyList(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await AxiosInstance.get("product-categories/");
      setCategoryList(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCompanyNames();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      return;
    }

    // Handle MRP & Percentage calculation
    if (name === "product_mrp" || name === "percentage") {
      const updatedForm = {
        ...formData,
        [name]: value,
      };

      const mrp = parseFloat(updatedForm.product_mrp);
      const percentage = parseFloat(updatedForm.percentage);

      const isValid = !isNaN(mrp) && !isNaN(percentage);
      const bdt = isValid ? (percentage * mrp).toFixed(2) : "";

      setFormData({
        ...updatedForm,
        product_bdt: bdt,
      });
      return;
    }


    // Filter categories by selected company
    if (name === "company") {
      const companyId = parseInt(value);
      const filtered = categoryList.filter(
        (cat) => cat.company_detail?.id === companyId
      );
      setFilteredCategories(filtered);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      for (const key in formData) {
        submitData.append(key, formData[key]);
      }

      const res = await AxiosInstance.post("/products/", submitData);

      if (res.status === 201 || res.status === 200) {
        alert("Product submitted successfully!");
        setFormData({
          company: "",
          category: "",
          product_name: "",
          part_no: "",
          hs_code: "",
          image: null,
          brand_name: "",
          model_no: "",
          net_weight: "",
          remarks: "",
          product_mrp: "",
          percentage: "",
          product_bdt: "",
        });
        // document.querySelector('input[name="image"]')?.value = "";
      } else {
        alert("Something went wrong during submission.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 text-sm">
      <h2 className="text-xl text-slate-700  mb-4 pb-3 border-slate-400 border-b-[1px]">
        Products Entry
      </h2>
      <form className="space-y-4 text-slate-700" onSubmit={handleSubmit}>
        {/* Rows */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8 place-items-start">
          <div>
            <label className="block ">
              Company Name:<span className="text-red-500">*</span>
            </label>
            <select
              name="company"
              onChange={handleChange}
              className="w-[190px] border rounded px-2 py-[6px]"
            >
              <option>--Select--</option>
              {companyList.map((company, index) => (
                <option key={index} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block ">
              Product Category:<span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              onChange={handleChange}
              className="w-[190px] border rounded px-2 py-[6px]"
            >
              <option value="">--Select--</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block ">
              Product Name:<span className="text-red-600">*</span>
            </label>
            <input
              name="product_name"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block ">
              Part No:<span className="text-red-600">*</span>
            </label>
            <input
              name="part_no"
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
              name="image"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block ">Brand Name:</label>
            <input
              name="brand_name"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block ">Model No:</label>
            <input
              name="model_no"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block ">Net Weight:</label>
            <input
              name="net_weight"
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
              name="product_mrp"
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
              name="product_bdt"
              type="text"
              onChange={handleChange}
              value={formData.product_bdt}
              readOnly
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block ">
              HS Code:<span className="text-red-600">*</span>
            </label>

            <input
              name="hs_code"
              type="number"
              placeholder="HS Code"
              required
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>
        {/* Buttons */}
        {loading ? (
        <div className="flex items-center justify-center">  <div className="h-10 w-10 animate-[spin_1s_linear_infinite] rounded-full border-4 border-l-0 border-r-0 border-double border-b-sky-400 border-t-sky-700"></div></div>
        ) : (
          <div className="">
          <button
            type="submit"
            className="bg-sky-950 text-white px-3 py-1 h-1/2  rounded hover:bg-sky-700"
          >
            Submit
          </button>
        </div>
        )}
      </form>
    </div>
  );
}
