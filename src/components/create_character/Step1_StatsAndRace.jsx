import React, { useState, useEffect } from "react";

export default function Step1_StatsAndRace({ characterData, updateCharacterData }) {
  const [expandedRaceId, setExpandedRaceId] = useState(null);
  // Toggle dropdown for race details
  const toggleRace = (id) => {
    setExpandedRaceId(expandedRaceId === id ? null : id);
  };

  const scores = characterData.abilityScores;

  // Dummy race data
  const races = [
    {
      id: 1,
      name: "Human",
      description: "Humans are versatile and ambitious.",
      features: ["Bonus feat", "Extra skill points"],
    },
    {
      id: 2,
      name: "Elf",
      description: "Elves are graceful and skilled with magic.",
      features: ["Darkvision", "Keen Senses", "Fey Ancestry"],
    },
    {
      id: 3,
      name: "Dwarf",
      description: "Dwarves are sturdy and strong warriors.",
      features: ["Darkvision", "Dwarven Resilience", "Stonecunning"],
    },
  ];

  // State to track rolled dice per stat, example: { Str: [5,4,3,2], Dex: [...] }
  const [rolls, setRolls] = useState({});

  // State for selected race
  const [selectedRace, setSelectedRace] = useState(null);

  // Rolls 4d6, sums top 3, returns the total and the individual rolls
  const roll4d6DropLowest = () => {
    const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    const sorted = [...dice].sort((a, b) => b - a);
    const topThreeSum = sorted.slice(0, 3).reduce((a, b) => a + b, 0);
    return { total: topThreeSum, dice };
  };

  // Handle manual input changes
  const handleManualChange = (stat, value) => {
    const intVal = parseInt(value, 10);
    if (!isNaN(intVal) && intVal >= 0 && intVal <= 30) {
      updateCharacterData("abilityScores", {
        ...scores,
        [stat.toLowerCase()]: intVal,
      });
    }
  };

  // Roll for a specific stat, update the rolls state and the score
  const rollStat = (stat) => {
    const { total, dice } = roll4d6DropLowest();
    setRolls((prev) => ({ ...prev, [stat]: dice }));
    updateCharacterData("abilityScores", {
      ...scores,
      [stat.toLowerCase()]: total,
    });
  };

  return (
    <div className="flex gap-8">
      {/* Ability Score Section */}
      <div className="w-1/2 bg-gray-800 p-4 rounded-xl space-y-4 h-[400px]">
        <h3 className="text-xl font-semibold mb-4 text-white">Ability Scores</h3>
        {["Str", "Dex", "Con", "Int", "Wis", "Cha"].map((stat) => (
          <div key={stat} className="flex items-center gap-4 mb-2">
            <label className="w-12 text-white">{stat}:</label>
            <input
              type="number"
              className="w-16 px-2 py-1 rounded bg-gray-100 text-black"
              value={scores[stat.toLowerCase()] || ""}
              onChange={(e) => handleManualChange(stat, e.target.value)}
              min={0}
              max={30}
            />
            <button
              onClick={() => rollStat(stat)}
              className="px-2 py-1 bg-blue-600 text-white rounded"
            >
              Roll
            </button>
            <div className="text-gray-300">
              {rolls[stat] ? rolls[stat].join(", ") : ""}
            </div>
          </div>
        ))}
      </div>

      {/* Races Right */}
      <div className="w-1/2 bg-gray-800 p-4 rounded-xl">
         <h3 className="text-xl font-semibold mb-4 text-white">Choose a Race</h3>
         <p className="p-2 text-white"><i>(I'm not implementing this for the demo)</i></p>
         <div className="space-y-2">
           {races.map((race) => (
             <div key={race.id} className="border border-gray-600 rounded">
               <button
                 className="w-full text-left px-4 py-2 bg-gray-700 text-white rounded flex justify-between items-center"
                 onClick={() => toggleRace(race.id)}
               >
                 <span>{race.name}</span>
                 <span>{expandedRaceId === race.id ? "▲" : "▼"}</span>
               </button>
               {expandedRaceId === race.id && (
                 <div className="p-4 bg-gray-600 text-gray-200">
                   <p className="mb-2">{race.description}</p>
                   <ul className="list-disc pl-5">
                     {race.features.map((feat, idx) => (
                       <li key={idx}>{feat}</li>
                     ))}
                   </ul>
                 </div>
               )}
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}