"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import axiosInstance from "../../components/AxiosInstance";
import toast from "react-hot-toast";

export default function AddEditCustomerPage() {
  const router = useRouter();
  const [initialData, setInitialData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

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

  const [formData, setFormData] = useState({
    customerName: "",
    district: null,
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
  const [districts, setDistricts] = useState([]);
  const customerTypes = ["Buyer", "Seller", "Wholeseller"];

  // Load edit data from localStorage
  useEffect(() => {
    const editData = localStorage.getItem("editCustomerData");
    if (editData) {
      const customerData = JSON.parse(editData);
      setInitialData(customerData);
      setIsEditMode(true);
      localStorage.removeItem("editCustomerData");
    }
  }, []);

  // Load districts from API
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axiosInstance.get("/districts/");
        const options = res.data.map((d) => ({ value: d.id, label: d.name }));
        setDistricts(options);
      } catch (error) {
        console.error("Failed to fetch districts", error);
        toast.error("Failed to load districts");
      }
    };

    fetchDistricts();
  }, []);

  // Set form data when edit mode and districts are loaded
  useEffect(() => {
    if (isEditMode && initialData && districts.length > 0) {
      const selectedDistrict = districts.find(
        (d) => d.label === initialData.district
      );

      setFormData({
        customerName: initialData.customer_name || "",
        district: selectedDistrict || null,
        customerType: initialData.customer_type || "",
        shopName: initialData.shop_name || "",
        phone1: initialData.phone1 || "",
        phone2: initialData.phone2 || "",
        email: initialData.email || "",
        address: initialData.address || "",
        dob: initialData.date_of_birth || "",
        nid: initialData.nid_no || "",
        courierName: initialData.courier_name || "",
        remarks: initialData.remarks || "",
        previousDue: initialData.previous_due_amount
          ? String(initialData.previous_due_amount)
          : "",
      });
    }
  }, [initialData, isEditMode, districts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim())
      newErrors.customerName = "Customer name is required";
    if (!formData.district) newErrors.district = "District is required";
    if (!formData.customerType)
      newErrors.customerType = "Customer type is required";
    if (!formData.phone1.trim()) newErrors.phone1 = "Phone 1 is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (formData.phone1 && !phoneRegex.test(formData.phone1))
      newErrors.phone1 = "Please enter a valid phone number";
    if (formData.phone2 && !phoneRegex.test(formData.phone2))
      newErrors.phone2 = "Please enter a valid phone number";

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email))
        newErrors.email = "Please enter a valid email address";
    }

    if (formData.previousDue && isNaN(formData.previousDue))
      newErrors.previousDue = "Previous due must be a number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: formData.customerName,
        district: formData.district ? formData.district.label : null, // send name, not id
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
        previous_due_amount: formData.previousDue
          ? parseFloat(formData.previousDue)
          : null,
      };

      if (isEditMode && initialData) {
        await axiosInstance.put(`/customers/${initialData.id}/`, payload);
        toast.success("Customer updated successfully!");
      } else {
        await axiosInstance.post("/customers/", payload);
        toast.success("Customer added successfully!");
      }

      router.push("/customer/customerList");
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
        customerName: "",
        district: null,
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
      setErrors({});
    }
  };

  const handleBack = () => {
    router.back();
  };

const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    const selectMenuOpen = document.querySelector(".react-select__menu");
    if (selectMenuOpen) return;

    e.preventDefault();

    const form = e.target.form;
    const elements = Array.from(form.elements).filter(
      (el) =>
        el.offsetParent !== null && // visible
        !el.disabled &&
        el.type !== "hidden"
    );

    let index = elements.indexOf(e.target);

    if (index > -1 && index < elements.length - 1) {
      let next = elements[index + 1];
      while (next && (next.disabled || next.offsetParent === null)) {
        index++;
        next = elements[index + 1];
      }
      if (next) next.focus();
    }
  }
};




  const renderField = (
    name,
    label,
    type = "text",
    required = false,
    placeholder = ""
  ) => (
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
        className={`border input-md px-2 py-1 rounded bg-white ${
          errors[name] ? "border-red-500" : "border-black"
        }`}
        required={required}
        onKeyDown={handleKeyDown}
      />
      {errors[name] && (
        <span className="text-red-500 text-xs mt-1">{errors[name]}</span>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        {isEditMode ? "Edit Customer" : "Add Customer"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {renderField("customerName", "Customer Name", "text", true)}
          {renderField("dob", "Date of Birth", "date")}

          <div className="flex flex-col">
            <label className="text-sm mb-1 font-medium">
              District <span className="text-red-500">*</span>
            </label>
            <Select
              name="district"
              value={formData.district}
              onChange={(selected) => {
                setFormData((prev) => ({ ...prev, district: selected }));
                if (errors.district)
                  setErrors((prev) => ({ ...prev, district: "" }));
              }}
              options={districts}
              isClearable
              placeholder="Select district"
              onKeyDown={handleKeyDown}
              styles={customSelectStyles}
            />
            {errors.district && (
              <span className="text-red-500 text-xs mt-1">
                {errors.district}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1 font-medium">
              Customer Type <span className="text-red-500">*</span>
            </label>
            <Select
              name="customerType"
              value={
                formData.customerType
                  ? {
                      label: formData.customerType,
                      value: formData.customerType,
                    }
                  : null
              }
              onChange={(selected) => {
                setFormData((prev) => ({
                  ...prev,
                  customerType: selected?.value || "",
                }));
                if (errors.customerType)
                  setErrors((prev) => ({ ...prev, customerType: "" }));
              }}
              options={customerTypes.map((t) => ({ value: t, label: t }))}
              isClearable
              placeholder="Select type"
              onKeyDown={handleKeyDown}
               styles={customSelectStyles}
            />
            {errors.customerType && (
              <span className="text-red-500 text-xs mt-1">
                {errors.customerType}
              </span>
            )}
          </div>

          {renderField("shopName", "Shop Name")}
          {renderField("phone1", "Phone 1", "tel", true)}
          {renderField("phone2", "Phone 2", "tel")}
          {renderField("email", "E-mail Id", "email")}
          {renderField("address", "Address", "text", true)}
          {renderField("nid", "NID No")}
          {renderField("courierName", "Courier Name")}
          {renderField(
            "previousDue",
            "Previous Due Amount",
            "number",
            false,
            "0.00"
          )}
          {renderField("remarks", "Remarks")}
        </div>

        <div className="flex justify-center mt-8 gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
            disabled={isSubmitting}
               onKeyDown={handleKeyDown}
          >
            Reset
          </button>
          <button
            type="submit"
            className={`px-6 py-2 rounded text-white transition-colors ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-sky-800 hover:bg-sky-700"
            }`}
            disabled={isSubmitting}
               onKeyDown={handleKeyDown}
          >
            {isSubmitting ? "Processing..." : isEditMode ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
