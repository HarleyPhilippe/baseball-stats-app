import React, { useEffect, useState } from "react";
import axios from "axios";

const PlayerManager = () => {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({ name: "", position: "" });
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [error, setError] = useState("");

  const fetchPlayers = async () => {
    try {
      const res = await axios.get("https://baseball-stats-api.onrender.com/players");
      setPlayers(res.data);
    } catch (err) {
      setError("Failed to fetch players");
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.position) return;

    try {
      if (editingPlayerId) {
        await axios.put(`https://baseball-stats-api.onrender.com/players/${editingPlayerId}`, form);
      } else {
        await axios.post("https://baseball-stats-api.onrender.com/players", form);
      }
      setForm({ name: "", position: "" });
      setEditingPlayerId(null);
      fetchPlayers();
    } catch (err) {
      setError("Failed to save player");
    }
  };

  const handleEdit = (player) => {
    setForm({ name: player.name, position: player.position });
    setEditingPlayerId(player.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://baseball-stats-api.onrender.com/players/${id}`);
      fetchPlayers();
    } catch {
      setError("Failed to delete player");
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
      <h2 className="text-2xl font-semibold text-center mb-4">Manage Players</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
        <input
          type="text"
          name="name"
          placeholder="Player Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="position"
          placeholder="Position"
          value={form.position}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {editingPlayerId ? "Update Player" : "Add Player"}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <ul className="space-y-2 divide-y">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2"
          >
            <span className="text-center sm:text-left">
              {player.name} ({player.position})
            </span>
            <div className="flex justify-center sm:justify-end gap-2 mt-2 sm:mt-0">
              <button
                className="text-sm bg-yellow-400 px-3 py-1 rounded"
                onClick={() => handleEdit(player)}
              >
                Edit
              </button>
              <button
                className="text-sm bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => handleDelete(player.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerManager;
