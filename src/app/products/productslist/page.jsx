"use client";
import AxiosInstance from "@/app/components/AxiosInstance";
import { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  const [filterCompany, setFilterCompany] = useState("");
const [filterPartNo, setFilterPartNo] = useState("");
const [filterProduct, setFilterProduct] = useState("");


  const fetchProducts = async () => {
    try {
      const response = await AxiosInstance.get("products/"); // Adjust the API endpoint as needed
      setProducts(response.data);
      console.log("Fetched products:", response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const res = await AxiosInstance.delete(`/products/${id}/`);
      if (res.status === 204) {
        alert("Product deleted successfully.");
        fetchProducts(); // refresh the list
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting product.");
    }
  };

  const filteredProducts = products.filter((item) => {
  const matchCompany = filterCompany
    ? item.category_detail.company_detail.id.toString() === filterCompany
    : true;
  const matchPartNo = filterPartNo
    ? item.part_no.toLowerCase().includes(filterPartNo.toLowerCase())
    : true;
  const matchProduct = filterProduct
    ? item.id.toString() === filterProduct
    : true;

  return matchCompany && matchPartNo && matchProduct;
});


  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h1 className="text-slate-500 text-xl mb-6 pb-1 border-slate-500 border-b-[1px]">
        Product List
      </h1>

      {/* Filter Form */}
     <div className="mt-10 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
  {/* Filter by Company */}
  <select
    className="w-full border border-gray-300 rounded-sm px-4 py-[6px]"
    value={filterCompany}
    onChange={(e) => setFilterCompany(e.target.value)}
  >
    <option value="">--Select Company--</option>
    {[...new Set(products.map((p) => p.category_detail.company_detail.id))].map((id) => {
      const name = products.find(p => p.category_detail.company_detail.id === id)?.category_detail.company_detail.company_name;
      return <option key={id} value={id}>{name}</option>;
    })}
  </select>

  {/* Filter by Part No */}
  <input
    type="text"
    placeholder="Part No"
    value={filterPartNo}
    onChange={(e) => setFilterPartNo(e.target.value)}
    className="w-full border border-gray-300 rounded-sm px-4 py-1"
  />

  {/* Filter by Product */}
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

  <button className="w-1/2 text-sm bg-emerald-600 text-white rounded-sm px-4 py-[6px]">
    Export To Excel
  </button>
</div>


      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-xs text-xs text-left">
          <thead className="bg-gray-100">
            <tr className="text-center">
              <th className="p-2  border border-slate-400 ">SL</th>
              <th className="p-2  border border-slate-400 ">Image</th>
              <th className="p-2  border border-slate-400 ">Company</th>
              <th className="p-2  border border-slate-400 ">Part No</th>
              <th className="p-2  border border-slate-400 ">Product Name</th>
              <th className="p-2  border border-slate-400 ">Code</th>
              <th className="p-2  border border-slate-400 ">Brand</th>
              <th className="p-2  border border-slate-400 ">Model</th>
              <th className="p-2  border border-slate-400 ">MRP</th>
              <th className="p-2  border border-slate-400 ">Percentage</th>
              <th className="p-2  border border-slate-400 ">BDT</th>
              <th className="p-2  border border-slate-400 ">Weight</th>
              <th className="p-2  border border-slate-400 ">HS Code</th>
              {/* <th className="p-2  border border-slate-400 ">Create Date</th> */}
              <th className="p-2  border border-slate-400 ">Entry By</th>
              <th className="p-2  border border-slate-400 ">Edit</th>
              <th className="p-2  border border-slate-400 ">Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((item, idx) => (
              <tr
                key={item.id}
                className="border text-center border-slate-400 "
              >
                <td className="p-2  border border-slate-400 ">{idx + 1}</td>
                <td className="p-2  border border-slate-400 ">
                  <img
                    src={item.image || "/no-image.png"}
                    alt="product"
                    className="w-12 h-10 object-cover  border border-slate-400 "
                  />
                </td>
                <td className="p-2  border border-slate-400 ">
                  {item.category_detail.company_detail.company_name}
                </td>
                <td className="p-2  border border-slate-400 ">
                  {item.part_no}
                </td>
                <td className="p-2  border border-slate-400 ">
                  {item.product_name}
                </td>
                <td className="p-2  border border-slate-400 ">
                  {item.product_code}
                </td>
                <td className="p-2  border border-slate-400 ">
                  {item.brand_name}
                </td>
                <td className="p-2  border border-slate-400 ">
                  {item.model_no}
                </td>
                <td className="p-2  border border-slate-400 ">
                  ৳{item.product_mrp}
                </td>
                <td className="p-2  border border-slate-400 ">
                  ৳{item.percentage}
                </td>
                <td className="p-2  border border-slate-400 ">
                  ৳{item.product_bdt}
                </td>
                <td className="p-2  border border-slate-400 ">
                  {item.net_weight}
                </td>
                <td className="p-2  border border-slate-400 ">
                  {item.hs_code}
                </td>
                <td className="p-2  border border-slate-400 ">
                  {item.entryBy || "Admin"}
                </td>
                <td className="p-2 text-lg border border-slate-400  text-blue-600 cursor-pointer">
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
    </div>
  );
}
