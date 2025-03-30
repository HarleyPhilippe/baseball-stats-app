import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


const ExcelExport = ({ data }) => {
  const handleExport = () => {
    console.log("Exporting stats to Excel:", data); // ✅ Log inside function

    const safeData = Array.isArray(data) ? data : [];

    const worksheet = XLSX.utils.json_to_sheet(safeData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stats");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(file, "player_stats_export.xlsx");
  };

  // ✅ Only show button if data is an array and has content
  return (
    Array.isArray(data) && data.length > 0 && (
      <button
        onClick={handleExport}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
      >
        Export to Excel
      </button>
    )
  );
};

export default ExcelExport;
