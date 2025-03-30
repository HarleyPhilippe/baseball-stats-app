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
      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Player</th>
            <th className="p-2">Hits</th>
            <th className="p-2">Home Runs</th>
            <th className="p-2">Batting Avg</th>
            <th className="p-2">OBP</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.hits}</td>
              <td className="p-2">{p.homeRuns}</td>
              <td className="p-2">{p.avg.toFixed(3)}</td>
              <td className="p-2">{p.obp.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
