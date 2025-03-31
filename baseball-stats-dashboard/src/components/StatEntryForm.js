import React, { useEffect, useState } from "react";
import axios from "axios";

const StatEntryForm = () => {
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [formData, setFormData] = useState({
    player_id: "",
    game_id: "",
    at_bats: 0,
    hits: 0,
    runs: 0,
    RBIs: 0,
    home_runs: 0,
    walks: 0,
    strikeouts: 0,
    doubles: 0,
    triples: 0,
    hit_by_pitch: 0,
    sacrifice_flies: 0,
    stolen_bases: 0
  });

  const [errors, setErrors] = useState({});
  const [isAddingNewGame, setIsAddingNewGame] = useState(false);
  const [newGame, setNewGame] = useState({
    date: "",
    opponent: "",
    location: "",
    result: ""
  });
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPlayers = async () => {
    const res = await axios.get("https://baseball-stats-api.onrender.com/players");
    setPlayers(res.data);
  };

  const fetchGames = async () => {
    const res = await axios.get("https://baseball-stats-api.onrender.com/games");
    setGames(res.data);
  };

  useEffect(() => {
    fetchPlayers();
    fetchGames();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNewGameChange = (e) => {
    const { name, value } = e.target;
    setNewGame((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.player_id) newErrors.player_id = "Player is required.";
    if (!isAddingNewGame && !formData.game_id) newErrors.game_id = "Game selection is required.";
    if (parseInt(formData.hits) > parseInt(formData.at_bats)) {
      newErrors.hits = "Hits cannot exceed at-bats.";
    }

    Object.keys(formData).forEach((key) => {
      if (parseInt(formData[key]) < 0) {
        newErrors[key] = "Cannot be negative.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      player_id: "",
      game_id: "",
      at_bats: 0,
      hits: 0,
      runs: 0,
      RBIs: 0,
      home_runs: 0,
      walks: 0,
      strikeouts: 0,
      doubles: 0,
      triples: 0,
      hit_by_pitch: 0,
      sacrifice_flies: 0,
      stolen_bases: 0
    });
    setNewGame({
      date: "",
      opponent: "",
      location: "",
      result: ""
    });
    setIsAddingNewGame(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let gameId = formData.game_id;

      if (isAddingNewGame) {
        const gameRes = await axios.post("https://baseball-stats-api.onrender.com/games", newGame);
        gameId = gameRes.data.game.id;
      }

      await axios.post("https://baseball-stats-api.onrender.com/stats", {
        ...formData,
        game_id: gameId,
        player_id: parseInt(formData.player_id)
      });

      await fetchPlayers();
      await fetchGames();

      setSuccessMessage("Stat submitted successfully!");
      resetForm();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error submitting stat:", err);
      alert("Failed to submit stat.");
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-3xl mt-10">
      <h2 className="text-2xl font-semibold text-center mb-4">Add Player Stats</h2>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-center">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="player_id"
          value={formData.player_id}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Player</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
        {errors.player_id && <p className="text-red-500 text-sm">{errors.player_id}</p>}

        <div className="space-y-2">
          <label className="font-semibold">Game:</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!isAddingNewGame}
                onChange={() => setIsAddingNewGame(false)}
              />
              Select Existing Game
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={isAddingNewGame}
                onChange={() => setIsAddingNewGame(true)}
              />
              Add New Game
            </label>
          </div>

          {isAddingNewGame ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input name="date" type="date" className="border p-2 rounded" onChange={handleNewGameChange} required />
              <input name="opponent" placeholder="Opponent" className="border p-2 rounded" onChange={handleNewGameChange} required />
              <input name="location" placeholder="Location" className="border p-2 rounded" onChange={handleNewGameChange} />
              <input name="result" placeholder="Result (e.g. W 5-3)" className="border p-2 rounded" onChange={handleNewGameChange} />
            </div>
          ) : (
            <select
              name="game_id"
              value={formData.game_id}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Game</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {new Date(game.date).toLocaleDateString()} - {game.opponent}
                </option>
              ))}
            </select>
          )}
          {errors.game_id && <p className="text-red-500 text-sm">{errors.game_id}</p>}
        </div>

        {/* Stat Fields */}
        {[
          "at_bats", "hits", "runs", "RBIs", "home_runs",
          "walks", "strikeouts", "doubles", "triples",
          "hit_by_pitch", "sacrifice_flies", "stolen_bases"
        ].map((stat) => (
          <div key={stat}>
            <label className="block font-semibold">{stat.replace("_", " ").toUpperCase()}:</label>
            <input
              type="number"
              name={stat}
              value={formData[stat]}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              min="0"
            />
            {errors[stat] && <p className="text-red-500 text-sm">{errors[stat]}</p>}
          </div>
        ))}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Submit Stats
        </button>
      </form>
    </div>
  );
};

export default StatEntryForm;
