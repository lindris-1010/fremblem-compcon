import { useState } from "react";
import { useClasses } from "../../context/ClassContext";
import { useFeats } from "../../context/FeatContext";
import { useEquipment } from "../../context/EquipmentContext";
import { usePowers } from "../../context/PowerContext";
import { useSkills } from "../../context/SkillContext";

export default function Step7_Review({ characterData, updateCharacterData }) {
  const [name, setName] = useState("");

  const { classes } = useClasses();
  const { feats } = useFeats();
  const { equipment } = useEquipment();
  const { powers } = usePowers();
  const { skills } = useSkills();

  console.log("CD.class: " + characterData.class);
  console.log("CD.feats: " + characterData.feat_ids);
  console.log("CD.powers: " + characterData.power_ids);
  console.log("CD.skills: " + characterData.skill_ids);

  const selectedClass = characterData.class;
  const selectedFeats = feats.filter(f => characterData.feat_ids.includes(f.feat_id));
  const selectedPowers = powers.filter(p => characterData.power_ids.includes(p.power_id));
  const selectedSkills = skills.filter(s => characterData.skill_ids.includes(s.skill_id));

  const handleNameChange = (e) => {
    setName(e.target.value);
    updateCharacterData("name", e.target.value);
  };

  return (
      <div className="flex flex-col items-center text-white space-y-6 p-6">
        <h2 className="text-4xl font-bold mb-4">Review Your Character</h2>

        <div className="w-full max-w-4xl space-y-6 bg-gray-800 p-6 rounded-lg shadow">
          <div>
            <label className="block font-semibold mb-1">Character Name:</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full px-3 py-2 text-black rounded border focus:outline-none"
              placeholder="Enter character name"
            />
          </div>

          {/* Top Row */}
          <div className="flex gap-6">
            {/* Ability Scores */}
            <div className="w-1/2">
              <h3 className="text-lg font-bold border-b border-gray-600 mb-2">Ability Scores:</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {[
                  ["str", "con", "dex"],
                  ["int", "wis", "cha"],
                ].map((group) =>
                  group.map((key) => {
                    const score = characterData.abilityScores[key];
                    const mod = Math.floor((score - 10) / 2);
                    const modText = mod >= 0 ? `+${mod}` : `${mod}`;
                    const modColor = mod >= 0 ? "text-green-600" : "text-red-600";
                    return (
                      <div key={key} className="capitalize">
                        {key}: {score} <span className={`${modColor}`}>({modText})</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Race and Class */}
            <div className="w-1/2 space-y-4">
              <div>
                <h3 className="text-lg font-bold border-b border-gray-600 mb-2">Race:</h3>
                <p>{characterData.race || "None selected"}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold border-b border-gray-600 mb-2">Class:</h3>
                <p>{selectedClass?.name || "None selected"}</p>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="flex gap-6">
            {/* Feats and Skills */}
            <div className="w-1/2 space-y-6">
              <div>
                <h3 className="text-lg font-bold border-b border-gray-600 mb-2">Feats:</h3>
                <ul className="list-disc list-inside">
                  {selectedFeats.length > 0
                    ? selectedFeats.map(feat => (
                        <li key={feat.feat_id}>{feat.name}</li>
                      ))
                    : <li>None selected</li>}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold border-b border-gray-600 mb-2">Skills:</h3>
                <ul className="list-disc list-inside">
                  {selectedSkills.length > 0
                    ? selectedSkills.map(skill => (
                        <li key={skill.skill_id}>{skill.name}</li>
                      ))
                    : <li>None selected</li>}
                </ul>
              </div>
            </div>

            {/* Powers */}
            <div className="w-1/2">
              <h3 className="text-lg font-bold border-b border-gray-600 mb-2">Powers:</h3>
              <ul className="list-disc list-inside">
                {selectedPowers.length > 0
                  ? selectedPowers.map(power => (
                      <li key={power.power_id}>{power.name}</li>
                    ))
                  : <li>None selected</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
}