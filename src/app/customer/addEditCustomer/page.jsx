"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import axiosInstance from "../../components/AxiosInstance"; // make sure this is correctly set up
import toast from "react-hot-toast"; 

export default function AddEditCustomerPage({ initialData, onSubmit }) {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState({
    customerName: "",
    district: "",
    customerType: "",
    shopName: "",
    phone1: "",
    phone2: "",
    email: "",
    address: "",
    dob: "",
    nid: "",
    courierName: "",
    remarks: "",
    previousDue: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const districts = [
    "Dhaka", "Chattogram", "Khulna", "Rajshahi", "Barishal", "Sylhet", "Mymensingh", "Rangpur",
    "Comilla", "Cox's Bazar", "Jessore", "Jamalpur", "Tangail", "Narayanganj", "Gazipur",
    "Narsingdi", "Faridpur", "Pabna", "Kushtia", "Noakhali", "Feni", "Brahmanbaria",
    "Bagerhat", "Chuadanga", "Jhenaidah", "Magura", "Meherpur", "Narail",
    "Satkhira", "Pirojpur", "Patuakhali", "Barguna", "Bhola", "Jhalokathi", "Sherpur",
    "Netrokona", "Habiganj", "Moulvibazar", "Sunamganj", "Dinajpur", "Gaibandha", "Kurigram",
    "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon", "Naogaon", "Natore", "Chapai Nawabganj",
    "Joypurhat", "Sirajganj"
  ];

  const customerTypes = ["Buyer", "Seller", "Wholeseller"];

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = "Customer name is required";
    if (!formData.district) newErrors.district = "District is required";
    if (!formData.customerType) newErrors.customerType = "Customer type is required";
    if (!formData.phone1.trim()) newErrors.phone1 = "Phone 1 is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (formData.phone1 && !phoneRegex.test(formData.phone1)) newErrors.phone1 = "Please enter a valid phone number";
    if (formData.phone2 && !phoneRegex.test(formData.phone2)) newErrors.phone2 = "Please enter a valid phone number";

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address";
    }

    if (formData.previousDue && isNaN(formData.previousDue)) newErrors.previousDue = "Previous due must be a number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e?.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);
  try {
    // Prepare payload matching Django field names
    const payload = {
      customer_name: formData.customerName,
      district: formData.district,
      customer_type: formData.customerType,
      shop_name: formData.shopName,
      phone1: formData.phone1,
      phone2: formData.phone2,
      email: formData.email,
      address: formData.address,
      date_of_birth: formData.dob || null,
      nid_no: formData.nid,
      courier_name: formData.courierName,
      remarks: formData.remarks,
      previous_due_amount: formData.previousDue ? parseFloat(formData.previousDue) : null,
    };

    if (isEditMode) {
      await axiosInstance.put(`/customers/${initialData.id}/`, payload);
      toast.success("Customer updated successfully!");
    } else {
      await axiosInstance.post("/customers/", payload);
      toast.success("Customer added successfully!");
    }

    if (onSubmit) onSubmit(payload);

    if (!isEditMode) {
      setFormData({
        customerName: "", district: "", customerType: "", shopName: "", phone1: "",
        phone2: "", email: "", address: "", dob: "", nid: "", courierName: "",
        remarks: "", previousDue: "",
      });
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    toast.error("An error occurred. Please check your data and try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  const handleReset = () => {
    if (confirm("Are you sure you want to reset the form?")) {
      setFormData({
        customerName: "", district: "", customerType: "", shopName: "", phone1: "",
        phone2: "", email: "", address: "", dob: "", nid: "", courierName: "",
        remarks: "", previousDue: "",
      });
      setErrors({});
    }
  };

  const renderField = (name, label, type = "text", required = false, placeholder = "") => (
    <div className="flex flex-col">
      <label className="text-sm mb-1 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className={`border px-2 py-1 rounded bg-white ${errors[name] ? "border-red-500" : "border-black"}`}
        required={required}
      />
      {errors[name] && <span className="text-red-500 text-xs mt-1">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto ">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          {isEditMode ? "Edit Customer" : "Add Customer"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {renderField("customerName", "Customer Name", "text", true)}

          {/* District with react-select */}
          <div className="flex flex-col">
            <label className="text-sm mb-1 font-medium">
              District <span className="text-red-500">*</span>
            </label>
            <Select
              name="district"
              value={formData.district ? { label: formData.district, value: formData.district } : null}
              onChange={(selected) => {
                setFormData({ ...formData, district: selected?.value || "" });
                if (errors.district) setErrors({ ...errors, district: "" });
              }}
              options={districts.map((d) => ({ value: d, label: d }))}
              isClearable
              placeholder="Select district"
            />
            {errors.district && <span className="text-red-500 text-xs mt-1">{errors.district}</span>}
          </div>

          {/* Customer type with react-select */}
          <div className="flex flex-col">
            <label className="text-sm mb-1 font-medium">
              Customer Type <span className="text-red-500">*</span>
            </label>
            <Select
              name="customerType"
              value={formData.customerType ? { label: formData.customerType, value: formData.customerType } : null}
              onChange={(selected) => {
                setFormData({ ...formData, customerType: selected?.value || "" });
                if (errors.customerType) setErrors({ ...errors, customerType: "" });
              }}
              options={customerTypes.map((t) => ({ value: t, label: t }))}
              isClearable
              placeholder="Select type"
            />
            {errors.customerType && <span className="text-red-500 text-xs mt-1">{errors.customerType}</span>}
          </div>

          {renderField("shopName", "Shop Name")}
          {renderField("phone1", "Phone 1", "tel", true)}
          {renderField("phone2", "Phone 2", "tel")}
          {renderField("email", "E-mail Id", "email")}
          {renderField("address", "Address", "text", true)}
          {renderField("dob", "Date of Birth", "date")}
          {renderField("nid", "NID No")}
          {renderField("courierName", "Courier Name")}
          {renderField("remarks", "Remarks")}
          {renderField("previousDue", "Previous Due Amount", "number", false, "0.00")}
        </div>

        <div className="flex justify-center mt-8 gap-4">
          <button type="button" onClick={handleReset}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors" disabled={isSubmitting}>
            Reset
          </button>
          <button type="button" onClick={handleSubmit}
            className={`px-6 py-2 rounded text-white transition-colors ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-sky-800 hover:bg-sky-700"}`} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : (isEditMode ? "Update" : "Submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
