"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../components/AxiosInstance";
import toast from "react-hot-toast";

export default function ProductOrderEntry() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orderInputs, setOrderInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Simplified company fetch
  useEffect(() => {
    axiosInstance
      .get("/companies/")
      .then((res) => {
        if (Array.isArray(res.data)) {
          const options = res.data.map((company) => ({
            label: company.company_name,
            value: company.id,
            details: company,
          }));
          setCompanies(options);
        } else {
          console.warn("Invalid companies data");
          setCompanies([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load companies:", err);
        setError(`Failed to load companies: ${err.message}`);
        setLoading(false);
      });
  }, []);

  // Products fetch remains unchanged
  useEffect(() => {
    axiosInstance
      .get("/products")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAllProducts(res.data);
          setFilteredProducts(res.data);
        } else {
          console.warn("Invalid products data");
          setAllProducts([]);
          setFilteredProducts([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setError(`Failed to load products: ${err.message}`);
      });
  }, []);

  const handleCompanyChange = (company) => {
    setSelectedCompany(company);
    setOrderInputs({});
    if (company) {
      const filtered = allProducts.filter((p) => p.company === company.value);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(allProducts);
    }
  };

  const handleInputChange = (productId, field, value) => {
    setOrderInputs((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    const output = Object.entries(orderInputs)
      .filter(([_, fields]) => fields.qty && fields.order_price)
      .map(([productId, fields]) => ({
        product_id: parseInt(productId),
        quantity: parseInt(fields.qty),
        order_price: parseFloat(fields.order_price),
      }));

    if (output.length === 0) {
      toast.error("Please enter quantity and price for at least one product");
      return;
    }

    console.log("📝 Order data prepared:", output);
    toast.success(`Order prepared for ${output.length} products`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Product Order Entry</h2>
        <p>Loading companies and products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Product Order Entry</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Product Order Entry</h2>

      <div className="flex gap-6">
        <div>
          <label className="text-sm font-medium">Order No:</label>
          <p className="border px-3 py-1 bg-gray-100 rounded">AUTO GENERATED</p>
        </div>
        <div>
          <label className="text-sm font-medium">Order Date:</label>
          <input
            type="date"
            className="border rounded px-3 py-1"
            defaultValue={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      {/* Company Select */}
      <div>
        <label className="text-sm font-medium mb-1 block">Company Name:</label>
        <Select
          options={companies}
          value={selectedCompany}
          onChange={handleCompanyChange}
          isClearable
          isSearchable
          placeholder="Search or select a company..."
          noOptionsMessage={() => "No companies found"}
        />
      </div>

      {/* Extra Company Info */}
      {selectedCompany && (
        <div className="mt-2 text-sm bg-gray-100 p-3 rounded border">
          <p><strong>Incharge:</strong> {selectedCompany.details?.incharge_name || 'N/A'}</p>
          <p><strong>Phone:</strong> {selectedCompany.details?.phone_no || 'N/A'}</p>
          <p><strong>Email:</strong> {selectedCompany.details?.email || 'N/A'}</p>
          <p><strong>Address:</strong> {selectedCompany.details?.address || 'N/A'}</p>
          <p><strong>Country:</strong> {selectedCompany.details?.country || 'N/A'}</p>
        </div>
      )}

      {/* Product Table */}
      <div className="overflow-x-auto mt-4">
        <table className="table-auto w-full text-sm border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Image</th>
              <th className="border p-2">Part No</th>
              <th className="border p-2">Product Name</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Brand</th>
              <th className="border p-2">MRP</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Order Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td className="border p-2 text-center">
                    {p.image ? (
                      <img 
                        src={p.image} 
                        alt={p.product_name} 
                        className="w-12 h-12 object-cover mx-auto"
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  <td className="border p-2">{p.part_no || 'N/A'}</td>
                  <td className="border p-2">{p.product_name || 'N/A'}</td>
                  <td className="border p-2">{p.category_detail?.category_name || 'N/A'}</td>
                  <td className="border p-2">{p.brand_name || 'N/A'}</td>
                  <td className="border p-2">৳{p.product_mrp || '0'}</td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="1"
                      className="w-20 border rounded px-2 py-1"
                      value={orderInputs[p.id]?.qty || ""}
                      onChange={(e) => handleInputChange(p.id, "qty", e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-24 border rounded px-2 py-1"
                      value={orderInputs[p.id]?.order_price || ""}
                      onChange={(e) => handleInputChange(p.id, "order_price", e.target.value)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-gray-500 p-6">
                  {selectedCompany 
                    ? "No products found for selected company" 
                    : "No products available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="text-right mt-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={Object.keys(orderInputs).length === 0}
          >
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
}
