import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  BarElement, // ✅ Import BarElement
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import axios from "axios";

// ✅ Register necessary Chart.js components
ChartJS.register(
  BarElement, // ✅ Register BarElement
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const BarChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/stats/leaderboard");
        console.log("API Response:", response.data);

        if (response.data && response.data.length > 0) {
          setChartData({
            labels: response.data.map(player => player.name),
            datasets: [
              {
                label: "Total Hits",
                data: response.data.map(player => parseInt(player.total_hits, 10) || 0),
                backgroundColor: "rgba(75, 192, 192, 0.7)",
              },
              {
                label: "Home Runs",
                data: response.data.map(player => parseInt(player.total_home_runs, 10) || 0),
                backgroundColor: "rgba(255, 99, 132, 0.7)",
              },
              {
                label: "OBP",
                data: response.data.map(player => parseFloat(player.on_base_percentage) || 0),
                backgroundColor: "rgba(54, 162, 235, 0.7)", // ✅ New color for OBP
              }
            ]
          });
        } else {
          setChartData(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!chartData) return <p>No data available.</p>;

  return (
    <div style={{ width: "100%", maxWidth: "800px", height: "400px", margin: "0 auto" }}>
      <h2>Leaderboard Stats</h2>
      <Bar 
        data={chartData} 
        options={{
          maintainAspectRatio: false,  
          responsive: true,            
          plugins: {
            legend: {
              display: true, 
              position: "top"
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function (tooltipItem) {
                  return `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(3)}`;
                }
              }
            }
          },
          scales: {
            x: { title: { display: true, text: "Players" } },
            y: { title: { display: true, text: "Stats" } }
          }
        }} 
        style={{ height: "100%", width: "100%" }} // ✅ Ensures it fits inside the div
      />
    </div>
  );
  
};

export default BarChart;
