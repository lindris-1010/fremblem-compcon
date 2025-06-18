import { createContext, useContext, useEffect, useState } from "react";
import { getAllRows, insertRow, ready } from "../db/database";

const CharEquipContext = createContext();

export function CharEquipProvider({ children }) {
  const [charEquip, setCharEquip] = useState([]);

  useEffect(() => {
    (async () => {
      await ready;
      const rows = getAllRows("char_equipment");
      setCharEquip(rows);
    })();
  }, []);

  // This is something you'll have to call after doing any CUD DB operations
  const refreshCharEquip = async () => {
    await ready;
    const rows = getAllRows("char_equipment");
    setCharEquip(rows);
  };

  const getCharEquipForCharacter = (character) => {
    try {
      const rows = getAllRows("char_equipment");
      return rows
        .filter(row => row.char_id === character.character_id)
        .map(row => ({
          profile_id: row.profile_id,
          profile_type: row.profile_type,
          enchant_id: row.enchant_id,
          quantity: row.quantity,
          is_equipped: row.is_equipped
        }));
    } catch (e) {
      console.error("Error fetching equipment for character:", e);
      return [];
    }
  };

  const addCharEquipToDB = (charId, profileId, profileType, quantity, isEquipped) => {
    try {
      const charEquipRow = {
        char_id: charId,
        profile_id: profileId,
        profile_type: profileType,
        enchant_id: 0,
        quantity: quantity,
        is_equipped: isEquipped
      };

      const charEquipId = insertRow("char_equipment", charEquipRow);

        // refresh the db
      refreshCharEquip();

      return charEquipId;
    } catch (error) {
      console.error("Failed to insert charEquip:", error);
      throw error;
    }
  };

  return (
    <CharEquipContext.Provider value={{ charEquip, getCharEquipForCharacter, addCharEquipToDB }}>
      {children}
    </CharEquipContext.Provider>
  );
}

export function useCharEquip() {
  return useContext(CharEquipContext);
}