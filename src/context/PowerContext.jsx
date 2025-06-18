import { createContext, useContext, useEffect, useState } from "react";
import { getAllRows, ready } from "../db/database";

const PowerContext = createContext();

export function PowerProvider({ children }) {
  const [powers, setPowers] = useState([]);

  useEffect(() => {
    (async () => {
      await ready;
      const rows = getAllRows("powers");
      setPowers(rows);
    })();
  }, []);

  const getPowerById = (id) => {
    return powers.find((power) => Number(power.power_id) === Number(id));
  }

  const getPowersForCharacter = (character) => {
    if (!character.power_ids) return [];
    try {
      const ids = typeof character.power_ids === "string"
        ? JSON.parse(character.power_ids)
        : character.power_ids;

      return Array.isArray(ids)
        ? ids.map(getPowerById).filter(Boolean)
        : [getPowerById(ids)];
    } catch (e) {
      console.error("Invalid power_ids JSON:", character.power_ids);
      return [];
    }
  };

  return (
    <PowerContext.Provider value={{ powers, getPowerById, getPowersForCharacter }}>
      {children}
    </PowerContext.Provider>
  );
}

export function usePowers() {
  return useContext(PowerContext);
}