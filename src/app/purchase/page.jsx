"use client";

import { useState, useEffect } from "react";
import AxiosInstance from "../components/AxiosInstance";

export default function LoanPurchaseEntry() {
  const [formData, setFormData] = useState({
    invoiceNo: "AUTO GENERATE",
    purchaseDate: "",
    exporterName: "",
    companyName: "",
    partNoInput: "",
    partNoSelect: "",
    totalPrice: "",
    quantity: "",
    purchasePrice: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [exporters, setExporters] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchExporters = async () => {
      try {
        const response = await AxiosInstance.get("exporters/");
        const response2 = await AxiosInstance.get("companies/");
        setExporters(response.data);
        setCompanies(response2.data);
      } catch (error) {
        console.error("Error fetching exporters:", error);
      }
    };

    fetchExporters();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await AxiosInstance.get("products/");
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    setFormData((prev) => ({
      ...prev,
      purchaseDate: today,
    }));
  }, []);

  const handlePartNoChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, partNoInput: value });

    if (value.length > 0) {
      const filtered = products.filter((p) =>
        p.part_no.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (part_no) => {
    setFormData({ ...formData, partNoInput: part_no });
    setSuggestions([]);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSearch = () => {
    if (!formData.partNoInput) {
      alert("Please enter a Part No to search!");
      return;
    }

    // Find the product in the products list
    const productMatch = products.find(
      (p) => p.part_no.toLowerCase() === formData.partNoInput.toLowerCase()
    );

    if (productMatch) {
      // Save it with exporter name attached
      setSelectedProduct({
        ...productMatch,
        exporterName: formData.exporterName,
        qty: "",
        purchasePrice: "",
      });
    } else {
      alert("Product not found!");
    }
  };

  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.purchasePrice) || 0;
    const total = quantity * price;

    setFormData((prev) => ({
      ...prev,
      totalPrice: total.toFixed(2),
    }));
  }, [formData.quantity, formData.purchasePrice]);

  const handleUpload = () => {
    if (selectedFile) {
      console.log("Uploading:", selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Submitting:", formData);

      const response = await AxiosInstance.post("purchase/", formData);

      console.log("Success:", response.data);
      alert("Purchase entry saved successfully!");

      setFormData({
        invoiceNo: "AUTO GENERATE",
        purchaseDate: "",
        exporterName: "",
        companyName: "",
        partNoInput: "",
        partNoSelect: "",
        totalPrice: "",
        quantity: "",
        purchasePrice: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error saving purchase entry. Please check the console.");
    }
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
    <div className="max-w-6xl mx-auto px-4 py-4">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Product Purchase Entry
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white shadow rounded p-6"
      >
        {/* Purchase Entry Section */}
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Invoice No:
            </label>
            <input
              type="text"
              name="invoiceNo"
              value={formData.invoiceNo}
              readOnly
              className="w-full border rounded px-3 h-8 bg-gray-100 cursor-not-allowed"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Purchase Date *
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 h-8"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Exporter Name *
            </label>
            <select
              name="exporterName"
              value={formData.exporterName}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 h-8"
              onKeyDown={handleKeyDown}
            >
              <option value="">--Select--</option>
              {exporters.map((exp) => (
                <option key={exp.id} value={exp.name}>
                  {exp.exporter_name}/ {exp.whatsapp_number}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Search */}
        <h3 className="text-lg font-semibold mt-8">Product Search</h3>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Left Side: Search Form (3/5) */}
          <div className="md:basis-3/5 w-full">
            <div className="grid md:grid-cols-4 gap-4 items-end">
              {/* Company Name */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold mb-1">
                  Company Name *
                </label>
                <select
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-1 h-8"
                  onKeyDown={handleKeyDown}
                >
                  <option value="">--Select--</option>
                  {companies.map((item) => (
                    <option key={item.id} value={item.company_name}>
                      {item.company_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Part No with Suggestions */}
              <div className="relative col-span-2 md:col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  Part No *
                </label>
                <input
                  type="text"
                  name="partNoInput"
                  value={formData.partNoInput}
                  onChange={handlePartNoChange}
                  placeholder="Type or select part no"
                  className="w-full border rounded px-2 h-8"
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 bg-white border rounded shadow w-full max-h-40 overflow-y-auto mt-1">
                    {suggestions.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => handleSuggestionClick(item.part_no)}
                        className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                      >
                        {item.part_no}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Search Button */}
              <div className="col-span-1">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 w-full"
                  onKeyDown={handleKeyDown}
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: File Upload (2/5) */}
          <div className="md:basis-2/5 w-1/2 bg-white px-4 rounded shadow">
            <h3 className="text-md font-semibold mb-2 text-sky-700">
              Download Template
            </h3>

            <div className="flex flex-col gap-3">
              <input
                type="file"
                onChange={handleFileChange}
                className="border rounded px-3 py-1 w-1/2"
                onKeyDown={handleKeyDown}
              />

              <button
                type="button"
                onClick={handleUpload}
                className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 w-1/2"
                onKeyDown={handleKeyDown}
              >
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* Total Price */}
        <div className="md:w-1/3">
          <label className="block text-sm font-semibold mb-1">
            Total Price:
          </label>
          <input
            type="text"
            name="totalPrice"
            value={formData.totalPrice}
            readOnly
            className="w-2/3 border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Product Details</h3>

          {selectedProduct ? (
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-cyan-500 text-white text-left">
                  <th className="border px-2 py-1">Product Image</th>
                  <th className="border px-2 py-1">Part No</th>
                  <th className="border px-2 py-1">Product Name</th>
                  <th className="border px-2 py-1">Product Category</th>
                  <th className="border px-2 py-1">Qty</th>
                  <th className="border px-2 py-1">Purchase Price</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50 text-left">
                  <td className="border p-2">
                    {selectedProduct.image_url ? (
                      <img
                        src={selectedProduct.image_url}
                        alt={selectedProduct.name}
                        className="w-12 h-12 object-cover"
                      />
                    ) : (
                      <span className="text-red-600 text-xs">No Image</span>
                    )}
                  </td>
                  <td className="border p-2">{selectedProduct.part_no}</td>
                  <td className="border p-2">{selectedProduct.product_name}</td>
                  <td className="border p-2">{selectedProduct.category}</td>
                  <td className="border p-2">
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-2/3"
                      onKeyDown={handleKeyDown}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-2/3"
                      onKeyDown={handleKeyDown}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">No product selected yet.</p>
          )}
        </div>

        {/* Submit */}
        <div className="text-left mt-8">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
