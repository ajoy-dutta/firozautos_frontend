// src/app/Dashboard/page.jsx
"use client";
import React from "react";

export default function dashboard() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📊 Welcome to Your Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Manage your business efficiently from here.
        </p>
      </div>
    </div>
  );
}
