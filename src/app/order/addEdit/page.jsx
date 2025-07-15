"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../components/AxiosInstance";
import toast from "react-hot-toast";

export default function ProductOrderEntry() {
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "30px",
      height: "30px",
      fontSize: "0.875rem",
      border: "1px solid #000000",
      borderRadius: "0.275rem",
      borderColor: state.isFocused ? "#000000" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #000000" : "none",
      // Remove default padding
      paddingTop: "0px",
      paddingBottom: "0px",
      // Ensure flex alignment
      display: "flex",
      alignItems: "center",
    }),

    valueContainer: (base) => ({
      ...base,
      height: "30px",
      padding: "0 6px",
      display: "flex",
      alignItems: "center",
      flexWrap: "nowrap",
    }),

    placeholder: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#9ca3af",
      margin: "0",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),

    singleValue: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#000000",
      margin: "0",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),

    input: (base) => ({
      ...base,
      fontSize: "0.875rem",
      margin: "0",
      padding: "0",
      color: "#000000",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),

    indicatorsContainer: (base) => ({
      ...base,
      height: "30px",
      display: "flex",
      alignItems: "center",
    }),

    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "#d1d5db",
      height: "16px", // Shorter separator
      marginTop: "auto",
      marginBottom: "auto",
    }),

    dropdownIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": {
        color: "#000000",
      },
    }),

    clearIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": {
        color: "#000000",
      },
    }),

    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#000000"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#000000",
      "&:hover": {
        backgroundColor: state.isSelected ? "#000000" : "#f3f4f6",
      },
    }),

    menu: (base) => ({
      ...base,
      fontSize: "0.875rem",
    }),

    menuList: (base) => ({
      ...base,
      fontSize: "0.875rem",
    }),
  };

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orderInputs, setOrderInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    axiosInstance
      .get("/products/")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAllProducts(res.data);
          setFilteredProducts(res.data);
        } else {
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
    console.log("Selected company:", company);
    setSelectedCompany(company);
    setOrderInputs({});
    setCurrentPage(1);
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
  const items = Object.entries(orderInputs)
    .filter(([_, fields]) => fields.qty && fields.order_price)
    .map(([productId, fields]) => ({
      product_id: parseInt(productId),  // must be a single number
      quantity: parseInt(fields.qty),
      order_price: parseFloat(fields.order_price),
    }));

  if (items.length === 0) {
    toast.error("Please enter quantity and price for at least one product");
    return;
  }

  const payload = {
    order_date: new Date().toISOString().split("T")[0],
    items,
  };

  console.log("Payload to backend:", payload);

   axiosInstance.post("/orders/", payload)
    .then(() => {
      toast.success("Order saved successfully!");

      // ✅ Clear form fields
      setOrderInputs({});
      setSelectedCompany(null);
      setFilteredProducts(allProducts); // reset product list
    })

    .catch((error) => {
      console.error("Order save failed:", error);
      toast.error("Failed to save order.");
    });
};


  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Product Order Entry</h2>
        <p>Loading companies and products...</p>
      </div>
    );
  }

  return (
    <div className="">
      <h2 className="text-xl font-bold mb-2">Product Order Entry</h2>

      <div className="flex justify-between gap-6 flex-wrap">
        {/* Order No + Order Date */}
        <div className="flex gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium">Order No:</label>
            <p className="border bg-gray-100 text-sm rounded px-3 h-[36px] flex items-center">
              AUTO GENERATED
            </p>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">Order Date:</label>
            <input
              type="date"
              className="border rounded text-sm px-3 h-[36px] min-w-[180px]"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Company Select */}
        <div className="flex flex-col min-w-[250px]">
          <label className="text-sm font-medium mb-1">Company Name:</label>
          <Select
            options={companies}
            value={selectedCompany}
            onChange={handleCompanyChange}
            isClearable
            isSearchable
            placeholder="Search or select a company..."
            noOptionsMessage={() => "No companies found"}
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: "36px",
                height: "36px",
                fontSize: "0.875rem",
                borderRadius: "0.375rem",
                borderColor: state.isFocused ? "#000" : "#d1d5db",
                boxShadow: "none",
              }),
              dropdownIndicator: (base) => ({
                ...base,
                paddingTop: 2,
                paddingBottom: 2,
              }),
              valueContainer: (base) => ({
                ...base,
                paddingTop: 0,
                paddingBottom: 0,
              }),
              input: (base) => ({
                ...base,
                margin: 0,
                padding: 0,
              }),
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="table-auto w-full text-sm border">
          <thead className="bg-sky-800 text-white">
            <tr>
              <th className="border p-2 w-24">Image</th>
              <th className="border p-2 w-32">Part No</th>
              <th className="border p-2 w-48">Product Name</th>
              <th className="border p-2 w-32">Category</th>
              <th className="border p-2 w-24">Qty</th>
              <th className="border p-2 w-32">Order Price</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => (
                <tr key={p.id}>
                  <td className="border p-2 text-center">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.product_name}
                        className="w-10 h-10 object-cover mx-auto"
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  <td className="border p-2">{p.part_no || "N/A"}</td>
                  <td className="border p-2">{p.product_name || "N/A"}</td>
                  <td className="border p-2">
                    {p.category_detail?.category_name || "N/A"}
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="1"
                      className="w-full border rounded px-2 py-1"
                      value={orderInputs[p.id]?.qty || ""}
                      onChange={(e) =>
                        handleInputChange(p.id, "qty", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full border rounded px-2 py-1"
                      value={orderInputs[p.id]?.order_price || ""}
                      onChange={(e) =>
                        handleInputChange(p.id, "order_price", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 p-6">
                  {selectedCompany
                    ? "No products found for selected company"
                    : "No products available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>
        )}

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
