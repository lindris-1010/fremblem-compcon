import React, { useState, useEffect } from "react";
import { useClasses } from "../../context/ClassContext";

/*
This class is a mess. I tried to do some cool auto-sizing stuff, and all I got was some nuclear AI fallout.
It's all kinds of broken
*/
export default function Step2_Class({ characterData, updateCharacterData, nextStep }) {
  const { classes } = useClasses();
  const currentClassId = characterData.class?.class_id ?? null;
  const [selectedClassId, setSelectedClassId] = useState(currentClassId);

  const handleSelectClass = () => {
    if (previewClass) {
      console.log("previewClass class_id: " + previewClass.class_id);
      updateCharacterData("class", previewClass);
      nextStep(); // Navigate to Step 3
    }
  };

  // Local state for previewed class
  const [previewClass, setPreviewClass] = useState(
    classes.find((cls) => cls.id === currentClassId) || null
  );

  // Update preview if characterData.class changes externally (e.g., step reset)
  useEffect(() => {
    setSelectedClassId(characterData.class?.id ?? null);
  }, [characterData.class]);

  const handleDisplayClass = (cls) => {
    setPreviewClass(cls);
  };

  return (
    <div className="flex gap-6 items-stretch h-[500px]">
      {/* Class List */}
      <div className="w-1/3 bg-gray-800 rounded-xl space-y-2 px-4 pt-4">
        <h3 className="text-2xl font-bold mb-2">Pick a Class:</h3>
        {classes.map((cls) => (
          <div
            key={cls.class_id}
            onClick={() => handleDisplayClass(cls)}
            className={`cursor-pointer px-4 py-2 rounded space-y-2 text-left border ${
              previewClass?.id === cls.id
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-gray-700 text-gray-200 border-gray-600"
            }`}
          >
            {cls.name}
          </div>
        ))}
      </div>

      {/* Class Details */}
      <div className="w-2/3 bg-gray-800 rounded-xl p-8 rounded text-white overflow-y-auto">
        {previewClass ? (
          <>
            <h2 className="text-4xl font-bold mb-2">{previewClass.name}</h2>
            <ul className="mb-2 text-sm">
              <li className="text-lg"><strong>Starting HP:</strong> {previewClass.starting_hp}</li>
              <li className="text-lg"><strong>HP per Level:</strong> {previewClass.hp_per_level}</li>
              <li className="text-lg"><strong>Healing Surges:</strong> {previewClass.healing_surges}</li>
              <li className="text-lg"><strong>Weapon Proficiencies:</strong> {previewClass.weapon_prof}</li>
              <li className="text-lg"><strong>Armor Proficiencies:</strong> {previewClass.armor_prof}</li>
              <li className="text-lg"><strong>Defense Boosts:</strong>
                {` Fort +${previewClass.def_boosts[0]}, Ref +${previewClass.def_boosts[1]}, Will +${previewClass.def_boosts[2]}`}
              </li>
            </ul>
            <p className="italic text-gray-300 mb-4">{previewClass.description}</p>

            {previewClass.class_id === currentClassId ? (
              <button
                disabled
                className="px-4 py-2 bg-gray-500 text-white rounded opacity-60 cursor-default"
              >
                Selected
              </button>
            ) : (
              <button
                onClick={handleSelectClass}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Select Class
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-300">Select a class to see details</p>
        )}
      </div>
    </div>
  );
}