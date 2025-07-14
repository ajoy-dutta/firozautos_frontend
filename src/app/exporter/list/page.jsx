"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../components/AxiosInstance";
import { useRouter } from "next/navigation";

export default function ExporterListPage() {
  const [exporters, setExporters] = useState([]);
  const [filteredExporters, setFilteredExporters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedExporter, setSelectedExporter] = useState(null);
  const router = useRouter();

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchExporters = async () => {
      try {
        const res = await axiosInstance.get("/exporters/");
        setExporters(res.data);
        setFilteredExporters(res.data);
      } catch (err) {
        console.error("Error fetching exporters:", err);
      }
    };
    fetchExporters();
  }, []);

  const exporterOptions = exporters.map((exp) => ({
    label: exp.exporter_name || "N/A",
    value: exp.id,
  }));

  const handleExporterChange = (selected) => {
    setSelectedExporter(selected);
    setCurrentPage(1);
    if (selected) {
      const filtered = exporters.filter((exp) => exp.id === selected.value);
      setFilteredExporters(filtered);
    } else {
      setFilteredExporters(exporters);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const filtered = exporters.filter((exp) =>
      exp.company_name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredExporters(filtered);
    setCurrentPage(1);
  };

  const handleEdit = (exporter) => {
  localStorage.setItem("editExporterData", JSON.stringify(exporter));
  router.push("/exporter/addEdit");
};


  const totalPages = Math.ceil(filteredExporters.length / itemsPerPage);
  const currentExporters = filteredExporters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Exporters</h2>
        <div className="flex gap-2 items-center">
       
          <Select
            options={exporterOptions}
            value={selectedExporter}
            onChange={handleExporterChange}
            isClearable
            placeholder="Select Exporter"
            className="text-sm w-48 z-50"
            menuPlacement="auto"
            menuPosition="fixed"
          />
        </div>
      </div>

      <div className="overflow-x-auto  rounded-box border border-base-content/5 bg-base-100">
        <table className="table text-sm">
          <thead className="bg-sky-800 text-white">
            <tr>
              <th className="text-center">SL</th>
              <th className="text-center leading-4">Exporter<br />Company Name</th>
              <th className="text-center leading-4">Exporter<br />Name</th>
              <th className="text-center leading-4">Mail<br />Address</th>
              <th className="text-center leading-4">Whatsapp<br />Number</th>
              <th className="text-center leading-4">Create<br />Date</th>
              <th className="text-center leading-4">Entry<br />By</th>
              <th className="text-center">Edit</th>
              <th className="text-center">Delete</th>
              <th className="text-center leading-4">Purchase<br />Statement</th>
            </tr>
          </thead>
          <tbody>
            {currentExporters.length > 0 ? (
              currentExporters.map((exporter, index) => (
                <tr key={exporter.id}>
                  <td className="text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="text-center">{exporter.company_name || "N/A"}</td>
                  <td className="text-center">{exporter.exporter_name || "N/A"}</td>
                  <td className="text-center">{exporter.mail_address || "N/A"}</td>
                  <td className="text-center">{exporter.whatsapp_number || "N/A"}</td>
                  <td className="text-center">{exporter.created_at ? exporter.created_at.slice(0, 10) : "N/A"}</td>
                  <td className="text-center">{exporter.entry_by || "N/A"}</td>
                      <td
                    className="text-center text-blue-600 cursor-pointer hover:underline"
                    onClick={() => handleEdit(exporter)}
                  >
                    Edit
                  </td>
                  <td className="text-center text-red-600 cursor-pointer hover:underline">Delete</td>
                  <td className="text-center text-green-600 cursor-pointer hover:underline">View</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center text-gray-500 py-4">
                  No exporters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}
