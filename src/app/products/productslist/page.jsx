"use client";
import { useEffect, useState } from "react";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Replace this with actual API call
    setProducts([
      {
        id: 1,
        image: null,
        company: "Suzuki",
        partNo: "12140-23J00-000",
        name: "PISTON RING",
        code: "PROD00066",
        brand: "SUZUKI",
        model: "HAYATE",
        mrp: 244.0,
        weight: 0.005,
        date: "26/02/2022",
        entryBy: "Admin",
      },
      {
        id: 2,
        image: null,
        company: "Yamaha",
        partNo: "2GSXF413J0P8",
        name: "TANKSIDE COVER",
        code: "PROD01010",
        brand: "YAMAHA",
        model: "FZ FI",
        mrp: 1392.0,
        weight: 0.0563,
        date: "01/03/2022",
        entryBy: "Admin",
      },
      // Add more dummy or fetched data
    ]);
  }, []);

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h1 className="text-slate-500 text-xl mb-6 pb-1 border-slate-500 border-b-[1px]">Product List</h1>

      {/* Filter Form */}
      <div className=" mt-10 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <select className="w-full border border-gray-300 rounded-sm px-4 py-[6px]">
          <option>--Select Company--</option>
        </select>
        <input
          type="text"
          placeholder="Part No"
          className="w-full border border-gray-300 rounded-sm px-4 py-1"
        />
        <select className="w-full border border-gray-300 rounded-sm px-4 py-[6px]">
          <option>--Select Product--</option>
        </select>
        <button className="w-1/2  bg-sky-600 text-white  rounded-sm px-4 py-1">
          Search
        </button>
        <button className="w-1/2 text-sm bg-emerald-600 text-white   rounded-sm px-4 py-[6px]">
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
              <th className="p-2  border border-slate-400 ">Weight</th>
              <th className="p-2  border border-slate-400 ">Date</th>
              <th className="p-2  border border-slate-400 ">Entry By</th>
              <th className="p-2  border border-slate-400 ">Edit</th>
              <th className="p-2  border border-slate-400 ">Delete</th>
            
            </tr>
          </thead>
          <tbody>
            {products.map((item, idx) => (
              <tr key={item.id} className="border text-center border-slate-400 ">
                <td className="p-2  border border-slate-400 ">{idx + 1}</td>
                <td className="p-2  border border-slate-400 ">
                  <img
                    src={item.image || "/no-image.png"}
                    alt="product"
                    className="w-12 h-10 object-cover  border border-slate-400 "
                  />
                </td>
                <td className="p-2  border border-slate-400 ">{item.company}</td>
                <td className="p-2  border border-slate-400 ">{item.partNo}</td>
                <td className="p-2  border border-slate-400 ">{item.name}</td>
                <td className="p-2  border border-slate-400 ">{item.code}</td>
                <td className="p-2  border border-slate-400 ">{item.brand}</td>
                <td className="p-2  border border-slate-400 ">{item.model}</td>
                <td className="p-2  border border-slate-400 ">৳{item.mrp.toFixed(2)}</td>
                <td className="p-2  border border-slate-400 ">{item.weight}</td>
                <td className="p-2  border border-slate-400 ">{item.date}</td>
                <td className="p-2  border border-slate-400 ">{item.entryBy}</td>
                <td className="p-2  border border-slate-400  text-blue-600 cursor-pointer">✏️</td>
                <td className="p-2  border border-slate-400  text-red-600 cursor-pointer">❌</td>
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

