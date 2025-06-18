import React, { useState, useEffect } from "react";
import { usePowers } from "../../context/PowerContext";

export default function Step3_Powers({ characterData, updateCharacterData, setCanContinue, setSelectedPowerIds }) {
  const { powers } = usePowers();
  const classId = characterData.class?.class_id;
  console.log("Step3 classId: " + classId);

  const [selectedAtWills, setSelectedAtWills] = useState([]);
  const [selectedEncounters, setSelectedEncounters] = useState([]);
  const [selectedDailies, setSelectedDailies] = useState([]);
  const [selectedPower, setSelectedPower] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const classPowers = powers.filter(p => p.class_id === classId);
  const level0Powers = classPowers.filter(p => p.level === 0);
  const atWills = classPowers.filter(p => p.level === 1 && p.use_type === "at_will");
  const encounters = classPowers.filter(p => p.level === 1 && p.use_type === "encounter");
  const dailies = classPowers.filter(p => p.level === 1 && p.use_type === "daily");

  const togglePower = (id, selectedList, setList, max) => {
    if (!Array.isArray(selectedList)) {
      console.warn("selectedList is not an array", selectedList);
      return;
    }

    if (selectedList.includes(id)) {
      setList(selectedList.filter(pid => pid !== id));
    } else if (selectedList.length < max) {
      setList([...selectedList, id]);
    }
  };

  useEffect(() => {
    const isReady =
      selectedAtWills.length === 2 &&
      selectedEncounters.length === 2 &&
      selectedDailies.length === 1;

    setCanContinue(isReady);

    const allPowerIds = [
      ...selectedAtWills,
      ...selectedEncounters,
      ...selectedDailies,
    ];

    setSelectedPowerIds?.(allPowerIds);
  }, [selectedAtWills, selectedEncounters, selectedDailies]);

  const renderPowerList = (powers, selectedList, setList, max, label) => (
    <div className="mb-4 rounded border border-gray-300 bg-white shadow">
      <div
        className="flex items-center justify-between cursor-pointer select-none px-4 py-2 font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-t"
        onClick={() => setOpenDropdown(openDropdown === label ? null : label)}
      >
        {label}
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${
            openDropdown === label ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {openDropdown === label && (
        <div className="space-y-2 py-2">
          {powers.map((power) => (
            <div key={power.power_id} className="flex justify-center">
              <label className="flex items-center gap-2 px-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedList.includes(power.power_id)}
                  disabled={
                    !selectedList.includes(power.power_id) &&
                    selectedList.length >= max
                  }
                  onChange={() =>
                    togglePower(power.power_id, selectedList, setList, max)
                  }
                  className="w-4 h-4"
                />
                <span
                  onClick={() => setSelectedPower(power)}
                  className="cursor-pointer text-gray-700 hover:text-blue-600"
                >
                  {power.name}
                </span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPowerProgress = () => {
    const renderCircles = (count, total) => {
      return Array.from({ length: total }).map((_, idx) => (
        <div
          key={idx}
          className={`w-4 h-4 rounded-full ${
            idx < count ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      ));
    };

    return (
      <div className="flex gap-6 items-center justify-center mt-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white">At-Will:</span>
          <div className="flex gap-1">{renderCircles(selectedAtWills.length, 2)}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white">Encounter:</span>
          <div className="flex gap-1">{renderCircles(selectedEncounters.length, 2)}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white">Daily:</span>
          <div className="flex gap-1">{renderCircles(selectedDailies.length, 1)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-800 rounded-xl h-[600px]">
      <h2 className="text-4xl font-semibold text-white mb-4">Select Powers:</h2>
      {renderPowerProgress()}
      <div className="flex gap-6">
        {/* Left side */}
        <div className="w-1/2 max-h-[800px] border rounded-lg bg-white overflow-y-auto">
          <div className="mb-4">
            <div className="mb-4 border rounded-lg">
              <div
                className="flex items-center justify-between cursor-pointer select-none px-4 py-2 bg-gray-100 font-bold text-gray-800"
                onClick={() => setOpenDropdown(openDropdown === "level0" ? null : "level0")}
              >
                Free Class Powers:
                <svg
                  className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                    openDropdown === "level0" ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openDropdown === "level0" && (
                <ul className="list-disc list-inside px-4 py-2 text-gray-700">
                  {level0Powers.length === 0 ? (
                    <ul className="text-gray-500 italic">None</ul>
                  ) : (
                    level0Powers.map((power) => (
                      <ul
                        key={power.power_id}
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => setSelectedPower(power)}
                      >
                        {power.name}
                      </ul>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>

          {renderPowerList(atWills, selectedAtWills, setSelectedAtWills, 2, "Pick two At-Will Powers:")}
          {renderPowerList(encounters, selectedEncounters, setSelectedEncounters, 2, "Pick two Encounter Powers:")}
          {renderPowerList(dailies, selectedDailies, setSelectedDailies, 1, "Pick one Daily Power:")}
        </div>

        {/* Right side */}
        <div className="w-1/2 border rounded-lg bg-white overflow-hidden shadow">
          {selectedPower ? (
            <>
              <div
                className="flex justify-between items-center px-4 py-2 text-white"
                style={{
                  backgroundColor:
                    selectedPower.use_type === "at_will"
                      ? "#3a8050"
                      : selectedPower.use_type === "encounter"
                      ? "#760021"
                      : "#303332",
                }}
              >
                <h4 className="text-xl font-bold">{selectedPower.name}</h4>
                <span className="text-sm">Level {selectedPower.level}</span>
              </div>
              <div className="p-4 space-y-2 text-gray-800 text-sm">
                <div className="flex flex-wrap gap-2 text-gray-600">
                  <span className="capitalize">{selectedPower.use_type?.replace("_", " ") || "Unknown"}</span>
                  <span>•</span>
                  <span>{selectedPower.keywords.replace(/[\[\]]/g, "")}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-gray-600">
                  <span><strong>Action:</strong> {selectedPower.action_type}</span>
                  {selectedPower.range || selectedPower.weapon ? (
                    <>
                      <span>•</span>
                      <span>{selectedPower.range ? (<><strong>Range:</strong> {selectedPower.range}</>) : (<><strong>Weapon:</strong> {selectedPower.weapon}</>)}</span>
                    </>
                  ) : null}
                </div>
                {selectedPower.target && (<div className="text-gray-700"><strong>Target:</strong> {selectedPower.target}</div>)}
                {selectedPower.attack && (<div className="text-gray-700"><strong>Attack:</strong> {selectedPower.attack}</div>)}
                {selectedPower.effect && (
                  <div className="bg-gray-100 border-l-4 border-gray-400 p-2 text-gray-700">
                    <strong>Effect:</strong> {selectedPower.effect}
                  </div>
                )}
                <div className="italic text-gray-600">{selectedPower.description}</div>
              </div>
            </>
          ) : (
            <div className="p-4 text-gray-500 italic">Select a power to view its details.</div>
          )}
        </div>
      </div>
    </div>
  );
}