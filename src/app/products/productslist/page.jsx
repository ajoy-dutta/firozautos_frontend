"use client";
import AxiosInstance from "@/app/components/AxiosInstance";
import { useEffect, useState } from "react";
import { MdModeEdit, MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useRouter } from "next/navigation";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [rawResponse, setRawResponse] = useState(null);  // for debugging
  const [filterCompany, setFilterCompany] = useState("");
  const [filterPartNo, setFilterPartNo] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const router = useRouter();

  // Fetch products from the API
  const fetchProducts = async () => {
    try {
      const response = await AxiosInstance.get("products/");
      console.log("Fetched response:", response.data);
      setRawResponse(response.data);

      // Handle paginated or unpaginated response
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data?.results) {
        setProducts(response.data.results);
      } else {
        console.error("Unexpected API response:", response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Error fetching products. Check console for details.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCompany, filterPartNo, filterProduct]);

  // Filtering
  const filteredProducts = products.filter((item) => {
    const matchCompany = filterCompany
      ? item.category_detail.company_detail.id.toString() === filterCompany
      : true;
    const matchPartNo = filterPartNo
      ? item.part_no?.toLowerCase().includes(filterPartNo.toLowerCase())
      : true;
    const matchProduct = filterProduct
      ? item.id.toString() === filterProduct
      : true;

    return matchCompany && matchPartNo && matchProduct;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleEdit = (id) => {
    router.push(`/products/addproducts?id=${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await AxiosInstance.delete(`/products/${id}/`);
      if (res.status === 204) {
        alert("Product deleted successfully.");
        fetchProducts();
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting product. Check console for details.");
    }
  };

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h1 className="text-slate-500 text-xl mb-6 pb-1 border-slate-500 border-b-[1px]">
        Product List
      </h1>


      {/* Filter Form */}
      <div className="mt-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <select
          className="w-full border border-gray-300 rounded-sm px-4 py-[6px]"
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
        >
          <option value="">--Select Company--</option>
          {[
            ...new Set(
              products.map((p) => p.category_detail.company_detail.id)
            ),
          ].map((id) => {
            const name = products.find(
              (p) => p.category_detail.company_detail.id === id
            )?.category_detail.company_detail.company_name;
            return (
              <option key={id} value={id}>
                {name}
              </option>
            );
          })}
        </select>

        <input
          type="text"
          placeholder="Part No"
          value={filterPartNo}
          onChange={(e) => setFilterPartNo(e.target.value)}
          className="w-full border border-gray-300 rounded-sm px-4 py-1"
        />

        <select
          className="w-full border border-gray-300 rounded-sm px-4 py-[6px]"
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
        >
          <option value="">--Select Product--</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.product_name}
            </option>
          ))}
        </select>

        <button
          onClick={() => alert("Export to Excel functionality not implemented yet.")}
          className="w-1/2 text-sm bg-emerald-600 text-white rounded-sm px-4 py-[6px]"
        >
          Export To Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-xs text-xs text-left">
          <thead className="bg-gray-100">
            <tr className="text-center">
              <th className="p-2 border border-slate-400">SL</th>
              <th className="p-2 border border-slate-400">Image</th>
              <th className="p-2 border border-slate-400">Company</th>
              <th className="p-2 border border-slate-400">Part No</th>
              <th className="p-2 border border-slate-400">Product Name</th>
              <th className="p-2 border border-slate-400">Code</th>
              <th className="p-2 border border-slate-400">Brand</th>
              <th className="p-2 border border-slate-400">Model</th>
              <th className="p-2 border border-slate-400">MRP</th>
              <th className="p-2 border border-slate-400">Percentage</th>
              <th className="p-2 border border-slate-400">BDT</th>
              <th className="p-2 border border-slate-400">Weight</th>
              <th className="p-2 border border-slate-400">HS Code</th>
              <th className="p-2 border border-slate-400">Entry By</th>
              <th className="p-2 border border-slate-400">Remarks</th>
              <th className="p-2 border border-slate-400">Edit</th>
              <th className="p-2 border border-slate-400">Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, idx) => (
              <tr key={item.id} className="border text-center border-slate-400">
                <td className="p-2 border border-slate-400">{idx + 1}</td>
                <td className="p-2 border border-slate-400">
                  <img
                    src={item.image || "/no-image.png"}
                    alt="product"
                    className="w-12 h-10 object-cover border border-slate-400"
                  />
                </td>
                <td className="p-2 border border-slate-400">
                  {item.category_detail?.company_detail?.company_name || "N/A"}
                </td>
                <td className="p-2 border border-slate-400">{item.part_no}</td>
                <td className="p-2 border border-slate-400">{item.product_name}</td>
                <td className="p-2 border border-slate-400">{item.product_code}</td>
                <td className="p-2 border border-slate-400">{item.brand_name}</td>
                <td className="p-2 border border-slate-400">{item.model_no}</td>
                <td className="p-2 border border-slate-400">৳{item.product_mrp}</td>
                <td className="p-2 border border-slate-400">৳{item.percentage}</td>
                <td className="p-2 border border-slate-400">৳{item.product_bdt}</td>
                <td className="p-2 border border-slate-400">{item.net_weight}</td>
                <td className="p-2 border border-slate-400">{item.hs_code}</td>
                <td className="p-2 border border-slate-400">{item.entryBy || "Admin"}</td>
                  <td className="p-2 border border-slate-400">{item.remarks}</td>
                <td
                  className="p-2 text-lg border border-slate-400 text-blue-600 cursor-pointer hover:text-blue-800"
                  onClick={() => handleEdit(item.id)}
                  title="Edit Product"
                >
                  <MdModeEdit />
                </td>
                <td
                  className="p-2 text-lg border border-slate-400 text-red-600 cursor-pointer hover:text-red-800"
                  onClick={() => handleDelete(item.id)}
                  title="Delete Product"
                >
                  <RiDeleteBin6Line />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4 gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-xs border rounded disabled:opacity-50"
        >
          <MdNavigateBefore />
        </button>

        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx + 1)}
            className={`px-3 py-1 border rounded-full ${
              currentPage === idx + 1 ? "bg-sky-950 text-sm text-white" : ""
            }`}
          >
            {idx + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          <MdNavigateNext />
        </button>
      </div>
    </div>
  );
}
