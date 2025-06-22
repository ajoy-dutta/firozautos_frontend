"use client";
import AxiosInstance from "@/app/components/AxiosInstance";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function page() {
  const [companyName, setCompanyName] = useState([]);

  const fetchCompanyNames = async () => {
    try {
      const response = await AxiosInstance.get("companies/");
      setCompanyName(response.data.map((company) => company.company_name));
      console.log("Fetched company names:", response.data);
    } catch (error) {
      console.error("Error fetching company names:", error);
    }
  };

  useEffect(() => {
    fetchCompanyNames();
  }, []);

  return (
    <div>
      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Product Category Master
        </h2>

        <form className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Company Name:<span className="text-red-600">*</span>
            </label>
            <select
              required
              className="border border-gray-300 rounded px-3 py-[6px] w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value=""> --------Select a company-------- </option>
              {companyName.map((company, index) => (
                <option className="py-1" key={index} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Product Category :<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-2 pt-10 mb-1">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
            >
              Save
            </button>
            <button
              type="reset"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
            >
              Reset
            </button>
          </div>
        </form>

           {/* Table */}
              <div className="mt-8 overflow-x-auto">
                <table className="w-full border border-collapse text-sm">
                  <thead className="bg-sky-900 text-white">
                    <tr>
                      <th className="border border-gray-400 px-2 py-1">SL</th>
                      <th className="border border-gray-400 px-2 py-1">Company Name</th>
                      <th className="border border-gray-400 px-2 py-1">Incharge Name</th>
                      <th className="border border-gray-400 px-2 py-1">Phone No</th>
                      <th className="border border-gray-400 px-2 py-1">Email Id</th>
                      <th className="border border-gray-400 px-2 py-1">Address</th>
                      <th className="border border-gray-400 px-2 py-1">Country</th>
                      <th className="border border-gray-400 px-2 py-1">Edit</th>
                      <th className="border border-gray-400 px-2 py-1">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyName.map((c, index) => (
                      <tr key={c.id} className="text-center">
                        <td className="border border-gray-400 px-2 py-1">{index + 1}</td>
                        <td className="border border-gray-400 px-2 py-1">
                          {c.company_name}
                        </td>
                        <td className="border border-gray-400 px-2 py-1">
                          {c.incharge_name}
                        </td>
                        <td className="border border-gray-400 px-2 py-1">{c.phone_no}</td>
                        <td className="border border-gray-400 px-2 py-1">{c.email}</td>
                        <td className="border border-gray-400 px-2 py-1">{c.address}</td>
                        <td className="border border-gray-400 px-2 py-1">{c.country}</td>
                        <td
                          className="border border-gray-400 px-2 py-1 text-yellow-600 cursor-pointer"
                          onClick={() => handleEdit(c)}
                        >
                          <div className="flex justify-center items-center">
                            <FaEdit />
                          </div>
                        </td>
                        <td
                          className="border border-gray-400 px-2 py-1 text-red-600 cursor-pointer"
                          onClick={() => handleDelete(c.id)}
                        >
                          <div className="flex justify-center items-center">
                            <FaTrash />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
      </div>
    </div>
  );
}
