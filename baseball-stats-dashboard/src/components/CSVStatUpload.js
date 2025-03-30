import React, { useState } from "react";

import axios from "axios";

const CSVStatUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a CSV file.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:3000/upload-stats", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage(`✅ ${res.data.message} (${res.data.total} rows added)`);
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Failed to upload stats.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-10">
      <h2 className="text-xl font-semibold text-center mb-4">Upload Player Stats CSV</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <input type="file" accept=".csv" onChange={handleFileChange} className="w-full border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Upload
        </button>
        {message && <p className="text-center text-sm text-gray-700 mt-2">{message}</p>}
      </form>
    </div>
  );
};

export default CSVStatUpload;
