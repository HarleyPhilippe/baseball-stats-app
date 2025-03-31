import React from "react";

const LeaderboardTable = () => {
  const players = [
    { name: "Christiano Ronaldo", hits: 1, homeRuns: 0, avg: 1.0, obp: 1.0 },
    { name: "John Doe", hits: 14, homeRuns: 1, avg: 0.56, obp: 0.674 },
    { name: "Elrey Tobi", hits: 10, homeRuns: 0, avg: 0.5, obp: 0.655 },
    { name: "Lionel Messi", hits: 1, homeRuns: 1, avg: 0.5, obp: 0.6 },
    { name: "Lebron James", hits: 9, homeRuns: 1, avg: 0.563, obp: 0.563 },
    { name: "Mike Trout", hits: 11, homeRuns: 0, avg: 0.611, obp: 0.56 },
  ];

  return (
    <div className="overflow-x-auto">
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">
        Leaderboard Table
      </h2>

      {/* Table */}
      <table className="w-full border border-gray-300 text-sm table-fixed">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border border-gray-300">Player</th>
            <th className="p-2 border border-gray-300">Hits</th>
            <th className="p-2 border border-gray-300">Home Runs</th>
            <th className="p-2 border border-gray-300">Batting Avg</th>
            <th className="p-2 border border-gray-300">OBP</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, index) => (
            <tr key={index}>
              <td className="p-2 border border-gray-300">{p.name}</td>
              <td className="p-2 border border-gray-300">{p.hits}</td>
              <td className="p-2 border border-gray-300">{p.homeRuns}</td>
              <td className="p-2 border border-gray-300">{p.avg.toFixed(3)}</td>
              <td className="p-2 border border-gray-300">{p.obp.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
