import React, { useState, useRef, useEffect } from "react";
import BarChart from "./components/BarChart";
import LeaderboardTable from "./components/LeaderboardTable";
import BattingAverageChart from "./components/BattingAverageChart";
import SluggingPercentageChart from "./components/SluggingPercentageChart";
import OnBasePercentageChart from "./components/OnBasePercentageChart";
import OPSChart from "./components/OPSChart";
import RunsScoredChart from "./components/RunsScoredChart";
import RBIsChart from "./components/RBIsChart";
import StrikeoutChart from "./components/StrikeoutChart";
import WalkTrendsChart from "./components/WalkTrendsChart";
import StolenBasesChart from "./components/StolenBasesChart";
import HitByPitchChart from "./components/HitByPitchChart";
import SacrificeFliesChart from "./components/SacrificeFliesChart";
import PlayerManager from "./components/PlayerManager";
import StatEntryForm from "./components/StatEntryForm";
import StatsTable from "./components/StatsTable";
import CSVStatUpload from "./components/CSVStatUpload";
import StatsExport from "./components/StatsExport";
import ExportWithChart from "./components/ExportWithChart";
import ExcelExport from "./components/ExcelExport";

const chartOptions = [
  { label: "Batting Average Trends", component: <BattingAverageChart /> },
  { label: "Slugging Percentage Trends", component: <SluggingPercentageChart /> },
  { label: "On-Base Percentage Trends", component: <OnBasePercentageChart /> },
  { label: "OPS (On-Base + Slugging) Trends", component: <OPSChart /> },
  { label: "Runs Scored Trends", component: <RunsScoredChart /> },
  { label: "RBIs Trends", component: <RBIsChart /> },
  { label: "Strikeout Trends", component: <StrikeoutChart /> },
  { label: "Walk Trends", component: <WalkTrendsChart /> },
  { label: "Stolen Bases Trends", component: <StolenBasesChart /> },
  { label: "Hit By Pitch Trends", component: <HitByPitchChart /> },
  { label: "Sacrifice Flies Trends", component: <SacrificeFliesChart /> },
];

function App() {
  const [selectedChartIndex, setSelectedChartIndex] = useState(0);
  const [role, setRole] = useState("viewer");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const leaderboardRef = useRef();
  const barChartRef = useRef();
  const statsTableRef = useRef();
  const battingAvgRef = useRef();
  const sluggingRef = useRef();
  const obpRef = useRef();
  const opsRef = useRef();
  const rbisRef = useRef();
  const strikeoutsRef = useRef();
  const walksRef = useRef();
  const stolenRef = useRef();
  const hbpRef = useRef();
  const sfRef = useRef();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white flex flex-col items-center justify-center p-10">
      
      {/* 🌙 Role + Theme Switch */}
      <div className="w-full max-w-4xl mb-4 flex justify-between items-center">
        {/* Role Dropdown */}
        <div>
          <label className="text-sm font-semibold mr-2">Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded p-1 dark:bg-gray-800 dark:text-white"
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm">☀️</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
            />
            <div className="w-10 h-5 bg-gray-300 rounded-full p-1 flex items-center dark:bg-gray-600">
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                  isDarkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </label>
          <span className="text-sm">🌙</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-blue-800 dark:text-blue-300 mb-6">
        Baseball Stats Dashboard
      </h1>

      {/* Leaderboard Table */}
      <div ref={leaderboardRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl mb-6">
        <LeaderboardTable />
      </div>

      {/* Bar Chart */}
      <div ref={barChartRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl mb-10">
        <h2 className="text-2xl font-semibold text-center mb-4">Leaderboard Stats</h2>
        <BarChart />
      </div>

      {/* Export Stats Only */}
      <StatsExport />

      {/* Chart Selector Viewer */}
      <div ref={battingAvgRef} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">
          Stat Trends Viewer
        </h2>
        <div className="mb-4 text-center w-full">
          <select
            value={selectedChartIndex}
            onChange={(e) => setSelectedChartIndex(Number(e.target.value))}
            className="w-full max-w-xs p-2 border border-gray-300 rounded dark:bg-gray-900 dark:border-gray-700"
          >
            {chartOptions.map((chart, index) => (
              <option key={index} value={index}>
                {chart.label}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">{chartOptions[selectedChartIndex].component}</div>
      </div>

      {/* Hidden charts for PDF export */}
      <div className="hidden">
        <div ref={sluggingRef}><SluggingPercentageChart /></div>
        <div ref={obpRef}><OnBasePercentageChart /></div>
        <div ref={opsRef}><OPSChart /></div>
        <div ref={rbisRef}><RBIsChart /></div>
        <div ref={strikeoutsRef}><StrikeoutChart /></div>
        <div ref={walksRef}><WalkTrendsChart /></div>
        <div ref={stolenRef}><StolenBasesChart /></div>
        <div ref={hbpRef}><HitByPitchChart /></div>
        <div ref={sfRef}><SacrificeFliesChart /></div>
      </div>

      {/* Admin Tools */}
      {role === "admin" && (
        <>
          <div ref={statsTableRef}><StatsTable /></div>
          <CSVStatUpload />
          <StatEntryForm />
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
            <PlayerManager />
          </div>
        </>
      )}

      {/* Export Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl mt-10">
        <h2 className="text-xl font-semibold mb-4 text-center">Export Data and Charts</h2>
        <ExportWithChart
          sections={[
            { label: "Leaderboard Table", ref: leaderboardRef },
            { label: "Bar Chart", ref: barChartRef },
            { label: "Stats Table", ref: statsTableRef },
            { label: "Batting Avg Chart", ref: battingAvgRef },
            { label: "Slugging % Chart", ref: sluggingRef },
            { label: "On-Base % Chart", ref: obpRef },
            { label: "OPS Chart", ref: opsRef },
            { label: "RBIs Chart", ref: rbisRef },
            { label: "Strikeouts Chart", ref: strikeoutsRef },
            { label: "Walks Chart", ref: walksRef },
            { label: "Stolen Bases Chart", ref: stolenRef },
            { label: "HBP Chart", ref: hbpRef },
            { label: "Sacrifice Flies Chart", ref: sfRef }
          ]}
        />
        <div className="mt-6 flex justify-center">
          <ExcelExport />
        </div>
      </div>
    </div>
  );
}

export default App;
