import React, { useState, useEffect } from "react";
import { useSkills } from "../../context/SkillContext";

export default function Step4_Skills({ characterData, updateCharacterData }) {
  const startingSkillIds = characterData.class?.starting_skill_ids || [];
  const trainableSkillIds = characterData.class?.trained_skill_ids || [];

  const [selectedTrainedSkills, setSelectedTrainedSkills] = useState([]);
  const { skills } = useSkills();
  const allSkills = skills;

  const toggleSkill = (skillId) => {
    if (selectedTrainedSkills.includes(skillId)) {
      setSelectedTrainedSkills(selectedTrainedSkills.filter((id) => id !== skillId));
    } else if (selectedTrainedSkills.length < 3) {
      setSelectedTrainedSkills([...selectedTrainedSkills, skillId]);
    }
  };

  useEffect(() => {
    updateCharacterData("skill_ids", selectedTrainedSkills);
  }, [selectedTrainedSkills]);

  const renderProgress = () => {
    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white text-sm">Trained Skills:</span>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full ${i < selectedTrainedSkills.length ? "bg-green-500" : "bg-gray-400"}`}
          />
        ))}
      </div>
    );
  };

  const startingSkills = allSkills.filter((skill) => startingSkillIds.includes(skill.skill_id));
  const trainableSkills = allSkills.filter((skill) => trainableSkillIds.includes(skill.skill_id));

  return (
    <div className="flex flex-col items-center justify-start p-4 bg-gray-800 rounded-xl h-[600px]">
      <h2 className="text-4xl font-semibold mb-4">Select Skills:</h2>
      {renderProgress()}

      <div className="w-full flex justify-center">
      <div className="w-1/2 max-w-md border rounded-lg bg-white p-4 text-gray-800 space-y-6">
        {startingSkills.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-2">Starting Skills:</h3>
            <div className={`columns-2 gap-x-4 space-y-2`}>
              {startingSkills.map((skill) => {
                const ability = skill.ability_used;
                const abilityScore = characterData.abilityScores?.[ability] ?? 10;
                const baseMod = Math.floor((abilityScore - 10) / 2);
                const totalMod = baseMod + 5;
                const modifierText = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;

                return (
                  <div key={skill.skill_id} className="break-inside-avoid flex items-center gap-2">
                    <span>
                      {skill.name}{" "}
                      <span className="text-sm text-gray-500">({modifierText})</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold mb-2">Select up to 3 Trained Skills:</h3>
          <div className="columns-2 gap-x-4 space-y-2">
            {trainableSkills.map((skill) => {
              const ability = skill.ability_used;
              const abilityScore = characterData.abilityScores?.[ability] ?? 10;
              const baseMod = Math.floor((abilityScore - 10) / 2);
              const isTrained = selectedTrainedSkills.includes(skill.skill_id);
              const totalMod = baseMod + (isTrained ? 5 : 0);
              const modifierText = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;

              return (
                <div key={skill.skill_id} className="break-inside-avoid flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isTrained}
                    disabled={!isTrained && selectedTrainedSkills.length >= 3}
                    onChange={() => toggleSkill(skill.skill_id)}
                    className="w-4 h-4"
                  />
                  <span onClick={() => toggleSkill(skill.skill_id)}>
                    {skill.name}{" "}
                    <span className="text-sm text-gray-500">({modifierText})</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}