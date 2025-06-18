import { createContext, useContext, useEffect, useState } from "react";
import { getAllRows, ready } from "../db/database";

const EquipmentContext = createContext();

export function EquipmentProvider({ children }) {
  const [equipment_all, setEquipment] = useState([]);

  useEffect(() => {
    (async () => {
      await ready;
      const rows = getAllRows("equipment");
      setEquipment(rows);
    })();
  }, []);

  const getEquipmentById = (id) => {
    return equipment_all.find((equipment) => Number(equipment.equipment_id) === Number(id));
  }

  const getEquipmentForIds = (ids) => {
    if (!Array.isArray(ids)) return [];

    return ids
      .map((id) => getEquipmentById(id))
      .filter(Boolean); // Filter out any undefined/null
  };

  return (
    <EquipmentContext.Provider value={{ equipment_all, getEquipmentById, getEquipmentForIds }}>
      {children}
    </EquipmentContext.Provider>
  );
}

export function useEquipment() {
  return useContext(EquipmentContext);
}