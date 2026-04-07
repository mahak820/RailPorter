// src/components/dashboard.jsx
import React from "react";

export default function Dashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <p className="text-gray-600">This is a protected page (login required).</p>
    </div>
  );
}
