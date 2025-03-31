import React from "react";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

const StatsExport = () => {
  const fetchStats = async () => {
    const res = await axios.get("https://baseball-stats-api.onrender.com/stats");

    return res.data;
  };

  const exportToExcel = async () => {
    const stats = await fetchStats();
    const worksheet = utils.json_to_sheet(stats);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Stats");
    writeFile(workbook, "player_stats_export.xlsx");
  };

  const exportToPDF = async () => {
    const stats = await fetchStats();
    const doc = new jsPDF();
    const tableData = stats.map((stat) => [
      stat.name,
      new Date(stat.date).toLocaleDateString(),
      stat.at_bats,
      stat.hits,
      stat.runs,
      stat.RBIs,
      stat.home_runs,
    ]);

    autoTable(doc, {
      head: [["Player", "Date", "AB", "Hits", "Runs", "RBIs", "HR"]],
      body: tableData,
    });

    doc.save("player_stats_export.pdf");
  };

  return (
    <div className="flex justify-center space-x-4 mb-6 mt-10">
  <button
    onClick={exportToExcel}
    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
  >
    Export to Excel
  </button>
  <button
    onClick={exportToPDF}
    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
  >
    Export to PDF
  </button>
</div>

  );
};

export default StatsExport;
