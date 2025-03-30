import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import axios from "axios";

// ✅ Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const SluggingPercentageChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ Search feature inside dropdown

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/stats/all_players/slugging");
        console.log("API Response:", response.data);

        if (response.data && response.data.length > 0) {
          const players = [...new Set(response.data.map(game => game.player_name))];
          setAllPlayers(players);
          setSelectedPlayers(players); // Default: Show all players

          const colors = [
            "rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", 
            "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)"
          ];

          const datasets = players.map((player, index) => ({
            label: player,
            data: response.data
              .filter(game => game.player_name === player)
              .map(game => parseFloat(game.slugging_percentage)),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length].replace("1)", "0.2)"),
            pointBackgroundColor: colors[index % colors.length],
            pointRadius: 5,
            tension: 0.4,
          }));

          setChartData({
            labels: [...new Set(response.data.map(game => new Date(game.date).toLocaleDateString()))],
            datasets: datasets
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

  // ✅ Handle Player Selection (Checkbox-style, includes "Select All")
  const handlePlayerChange = (event) => {
    const value = event.target.value;
    if (value === "all") {
      setSelectedPlayers(selectedPlayers.length === allPlayers.length ? [] : allPlayers);
    } else {
      setSelectedPlayers(prevSelected =>
        prevSelected.includes(value)
          ? prevSelected.filter(player => player !== value) // Remove
          : [...prevSelected, value] // Add
      );
    }
  };

  // ✅ Handle Player Search
  const filteredPlayers = allPlayers.filter(player =>
    player.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Filtered Chart Data
  const filteredChartData = {
    labels: chartData?.labels || [],
    datasets: chartData
      ? chartData.datasets.filter(dataset => selectedPlayers.includes(dataset.label))
      : []
  };

  if (loading) return <p>Loading data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!chartData) return <p>No data available.</p>;

  return (
    <div 
      style={{ 
        width: "100%", 
        maxWidth: "900px", 
        height: "auto", 
        margin: "0 auto", 
        background: "#f9f9f9", 
        padding: "20px", 
        borderRadius: "10px",
        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)"
      }}
    >
      <h2 style={{ textAlign: "center" }}>Slugging Percentage Trends</h2>

      {/* ✅ Player Dropdown Selection */}
      <div style={{ textAlign: "center", marginBottom: "10px", position: "relative" }}>
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
            width: "200px",
            fontSize: "14px",
            fontWeight: "bold"
          }}
        >
          Select Players ▼
        </button>

        {dropdownOpen && (
          <div 
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              marginTop: "5px",
              background: "#fff",
              boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
              borderRadius: "5px",
              border: "1px solid #ccc",
              padding: "10px",
              width: "220px",
              zIndex: 10
            }}
          >
            {/* ✅ Search Bar Inside Dropdown */}
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                marginBottom: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc"
              }}
            />

            {/* ✅ Select All Checkbox */}
            <label style={{ display: "block", fontWeight: "bold", textAlign: "left" }}>
              <input 
                type="checkbox" 
                value="all" 
                checked={selectedPlayers.length === allPlayers.length}
                onChange={handlePlayerChange}
                style={{ marginRight: "8px" }}
              />
              Select All
            </label>

            {/* ✅ Player Checkboxes */}
            {filteredPlayers.map(player => (
              <label key={player} style={{ display: "block", textAlign: "left", padding: "2px 0" }}>
                <input 
                  type="checkbox" 
                  value={player} 
                  checked={selectedPlayers.includes(player)}
                  onChange={handlePlayerChange}
                  style={{ marginRight: "8px" }}
                />
                {player}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Display Selected Players */}
      <div style={{ textAlign: "center", marginBottom: "10px", fontWeight: "bold" }}>
        Selected Players: {selectedPlayers.length > 0 ? selectedPlayers.join(", ") : "None"}
      </div>

      {/* ✅ Line Chart */}
      <div style={{ width: "100%", height: "450px" }}>
        <Line
          data={filteredChartData}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: { display: true, position: "top" },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: function (tooltipItem) {
                    return `SLG: ${tooltipItem.raw.toFixed(3)}`;
                  }
                }
              }
            },
            scales: {
              x: { title: { display: true, text: "Game Date" } },
              y: { title: { display: true, text: "Slugging Percentage" } }
            }
          }}
        />
      </div>
    </div>
  );
};

export default SluggingPercentageChart;
