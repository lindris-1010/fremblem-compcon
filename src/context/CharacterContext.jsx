import { createContext, useContext, useState, useEffect } from "react";
import { getAllRows, insertRow, ready } from "../db/database";

// Create context
const CharacterContext = createContext();

// Provider component
export function CharacterProvider({ children }) {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    (async () => {
      await ready;
      const chars = getAllRows("characters");
      setCharacters(chars);
    })();
  }, []);

  // This is something you'll have to call after doing any CUD DB operations
  const refreshCharacters = async () => {
    await ready;
    const chars = getAllRows("characters");
    setCharacters(chars);
  };

  const getCharacterById = (id) =>
    characters.find((char) => char.character_id === id);

  const addCharacterToDB = (characterData) => {
    try {
      // Create the basic character row
      const { abilityScores, race, class: charClass,
              power_ids: powersArray, skill_ids: skillsArray, equipment: equipmentArray,
              feat_ids: featsArray, coins, name } = characterData;

      console.log("Adding class_id: " + charClass.class_id);
      console.log("Adding skill_ids: " + skillsArray);
      console.log("Adding power_ids: " + powersArray);
      console.log("Adding feat_ids: " + featsArray);
      console.log("Adding name: " + name);

      const characterRow = {
        class_id: charClass.class_id,
        str_score: abilityScores.str,
        con_score: abilityScores.con,
        dex_score: abilityScores.dex,
        int_score: abilityScores.int,
        wis_score: abilityScores.wis,
        cha_score: abilityScores.cha,
        gp: coins.gp,
        sp: coins.sp,
        cp: coins.cp,
        skill_ids: skillsArray,
        power_ids: powersArray,
        feat_ids: featsArray,
        name: name,
        level: 1
      };

      // Insert character row
      console.log("Adding character: " + characterRow);
      const charId = insertRow("characters", characterRow);
      console.log("Added character_id: " + charId);

      // refresh the db
      refreshCharacters();

      //

      return charId;
    } catch (error) {
      console.error("Failed to insert character:", error);
      throw error;
    }
  };

  return (
    <CharacterContext.Provider value={{ characters, getCharacterById, addCharacterToDB }}>
      {children}
    </CharacterContext.Provider>
  );
}

// Custom hook to use the context
export function useCharacters() {
  return useContext(CharacterContext);
}