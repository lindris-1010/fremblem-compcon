import { createContext, useContext, useEffect, useState } from "react";
import { getAllRows, ready } from "../db/database";

const SkillContext = createContext();

export function SkillProvider({ children }) {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    (async () => {
      await ready;
      const rows = getAllRows("skills");
      setSkills(rows);
    })();
  }, []);

  const getSkillById = (id) => {
    console.log("All skills: ", skills);
    console.log("searching for skill_id: ", id);
    return skills.find((skill) => Number(skill.skill_id) === Number(id));
  };

  const getSkillsForCharacter = (character) => {
    if (!character.skill_ids) return [];
    try {
      const ids =
        typeof character.skill_ids === "string"
          ? JSON.parse(character.skill_ids)
          : character.skill_ids;

      return Array.isArray(ids)
        ? ids.map(getSkillById).filter(Boolean)
        : [getSkillById(ids)];
    } catch (e) {
      console.error("Invalid skill_ids JSON:", character.skill_ids);
      return [];
    }
  };

  return (
    <SkillContext.Provider value={{ skills, getSkillById, getSkillsForCharacter }}>
      {children}
    </SkillContext.Provider>
  );
}

export function useSkills() {
  return useContext(SkillContext);
}