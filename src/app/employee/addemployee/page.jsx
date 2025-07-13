"use client";

import AxiosInstance from "@/app/components/AxiosInstance";
import React, { useState } from "react";

export default function EmployeeForm() {
  const [education, setEducation] = useState([]);
  const [eduInput, setEduInput] = useState({
    exam: "",
    institute: "",
    passingYear: "",
    group: "",
    gpa: "",
    board: "",
  });

  const [formData, setFormData] = useState({
    employee_name: "",
    father_name: "",
    mother_name: "",
    gender: "",
    blood_group: "",
    date_of_birth: "",
    joining_date: "",
    photo: null,
    age: "",
    religion: "",
    birth_id_no: "",
    nid_no: "",
    passport_no: "",
    nationality: "Bangladeshi",
    email: "",
    mobile_no: "",
    father_mobile_no: "",
    mother_mobile_no: "",
    other_mobile_no: "",
    salary_amount: "",
    country: "",
    district: "",
    division: "",
    police_station: "",
    post_office: "",
    town_or_village: "",
    previous_work: "",
    shop_name: "",
    shop_address: "",
    account_name: "",
    account_no: "",
    bank_name: "",
    branch_address: "",
    bkash_no: "",
    roket_no: "",
    nagad_no: "",
    reference_by: "",
    reference_mobile: "",
    reference_address: "",
  });

  // ✅ General input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    // Convert "select" placeholder to empty string
    if (value === "select") {
      parsedValue = "";
    }

    // Handle integer fields
    if (["age", "salary_amount"].includes(name)) {
      parsedValue = value ? parseInt(value) : "";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  // ✅ File input
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      photo: file,
    }));
  };

  // ✅ Education input
  const handleEduChange = (e) => {
    const { name, value } = e.target;
    setEduInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEducation = () => {
    if (eduInput.exam && eduInput.institute) {
      setEducation((prev) => [...prev, eduInput]);
      setEduInput({
        exam: "",
        institute: "",
        passingYear: "",
        group: "",
        gpa: "",
        board: "",
      });
    } else {
      alert("Please fill Exam and Institute fields before adding.");
    }
  };

  const handleDeleteEducation = (index) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (education.length === 0) {
      alert("Please add at least one education record!");
      return;
    }

    const formDataToSend = new FormData();

    // Append all fields except photo
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "photo") {
        formDataToSend.append(key, value ?? "");
      }
    });

    // Append photo if any
    if (formData.photo instanceof File) {
      formDataToSend.append("photo", formData.photo);
    }

    // ✅ Append education as JSON string
    const formattedEducation = education.map((item) => ({
      exam_name: item.exam,
      institute_name: item.institute,
      passing_year: item.passingYear,
      group_or_subject: item.group,
      gpa_or_dvision: item.gpa,
      board_or_university: item.board,
    }));

    formDataToSend.append("education", JSON.stringify(formattedEducation));

    for (let [key, value] of formDataToSend.entries()) {
      console.log("hi", key, value);
    }
    try {
      const res = await AxiosInstance.post("/employees/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Submit success:", res.data);
      alert("✅ Employee created successfully!");
    } catch (error) {
      console.error("❌ Submit error:", error.response?.data || error);
      alert(
        `❌ Failed to submit employee form.\n\nError: ${
          error.response?.data
            ? JSON.stringify(error.response.data)
            : "Check console for details."
        }`
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    // Skip if react-select menu is open
    const selectMenuOpen = document.querySelector(".react-select__menu");
    if (selectMenuOpen) return;

    e.preventDefault();

    // Select all focusable elements
    const allFocusable = Array.from(
      document.querySelectorAll(
        `input:not([type="hidden"]),
       select,
       textarea,
       button,
       [tabindex]:not([tabindex="-1"])`
      )
    ).filter(
      (el) =>
        el.offsetParent !== null && // visible
        !el.disabled && // not disabled
        !(el.readOnly === true || el.getAttribute("readonly") !== null) // not readonly
    );

    const currentIndex = allFocusable.indexOf(e.target);

    if (currentIndex !== -1) {
      for (let i = currentIndex + 1; i < allFocusable.length; i++) {
        const nextEl = allFocusable[i];
        nextEl.focus();
        break;
      }
    }
  };

  return (
    <div className="text-sm text-black">
      <h2 className="text-2xl  mb-4  border-b border-back pb-2">
        Add-Edit Employee
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <h3 className="text-xl italic font-medium text-black mb-4">
          Basic Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="font-medium">
              Employee Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="employee_name"
              value={formData.employee_name}
              onChange={handleChange}
              placeholder="Employee Name"
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">
              Father’s Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="father_name"
              value={formData.father_name}
              onChange={handleChange}
              placeholder="Father's Name"
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">
              Mother’s Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mother_name"
              value={formData.mother_name}
              onChange={handleChange}
              placeholder="Mother's Name"
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Employee Code</label>
            <input
              type="text"
              value="AUTO GENERATE"
              readOnly
              className="w-full border border-black py-1 px-2 rounded-xs bg-slate-100"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            >
              <option value="">select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="font-medium">Blood Group</label>
            <select
              name="blood_group"
              value={formData.blood_group}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            >
              <option value="">Select</option>
              <option value="A+">A+</option>
              <option value="A-">A−</option>
              <option value="B+">B+</option>
              <option value="B-">B−</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB−</option>
              <option value="O+">O+</option>
              <option value="O-">O−</option>
            </select>
          </div>
          <div>
            <label className="font-medium">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">
              Joining Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="joining_date"
              value={formData.joining_date}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Photo</label>
            <input
              type="file"
              name="photo"
              onChange={handlePhotoChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Age</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Religion</label>
            <select
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            >
              <option value="">select</option>
              <option value="Islam">Islam</option>
              <option value="Hinduism">Hinduism</option>
              <option value="Christianity">Christianity</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="font-medium">Birth ID No.</label>
            <input
              type="text"
              name="birth_id_no"
              value={formData.birth_id_no}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">NID No.</label>
            <input
              type="text"
              name="nid_no"
              value={formData.nid_no}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Passport No.</label>
            <input
              type="text"
              name="passport_no"
              value={formData.passport_no}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Nationality</label>
            <select
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            >
              <option>Bangladeshi</option>
            </select>
          </div>
          <div>
            <label className="font-medium">Email ID</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Mobile No</label>
            <input
              type="text"
              name="mobile_no"
              value={formData.mobile_no}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Father Mobile No</label>
            <input
              type="text"
              name="father_mobile_no"
              value={formData.father_mobile_no}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Mother Mobile No</label>
            <input
              type="text"
              name="mother_mobile_no"
              value={formData.mother_mobile_no}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Other Mobile No</label>
            <input
              type="text"
              name="other_mobile_no"
              value={formData.other_mobile_no}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Salary Amount</label>
            <input
              type="number"
              name="salary_amount"
              value={formData.salary_amount}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <h3 className="text-xl italic font-medium text-black mt-10 mb-4">
          Education Qualification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <input
            name="exam"
            placeholder="Exam Name"
            value={eduInput.exam}
            onChange={handleEduChange}
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="institute"
            placeholder="Institute Name"
            value={eduInput.institute}
            onChange={handleEduChange}
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="passingYear"
            placeholder="Passing Year"
            value={eduInput.passingYear}
            onChange={handleEduChange}
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="group"
            placeholder="Group"
            value={eduInput.group}
            onChange={handleEduChange}
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="gpa"
            placeholder="GPA/Grade"
            value={eduInput.gpa}
            onChange={handleEduChange}
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="board"
            placeholder="Board/University"
            value={eduInput.board}
            onChange={handleEduChange}
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />

          <div className="flex  items-center">
            <button
              onClick={handleAddEducation}
              type="button"
              className="bg-sky-900 text-white btn btn-sm px-4 py-1 rounded-xs hover:bg-sky-700 "
              onKeyDown={handleKeyDown}
            >
              Add
            </button>
          </div>
        </div>

        {education.length === 0 ? (
          <p className="text-slate-500 italic">
            No Education Qualification Found
          </p>
        ) : (
          <table className="w-full border border-slate-800 mt-4">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-400 py-1 px-2">Exam</th>
                <th className="border border-slate-400 py-1 px-2">Institute</th>
                <th className="border border-slate-400 py-1 px-2">Year</th>
                <th className="border border-slate-400 py-1 px-2">Group</th>
                <th className="border border-slate-400 py-1 px-2">GPA</th>
                <th className="border border-slate-400 py-1 px-2">Board</th>
                <th className="border border-slate-400 py-1 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {education.map((edu, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border border-slate-400 py-1 px-2">
                    {edu.exam}
                  </td>
                  <td className="border border-slate-400 py-1 px-2">
                    {edu.institute}
                  </td>
                  <td className="border border-slate-400 py-1 px-2">
                    {edu.passingYear}
                  </td>
                  <td className="border border-slate-400 py-1 px-2">
                    {edu.group}
                  </td>
                  <td className="border border-slate-400 py-1 px-2">
                    {edu.gpa}
                  </td>
                  <td className="border border-slate-400 py-1 px-2">
                    {edu.board}
                  </td>
                  <td className="border border-slate-400 py-1 px-2">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded-xs"
                      onClick={() => handleDeleteEducation(idx)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3 className="text-xl italic font-medium text-black mt-8 mb-4">
          Address Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="font-medium">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Division</label>
            <input
              type="text"
              name="division"
              value={formData.division}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Police Station</label>
            <input
              type="text"
              name="police_station"
              value={formData.police_station}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Post Office</label>
            <input
              type="text"
              name="post_office"
              value={formData.post_office}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="font-medium">Town/Village</label>
            <input
              type="text"
              name="town_or_village"
              value={formData.town_or_village}
              onChange={handleChange}
              className="w-full border border-black py-1 px-2 rounded-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <h3 className="text-xl italic font-medium text-black mt-10 mb-4">
          Experience Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <input
            name="previous_work"
            value={formData.previous_work}
            onChange={handleChange}
            placeholder="Previous Work Name"
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="shop_name"
            value={formData.shop_name}
            onChange={handleChange}
            placeholder="Shop Name"
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="shop_address"
            value={formData.shop_address}
            onChange={handleChange}
            placeholder="Address"
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
        </div>

        <h3 className="text-xl italic font-medium text-black mb-4">
          Bank Accounts Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            name="account_name"
            value={formData.account_name}
            onChange={handleChange}
            placeholder="Accounts Name"
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="account_no"
            value={formData.account_no}
            onChange={handleChange}
            placeholder="Accounts No"
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="bank_name"
            value={formData.bank_name}
            onChange={handleChange}
            placeholder="Bank Name"
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />

          <input
            name="branch_address"
            rows="1"
            value={formData.branch_address}
            onChange={handleChange}
            placeholder="Bank/Branch Address"
            className="border col-span-2 border-black py-1 px-2 rounded-xs w-full"
            onKeyDown={handleKeyDown}
          />
        </div>

        <h3 className="text-xl italic font-medium text-black mt-10 mb-4">
          Mobile Banking
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <input
            name="bkash_no"
            value={formData.bkash_no}
            onChange={handleChange}
            type="text"
            placeholder="Bkash No"
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="roket_no"
            value={formData.roket_no}
            onChange={handleChange}
            type="text"
            placeholder="Rocket No"
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="nagad_no"
            value={formData.nagad_no}
            onChange={handleChange}
            type="text"
            placeholder="Nagad No"
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="reference_by"
            value={formData.reference_by}
            onChange={handleChange}
            type="text"
            placeholder="Reference By"
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="reference_mobile"
            value={formData.reference_mobile}
            onChange={handleChange}
            type="text"
            placeholder="Mobile No"
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
          <input
            name="reference_address"
            value={formData.reference_address}
            onChange={handleChange}
            type="text"
            placeholder="Address"
            className="border border-black py-1 px-2 rounded-xs"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="mt-6">
          <button
            className="bg-sky-900 text-white px-6 py-1 rounded-xs hover:bg-sky-700"
            onKeyDown={handleKeyDown}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
