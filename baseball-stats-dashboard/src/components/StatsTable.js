import React, { useEffect, useState } from "react";
import axios from "axios";

const StatsTable = () => {
  const [stats, setStats] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedStat, setEditedStat] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "asc" });
  const [filters, setFilters] = useState({
    playerName: "",
    gameDate: ""
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:3000/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleEditClick = (stat) => {
    setEditingId(stat.id);
    setEditedStat(stat);
  };

  const handleChange = (e) => {
    setEditedStat({ ...editedStat, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3000/stats/${editingId}`, editedStat);
      setEditingId(null);
      fetchStats();
    } catch (error) {
      console.error("Error updating stat:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stat?")) return;
    try {
      await axios.delete(`http://localhost:3000/stats/${id}`);
      fetchStats();
    } catch (error) {
      console.error("Error deleting stat:", error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedStat({});
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const filteredStats = stats.filter((stat) => {
    const playerMatch = stat.name.toLowerCase().includes(filters.playerName.toLowerCase());
    const dateMatch = filters.gameDate
      ? new Date(stat.date).toLocaleDateString() === filters.gameDate
      : true;
    return playerMatch && dateMatch;
  });

  const sortedStats = [...filteredStats].sort((a, b) => {
    const key = sortConfig.key;
    const dir = sortConfig.direction === "asc" ? 1 : -1;

    if (key === "date") {
      return dir * (new Date(a.date) - new Date(b.date));
    } else if (typeof a[key] === "string") {
      return dir * a[key].localeCompare(b[key]);
    } else {
      return dir * (a[key] - b[key]);
    }
  });

  return (
    <div className="p-4 bg-white shadow-md rounded-md w-full max-w-6xl mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4 text-center">All Player Stats</h2>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          name="playerName"
          placeholder="Filter by Player Name"
          value={filters.playerName}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded w-full"
        />
        <input
          type="text"
          name="gameDate"
          placeholder="Filter by Game Date (MM/DD/YYYY)"
          value={filters.gameDate}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      {/* Responsive Scrollable Table */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm border-collapse">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              <th className="p-2 cursor-pointer" onClick={() => requestSort("name")}>Player</th>
              <th className="p-2 cursor-pointer" onClick={() => requestSort("date")}>Game Date</th>
              <th className="p-2 cursor-pointer" onClick={() => requestSort("at_bats")}>At Bats</th>
              <th className="p-2 cursor-pointer" onClick={() => requestSort("hits")}>Hits</th>
              <th className="p-2 cursor-pointer" onClick={() => requestSort("runs")}>Runs</th>
              <th className="p-2 cursor-pointer" onClick={() => requestSort("RBIs")}>RBIs</th>
              <th className="p-2 cursor-pointer" onClick={() => requestSort("home_runs")}>HRs</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStats
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((stat) => (
                <tr key={stat.id} className="border-t">
                  <td className="p-2">{stat.name}</td>
                  <td className="p-2">{new Date(stat.date).toLocaleDateString()}</td>
                  {editingId === stat.id ? (
                    <>
                      {["at_bats", "hits", "runs", "RBIs", "home_runs"].map((field) => (
                        <td key={field} className="p-2">
                          <input
                            type="number"
                            name={field}
                            value={editedStat[field]}
                            onChange={handleChange}
                            className="w-16 border px-1 rounded"
                          />
                        </td>
                      ))}
                      <td className="p-2 space-x-2 whitespace-nowrap">
                        <button onClick={handleSave} className="px-2 py-1 bg-green-500 text-white rounded">Save</button>
                        <button onClick={handleCancel} className="px-2 py-1 bg-gray-400 text-white rounded">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">{stat.at_bats}</td>
                      <td className="p-2">{stat.hits}</td>
                      <td className="p-2">{stat.runs}</td>
                      <td className="p-2">{stat.RBIs}</td>
                      <td className="p-2">{stat.home_runs}</td>
                      <td className="p-2 space-x-2 whitespace-nowrap">
                        <button onClick={() => handleEditClick(stat)} className="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
                        <button onClick={() => handleDelete(stat.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap justify-center mt-4 gap-2">
        {Array.from({ length: Math.ceil(filteredStats.length / itemsPerPage) }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatsTable;
