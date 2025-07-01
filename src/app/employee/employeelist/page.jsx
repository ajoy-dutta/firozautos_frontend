"use client";

import { useEffect, useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { FaTrash, FaEdit, FaFilePdf } from "react-icons/fa";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    name: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await AxiosInstance.get("/employees/");
      setEmployees(res.data);
      setFilteredList(res.data); // initialize filtered list
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  const applyFilters = ({ name, fromDate, toDate }) => {
    let filtered = [...employees];

    if (name) {
      filtered = filtered.filter((emp) =>
        emp.employee_name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (fromDate) {
      filtered = filtered.filter((emp) =>
        emp.created_at >= fromDate
      );
    }

    if (toDate) {
      filtered = filtered.filter((emp) =>
        emp.created_at <= toDate
      );
    }

    setFilteredList(filtered);
  };

 const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this employee?")) return;

  try {
    await AxiosInstance.delete(`/employees/${id}/`);
    alert("Employee deleted successfully.");
    fetchEmployees();  // re-fetch from server
  } catch (error) {
    console.error("Failed to delete employee", error);
    alert("Error deleting employee.");
  }
};



  return (
    <div className="text-sm text-slate-700 p-4">
      <h2 className="text-xl font-semibold mb-4">Employee List</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="date"
          name="fromDate"
          value={filters.fromDate}
          onChange={handleChange}
          className="border border-slate-400 py-1 px-2 rounded-xs"
        />
        <input
          type="date"
          name="toDate"
          value={filters.toDate}
          onChange={handleChange}
          className="border border-slate-400 py-1 px-2 rounded-xs"
        />
        <input
          type="text"
          name="name"
          value={filters.name}
          onChange={handleChange}
          placeholder="Search by name"
          className="border border-slate-400 py-1 px-2 rounded-xs"
        />
        <button
          onClick={() => alert("Excel export not implemented")}
          className="bg-yellow-500 text-white px-4 py-1 rounded-xs"
        >
          Export to Excel
        </button>
      </div>

      <table className="w-full border border-slate-400">
        <thead className="bg-slate-100 text-center">
          <tr>
            <th className="border py-1 px-2">SL</th>
            <th className="border py-1 px-2">Name</th>
            <th className="border py-1 px-2">Employee Code</th>
            <th className="border py-1 px-2">Father's Name</th>
            <th className="border py-1 px-2">Mother's Name</th>
            <th className="border py-1 px-2">Mobile No</th>
            <th className="border py-1 px-2">Print</th>
            <th className="border py-1 px-2">Salary Statement</th>
            <th className="border py-1 px-2">Edit</th>
            <th className="border py-1 px-2">Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-2 italic">
                No employee found
              </td>
            </tr>
          ) : (
            filteredList.map((emp, index) => (
              <tr key={emp.id} className="text-center">
                <td className="border py-1 px-2">{index + 1}</td>
                <td className="border py-1 px-2">{emp.employee_name}</td>
                <td className="border py-1 px-2">{emp.employee_code}</td>
                <td className="border py-1 px-2">{emp.father_name}</td>
                <td className="border py-1 px-2">{emp.mother_name}</td>
                <td className="border py-1 px-2">{emp.mobile_no}</td>
                <td className="border py-1 px-2">
                  <FaFilePdf className="text-red-600 mx-auto cursor-pointer" />
                </td>
                <td className="border py-1 px-2">
                  <FaFilePdf className="text-red-600 mx-auto cursor-pointer" />
                </td>
                <td className="border py-1 px-2">
                  <FaEdit className="text-yellow-600 mx-auto cursor-pointer" />
                </td>
                <td className="border py-1 px-2">
                  <FaTrash onClick={() => handleDelete(emp.id)} className="text-red-600 mx-auto cursor-pointer" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
