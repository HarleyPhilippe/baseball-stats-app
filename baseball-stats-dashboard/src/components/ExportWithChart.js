// components/ExportWithChart.js
import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


const ExportWithChart = ({ sections }) => {
  const [selectedSections, setSelectedSections] = useState(
    sections.map((_, idx) => idx) // All selected by default
  );

  const toggleSelection = (index) => {
    setSelectedSections((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const exportToPDF = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    const margin = 20;
    let y = margin;

    for (const [i, section] of sections.entries()) {
      if (!selectedSections.includes(i)) continue;

      const element = section.ref.current;
      if (!element) continue;

      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");

      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth() - 2 * margin;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (y + pdfHeight > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        y = margin;
      }

      doc.text(section.label, margin, y);
      y += 10;
      doc.addImage(imgData, "PNG", margin, y, pdfWidth, pdfHeight);
      y += pdfHeight + margin;
    }

    doc.save("stats_and_charts_export.pdf");
  };

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-4xl mb-6">
      <h3 className="text-lg font-semibold mb-3 text-center">Select Charts & Data to Export</h3>

      {/* ✅ Scrollable Styled Chart Selection */}
      <div className="max-h-48 overflow-y-auto border rounded p-3 bg-gray-50 shadow-inner mb-4">
        {sections.map((section, idx) => (
          <label key={idx} className="block mb-2 cursor-pointer hover:text-blue-600">
            <input
              type="checkbox"
              checked={selectedSections.includes(idx)}
              onChange={() => toggleSelection(idx)}
              className="mr-2"
            />
            {section.label}
          </label>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={exportToPDF}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
        >
          Export Selected to PDF
        </button>
      </div>
    </div>
  );
};

export default ExportWithChart;
