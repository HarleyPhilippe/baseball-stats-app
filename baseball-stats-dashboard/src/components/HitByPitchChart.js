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

const HitByPitchChart = () => {
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
        const response = await axios.get("https://baseball-stats-api.onrender.com/stats/all_players/hbp");


        const players = [...new Set(response.data.map(game => game.player_name))];
        setAllPlayers(players);
        setSelectedPlayers(players);

        const colors = [
          "rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)"
        ];

        const datasets = players.map((player, index) => ({
          label: player,
          data: response.data
            .filter(game => game.player_name === player)
            .map(game => parseInt(game.hit_by_pitch)),
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
      } catch (error) {
        console.error("Error fetching data:", error);
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
      ? chartData.datasets.filter(ds => selectedPlayers.includes(ds.label))
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

  return (
    <div style={{
      width: "100%",
      maxWidth: "900px",
      height: "550px",
      margin: "0 auto",
      background: "#fff",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0px 4px 6px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ textAlign: "center" }}>Hit by Pitch Trends</h2>

      {/* Dropdown */}
      <div style={{ textAlign: "center", marginBottom: "15px", position: "relative" }} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            width: "90%",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            background: "#f9f9f9",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Select Players ▼
        </button>

        {dropdownOpen && (
          <div style={{
            position: "absolute",
            width: "90%",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "10px",
            zIndex: 10,
            maxHeight: "250px",
            overflowY: "auto",
            left: "50%",
            transform: "translateX(-50%)"
          }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "5px",
                marginBottom: "8px",
                borderRadius: "3px",
                border: "1px solid #ccc"
              }}
            />
            <label style={{ display: "block", fontWeight: "bold", paddingBottom: "5px" }}>
              <input
                type="checkbox"
                onChange={() => handlePlayerChange("all")}
                checked={selectedPlayers.length === allPlayers.length}
                style={{ marginRight: "5px" }}
              />
              Select All
            </label>
            {filteredPlayers.map(player => (
              <label key={player} style={{ display: "block", padding: "3px" }}>
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

      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <strong>Selected Players:</strong> {selectedPlayers.join(", ")}
      </div>

      <div style={{ width: "100%", height: "400px" }}>
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
                    return `HBP: ${tooltipItem.raw}`;
                  }
                }
              }
            },
            scales: {
              x: { title: { display: true, text: "Game Date" } },
              y: { title: { display: true, text: "Hit by Pitch" } }
            }
          }}
        />
      </div>
    </div>
  );
};

export default HitByPitchChart;
