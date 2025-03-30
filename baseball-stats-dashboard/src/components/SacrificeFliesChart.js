import React, { useEffect, useState, useRef } from "react";
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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const SacrificeFliesChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/stats/all_players/sacrifice_flies");
        const data = response.data;

        const players = [...new Set(data.map(game => game.player_name))];
        setAllPlayers(players);
        setSelectedPlayers(players);

        const colors = [
          "rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", 
          "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)"
        ];

        const datasets = players.map((player, index) => ({
          label: player,
          data: data
            .filter(game => game.player_name === player)
            .map(game => parseInt(game.sacrifice_flies)),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length].replace("1)", "0.2)"),
          pointBackgroundColor: colors[index % colors.length],
          pointRadius: 5,
          tension: 0.4,
        }));

        setChartData({
          labels: [...new Set(data.map(game => new Date(game.date).toLocaleDateString()))],
          datasets: datasets
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlayerChange = (value) => {
    if (value === "all") {
      setSelectedPlayers(selectedPlayers.length === allPlayers.length ? [] : allPlayers);
    } else {
      setSelectedPlayers(prev =>
        prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
      );
    }
  };

  const filteredPlayers = allPlayers.filter(player =>
    player.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChartData = {
    labels: chartData?.labels || [],
    datasets: chartData
      ? chartData.datasets.filter(dataset => selectedPlayers.includes(dataset.label))
      : []
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!chartData) return <p>No data available.</p>;

  return (
    <div style={{
      width: "100%",
      maxWidth: "900px",
      margin: "0 auto",
      background: "#f9f9f9",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0px 4px 6px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ textAlign: "center" }}>Sacrifice Flies Trends</h2>

      {/* Player Selection Dropdown */}
      <div style={{ textAlign: "center", marginBottom: "10px", position: "relative" }} ref={dropdownRef}>
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

            <label style={{ display: "block", fontWeight: "bold", textAlign: "left" }}>
              <input
                type="checkbox"
                value="all"
                checked={selectedPlayers.length === allPlayers.length}
                onChange={() => handlePlayerChange("all")}
                style={{ marginRight: "8px" }}
              />
              Select All
            </label>

            {filteredPlayers.map(player => (
              <label key={player} style={{ display: "block", textAlign: "left", padding: "2px 0" }}>
                <input
                  type="checkbox"
                  value={player}
                  checked={selectedPlayers.includes(player)}
                  onChange={() => handlePlayerChange(player)}
                  style={{ marginRight: "8px" }}
                />
                {player}
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginBottom: "10px", fontWeight: "bold" }}>
        Selected Players: {selectedPlayers.length > 0 ? selectedPlayers.join(", ") : "None"}
      </div>

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
                    return `SF: ${tooltipItem.raw}`;
                  }
                }
              }
            },
            scales: {
              x: { title: { display: true, text: "Game Date" } },
              y: { title: { display: true, text: "Sacrifice Flies" } }
            }
          }}
        />
      </div>
    </div>
  );
};

export default SacrificeFliesChart;
